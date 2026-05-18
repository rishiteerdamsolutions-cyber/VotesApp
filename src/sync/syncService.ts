import { db } from '../db/db'
import type { Voter } from '../types'
import { apiPost, apiGet } from '../api/client'
import { setMeta, getMeta } from '../db/db'

export interface SyncSummary {
  pending: number
  failed: number
  synced: number
}

export async function getSyncSummary(divisionId: number): Promise<SyncSummary> {
  const voters = await db.voters.where('divisionId').equals(divisionId).toArray()
  return {
    pending: voters.filter((v) => v.syncStatus === 'pending').length,
    failed: voters.filter((v) => v.syncStatus === 'failed').length,
    synced: voters.filter((v) => v.syncStatus === 'synced').length,
  }
}

export async function saveVoterLocal(
  voter: Voter,
  operation: 'create' | 'update'
): Promise<Voter> {
  const localId = voter.localId ?? crypto.randomUUID()
  const record: Voter = {
    ...voter,
    localId,
    syncStatus: 'pending',
    updatedAt: new Date().toISOString(),
    createdAt: voter.createdAt ?? new Date().toISOString(),
  }
  await db.voters.put(record)
  await db.syncQueue.add({
    localId,
    serverId: voter.serverId,
    entityType: 'voter',
    operation,
    payload: JSON.stringify(record),
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
  if (navigator.onLine) {
    void runUpdate(voter.divisionId).catch(() => {})
  }
  return record
}

export async function runUpdate(divisionId: number): Promise<SyncSummary> {
  const queue = await db.syncQueue.where('status').anyOf(['pending', 'failed']).toArray()
  if (queue.length > 0) {
    const items = queue.map((q) => ({
      localId: q.localId,
      serverId: q.serverId,
      operation: q.operation,
      payload: JSON.parse(q.payload),
    }))
    try {
      const { results } = await apiPost<{
        results: Array<{ localId?: string; serverId: number; ok: boolean }>
      }>('/api/sync/push', { items })
      for (const r of results) {
        if (r.ok && r.localId) {
          const voter = await db.voters.get(r.localId)
          if (voter) {
            await db.voters.put({
              ...voter,
              serverId: r.serverId,
              id: r.serverId,
              syncStatus: 'synced',
            })
          }
          await db.syncQueue.where('localId').equals(r.localId!).delete()
        }
      }
    } catch {
      await db.syncQueue.where('status').equals('pending').modify({ status: 'failed' })
    }
  }
  const since = (await getMeta(`lastSyncedAt_${divisionId}`)) ?? '1970-01-01'
  try {
    const { voters, syncedAt } = await apiGet<{ voters: Voter[]; syncedAt: string }>(
      `/api/sync/pull?divisionId=${divisionId}&since=${encodeURIComponent(since)}`
    )
    for (const v of voters) {
      const localId = `srv_${v.id}`
      await db.voters.put({
        ...v,
        localId,
        serverId: v.id,
        syncStatus: 'synced',
      })
    }
    await setMeta(`lastSyncedAt_${divisionId}`, syncedAt)
  } catch {
    /* offline */
  }
  return getSyncSummary(divisionId)
}

export async function bootstrapDivision(divisionId: number): Promise<void> {
  let page = 0
  let hasMore = true
  while (hasMore) {
    const batch = await apiGet<Voter[]>(
      `/api/voters?divisionId=${divisionId}&page=${page}&limit=500`
    )
    if (!batch.length) {
      hasMore = false
      break
    }
    for (const v of batch) {
      await db.voters.put({
        ...v,
        localId: `srv_${v.id}`,
        serverId: v.id,
        syncStatus: 'synced',
      })
    }
    page += 1
    if (batch.length < 500) hasMore = false
  }
  await setMeta(`lastSyncedAt_${divisionId}`, new Date().toISOString())
}

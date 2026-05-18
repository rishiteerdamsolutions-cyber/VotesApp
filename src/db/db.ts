import Dexie, { type Table } from 'dexie'
import type { Voter, Constituency, Division } from '../types'

export interface SyncQueueItem {
  id?: number
  localId: string
  serverId?: number
  entityType: 'voter'
  operation: 'create' | 'update'
  payload: string
  status: 'pending' | 'failed'
  createdAt: string
}

export interface MetaRow {
  key: string
  value: string
}

export class VoterMapDB extends Dexie {
  voters!: Table<Voter, string>
  constituencies!: Table<Constituency, number>
  divisions!: Table<Division, number>
  syncQueue!: Table<SyncQueueItem, number>
  meta!: Table<MetaRow, string>

  constructor() {
    super('VoterMapDB')
    this.version(1).stores({
      voters: '&localId, serverId, divisionId, epicId, syncStatus, updatedAt',
      constituencies: '++id, name',
      divisions: '++id, constituencyId',
      syncQueue: '++id, status, localId',
      meta: 'key',
    })
  }
}

export const db = new VoterMapDB()

export async function getMeta(key: string): Promise<string | undefined> {
  const row = await db.meta.get(key)
  return row?.value
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value })
}

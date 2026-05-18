import { Badge } from './ui/Badge'
import type { SyncStatus } from '../types'

export function SyncStatusBadge({ status }: { status?: SyncStatus }) {
  const s = status ?? 'pending'
  const labels: Record<SyncStatus, string> = {
    pending: 'Pending sync',
    synced: 'Saved',
    failed: 'Sync failed',
  }
  return <Badge label={labels[s]} variant={s} />
}

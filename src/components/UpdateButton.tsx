import { useState } from 'react'
import { Button } from './ui/Button'
import { runUpdate, type SyncSummary } from '../sync/syncService'
import { useToast } from './ui/Toast'

export function UpdateButton({
  divisionId,
  onComplete,
}: {
  divisionId: number
  onComplete?: (s: SyncSummary) => void
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const summary = await runUpdate(divisionId)
      onComplete?.(summary)
      const msg =
        summary.failed > 0
          ? `${summary.synced} synced, ${summary.failed} failed — retry when online`
          : `${summary.synced} up to date, ${summary.pending} pending`
      toast(msg, summary.failed ? 'error' : 'success')
    } catch {
      toast('Update failed — check connection', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleUpdate} disabled={loading} className="text-sm">
      {loading ? 'Updating…' : '⟳ Update'}
    </Button>
  )
}

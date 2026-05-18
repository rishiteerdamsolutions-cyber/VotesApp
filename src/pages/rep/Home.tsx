import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { UpdateButton } from '../../components/UpdateButton'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { db } from '../../db/db'
import { getSyncSummary } from '../../sync/syncService'

export function RepHome() {
  const user = useAuthStore((s) => s.user)!
  const divisionId = user.divisionId!
  const [stats, setStats] = useState({ total: 0, live: 0, pending: 0 })
  const [electionMode, setElectionMode] = useState(false)

  const refresh = async () => {
    const voters = await db.voters.where('divisionId').equals(divisionId).toArray()
    const sync = await getSyncSummary(divisionId)
    setStats({
      total: voters.length,
      live: voters.filter((v) => v.isLive).length,
      pending: sync.pending + sync.failed,
    })
  }

  useEffect(() => {
    void refresh()
  }, [divisionId])

  return (
    <PageWrapper
      title={`Division — ${user.username}`}
      action={<UpdateButton divisionId={divisionId} onComplete={() => void refresh()} />}
    >
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="My voters" value={stats.total} />
        <StatCard label="Live" value={stats.live} />
        <StatCard label="Pending sync" value={stats.pending} />
        <StatCard label="Election mode" value={electionMode ? 'ON' : 'OFF'} />
      </div>
      <label className="flex items-center gap-2 mb-4 text-sm">
        <input
          type="checkbox"
          checked={electionMode}
          onChange={(e) => setElectionMode(e.target.checked)}
        />
        Election day mode
      </label>
      <Link to="/rep/add">
        <Button fullWidth className="mb-2">
          Add new voter
        </Button>
      </Link>
      <Link to="/rep/voters">
        <Button fullWidth variant="outline">
          View all voters
        </Button>
      </Link>
    </PageWrapper>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-primary-light">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  )
}

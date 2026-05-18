import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { UpdateButton } from '../../components/UpdateButton'
import { Badge, voterStatusVariant } from '../../components/ui/Badge'
import { SyncStatusBadge } from '../../components/SyncStatusBadge'
import { useAuthStore } from '../../store/authStore'
import { db } from '../../db/db'
import type { Voter, VoterSortOption } from '../../types'
import { sortVoters } from '../../utils/sortVoters'

const FILTERS = ['all', 'live', 'dead', 'alienated', 'migrated', 'new'] as const

export function VoterList() {
  const user = useAuthStore((s) => s.user)!
  const divisionId = user.divisionId!
  const [voters, setVoters] = useState<Voter[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [sort, setSort] = useState<VoterSortOption>('house_asc')

  const load = () => {
    void db.voters
      .where('divisionId')
      .equals(divisionId)
      .toArray()
      .then(setVoters)
  }

  useEffect(() => {
    load()
  }, [divisionId])

  const filtered = useMemo(() => {
    let list = [...voters]
    if (filter === 'live') list = list.filter((v) => v.isLive)
    if (filter === 'dead') list = list.filter((v) => v.isDead)
    if (filter === 'alienated') list = list.filter((v) => v.isAlienated)
    if (filter === 'migrated') list = list.filter((v) => v.isImmigrated)
    if (filter === 'new') list = list.filter((v) => v.isNewVoter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (v) =>
          v.epicId.toLowerCase().includes(q) ||
          v.houseNumber.toLowerCase().includes(q) ||
          `${v.surname} ${v.name}`.toLowerCase().includes(q)
      )
    }
    return sortVoters(list, sort)
  }, [voters, filter, search, sort])

  return (
    <PageWrapper
      title="Voter list"
      action={<UpdateButton divisionId={divisionId} onComplete={load} />}
    >
      <input
        className="w-full min-h-11 mb-2 rounded-lg border px-3"
        placeholder="Search name, EPIC, house…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search voters"
      />
      <select
        className="w-full min-h-11 mb-2 rounded-lg border px-3 text-sm"
        value={sort}
        onChange={(e) => setSort(e.target.value as VoterSortOption)}
        aria-label="Sort voters"
      >
        <option value="house_asc">House number (asc)</option>
        <option value="house_desc">House number (desc)</option>
        <option value="name_asc">Name A–Z</option>
      </select>
      <div className="flex flex-wrap gap-1 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded-full text-xs capitalize ${
              filter === f ? 'bg-primary text-white' : 'bg-white border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No voters yet. Add your first voter.</p>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {filtered.map((v) => {
            const st = voterStatusVariant(v)
            return (
              <Link
                key={v.localId}
                to={`/voter/${v.serverId ?? v.localId}`}
                className="block bg-white rounded-lg p-3 border border-primary-light shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {v.surname} {v.name} — {v.houseNumber}
                    </p>
                    <p className="text-xs text-gray-500">{v.epicId}</p>
                    <p className="text-xs text-gray-500">
                      {v.age} · {v.gender} · {v.caste}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge label={st.label} variant={st.variant} />
                    <SyncStatusBadge status={v.syncStatus} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}

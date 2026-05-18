import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { apiGet } from '../../api/client'
import type { Constituency, Division, Voter, VoterSortOption } from '../../types'
import { exportVotersExcel } from '../../utils/exportExcel'

const SORT_OPTIONS: { value: VoterSortOption; label: string }[] = [
  { value: 'house_asc', label: 'House number (asc)' },
  { value: 'house_desc', label: 'House number (desc)' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'epic', label: 'EPIC ID' },
  { value: 'age_asc', label: 'Age (asc)' },
  { value: 'age_desc', label: 'Age (desc)' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

export function Export() {
  const [constituencies, setConstituencies] = useState<Constituency[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [constituencyId, setConstituencyId] = useState<number | null>(null)
  const [divisionId, setDivisionId] = useState<number | null>(null)
  const [sort, setSort] = useState<VoterSortOption>('house_asc')

  useEffect(() => {
    void apiGet<Constituency[]>('/api/constituencies').then(setConstituencies)
  }, [])

  useEffect(() => {
    if (constituencyId) {
      void apiGet<Division[]>(`/api/divisions?constituencyId=${constituencyId}`).then(setDivisions)
    }
  }, [constituencyId])

  const fetchVoters = async (filter?: (v: Voter) => boolean) => {
    if (!divisionId) return []
    const all: Voter[] = []
    let page = 0
    for (;;) {
      const batch = await apiGet<Voter[]>(
        `/api/voters?divisionId=${divisionId}&page=${page}&limit=500`
      )
      if (!batch.length) break
      all.push(...batch)
      if (batch.length < 500) break
      page++
    }
    return filter ? all.filter(filter) : all
  }

  const exportExcel = async (name: string, filter?: (v: Voter) => boolean) => {
    const data = await fetchVoters(filter)
    exportVotersExcel(data, sort, name)
  }

  return (
    <PageWrapper title="Export">
      <select
        className="w-full min-h-11 mb-2 rounded-lg border px-3"
        value={constituencyId ?? ''}
        onChange={(e) => setConstituencyId(Number(e.target.value) || null)}
        aria-label="Constituency"
      >
        <option value="">Constituency</option>
        {constituencies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className="w-full min-h-11 mb-2 rounded-lg border px-3"
        value={divisionId ?? ''}
        onChange={(e) => setDivisionId(Number(e.target.value) || null)}
        aria-label="Division"
      >
        <option value="">Division</option>
        {divisions.map((d) => (
          <option key={d.id} value={d.id}>
            {d.divisionNumber} — {d.name}
          </option>
        ))}
      </select>
      <label className="block text-sm font-medium mb-1">Sort by</label>
      <select
        className="w-full min-h-11 mb-4 rounded-lg border px-3"
        value={sort}
        onChange={(e) => setSort(e.target.value as VoterSortOption)}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="space-y-2">
        <Button fullWidth disabled={!divisionId} onClick={() => exportExcel('voters.xlsx')}>
          Export voter list (Excel)
        </Button>
        <Button
          fullWidth
          variant="outline"
          disabled={!divisionId}
          onClick={() => exportExcel('dead-voters.xlsx', (v) => v.isDead)}
        >
          Export dead voters
        </Button>
        <Button
          fullWidth
          variant="outline"
          disabled={!divisionId}
          onClick={() => exportExcel('new-voters.xlsx', (v) => v.isNewVoter)}
        >
          Export new voters
        </Button>
      </div>
    </PageWrapper>
  )
}

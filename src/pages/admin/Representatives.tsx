import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { CredentialsModal } from '../../components/CredentialsModal'
import { apiGet, apiPost, apiDelete } from '../../api/client'
import type { Constituency, Division, Representative } from '../../types'
import { generateCorpCode } from '../../utils/generateUsername'
import { useToast } from '../../components/ui/Toast'

export function Representatives() {
  const { toast } = useToast()
  const [constituencies, setConstituencies] = useState<Constituency[]>([])
  const [allDivisions, setAllDivisions] = useState<Division[]>([])
  const [reps, setReps] = useState<Representative[]>([])
  const [maxReps, setMaxReps] = useState(10)
  const [filterDivisionId, setFilterDivisionId] = useState<number | null>(null)
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null)
  const [form, setForm] = useState({
    surname: '',
    name: '',
    lastName: '',
    mobile: '',
    constituencyId: 0,
    divisionId: 0,
  })

  useEffect(() => {
    void apiGet<Constituency[]>('/api/constituencies').then(setConstituencies)
    void apiGet<Division[]>('/api/divisions').then(setAllDivisions)
    void apiGet<Record<string, string>>('/api/settings').then((s) =>
      setMaxReps(Number(s.maxRepsPerDivision ?? 10))
    )
  }, [])

  useEffect(() => {
    if (filterDivisionId) {
      void apiGet<Representative[]>(`/api/representatives?divisionId=${filterDivisionId}`).then(
        setReps
      )
    } else setReps([])
  }, [filterDivisionId])

  const previewUsername = () => {
    const c = constituencies.find((x) => x.id === form.constituencyId)
    const d = allDivisions.find((x) => x.id === form.divisionId)
    if (!c || !d) return '—'
    const count = reps.filter((r) => r.divisionId === form.divisionId).length
    return `${generateCorpCode(c.corporation)}${d.divisionNumber}R${count + 1}`
  }

  const createRep = async () => {
    try {
      const res = await apiPost<{
        credentials: { username: string; password: string }
      }>('/api/representatives', form)
      setCreds(res.credentials)
      toast('Representative created', 'success')
      if (filterDivisionId) {
        setReps(await apiGet(`/api/representatives?divisionId=${filterDivisionId}`))
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error')
    }
  }

  const labelForDivision = (id: number) => {
    const d = allDivisions.find((x) => x.id === id)
    const c = constituencies.find((x) => x.id === d?.constituencyId)
    return d ? `${c?.name ?? ''} — ${d.divisionNumber} ${d.name}` : String(id)
  }

  return (
    <PageWrapper title="Representatives">
      {creds && (
        <CredentialsModal
          username={creds.username}
          password={creds.password}
          onClose={() => setCreds(null)}
        />
      )}
      <label className="block text-sm font-medium mb-1">Filter by division</label>
      <select
        className="w-full min-h-11 mb-4 rounded-lg border px-3"
        value={filterDivisionId ?? ''}
        onChange={(e) => setFilterDivisionId(Number(e.target.value) || null)}
        aria-label="Select division"
      >
        <option value="">All divisions</option>
        {allDivisions.map((d) => (
          <option key={d.id} value={d.id}>
            {labelForDivision(d.id!)}
          </option>
        ))}
      </select>
      {filterDivisionId && (
        <p className="text-sm mb-4 text-gray-600">
          {reps.length} / {maxReps} representatives
        </p>
      )}
      <ul className="space-y-2 mb-6">
        {reps.map((r) => (
          <li key={r.id} className="bg-white p-3 rounded-lg text-sm">
            <p className="font-medium">
              {r.name} {r.surname} — {r.username}
            </p>
            <p className="text-gray-500">{r.mobile}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                className="text-primary text-xs"
                onClick={() =>
                  void apiPost(`/api/representatives/${r.id}/reset-device`, {}).then(() =>
                    toast('Device reset', 'success')
                  )
                }
              >
                Reset device
              </button>
              <button
                type="button"
                className="text-primary text-xs"
                onClick={async () => {
                  const res = await apiPost<{ username: string; password: string }>(
                    `/api/representatives/${r.id}/regenerate-password`,
                    {}
                  )
                  setCreds({ username: res.username, password: res.password })
                }}
              >
                New password
              </button>
              <button
                type="button"
                className="text-red-600 text-xs"
                onClick={() => {
                  void apiDelete(`/api/representatives/${r.id}`).then(() =>
                    setReps((prev) => prev.filter((x) => x.id !== r.id))
                  )
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="font-semibold mb-2">Add representative</h2>
      <p className="text-xs text-primary mb-2">Username preview: {previewUsername()}</p>
      <select
        className="w-full min-h-11 mb-2 rounded-lg border px-3"
        onChange={(e) => setForm({ ...form, constituencyId: Number(e.target.value) })}
        aria-label="Constituency"
      >
        <option value={0}>Constituency</option>
        {constituencies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className="w-full min-h-11 mb-4 rounded-lg border px-3"
        onChange={(e) => setForm({ ...form, divisionId: Number(e.target.value) })}
        aria-label="Division"
      >
        <option value={0}>Division</option>
        {allDivisions
          .filter((d) => !form.constituencyId || d.constituencyId === form.constituencyId)
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.divisionNumber} — {d.name}
            </option>
          ))}
      </select>
      <Input label="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input
        label="Last name"
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
      />
      <Input
        label="Mobile"
        value={form.mobile}
        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
      />
      <Button fullWidth onClick={createRep}>
        Create representative
      </Button>
    </PageWrapper>
  )
}

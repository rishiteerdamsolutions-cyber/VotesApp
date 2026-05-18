import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { apiGet, apiPost, apiDelete, apiPut } from '../../api/client'
import type { Constituency, Division } from '../../types'
import { useToast } from '../../components/ui/Toast'

export function Setup() {
  const { toast } = useToast()
  const [constituencies, setConstituencies] = useState<Constituency[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [selectedConstituency, setSelectedConstituency] = useState<number | null>(null)
  const [maxReps, setMaxReps] = useState('10')
  const [cForm, setCForm] = useState({ name: '', corporation: '', city: '' })
  const [dForm, setDForm] = useState({ divisionNumber: '', name: '' })

  const load = async () => {
    setConstituencies(await apiGet<Constituency[]>('/api/constituencies'))
    const settings = await apiGet<Record<string, string>>('/api/settings')
    setMaxReps(settings.maxRepsPerDivision ?? '10')
    if (selectedConstituency) {
      setDivisions(
        await apiGet<Division[]>(`/api/divisions?constituencyId=${selectedConstituency}`)
      )
    }
  }

  useEffect(() => {
    void load()
  }, [selectedConstituency])

  const addConstituency = async () => {
    await apiPost('/api/constituencies', cForm)
    setCForm({ name: '', corporation: '', city: '' })
    toast('Constituency added', 'success')
    void load()
  }

  const addDivision = async () => {
    if (!selectedConstituency) return
    await apiPost('/api/divisions', { ...dForm, constituencyId: selectedConstituency })
    setDForm({ divisionNumber: '', name: '' })
    toast('Division added', 'success')
    void load()
  }

  const saveSettings = async () => {
    await apiPut('/api/settings', { maxRepsPerDivision: maxReps })
    toast('Settings saved', 'success')
  }

  return (
    <PageWrapper title="Setup">
      <section className="mb-8">
        <h2 className="font-semibold text-primary-dark mb-3">Constituency</h2>
        <Input label="Name" value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} />
        <Input
          label="Corporation"
          value={cForm.corporation}
          onChange={(e) => setCForm({ ...cForm, corporation: e.target.value })}
        />
        <Input label="City" value={cForm.city} onChange={(e) => setCForm({ ...cForm, city: e.target.value })} />
        <Button fullWidth onClick={addConstituency}>
          Add constituency
        </Button>
        <ul className="mt-4 space-y-2">
          {constituencies.map((c) => (
            <li key={c.id} className="bg-white p-3 rounded-lg flex justify-between text-sm">
              <span>
                {c.name} — {c.corporation}
              </span>
              <button
                type="button"
                className="text-red-600"
                onClick={() => {
                  void apiDelete(`/api/constituencies/${c.id}`).then(load)
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold text-primary-dark mb-3">Divisions</h2>
        <select
          className="w-full min-h-11 mb-3 rounded-lg border px-3"
          value={selectedConstituency ?? ''}
          onChange={(e) => setSelectedConstituency(Number(e.target.value) || null)}
          aria-label="Select constituency"
        >
          <option value="">Select constituency</option>
          {constituencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          label="Division number"
          value={dForm.divisionNumber}
          onChange={(e) => setDForm({ ...dForm, divisionNumber: e.target.value })}
        />
        <Input label="Division name" value={dForm.name} onChange={(e) => setDForm({ ...dForm, name: e.target.value })} />
        <Button fullWidth onClick={addDivision} disabled={!selectedConstituency}>
          Add division
        </Button>
        <ul className="mt-4 space-y-2">
          {divisions.map((d) => (
            <li key={d.id} className="bg-white p-3 rounded-lg text-sm">
              {d.divisionNumber} — {d.name}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-semibold text-primary-dark mb-3">System settings</h2>
        <Input
          label="Max reps per division"
          type="number"
          value={maxReps}
          onChange={(e) => setMaxReps(e.target.value)}
        />
        <Button fullWidth onClick={saveSettings}>
          Save settings
        </Button>
      </section>
    </PageWrapper>
  )
}

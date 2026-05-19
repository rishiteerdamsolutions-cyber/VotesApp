import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { apiGet, apiPost } from '../../api/client'
import { useToast } from '../../components/ui/Toast'

interface SirContext {
  program: {
    title: string
    schedule: Array<{
      phase: string
      detail?: string
      start?: string
      end?: string
      date?: string
    }>
    fieldProcess: string[]
    reservationSummary: { totalAssemblySeats: number; scReserved: number; stReserved: number }
  }
  ghmc: {
    structure: { zones: number; circles: number; wards: number }
    voterMapDivisionGuidance: string
  }
  fieldMapping: {
    voterMapToSir: Array<{ sirConcept: string; voterMap: string; example: string }>
    officialForms: Array<{ form: string; use: string }>
  }
  links: Record<string, string>
  constituencies: {
    count: number
    constituencies: Array<{ acNumber: number; displayName: string; district: string; inGhmcArea: boolean }>
  }
}

export function SirGuide() {
  const { toast } = useToast()
  const [ctx, setCtx] = useState<SirContext | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [filter, setFilter] = useState('')
  const [dbCount, setDbCount] = useState<number | null>(null)
  const [loadError, setLoadError] = useState('')

  const refreshDbCount = () =>
    apiGet<unknown[]>('/api/constituencies')
      .then((rows) => setDbCount(rows.length))
      .catch(() => setDbCount(null))

  useEffect(() => {
    void apiGet<SirContext>('/api/sir/context')
      .then(setCtx)
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load SIR data'))
    void refreshDbCount()
  }, [])

  const seed = async () => {
    setSeeding(true)
    try {
      const r = await apiPost<{ inserted: number; skipped: boolean; message: string }>(
        '/api/admin/seed-telangana',
        {}
      )
      toast(r.message, r.skipped ? 'info' : 'success')
      await refreshDbCount()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Seed failed', 'error')
    } finally {
      setSeeding(false)
    }
  }

  const list = ctx?.constituencies.constituencies.filter(
    (c) =>
      !filter ||
      c.displayName.toLowerCase().includes(filter.toLowerCase()) ||
      c.district.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <PageWrapper title="Telangana SIR">
      {loadError && (
        <p className="text-sm text-red-600 mb-4">{loadError}</p>
      )}
      {!ctx ? (
        <p className="text-sm text-gray-600">Loading SIR reference data…</p>
      ) : (
        <div className="space-y-6 pb-24">
          <section className="bg-white rounded-xl p-4 shadow-sm border border-primary-light">
            <h2 className="font-semibold text-primary-dark mb-2">{ctx.program.title}</h2>
            <p className="text-sm text-gray-600 mb-3">
              {ctx.program.reservationSummary.totalAssemblySeats} Assembly seats ({ctx.program.reservationSummary.scReserved} SC, {ctx.program.reservationSummary.stReserved} ST). Last SIR in Telangana: 2002.
            </p>
            <p className="text-sm mb-3 rounded-lg bg-primary-xlight p-3 border border-primary-light">
              <span className="font-medium text-primary-dark">Database:</span>{' '}
              {dbCount === null
                ? 'Could not read (log in as admin).'
                : dbCount === 0
                  ? '0 constituencies — tap the button below to populate Setup.'
                  : `${dbCount} constituencies loaded — open Setup to add divisions.`}
            </p>
            <Button fullWidth onClick={seed} disabled={seeding}>
              {seeding ? 'Saving to database…' : 'Save 119 ACs to database (for Setup & Reps)'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              The list below is reference data only until you tap save. Divisions (BLO areas) are added in Setup.
            </p>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-primary-dark mb-2">Official timeline</h3>
            <ul className="space-y-2 text-sm">
              {ctx.program.schedule.map((s) => (
                <li key={s.phase} className="border-l-2 border-primary pl-3">
                  <p className="font-medium">{s.phase}</p>
                  {s.detail && <p className="text-gray-600">{s.detail}</p>}
                  <p className="text-xs text-primary">
                    {s.date ?? (s.start && s.end ? `${s.start} → ${s.end}` : s.start)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-primary-dark mb-2">GHMC (Hyderabad)</h3>
            <p className="text-sm text-gray-600">
              {ctx.ghmc.structure.zones} zones, {ctx.ghmc.structure.circles} circles, {ctx.ghmc.structure.wards} wards (post-2025 delimitation).
            </p>
            <p className="text-sm text-gray-600 mt-2">{ctx.ghmc.voterMapDivisionGuidance}</p>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-primary-dark mb-2">SIR ↔ VoterMap</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1">SIR / ECI</th>
                    <th className="py-1">App</th>
                  </tr>
                </thead>
                <tbody>
                  {ctx.fieldMapping.voterMapToSir.map((r) => (
                    <tr key={r.sirConcept} className="border-t border-gray-100">
                      <td className="py-1.5">{r.sirConcept}</td>
                      <td className="py-1.5 text-primary-dark">{r.voterMap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-primary-dark mb-2">Official links</h3>
            <ul className="text-sm space-y-1">
              {Object.entries(ctx.links).map(([k, url]) => (
                <li key={k}>
                  <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
                    {k}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-primary-dark mb-2">
              All {ctx.constituencies.count} Assembly constituencies
            </h3>
            <input
              className="w-full min-h-11 mb-2 rounded-lg border px-3 text-sm"
              placeholder="Filter by name or district…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter constituencies"
            />
            <ul className="max-h-64 overflow-y-auto text-xs space-y-1">
              {list?.map((c) => (
                <li key={c.acNumber} className="flex justify-between gap-2">
                  <span>{c.displayName}</span>
                  <span className="text-gray-500 shrink-0">{c.district}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </PageWrapper>
  )
}

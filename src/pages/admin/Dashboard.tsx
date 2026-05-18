import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { apiGet } from '../../api/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#C2185B', '#E91E63', '#F8BBD9', '#880E4F', '#AD1457']

export function Dashboard() {
  const [summary, setSummary] = useState({
    totalVoters: 0,
    totalDivisions: 0,
    totalReps: 0,
    newVotersWeek: 0,
  })
  const [byDiv, setByDiv] = useState<{ divisionId: number; count: number }[]>([])
  const [caste, setCaste] = useState<{ caste: string; count: number }[]>([])

  useEffect(() => {
    void apiGet<typeof summary>('/api/analytics/summary').then(setSummary)
    void apiGet<typeof byDiv>('/api/analytics/by-division').then(setByDiv)
    void apiGet<typeof caste>('/api/analytics/caste').then(setCaste)
  }, [])

  const cards = [
    { label: 'Total voters', value: summary.totalVoters },
    { label: 'Divisions', value: summary.totalDivisions },
    { label: 'Representatives', value: summary.totalReps },
    { label: 'New this week', value: summary.newVotersWeek },
  ]

  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-primary-light">
            <p className="text-2xl font-bold text-primary">{c.value}</p>
            <p className="text-xs text-gray-600">{c.label}</p>
          </div>
        ))}
      </div>
      <h2 className="text-sm font-semibold mb-2">Voters per division</h2>
      <div className="h-48 bg-white rounded-xl p-2 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byDiv}>
            <XAxis dataKey="divisionId" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="count" fill="#C2185B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h2 className="text-sm font-semibold mb-2">Caste distribution</h2>
      <div className="h-48 bg-white rounded-xl p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={caste.slice(0, 8)} dataKey="count" nameKey="caste" cx="50%" cy="50%" outerRadius={60}>
              {caste.slice(0, 8).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </PageWrapper>
  )
}

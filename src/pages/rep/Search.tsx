import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'
import { db } from '../../db/db'
import type { Voter } from '../../types'

export function Search() {
  const user = useAuthStore((s) => s.user)!
  const [epic, setEpic] = useState('')
  const [name, setName] = useState('')
  const [house, setHouse] = useState('')
  const [mobile, setMobile] = useState('')
  const [results, setResults] = useState<Voter[]>([])

  const search = async () => {
    const all = await db.voters.where('divisionId').equals(user.divisionId!).toArray()
    let list = all
    if (epic.trim()) {
      list = list.filter((v) => v.epicId.toUpperCase() === epic.trim().toUpperCase())
    } else {
      if (name.trim()) {
        const q = name.toLowerCase()
        list = list.filter((v) => `${v.surname} ${v.name}`.toLowerCase().includes(q))
      }
      if (house.trim()) {
        list = list.filter((v) => v.houseNumber.toLowerCase().includes(house.toLowerCase()))
      }
      if (mobile.trim()) {
        list = list.filter((v) => v.mobileNumber.includes(mobile.trim()))
      }
    }
    setResults(list.slice(0, 50))
  }

  return (
    <PageWrapper title="Search">
      <Input label="EPIC ID (exact)" value={epic} onChange={(e) => setEpic(e.target.value)} />
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="House number" value={house} onChange={(e) => setHouse(e.target.value)} />
      <Input label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
      <button
        type="button"
        className="w-full min-h-11 bg-primary text-white rounded-lg mb-4"
        onClick={() => void search()}
      >
        Search
      </button>
      <ul className="space-y-2">
        {results.map((v) => (
          <li key={v.localId}>
            <Link to={`/voter/${v.serverId ?? v.localId}`} className="block bg-white p-3 rounded-lg">
              {v.surname} {v.name} — {v.epicId}
            </Link>
          </li>
        ))}
      </ul>
    </PageWrapper>
  )
}

import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { VoterForm } from '../../components/forms/VoterForm'
import { useAuthStore } from '../../store/authStore'
import { saveVoterLocal } from '../../sync/syncService'
import { db } from '../../db/db'
import { useToast } from '../../components/ui/Toast'
import type { VoterFormValues } from '../../schemas/voterSchema'
import { apiGet } from '../../api/client'

export function AddVoter() {
  const user = useAuthStore((s) => s.user)!
  const { toast } = useToast()
  const [divisionNumber, setDivisionNumber] = useState('')
  const [castes, setCastes] = useState<string[]>([])

  useEffect(() => {
    void apiGet<{ divisionNumber: string }[]>(`/api/divisions?constituencyId=${user.constituencyId}`).then(
      (divs) => {
        const d = divs.find((x) => (x as { id?: number }).id === user.divisionId) as
          | { divisionNumber: string }
          | undefined
        if (d) setDivisionNumber(d.divisionNumber)
      }
    )
    void db.voters
      .where('divisionId')
      .equals(user.divisionId!)
      .toArray()
      .then((v) => {
        const set = new Set(v.map((x) => x.caste).filter(Boolean))
        setCastes([...set])
      })
  }, [user])

  const buildVoter = (data: VoterFormValues) => ({
    divisionId: user.divisionId!,
    constituencyId: user.constituencyId!,
    enteredBy: user.userId,
    divisionNumber: divisionNumber || String(user.divisionId),
    ...data,
    mobileNumber: data.mobileNumber ?? '',
    boothVisited: false,
    votedOnElectionDay: false,
    syncStatus: 'pending' as const,
  })

  const save = async (data: VoterFormValues) => {
    await saveVoterLocal(buildVoter(data), 'create')
    toast('Voter saved locally — tap Update to sync', 'success')
  }

  return (
    <PageWrapper title={`Add voter — Div ${divisionNumber}`}>
      <VoterForm
        divisionNumber={divisionNumber}
        castes={castes}
        onSubmit={save}
        onSubmitAnother={save}
      />
    </PageWrapper>
  )
}

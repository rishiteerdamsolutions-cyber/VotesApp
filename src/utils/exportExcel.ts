import * as XLSX from 'xlsx'
import type { Voter, VoterSortOption } from '../types'
import { sortVoters } from './sortVoters'

export function exportVotersExcel(voters: Voter[], sort: VoterSortOption, filename: string) {
  const sorted = sortVoters(voters, sort)
  const rows = sorted.map((v, i) => ({
    'S.No': i + 1,
    'EPIC ID': v.epicId,
    Surname: v.surname,
    Name: v.name,
    'Last Name': v.lastName,
    'Surname (TE)': v.surnameTe,
    'Name (TE)': v.nameTe,
    'Last Name (TE)': v.lastNameTe,
    Caste: v.caste,
    Age: v.age,
    Gender: v.gender,
    'House No': v.houseNumber,
    'Father/Husband': v.fatherHusbandName,
    'Father/Husband (TE)': v.fatherHusbandNameTe,
    Mobile: v.mobileNumber,
    Live: v.isLive,
    Dead: v.isDead,
    Alienated: v.isAlienated,
    Migrated: v.isImmigrated,
    New: v.isNewVoter,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Voters')
  XLSX.writeFile(wb, filename)
}

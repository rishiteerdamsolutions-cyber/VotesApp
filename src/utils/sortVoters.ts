import type { Voter, VoterSortOption } from '../types'
import { naturalSort } from './naturalSort'

export function sortVoters(list: Voter[], option: VoterSortOption): Voter[] {
  const copy = [...list]
  switch (option) {
    case 'house_asc':
      return copy.sort((a, b) => naturalSort(a.houseNumber, b.houseNumber))
    case 'house_desc':
      return copy.sort((a, b) => naturalSort(b.houseNumber, a.houseNumber))
    case 'name_asc':
      return copy.sort((a, b) =>
        `${a.surname} ${a.name}`.localeCompare(`${b.surname} ${b.name}`)
      )
    case 'epic':
      return copy.sort((a, b) => a.epicId.localeCompare(b.epicId))
    case 'age_asc':
      return copy.sort((a, b) => a.age - b.age)
    case 'age_desc':
      return copy.sort((a, b) => b.age - a.age)
    case 'oldest':
      return copy.sort(
        (a, b) =>
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
      )
    case 'newest':
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
  }
}

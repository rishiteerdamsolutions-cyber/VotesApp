export type SyncStatus = 'pending' | 'synced' | 'failed'

export type Gender = 'Male' | 'Female' | 'Other'

export interface SessionUser {
  userId: number
  role: 'superadmin' | 'representative'
  divisionId: number | null
  constituencyId: number | null
  name: string
  username: string
  expiresAt: number
}

export interface Constituency {
  id?: number
  name: string
  corporation: string
  city: string
  createdAt?: string
}

export interface Division {
  id?: number
  constituencyId: number
  divisionNumber: string
  name: string
  createdAt?: string
}

export interface Representative {
  id?: number
  divisionId: number | null
  constituencyId: number | null
  username: string
  surname: string
  name: string
  lastName: string
  mobile: string
  role: 'representative' | 'superadmin'
  repNumber?: number | null
  isActive: boolean
  boundDeviceId?: string | null
}

export interface Voter {
  id?: number
  serverId?: number
  localId?: string
  divisionId: number
  constituencyId: number
  enteredBy: number
  divisionNumber: string
  surname: string
  name: string
  lastName: string
  surnameTe: string
  nameTe: string
  lastNameTe: string
  caste: string
  age: number
  gender: Gender
  epicId: string
  houseNumber: string
  fatherHusbandName: string
  fatherHusbandNameTe: string
  mobileNumber: string
  isLive: boolean
  isDead: boolean
  isAlienated: boolean
  isImmigrated: boolean
  isNewVoter: boolean
  boothVisited: boolean
  votedOnElectionDay: boolean
  photoUrl?: string
  syncStatus?: SyncStatus
  createdAt?: string
  updatedAt?: string
}

export type VoterSortOption =
  | 'house_asc'
  | 'house_desc'
  | 'name_asc'
  | 'epic'
  | 'age_asc'
  | 'age_desc'
  | 'newest'
  | 'oldest'

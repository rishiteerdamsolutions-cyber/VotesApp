import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
})

export const constituencies = pgTable('constituencies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  corporation: text('corporation').notNull(),
  city: text('city').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})

export const divisions = pgTable(
  'divisions',
  {
    id: serial('id').primaryKey(),
    constituencyId: integer('constituency_id')
      .notNull()
      .references(() => constituencies.id, { onDelete: 'cascade' }),
    divisionNumber: text('division_number').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [index('divisions_constituency_idx').on(t.constituencyId)]
)

export const representatives = pgTable(
  'representatives',
  {
    id: serial('id').primaryKey(),
    divisionId: integer('division_id').references(() => divisions.id),
    constituencyId: integer('constituency_id').references(() => constituencies.id),
    username: text('username').notNull(),
    passwordHash: text('password_hash').notNull(),
    surname: text('surname').notNull(),
    name: text('name').notNull(),
    lastName: text('last_name').notNull(),
    mobile: text('mobile').notNull(),
    role: text('role').notNull().$type<'representative' | 'superadmin'>(),
    repNumber: integer('rep_number'),
    isActive: boolean('is_active').notNull().default(true),
    boundDeviceId: text('bound_device_id'),
    deviceBoundAt: timestamp('device_bound_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    lastLogin: timestamp('last_login', { mode: 'string' }),
  },
  (t) => [uniqueIndex('representatives_username_idx').on(t.username)]
)

export const voters = pgTable(
  'voters',
  {
    id: serial('id').primaryKey(),
    divisionId: integer('division_id').notNull(),
    constituencyId: integer('constituency_id').notNull(),
    enteredBy: integer('entered_by').notNull(),
    divisionNumber: text('division_number').notNull(),
    surname: text('surname').notNull(),
    name: text('name').notNull(),
    lastName: text('last_name').notNull(),
    surnameTe: text('surname_te').notNull().default(''),
    nameTe: text('name_te').notNull().default(''),
    lastNameTe: text('last_name_te').notNull().default(''),
    caste: text('caste').notNull().default(''),
    age: integer('age').notNull(),
    gender: text('gender').notNull().$type<'Male' | 'Female' | 'Other'>(),
    epicId: text('epic_id').notNull(),
    houseNumber: text('house_number').notNull(),
    fatherHusbandName: text('father_husband_name').notNull(),
    fatherHusbandNameTe: text('father_husband_name_te').notNull().default(''),
    mobileNumber: text('mobile_number').notNull().default(''),
    isLive: boolean('is_live').notNull().default(true),
    isDead: boolean('is_dead').notNull().default(false),
    isAlienated: boolean('is_alienated').notNull().default(false),
    isImmigrated: boolean('is_immigrated').notNull().default(false),
    isNewVoter: boolean('is_new_voter').notNull().default(false),
    boothVisited: boolean('booth_visited').notNull().default(false),
    votedOnElectionDay: boolean('voted_on_election_day').notNull().default(false),
    photoUrl: text('photo_url'),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('voters_epic_id_idx').on(t.epicId),
    index('voters_division_idx').on(t.divisionId),
    index('voters_division_updated_idx').on(t.divisionId, t.updatedAt),
  ]
)

export const canvassLogs = pgTable('canvass_logs', {
  id: serial('id').primaryKey(),
  voterId: integer('voter_id').notNull(),
  representativeId: integer('representative_id').notNull(),
  note: text('note').notNull().default(''),
  date: text('date').notNull(),
  outcome: text('outcome')
    .notNull()
    .$type<'favorable' | 'unfavorable' | 'neutral' | 'not_home'>(),
})

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    representativeId: integer('representative_id').notNull(),
    action: text('action').notNull(),
    entityId: integer('entity_id').notNull(),
    before: text('before'),
    after: text('after'),
    timestamp: timestamp('timestamp', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [index('audit_logs_rep_idx').on(t.representativeId)]
)

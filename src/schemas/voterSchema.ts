import { z } from 'zod'

export const voterSchema = z
  .object({
    surname: z.string().min(1, 'Required'),
    name: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    surnameTe: z.string(),
    nameTe: z.string(),
    lastNameTe: z.string(),
    caste: z.string(),
    age: z.number().min(18).max(110),
    gender: z.enum(['Male', 'Female', 'Other']),
    epicId: z.string().min(1).transform((s) => s.toUpperCase()),
    houseNumber: z.string().min(1),
    fatherHusbandName: z.string().min(1),
    fatherHusbandNameTe: z.string(),
    mobileNumber: z
      .string()
      .optional()
      .refine((s) => !s || /^\d{10}$/.test(s), '10 digits'),
    isLive: z.boolean(),
    isDead: z.boolean(),
    isAlienated: z.boolean(),
    isImmigrated: z.boolean(),
    isNewVoter: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isLive && data.isDead) {
      ctx.addIssue({ code: 'custom', message: 'Cannot be both Live and Dead', path: ['isDead'] })
    }
  })

export type VoterFormValues = z.infer<typeof voterSchema>

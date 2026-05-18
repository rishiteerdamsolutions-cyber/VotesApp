import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { voterSchema, type VoterFormValues } from '../../schemas/voterSchema'
import { teluguTransliterate } from '../../utils/teluguTransliterate'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Voter } from '../../types'

const defaultValues: VoterFormValues = {
  surname: '',
  name: '',
  lastName: '',
  surnameTe: '',
  nameTe: '',
  lastNameTe: '',
  caste: '',
  age: 18,
  gender: 'Male',
  epicId: '',
  houseNumber: '',
  fatherHusbandName: '',
  fatherHusbandNameTe: '',
  mobileNumber: '',
  isLive: true,
  isDead: false,
  isAlienated: false,
  isImmigrated: false,
  isNewVoter: false,
}

export function VoterForm({
  divisionNumber,
  initial,
  castes,
  onSubmit,
  onSubmitAnother,
}: {
  divisionNumber: string
  initial?: Partial<Voter>
  castes: string[]
  onSubmit: (data: VoterFormValues) => Promise<void>
  onSubmitAnother?: (data: VoterFormValues) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VoterFormValues>({
    resolver: zodResolver(voterSchema),
    defaultValues: initial
      ? { ...defaultValues, ...initial, mobileNumber: initial.mobileNumber ?? '' }
      : defaultValues,
  })

  const surname = watch('surname')
  const name = watch('name')
  const lastName = watch('lastName')
  const father = watch('fatherHusbandName')
  const isDead = watch('isDead')
  const isLive = watch('isLive')

  const syncTe = (field: keyof VoterFormValues, en: string) => {
    setValue(field, teluguTransliterate(en) as never)
  }

  const submit = async (data: VoterFormValues, another?: boolean) => {
    if (another && onSubmitAnother) await onSubmitAnother(data)
    else await onSubmit(data)
    if (another) reset(defaultValues)
  }

  return (
    <form onSubmit={handleSubmit((d) => submit(d))} className="space-y-1">
      <p className="text-sm text-gray-600 mb-2">
        Division <strong>{divisionNumber}</strong> (read-only)
      </p>
      <Input
        label="Surname *"
        {...register('surname')}
        onBlur={() => syncTe('surnameTe', surname)}
        error={errors.surname?.message}
      />
      <input type="hidden" {...register('surnameTe')} />
      <p className="text-sm text-gray-500 -mt-2 mb-2 telugu">{watch('surnameTe')}</p>
      <Input
        label="Name *"
        {...register('name')}
        onBlur={() => syncTe('nameTe', name)}
        error={errors.name?.message}
      />
      <p className="text-sm text-gray-500 -mt-2 mb-2 telugu">{watch('nameTe')}</p>
      <Input
        label="Last name *"
        {...register('lastName')}
        onBlur={() => syncTe('lastNameTe', lastName)}
        error={errors.lastName?.message}
      />
      <p className="text-sm text-gray-500 -mt-2 mb-2 telugu">{watch('lastNameTe')}</p>
      <Input label="Caste" list="castes" {...register('caste')} />
      <datalist id="castes">
        {castes.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Input
        label="Age *"
        type="number"
        {...register('age', { valueAsNumber: true })}
        error={errors.age?.message}
      />
      <fieldset className="mb-3">
        <legend className="text-sm font-medium mb-2">Gender *</legend>
        <div className="flex gap-2">
          {(['Male', 'Female', 'Other'] as const).map((g) => (
            <label key={g} className="flex-1 text-center">
              <input type="radio" value={g} {...register('gender')} className="sr-only peer" />
              <span className="block py-2 rounded-lg border peer-checked:bg-primary peer-checked:text-white text-sm">
                {g}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Input
        label="EPIC ID *"
        {...register('epicId')}
        onChange={(e) => setValue('epicId', e.target.value.toUpperCase())}
        error={errors.epicId?.message}
      />
      <Input label="House number *" {...register('houseNumber')} />
      <Input
        label="Father / Husband name *"
        {...register('fatherHusbandName')}
        onBlur={() => syncTe('fatherHusbandNameTe', father)}
      />
      <p className="text-sm text-gray-500 -mt-2 mb-2 telugu">{watch('fatherHusbandNameTe')}</p>
      <Input label="Mobile (10 digits)" {...register('mobileNumber')} />
      <fieldset className="mb-4 space-y-2">
        <legend className="text-sm font-medium">Status</legend>
        <label className="flex items-center gap-2 text-green-700">
          <input
            type="checkbox"
            {...register('isLive')}
            checked={isLive}
            onChange={(e) => {
              setValue('isLive', e.target.checked)
              if (e.target.checked) setValue('isDead', false)
            }}
          />
          Live voter
        </label>
        <label className="flex items-center gap-2 text-red-700">
          <input
            type="checkbox"
            {...register('isDead')}
            checked={isDead}
            onChange={(e) => {
              setValue('isDead', e.target.checked)
              if (e.target.checked) setValue('isLive', false)
            }}
          />
          Dead
        </label>
        <label className="flex items-center gap-2 text-orange-700">
          <input type="checkbox" {...register('isAlienated')} /> Alienated
        </label>
        <label className="flex items-center gap-2 text-blue-700">
          <input type="checkbox" {...register('isImmigrated')} /> Migrated
        </label>
        <label className="flex items-center gap-2 text-purple-700">
          <input type="checkbox" {...register('isNewVoter')} /> New voter
        </label>
      </fieldset>
      <Button type="submit" fullWidth disabled={isSubmitting}>
        Save voter
      </Button>
      {onSubmitAnother && (
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-2"
          disabled={isSubmitting}
          onClick={handleSubmit((d) => submit(d, true))}
        >
          Save & add another
        </Button>
      )}
    </form>
  )
}

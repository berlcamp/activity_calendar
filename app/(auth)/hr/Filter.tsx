// components/FilterComponent.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { departments } from '@/lib/constants'
import { Controller, useForm } from 'react-hook-form'

interface FormType {
  keyword: string
  office: string
}

export const Filter = ({
  filter,
  setFilter,
  setFilterDepartment
}: {
  filter: string
  setFilter: (filter: string) => void
  setFilterDepartment: (filter: string) => void
}) => {
  const { reset, register, control, handleSubmit } = useForm<FormType>()

  // Submit handler
  const onSubmit = async (data: FormType) => {
    setFilter(data.keyword)
    setFilterDepartment(data.office)
  }

  const handleReset = () => {
    setFilter('')
    reset({
      keyword: '',
      office: ''
    })
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-2">
          <Input
            {...register('keyword')}
            placeholder="Search employee"
            className="mb-4 max-w-xs"
          />
          <Controller
            name="office"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Offices</SelectLabel>
                    {departments.map((d, i) => (
                      <SelectItem key={i} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex justify-start space-x-2">
          <Button type="submit" onClick={() => setFilter(filter)}>
            Submit Filter
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

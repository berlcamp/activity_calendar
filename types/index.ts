import { RootState as RootStateType } from '@/lib/redux'

export type RootState = RootStateType

export interface User {
  id: string
  user_id: string
  org_id: string
  name: string
  password: string
  email?: string
  type?: string
  is_active: boolean
  created_at?: string
}

export interface Activity {
  id: number
  type: string
  date: string | null
  particulars: string | null
  location: string | null
  from: string | null
  user_id: number | null
}

export interface Employee {
  id: number
  id_number: string
  firstname: string
  middlename: string
  lastname: string
  department: string
  type: string
}

// components/AddItemTypeModal.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { departments } from '@/lib/constants'
import { useAppDispatch } from '@/lib/redux/hook'
import { addItem, updateList } from '@/lib/redux/listSlice'
import { supabase } from '@/lib/supabase/client'
import { Employee } from '@/types'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

// Always update this on other pages
type ItemType = Employee
type FormType = {
  firstname: string
  middlename?: string
  lastname: string
  id_number: string
  department: string
}
const table = 'employees'
const title = 'Employee'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  editData?: ItemType | null // Optional prop for editing existing item
}

const FormSchema = z.object({
  firstname: z.string().min(1, 'Firstname is required'),
  middlename: z.string().optional(),
  lastname: z.string().min(1, 'Lastname is required'),
  id_number: z.string().min(1, 'ID No is required'),
  department: z.string().min(1, 'Department is required')
})

export const AddModal = ({ isOpen, onClose, editData }: ModalProps) => {
  //
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useAppDispatch()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: '',
      middlename: '',
      lastname: '',
      id_number: '',
      department: ''
    }
  })

  // Submit handler
  const onSubmit = async (data: FormType) => {
    if (isSubmitting) return // 🚫 Prevent double-submit
    setIsSubmitting(true)

    try {
      const newData = {
        firstname: data.firstname,
        middlename: data.middlename,
        lastname: data.lastname,
        id_number: data.id_number,
        department: data.department
      }

      // 🔎 Check if id_number already exists
      const { data: existing, error: checkError } = await supabase
        .from(table)
        .select('id, id_number')
        .eq('id_number', newData.id_number)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking id_number:', checkError)
        toast.error('Error validating employee ID')
        return
      }

      // If another record with same id_number exists
      if (existing && existing.id !== editData?.id) {
        toast.error('ID number already exists for another employee')
        return
      }

      // ✅ Safe to proceed
      if (editData?.id) {
        const { error } = await supabase
          .from(table)
          .update(newData)
          .eq('id', editData.id)

        if (error) {
          console.error('Error updating ItemType:', error)
        } else {
          //Update list on redux
          dispatch(updateList({ ...newData, id: editData.id })) // ✅ Update Redux with new data
          onClose()
        }
      } else {
        // Add new one
        const { data, error } = await supabase
          .from(table)
          .insert([newData])
          .select()

        if (error) {
          console.error('Error adding ItemType:', error)
        } else {
          // Insert new item to Redux
          dispatch(addItem({ ...newData, id: data[0].id }))
          onClose()
        }
      }

      toast.success('Successfully saved!')
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    form.reset({
      firstname: editData?.firstname || '',
      middlename: editData?.middlename || '',
      lastname: editData?.lastname || '',
      id_number: editData?.id_number || '',
      department: editData?.department || ''
    })
  }, [form, editData, isOpen])

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={() => {}}
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-600 opacity-80"
        aria-hidden="true"
      />

      {/* Centered panel container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel transition className="app__modal_dialog_panel_sm">
          {/* Sticky Header */}
          <div className="app__modal_dialog_title_container">
            <DialogTitle as="h3" className="text-base font-medium">
              {editData ? 'Edit' : 'Add'} {title}
            </DialogTitle>
          </div>
          {/* Scrollable Form Content */}
          <div className="app__modal_dialog_content">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="app__formlabel_standard">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="app__input_standard"
                                placeholder="First Name"
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="middlename"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="app__formlabel_standard">
                              Middle Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="app__input_standard"
                                placeholder="Middle Name"
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="app__formlabel_standard">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="app__input_standard"
                                placeholder="Last Name"
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="id_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="app__formlabel_standard">
                              ID No
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="app__input_standard"
                                placeholder="ID No"
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="app__modal_dialog_footer">
                  <Button type="button" onClick={onClose} variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editData ? (
                      'Update'
                    ) : (
                      <span>{isSubmitting ? 'Saving..' : 'Save'}</span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

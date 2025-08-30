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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { activityTypeColors, activityTypes } from '@/lib/constants'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Activity } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  addDays,
  addMonths,
  compareAsc,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns'
import { JSX, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import PrintActivities from './PrintActivities'

const ActivitySchema = z.object({
  type: z.string().min(1, 'Type is required'),
  particulars: z.string().min(1, 'Particulars are required'),
  date: z.string().min(1, 'Date is required'),
  from: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required')
})

export type ActivityFormValues = z.infer<typeof ActivitySchema>

export default function CalendarPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'list'>('month')
  const [selected, setSelected] = useState<Activity | null>(null)
  const [open, setOpen] = useState(false)
  const [isNew, setIsNew] = useState(false)

  // form state
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(ActivitySchema),
    defaultValues: {
      type: '',
      particulars: '',
      date: '',
      from: '',
      location: ''
    }
  })

  // 🔹 Fetch activities from Supabase
  const fetchActivities = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setActivities(data as Activity[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  // --- Navigation ---
  const goPrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    else setCurrentDate(addDays(currentDate, -7))
  }

  const goNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 7))
  }

  // --- CRUD Handlers ---
  const onSubmit = async (form: ActivityFormValues) => {
    if (isNew) {
      // insert
      const { error } = await supabase.from('activities').insert([
        {
          type: form.type,
          particulars: form.particulars,
          date: form.date,
          location: form.location,
          from: form.from
        }
      ])
      if (error) {
        console.error(error)
      }
    } else {
      if (!selected) {
        return
      }

      // update
      const { error } = await supabase
        .from('activities')
        .update({
          type: form.type,
          particulars: form.particulars,
          date: form.date,
          location: form.location,
          from: form.from
        })
        .eq('id', selected.id)
      if (error) {
        console.error(error)
      }
    }

    setOpen(false)
    await fetchActivities()
  }

  const handleDelete = async () => {
    if (!selected) return
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', selected.id)
    if (error) console.error(error)
    setOpen(false)
    await fetchActivities()
  }

  // --- Open editor ---
  const openNew = () => {
    setIsNew(true)
    setSelected(null)
    setOpen(true)
  }

  const openEdit = (a: Activity) => {
    setIsNew(false)
    setSelected(a)
    setOpen(true)
  }

  useEffect(() => {
    if (selected) {
      form.reset({
        type: selected.type || '',
        particulars: selected.particulars || '',
        date: selected.date || '',
        from: selected.from || '',
        location: selected.location || ''
      })
    }
  }, [form, selected])

  // --- Render Month View ---
  const renderMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const rows = []
    let days: JSX.Element[] = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayActivities = activities.filter((a) => a.date === dayStr)

        days.push(
          <div
            key={day.toString()}
            className={cn(
              'border h-28 p-1 flex flex-col',
              !isSameMonth(day, monthStart) && 'bg-gray-100 text-gray-400'
            )}
          >
            <div
              className={cn(
                'text-sm mb-1',
                isSameDay(day, new Date()) && 'font-bold text-blue-600'
              )}
            >
              {format(day, 'd')}
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {dayActivities.map((a) => (
                <button
                  key={a.id}
                  className={`text-xs px-1 rounded truncate text-left ${
                    activityTypeColors[a.type] ||
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => openEdit(a)}
                >
                  {a.particulars}
                </button>
              ))}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      )
      days = []
    }

    return (
      <>
        <div className="grid grid-cols-7 text-center font-medium border-b pb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid">{rows}</div>
      </>
    )
  }

  // --- Render Week View ---
  const renderWeek = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayActivities = activities.filter((a) => a.date === dayStr)

          return (
            <div key={day.toString()} className="border h-64 p-2 flex flex-col">
              <div
                className={cn(
                  'text-sm mb-2',
                  isSameDay(day, new Date()) && 'font-bold text-blue-600'
                )}
              >
                {format(day, 'EEE d')}
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {dayActivities.length > 0 ? (
                  dayActivities.map((a) => (
                    <button
                      key={a.id}
                      className={`text-xs px-1 rounded truncate text-left ${
                        activityTypeColors[a.type] ||
                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => openEdit(a)}
                    >
                      {a.particulars}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    No events
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // --- Render List View ---
  const renderList = () => {
    const sorted = [...activities].sort((a, b) =>
      compareAsc(new Date(a.date ?? ''), new Date(b.date ?? ''))
    )

    // group by date
    const grouped = sorted.reduce<Record<string, typeof activities>>(
      (acc, a) => {
        const key = a.date ? format(new Date(a.date), 'yyyy-MM-dd') : 'no-date'
        acc[key] = acc[key] || []
        acc[key].push(a)
        return acc
      },
      {}
    )

    return (
      <div className="divide-y">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="py-4">
            {/* Date header */}
            <div className="flex items-baseline mb-2">
              <div className="text-3xl font-bold text-indigo-600 w-12 text-center">
                {date !== 'no-date' ? format(new Date(date), 'd') : '—'}
              </div>
              <div className="ml-2 text-sm text-gray-500">
                {date !== 'no-date'
                  ? format(new Date(date), 'EEEE, MMMM d, yyyy')
                  : 'No Date'}
              </div>
            </div>

            {/* Activities for that date */}
            <div className="space-y-2">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border hover:bg-gray-50 flex justify-between items-start cursor-pointer transition"
                  onClick={() => openEdit(a)}
                >
                  <div>
                    <div className="text-sm font-medium">{a.particulars}</div>
                    {a.location && (
                      <div className="text-xs text-gray-500">{a.location}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs ${activityTypeColors[a.type] || 'bg-indigo-100 text-indigo-700'} px-2 py-0.5 rounded-full`}
                  >
                    {a.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <Button onClick={goPrev}>←</Button>
          <Button onClick={goNext}>→</Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            List
          </Button>
        </div>
        <div className="flex gap-2">
          {/* Print button (blue) */}
          <PrintActivities activities={activities} />
          <Button onClick={openNew}>+ New</Button>
        </div>
      </div>

      {/* Views */}
      {loading ? (
        <p>Loading...</p>
      ) : view === 'month' ? (
        renderMonth()
      ) : view === 'week' ? (
        renderWeek()
      ) : (
        renderList()
      )}

      {/* Sheet Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[420px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">
              {isNew ? 'New Activity' : 'Edit Activity'}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {isNew
                ? 'Fill in the details to create a new activity.'
                : 'Update the details or delete this activity.'}
            </p>
          </SheetHeader>

          <div className="mt-6 space-y-5 px-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Activity Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityTypes.map((type) => (
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

                {/* Particulars */}
                <FormField
                  control={form.control}
                  name="particulars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Particulars</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Barangay Assembly"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., City Hall, Covered Court"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SheetFooter className="mt-8">
                  <div className="flex w-full items-center justify-between">
                    {!isNew && (
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="px-4"
                      >
                        Delete
                      </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="px-6">
                        Save
                      </Button>
                    </div>
                  </div>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

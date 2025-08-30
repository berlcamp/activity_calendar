'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Activity } from '@/types'
import { compareAsc, format, isWithinInterval } from 'date-fns'
import { useState } from 'react'

export default function PrintActivities({
  activities
}: {
  activities: Activity[]
}) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handlePrint = () => {
    const fromDate = from ? new Date(from) : null
    const toDate = to ? new Date(to) : null

    // filter activities
    let filtered = [...activities]
    if (fromDate && toDate) {
      filtered = activities.filter((a) => {
        if (!a.date) return false
        const d = new Date(a.date)
        return isWithinInterval(d, { start: fromDate, end: toDate })
      })
    }

    // sort
    const sorted = [...filtered].sort((a, b) =>
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

    // build HTML with same design
    const printContent = `
      <html>
        <head>
          <title>Calendar of Activities</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 24px; font-size: 20px; }
            .day-block { margin-bottom: 24px; page-break-inside: avoid; }
            .date-header { display: flex; align-items: baseline; margin-bottom: 8px; }
            .day-number { font-size: 28px; font-weight: bold; color: #4f46e5; width: 48px; text-align: center; }
            .full-date { margin-left: 8px; font-size: 14px; color: #6b7280; }
            .activity-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: start; }
            .activity-card:hover { background-color: #f9fafb; }
            .particulars { font-size: 14px; font-weight: 500; }
            .location { font-size: 12px; color: #6b7280; margin-top: 2px; }
            .from-tag { font-size: 12px; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 9999px; white-space: nowrap; }
            /* 🎨 Type badges */
            .tag { font-size: 12px; padding: 2px 6px; border-radius: 9999px; white-space: nowrap; display: inline-block; }
            .tag-national { background: #dbeafe; color: #1e40af; }   /* blue */
            .tag-lgu { background: #dcfce7; color: #166534; }        /* green */
            .tag-barangay { background: #fef9c3; color: #854d0e; }   /* yellow */
            .tag-default { background: #e0e7ff; color: #4338ca; }    /* indigo */
          </style>
        </head>
        <body>
          <h2>Calendar of Activities</h2>
          ${Object.entries(grouped)
            .map(
              ([date, items]) => `
              <div class="day-block">
                <div class="date-header">
                  <div class="day-number">${
                    date !== 'no-date' ? format(new Date(date), 'd') : '—'
                  }</div>
                  <div class="full-date">${
                    date !== 'no-date'
                      ? format(new Date(date), 'EEEE, MMMM d, yyyy')
                      : 'No Date'
                  }</div>
                </div>
                ${items
                  .map(
                    (a) => `
                    <div class="activity-card">
                      <div>
                        <div class="particulars">${a.particulars ?? ''}</div>
                        ${
                          a.location
                            ? `<div class="location">${a.location}</div>`
                            : ''
                        }
                      </div>
                      
                      <div class="tag ${
                        a.type === 'National Agency'
                          ? 'tag-national'
                          : a.type === 'LGU Activity'
                            ? 'tag-lgu'
                            : a.type === 'Barangay Activity'
                              ? 'tag-barangay'
                              : 'tag-default'
                      }">
                    ${a.type}
                  </div>
                    </div>
                  `
                  )
                  .join('')}
              </div>
            `
            )
            .join('')}
        </body>
      </html>
    `

    const newWin = window.open('', '_blank')
    if (newWin) {
      newWin.document.write(printContent)
      newWin.document.close()
      newWin.focus()
      newWin.print()
      newWin.close()
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-blue-600 text-white">
        Print
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Calendar</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">From</label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">To</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrint}>Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

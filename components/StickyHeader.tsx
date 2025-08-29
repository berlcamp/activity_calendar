'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import HeaderDropdown from './HeaderDropdownMenu'
import NotificationBell from './NotificationBell'
import { Input } from './ui/input'
import { SidebarTrigger } from './ui/sidebar'

export default function StickyHeader() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('') // ✅ add state for search input

  const router = useRouter()

  const handleSearch = (term: string) => {
    if (!term.trim()) return
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <header className="fixed w-full top-0 z-40 bg-[#2e2e30] border-b border-[#424244] p-2 flex justify-start items-center gap-4">
      <SidebarTrigger />

      {/* Left section: Logo */}
      <div className="flex items-center gap-4">
        <div className="text-white font-semibold flex items-center">
          <span>ADB</span>
        </div>
      </div>

      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch(searchTerm)
        }}
      >
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // ✅ keep state in sync
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSubmitting) {
              e.preventDefault()
              setIsSubmitting(true)
              handleSearch(searchTerm)
              e.currentTarget.blur() // 👈 unfocus after submit
              setTimeout(() => setIsSubmitting(false), 1000) // cooldown
            }
          }}
          className="w-full bg-[#565557] border-none focus-visible:ring-1 focus:ring-white text-white"
        />
      </form>

      <div className="flex-1"></div>

      {/* 🔔 Notification */}
      <NotificationBell />

      {/* Right section: Settings dropdown */}
      <HeaderDropdown />
    </header>
  )
}

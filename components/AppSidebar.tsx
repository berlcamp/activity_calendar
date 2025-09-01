'use client'

import { Calendar, Home, Users2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useAppSelector } from '@/lib/redux/hook'

export function AppSidebar() {
  const pathname = usePathname()

  const user = useAppSelector((state) => state.user.user)

  // Menu items
  const items = [
    {
      title: 'Home',
      url: '/home',
      icon: Home
    },
    {
      title: 'Calendar',
      url: '/calendar',
      icon: Calendar
    }
  ]

  // Only add HR if user.id === 1
  if (user?.system_user_id === 1) {
    items.push({
      title: 'HR - Employees',
      url: '/hr',
      icon: Users2
    })
  }

  return (
    <Sidebar className="pt-13">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 rounded-md px-2 py-1 transition-colors ${
                          isActive
                            ? 'bg-gray-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            isActive ? 'text-white' : 'text-gray-400'
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

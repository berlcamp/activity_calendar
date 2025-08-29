/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import LoadingSkeleton from '@/components/LoadingSkeleton'
import { OverviewTab } from '@/components/OverviewTab'
import { VotersTab } from '@/components/VotersTab'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hook'
import { clearLocation, setLocation } from '@/lib/redux/locationSlice'
import { supabase } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'voters' | 'households'
  >('overview')

  const user = useAppSelector((state) => state.user.user)

  const params = useParams()
  const locationId = params?.locationid as string

  console.log('params', params)

  const [loading, setLoading] = useState(false)

  const dispatch = useAppDispatch()
  const location = useAppSelector((state) => state.location.selectedLocation)

  useEffect(() => {
    if (!locationId) return

    dispatch(clearLocation()) // 👈 Clear old location when URL changes

    const fetchData = async () => {
      console.log('location details fetched')
      setLoading(true)

      // Super admin
      if (user?.admin) {
        const { data, error } = await supabase
          .from('locations')
          .select()
          .eq('id', locationId)
          .single()

        if (error) {
          console.error('Error checking access:', error)
        }
        dispatch(setLocation(data))
      } else {
        const { data, error } = await supabase.rpc('check_location_access', {
          input_user_id: user?.system_user_id,
          input_location_id: locationId
        })
        console.log('location details fetched2')

        if (error) {
          console.error('Error checking access:', error)
        } else if (data === false) {
          console.log('User has no access')
        } else if (data) {
          console.log('location details fetched2', data)
          dispatch(setLocation(data))
        }
      }

      setLoading(false)
    }
    void fetchData()
  }, [locationId])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!location) {
    return (
      <div className="space-y-4 w-full">
        <div className="app__title">
          <h1 className="text-xl font-semibold">Page not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="app__title">
        <h1 className="text-xl font-semibold">{location.name}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b flex gap-2 px-4 mt-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-2 text-sm -mb-px cursor-pointer ${
            activeTab === 'overview'
              ? 'border-b-2 font-bold border-gray-500 text-gray-700 dark:text-gray-400'
              : 'text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Overview
        </button>
        {user?.type === 'super admin xx' && (
          <button
            onClick={() => setActiveTab('voters')}
            className={`py-2 px-2 text-sm -mb-px cursor-pointer ${
              activeTab === 'voters'
                ? 'border-b-2 font-bold border-gray-500 text-gray-700 dark:text-gray-400'
                : 'text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Voters
          </button>
        )}
      </div>

      <div className="px-4">
        <div className={activeTab === 'overview' ? '' : 'hidden'}>
          <OverviewTab />
        </div>
        {user?.type === 'super admin xx' && (
          <div className={activeTab === 'voters' ? '' : 'hidden'}>
            <VotersTab locationId={Number(locationId)} />
          </div>
        )}
      </div>
    </div>
  )
}

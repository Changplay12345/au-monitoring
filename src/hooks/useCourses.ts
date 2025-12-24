'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Course, NormalizedCourse, CourseGroup, FilterState, DAYS } from '@/lib/types'
import { normalizeCourse, toMinutes } from '@/lib/utils'

const TABLE_NAME = 'data_vme'

export function useCourses() {
  const [rawCourses, setRawCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false) // Start as not loading
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    session: 'ALL',
    activeDay: 'ALL',
  })

  // Fetch courses from Supabase
  const fetchCourses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('*')

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        setError(fetchError.message)
        setIsLoading(false)
        return
      }

      setRawCourses((data || []).filter(Boolean) as Course[])
      setIsLoading(false)
    } catch (error) {
      console.error('Unexpected fetch error:', error)
      setError('Failed to fetch courses')
      setIsLoading(false)
    }
  }, [])

  // Initial fetch - removed to prevent auto-loading
  // useEffect(() => {
  //   fetchCourses()
  // }, [fetchCourses])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('courses-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRawCourses(prev => [...prev, payload.new as Course])
          } else if (payload.eventType === 'UPDATE') {
            setRawCourses(prev => 
              prev.map(c => 
                c['Course Code'] === (payload.new as Course)['Course Code'] 
                  ? payload.new as Course 
                  : c
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setRawCourses(prev => 
              prev.filter(c => c['Course Code'] !== (payload.old as Course)['Course Code'])
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Normalize courses
  const normalizedCourses = useMemo(() => {
    return rawCourses.map(normalizeCourse)
  }, [rawCourses])

  // Apply filters
  const filteredCourses = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const ses = filters.session

    return normalizedCourses.filter(course => {
      const code = (course.code || '').toLowerCase()
      const prefix = (course.prefix || '').toLowerCase()
      const okQ = !q || code.startsWith(q) || prefix === q
      const okS = ses === 'ALL' || course.session === ses
      return okQ && okS
    })
  }, [normalizedCourses, filters.search, filters.session])

  // Group overlapping courses by day
  const groupedByDay = useMemo(() => {
    const grouped: Record<string, CourseGroup[]> = {}

    for (const day of DAYS) {
      const rows = filteredCourses.filter(r => r.day === day)

      // Sort by start time, then end time
      rows.sort((a, b) => {
        const sa = toMinutes(a.start) || 0
        const sb = toMinutes(b.start) || 0
        if (sa !== sb) return sa - sb
        const ea = toMinutes(a.end) || 0
        const eb = toMinutes(b.end) || 0
        return ea - eb
      })

      const groups: CourseGroup[] = []

      for (const row of rows) {
        const s = toMinutes(row.start)
        const e = toMinutes(row.end)

        // Skip rows with missing times or non-positive duration
        if (s == null || e == null || e <= s) continue

        let placed = false
        for (const g of groups) {
          if (s < g.max && e > g.min) {
            g.items.push(row)
            g.min = Math.min(g.min, s)
            g.max = Math.max(g.max, e)
            placed = true
            break
          }
        }

        if (!placed) {
          groups.push({ min: s, max: e, items: [row], visibleIndex: 0 })
        }
      }

      // Set visible index to longest duration course
      groups.forEach(g => {
        g.visibleIndex = g.items.reduce((best, it, idx) => {
          const dur = (toMinutes(it.end) || 0) - (toMinutes(it.start) || 0)
          const bestDur = (toMinutes(g.items[best].end) || 0) - (toMinutes(g.items[best].start) || 0)
          return dur > bestDur ? idx : best
        }, 0)
      })

      grouped[day] = groups
    }

    return grouped
  }, [filteredCourses])

  // Update filters
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  const setSession = useCallback((session: FilterState['session']) => {
    setFilters(prev => ({ ...prev, session }))
  }, [])

  const setActiveDay = useCallback((activeDay: string) => {
    setFilters(prev => ({ ...prev, activeDay }))
  }, [])

  return {
    courses: normalizedCourses,
    filteredCourses,
    groupedByDay,
    isLoading,
    error,
    filters,
    setSearch,
    setSession,
    setActiveDay,
    refresh: fetchCourses,
  }
}

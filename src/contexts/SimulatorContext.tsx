'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface SimulatorState {
  isRunning: boolean
  sessionId: string | null
  stats: {
    registeredStudents: number
    totalRegistrations: number
    failedRegistrations: number
    startTime: string | null
    elapsedTime: number
  }
  config: {
    totalStudents: number
    coursesPerStudent: number
    studentsPerMinute: number
  }
  logs: string[]
}

interface SimulatorContextType {
  state: SimulatorState
  isSimulatorRunning: boolean
  startSimulation: (config: SimulatorState['config']) => Promise<void>
  stopSimulation: () => Promise<void>
  resetSimulation: () => Promise<void>
  refreshStatus: () => Promise<void>
}

const defaultState: SimulatorState = {
  isRunning: false,
  sessionId: null,
  stats: {
    registeredStudents: 0,
    totalRegistrations: 0,
    failedRegistrations: 0,
    startTime: null,
    elapsedTime: 0,
  },
  config: {
    totalStudents: 100,
    coursesPerStudent: 5,
    studentsPerMinute: 20,
  },
  logs: [],
}

const SimulatorContext = createContext<SimulatorContextType | null>(null)

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulatorState>(defaultState)

  // Poll for status updates when simulation is running
  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/simulator/status')
      if (res.ok) {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          isRunning: data.isRunning,
          sessionId: data.sessionId,
          stats: data.stats || prev.stats,
          logs: data.logs || prev.logs,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch simulator status:', error)
    }
  }, [])

  // Initial status check and polling
  useEffect(() => {
    refreshStatus()
    
    // Poll every 2 seconds when running
    const interval = setInterval(() => {
      refreshStatus()
    }, 2000)

    return () => clearInterval(interval)
  }, [refreshStatus])

  const startSimulation = useCallback(async (config: SimulatorState['config']) => {
    try {
      const res = await fetch('/api/simulator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (res.ok) {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          isRunning: true,
          sessionId: data.sessionId,
          config,
          stats: {
            ...prev.stats,
            registeredStudents: 0,
            totalRegistrations: 0,
            failedRegistrations: 0,
            startTime: new Date().toISOString(),
            elapsedTime: 0,
          },
          logs: [`[${new Date().toLocaleTimeString()}] 🚀 Simulation started`],
        }))
      }
    } catch (error) {
      console.error('Failed to start simulation:', error)
    }
  }, [])

  const stopSimulation = useCallback(async () => {
    try {
      await fetch('/api/simulator/stop', { method: 'POST' })
      setState(prev => ({
        ...prev,
        isRunning: false,
      }))
    } catch (error) {
      console.error('Failed to stop simulation:', error)
    }
  }, [])

  const resetSimulation = useCallback(async () => {
    try {
      await fetch('/api/simulator/reset', { method: 'POST' })
      setState(prev => ({
        ...prev,
        isRunning: false,
        stats: defaultState.stats,
        logs: [`[${new Date().toLocaleTimeString()}] 🔄 Database reset`],
      }))
    } catch (error) {
      console.error('Failed to reset simulation:', error)
    }
  }, [])

  return (
    <SimulatorContext.Provider
      value={{
        state,
        isSimulatorRunning: state.isRunning,
        startSimulation,
        stopSimulation,
        resetSimulation,
        refreshStatus,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  )
}

export function useSimulator() {
  const context = useContext(SimulatorContext)
  if (!context) {
    throw new Error('useSimulator must be used within SimulatorProvider')
  }
  return context
}

import { createServerClient } from './supabase'

const TEST_TABLE = 'data_vme_test'
const SOURCE_TABLE = 'data_vme'

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

// Use global to persist across hot reloads in dev mode
declare global {
  var __simulatorState: SimulatorState | undefined
  var __simulationInterval: NodeJS.Timeout | null | undefined
}

// In-memory state (persists as long as server is running)
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

// Initialize or get existing state
if (!global.__simulatorState) {
  global.__simulatorState = { ...defaultState }
}
if (global.__simulationInterval === undefined) {
  global.__simulationInterval = null
}

const simulatorState = global.__simulatorState

export function getSimulatorState(): SimulatorState {
  // Update elapsed time if running
  if (simulatorState.isRunning && simulatorState.stats.startTime) {
    const start = new Date(simulatorState.stats.startTime).getTime()
    simulatorState.stats.elapsedTime = Math.floor((Date.now() - start) / 1000)
  }
  return { ...simulatorState }
}

export function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  simulatorState.logs = [`[${timestamp}] ${message}`, ...simulatorState.logs.slice(0, 99)]
}

export async function startSimulator(config: SimulatorState['config']): Promise<string> {
  if (simulatorState.isRunning) {
    return simulatorState.sessionId || ''
  }

  const sessionId = `sim_${Date.now()}`
  
  // Update state properties directly instead of reassigning
  simulatorState.isRunning = true
  simulatorState.sessionId = sessionId
  simulatorState.stats = {
    registeredStudents: 0,
    totalRegistrations: 0,
    failedRegistrations: 0,
    startTime: new Date().toISOString(),
    elapsedTime: 0,
  }
  simulatorState.config = config
  simulatorState.logs = []

  addLog(`🚀 Starting simulation: ${config.totalStudents} students, ${config.coursesPerStudent} courses each, ${config.studentsPerMinute} students/min`)

  // Start the simulation loop
  const intervalMs = (60 / config.studentsPerMinute) * 1000
  
  global.__simulationInterval = setInterval(async () => {
    if (!simulatorState.isRunning) {
      if (global.__simulationInterval) {
        clearInterval(global.__simulationInterval)
        global.__simulationInterval = null
      }
      return
    }

    if (simulatorState.stats.registeredStudents >= config.totalStudents) {
      addLog('🎉 Simulation completed!')
      stopSimulator()
      return
    }

    // Register a student
    await registerStudent()
  }, intervalMs)

  return sessionId
}

async function registerStudent() {
  const supabase = createServerClient()
  const studentNum = simulatorState.stats.registeredStudents + 1

  // Get available courses
  const { data: courses } = await supabase
    .from(TEST_TABLE)
    .select('*')
    .gt('Seat Left', 0)

  if (!courses || courses.length === 0) {
    addLog(`⚠️ No available seats for Student #${studentNum}`)
    simulatorState.stats.registeredStudents = studentNum
    simulatorState.stats.failedRegistrations += simulatorState.config.coursesPerStudent
    return
  }

  // Randomly select courses
  const numCourses = Math.min(simulatorState.config.coursesPerStudent, courses.length)
  const shuffled = [...courses].sort(() => Math.random() - 0.5)
  const selectedCourses = shuffled.slice(0, numCourses)

  let successCount = 0
  let failedCount = 0

  for (const course of selectedCourses) {
    // Check current availability
    const { data: currentData } = await supabase
      .from(TEST_TABLE)
      .select('*')
      .eq('Course Code', course['Course Code'])
      .eq('Section', course['Section'])
      .single()

    if (!currentData || currentData['Seat Left'] <= 0) {
      failedCount++
      continue
    }

    // Update seat count
    const { error } = await supabase
      .from(TEST_TABLE)
      .update({
        'Seat Used': currentData['Seat Used'] + 1,
        'Seat Left': currentData['Seat Left'] - 1,
      })
      .eq('Course Code', course['Course Code'])
      .eq('Section', course['Section'])

    if (error) {
      failedCount++
      addLog(`❌ Failed: Student #${studentNum} → ${course['Course Code']}-${course['Section']}`)
    } else {
      successCount++
      addLog(`✅ Registered: Student #${studentNum} → ${course['Course Code']}-${course['Section']} (Seat Left: ${currentData['Seat Left'] - 1})`)
    }
  }

  simulatorState.stats.registeredStudents = studentNum
  simulatorState.stats.totalRegistrations += successCount
  simulatorState.stats.failedRegistrations += failedCount
}

export function stopSimulator() {
  if (global.__simulationInterval) {
    clearInterval(global.__simulationInterval)
    global.__simulationInterval = null
  }
  simulatorState.isRunning = false
  addLog('⏹️ Simulation stopped')
}

export async function resetSimulator() {
  stopSimulator()
  
  const supabase = createServerClient()

  // Copy data from source to test table
  const { data: sourceData, error: fetchError } = await supabase
    .from(SOURCE_TABLE)
    .select('*')

  if (fetchError || !sourceData) {
    addLog(`❌ Error fetching source data: ${fetchError?.message}`)
    return false
  }

  // Clear test table
  await supabase.from(TEST_TABLE).delete().neq('Course Code', '')

  // Insert fresh data
  const { error: insertError } = await supabase
    .from(TEST_TABLE)
    .insert(sourceData.map(row => ({ ...row })))

  if (insertError) {
    addLog(`❌ Error resetting database: ${insertError.message}`)
    return false
  }

  simulatorState.stats = {
    registeredStudents: 0,
    totalRegistrations: 0,
    failedRegistrations: 0,
    startTime: null,
    elapsedTime: 0,
  }
  
  addLog(`🔄 Database reset - ${sourceData.length} courses restored`)
  return true
}

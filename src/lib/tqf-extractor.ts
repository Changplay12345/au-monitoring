/**
 * TQF Fast Extractor - Pure TypeScript implementation
 * Extracts study plan data from DOCX files using regex patterns
 */

import mammoth from 'mammoth'
import { v4 as uuidv4 } from 'uuid'

// Types
export interface ProgramInfo {
  program_code: string
  program_title: string
  total_credits: number
}

export interface Course {
  year: number
  semester: number
  course_code: string
  course_title: string
  credits: number
  prerequisite: string
  or_flag: string
}

export interface StudyPlanNode {
  id: string
  year: number
  semester: number
  code: string
  title: string
  credits: number
  type: 'course' | 'major_elective' | 'free_elective'
  or_group: string | null
  position: { x: number; y: number } | null
}

export interface StudyPlanEdge {
  from_id: string
  to_id: string
  sources?: string[]
}

export interface StudyPlanGraph {
  nodes: StudyPlanNode[]
  edges: StudyPlanEdge[]
}

export interface ParseResponse {
  program_info: ProgramInfo
  courses: Course[]
  session_id: string | null
  graph: StudyPlanGraph | null
}

// In-memory storage for sessions (server-side only)
const sessionStorage = new Map<string, ParseResponse>()
const csvStorage = new Map<string, string>()

export function getSession(sessionId: string): ParseResponse | undefined {
  return sessionStorage.get(sessionId)
}

export function getCSV(sessionId: string): string | undefined {
  return csvStorage.get(sessionId)
}

export function setSession(sessionId: string, data: ParseResponse, csv: string): void {
  sessionStorage.set(sessionId, data)
  csvStorage.set(sessionId, csv)
  // Auto-cleanup after 1 hour
  setTimeout(() => {
    sessionStorage.delete(sessionId)
    csvStorage.delete(sessionId)
  }, 60 * 60 * 1000)
}

/**
 * Extract text from DOCX file buffer
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

/**
 * Extract credits number from string like '3 (3-0-6)'
 */
function extractCreditsNumber(creditsStr: string): number {
  const match = creditsStr.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : 3
}

/**
 * Extract prerequisites from DOCX text
 * Pattern: Course line followed by "Prerequisite: ..." line
 */
function extractPrerequisites(text: string): Record<string, string> {
  const prerequisites: Record<string, string> = {}
  const lines = text.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check if this line is a prerequisite line
    if (line.toLowerCase().startsWith('prerequisite')) {
      // Look at previous non-empty lines to find the course
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const prevLine = lines[j].trim()
        if (!prevLine) continue
        
        // Try to extract course code from previous line
        const courseMatch = prevLine.match(/^([A-Z]{2,4}\s*\d{4})/)
        if (courseMatch) {
          const courseCode = courseMatch[1].replace(/\s/g, '')
          
          // Extract prerequisite content after "Prerequisite:" or "Prerequisites:"
          const prereqMatch = line.match(/^Prerequisites?:\s*(.+)$/i)
          if (prereqMatch) {
            const prereqText = prereqMatch[1].trim()
            prerequisites[courseCode] = prereqText
          }
          break
        }
      }
    }
  }
  
  return prerequisites
}

/**
 * Extract program info from document text
 */
function extractProgramInfo(text: string): ProgramInfo {
  // Try to find program code
  let codeMatch = text.match(/Code\s+(\d{10,})/i)
  if (!codeMatch) {
    codeMatch = text.match(/Program\s*Code[:\s]*([A-Z0-9\-]+)/i)
  }
  const programCode = codeMatch ? codeMatch[1] : 'UNKNOWN'

  // Try to find program title
  let programTitle = 'Study Plan'
  let titleMatch = text.match(/Program\s+(Bachelor[^\n]+(?:\([^)]+\))?)/i)
  if (titleMatch) {
    programTitle = titleMatch[1].trim()
  } else {
    titleMatch = text.match(/(Bachelor\s+of\s+\w+\s+Program\s+in[^\n]+(?:\([^)]+\))?)/i)
    if (titleMatch) {
      programTitle = titleMatch[1].trim()
    }
  }
  programTitle = programTitle.split(/\s+/).join(' ')

  // Try to find total credits
  let creditsMatch = text.match(/Total\s*(?:Credits?|หน่วยกิต)[:\s]*(\d+)/i)
  if (!creditsMatch) {
    creditsMatch = text.match(/(\d{2,3})\s*Credits?/i)
  }
  const totalCredits = creditsMatch ? parseInt(creditsMatch[1], 10) : 132

  return {
    program_code: programCode,
    program_title: programTitle,
    total_credits: totalCredits
  }
}

/**
 * Word to number mapping
 */
const wordToNum: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
}

/**
 * Extract courses for a specific year/semester
 */
function extractSemesterCourses(text: string, year: number, semester: number): Array<[string, string, number, string]> {
  const headerPattern = new RegExp(`Year\\s*${year}[\\s,]*Semester\\s*${semester}`, 'i')
  
  if (!text) return []
  
  const headerMatch = text.match(headerPattern)
  if (!headerMatch || headerMatch.index === undefined) return []
  
  // Find the end of this semester section (next Year X, Semester Y or end of text)
  const nextSemesterPattern = new RegExp(`Year\\s*\\d[\\s,]*Semester\\s*\\d`, 'gi')
  let endIndex = text.length
  let match
  nextSemesterPattern.lastIndex = headerMatch.index + 1
  while ((match = nextSemesterPattern.exec(text)) !== null) {
    if (match.index > headerMatch.index + 10) {
      endIndex = match.index
      break
    }
  }
  
  const sectionText = text.slice(headerMatch.index, endIndex)
  const lines = sectionText.split('\n')
  const dataRows: Array<[string, string, number, string]> = []
  
  // Filter out empty lines and get clean lines
  const cleanLines = lines.map(l => l.trim()).filter(l => l)
  
  // Find where the actual course data starts (after header)
  let startIdx = 0
  for (let i = 0; i < cleanLines.length; i++) {
    if (cleanLines[i] === 'Credits') {
      startIdx = i + 1
      break
    }
  }
  
  // Process lines - the table may have multiple courses per row
  // Pattern: CODE1, CODE2, TITLE1, TITLE2, CREDITS1, CREDITS2
  // We need to collect codes, then titles, then credits and pair them
  
  let i = startIdx
  while (i < cleanLines.length) {
    const line = cleanLines[i]
    
    // Stop at Total line
    if (/^Total/i.test(line)) break
    
    // Handle Major Elective
    if (line.includes('Major Elective')) {
      const electiveMatch = line.match(/(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|\d+)\s+Major Elective/i)
      if (electiveMatch) {
        const numStr = electiveMatch[1].toLowerCase()
        const num = parseInt(numStr, 10) || wordToNum[numStr] || 1
        for (let j = 0; j < num; j++) {
          dataRows.push(['', 'Major Elective Course', 3, ''])
        }
      }
      i++
      continue
    }
    
    // Handle Free Elective
    if (line.includes('Free Elective')) {
      const electiveMatch = line.match(/(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|\d+)\s+Free Elective/i)
      if (electiveMatch) {
        const numStr = electiveMatch[1].toLowerCase()
        const num = parseInt(numStr, 10) || wordToNum[numStr] || 1
        for (let j = 0; j < num; j++) {
          dataRows.push(['', 'Free Elective Course', 3, ''])
        }
      }
      i++
      continue
    }
    
    // Check for standalone "or" prefix (e.g., "or GE 1409" that appears after credits)
    const orPrefixMatch = line.match(/^or\s+([A-Z]{2,4}\s*\d{4})$/i)
    if (orPrefixMatch) {
      const code = orPrefixMatch[1].replace(/\s/g, '')
      i++
      
      // Look ahead for title and credits
      let title = ''
      let credits = 3
      
      // Get title (next non-code, non-credits line)
      if (i < cleanLines.length && 
          !/^[A-Z]{2,4}\s*\d{4}$/.test(cleanLines[i]) &&
          !/^or\s+/i.test(cleanLines[i]) &&
          !/^\d+\s*\([\d\-]+\)/.test(cleanLines[i]) &&
          !/^Total/i.test(cleanLines[i])) {
        title = cleanLines[i]
        i++
      }
      
      // Get credits
      if (i < cleanLines.length && /^\d+\s*\([\d\-]+\)/.test(cleanLines[i])) {
        const cm = cleanLines[i].match(/^(\d+)/)
        credits = cm ? parseInt(cm[1], 10) : 3
        i++
      }
      
      // Mark previous courses in the same OR group
      // Look back and mark all recent courses as OR until we hit a non-OR course
      for (let k = dataRows.length - 1; k >= 0; k--) {
        if (dataRows[k][3] === 'or') continue // Already marked
        // Check if this course is likely part of the same OR group (same semester section)
        dataRows[k][3] = 'or'
        break // Only mark the immediately previous course
      }
      
      dataRows.push([code, title || 'Unknown Course', credits, 'or'])
      continue
    }
    
    // Check if this line is a course code
    const codeMatch = line.match(/^([A-Z]{2,4}\s*\d{4})$/)
    if (codeMatch) {
      // Collect all consecutive course codes (same row in table)
      const codes: string[] = []
      while (i < cleanLines.length && /^[A-Z]{2,4}\s*\d{4}$/.test(cleanLines[i])) {
        codes.push(cleanLines[i].replace(/\s/g, ''))
        i++
      }
      
      // Check if next line is "or CODE" - if so, we need to handle OR group specially
      // Collect OR codes that follow
      const orCodes: string[] = []
      while (i < cleanLines.length && /^or\s+[A-Z]{2,4}\s*\d{4}$/i.test(cleanLines[i])) {
        const orMatch = cleanLines[i].match(/^or\s+([A-Z]{2,4}\s*\d{4})$/i)
        if (orMatch) {
          orCodes.push(orMatch[1].replace(/\s/g, ''))
        }
        i++
      }
      
      // Collect all consecutive titles (same row in table)
      const titles: string[] = []
      while (i < cleanLines.length && 
             !/^[A-Z]{2,4}\s*\d{4}$/.test(cleanLines[i]) &&
             !/^or\s+[A-Z]{2,4}\s*\d{4}$/i.test(cleanLines[i]) &&
             !/^\d+\s*\([\d\-]+\)/.test(cleanLines[i]) &&
             !/^Total/i.test(cleanLines[i]) &&
             !/^Year\s*\d/i.test(cleanLines[i])) {
        titles.push(cleanLines[i])
        i++
      }
      
      // Collect all consecutive credits (same row in table)
      const creditsList: number[] = []
      while (i < cleanLines.length && /^\d+\s*\([\d\-]+\)/.test(cleanLines[i])) {
        const creditsMatch = cleanLines[i].match(/^(\d+)/)
        creditsList.push(creditsMatch ? parseInt(creditsMatch[1], 10) : 3)
        i++
      }
      
      // Combine all codes (regular + OR codes)
      const allCodes = [...codes, ...orCodes]
      const hasOrCodes = orCodes.length > 0
      
      // Check if any title contains "or" indicating OR courses
      const hasOrInTitles = titles.some(t => /\bor\b/i.test(t))
      const isOrGroup = (codes.length === 2 && titles.length >= 2 && hasOrInTitles) || hasOrCodes
      
      // Pair codes with titles and credits
      for (let j = 0; j < allCodes.length; j++) {
        const code = allCodes[j]
        const title = titles[j] || titles[0] || 'Unknown Course'
        const credits = creditsList[j] !== undefined ? creditsList[j] : (creditsList[0] || 3)
        // Mark as OR if it's part of an OR group
        const orFlag = isOrGroup ? 'or' : ''
        dataRows.push([code, title, credits, orFlag])
      }
      
      continue
    }
    
    i++
  }
  
  return dataRows
}

/**
 * Validate and clean courses - filter prerequisites to only include in-plan courses
 */
function validateAndCleanCourses(courses: Course[]): Course[] {
  const validCodes = new Set(courses.map(c => c.course_code.replace(/\s/g, '')).filter(Boolean))
  
  return courses.map(course => {
    if (course.prerequisite && course.prerequisite !== '' && course.prerequisite !== '-') {
      const prereqList = course.prerequisite.split(',').map(p => p.trim())
      const validPrereqs: string[] = []
      
      for (const prereq of prereqList) {
        if (!prereq) continue
        const codeMatch = prereq.match(/^([A-Z]{2,4}\s*\d{4})/)
        if (codeMatch) {
          const prereqCode = codeMatch[1].replace(/\s/g, '')
          if (validCodes.has(prereqCode)) {
            validPrereqs.push(prereqCode)
          }
        }
      }
      
      return { ...course, prerequisite: validPrereqs.join(', ') }
    }
    return course
  })
}

/**
 * Generate study plan graph for visualization
 */
function generateStudyPlanGraph(courses: Course[]): StudyPlanGraph {
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.semester - b.semester
  })
  
  const nodes: StudyPlanNode[] = []
  const courseCodeToId: Record<string, string> = {}
  const orGroupCounter: Record<string, number> = {}
  const semesterPositions: Record<string, number> = {}
  
  for (const course of sortedCourses) {
    const titleLower = (course.course_title || '').toLowerCase()
    let nodeType: 'course' | 'major_elective' | 'free_elective' = 'course'
    
    if (titleLower.includes('major elective')) {
      nodeType = 'major_elective'
    } else if (titleLower.includes('free elective')) {
      nodeType = 'free_elective'
    }
    
    let nodeId: string
    if (course.course_code) {
      nodeId = course.course_code
      courseCodeToId[course.course_code] = nodeId
      courseCodeToId[course.course_code.replace(/\s/g, '')] = nodeId
    } else {
      const semesterKey = `${course.year}-${course.semester}`
      orGroupCounter[semesterKey] = (orGroupCounter[semesterKey] || 0) + 1
      nodeId = `Y${course.year}S${course.semester}-${nodeType.toUpperCase()}-${orGroupCounter[semesterKey]}`
    }
    
    const orGroup = course.or_flag === 'or' ? `Y${course.year}S${course.semester}-OR` : null
    
    const semesterIndex = (course.year - 1) * 2 + course.semester
    const semesterKey = `${course.year}-${course.semester}`
    semesterPositions[semesterKey] = semesterPositions[semesterKey] || 0
    
    const row = semesterPositions[semesterKey]
    const x = semesterIndex * 300
    const y = row * 150
    semesterPositions[semesterKey]++
    
    nodes.push({
      id: nodeId,
      year: course.year,
      semester: course.semester,
      code: course.course_code || '',
      title: course.course_title,
      credits: course.credits,
      type: nodeType,
      or_group: orGroup,
      position: { x, y }
    })
  }
  
  // Create edges from prerequisites
  const edges: StudyPlanEdge[] = []
  const coursePrerequisites: Record<string, string[]> = {}
  
  for (const course of sortedCourses) {
    if (!course.course_code || !course.prerequisite || course.prerequisite === '' || course.prerequisite === '-') {
      continue
    }
    
    const prereqList = course.prerequisite.split(',').map(p => p.trim())
    const validPrereqs: string[] = []
    
    for (const prereq of prereqList) {
      if (!prereq) continue
      const codeMatch = prereq.match(/^([A-Z]{2,4}\s*\d{4})/)
      if (codeMatch) {
        const prereqCode = codeMatch[1].replace(/\s/g, '')
        if (courseCodeToId[prereqCode]) {
          validPrereqs.push(prereqCode)
        }
      }
    }
    
    if (validPrereqs.length > 0) {
      coursePrerequisites[course.course_code] = validPrereqs
    }
  }
  
  for (const [targetCourse, sourceCourses] of Object.entries(coursePrerequisites)) {
    if (sourceCourses.length === 1) {
      edges.push({
        from_id: courseCodeToId[sourceCourses[0]],
        to_id: courseCodeToId[targetCourse]
      })
    } else {
      edges.push({
        from_id: courseCodeToId[sourceCourses[0]],
        to_id: courseCodeToId[targetCourse],
        sources: sourceCourses.map(prereq => courseCodeToId[prereq])
      })
    }
  }
  
  return { nodes, edges }
}

/**
 * Generate CSV content from courses
 */
export function generateCSV(courses: Course[]): string {
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.semester - b.semester
  })
  
  const rows: string[] = []
  rows.push('Year,Semester,CourseCode,CourseTitle,Prerequisite,Or')
  
  let currentYear: number | null = null
  
  for (const course of sortedCourses) {
    if (currentYear !== null && course.year !== currentYear) {
      rows.push(',,,,,')
    }
    currentYear = course.year
    
    const courseCode = (course.course_code || '').trim()
    const courseTitle = (course.course_title || '').trim().replace(/,/g, ';')
    const prerequisite = (course.prerequisite && course.prerequisite !== '-') ? course.prerequisite.trim() : ''
    const orFlag = (course.or_flag || '').trim()
    
    rows.push(`${course.year},${course.semester},"${courseCode}","${courseTitle}","${prerequisite}","${orFlag}"`)
  }
  
  return rows.join('\n')
}

/**
 * Main extraction function - Fast extract without AI
 */
export async function fastExtractStudyPlan(fileBuffer: Buffer, filename: string): Promise<ParseResponse> {
  if (!filename.toLowerCase().endsWith('.docx')) {
    throw new Error('Only DOCX files are supported for fast extraction')
  }
  
  const text = await extractTextFromDocx(fileBuffer)
  
  if (!text.trim()) {
    throw new Error('Could not extract text from the uploaded file')
  }
  
  const programInfo = extractProgramInfo(text)
  
  // Extract prerequisites from DOCX text
  const prereqMap = extractPrerequisites(text)
  
  const yearSemPairs: Array<[number, number]> = [
    [1, 1], [1, 2], [2, 1], [2, 2],
    [3, 1], [3, 2], [4, 1], [4, 2]
  ]
  
  let courses: Course[] = []
  
  for (const [year, semester] of yearSemPairs) {
    const semesterCourses = extractSemesterCourses(text, year, semester)
    
    for (const [code, title, credits, orFlag] of semesterCourses) {
      // Get prerequisite for this course
      const codeNormalized = code.replace(/\s/g, '')
      const prereq = prereqMap[codeNormalized] || ''
      
      courses.push({
        year,
        semester,
        course_code: code,
        course_title: title,
        credits,
        prerequisite: prereq,
        or_flag: orFlag
      })
    }
  }
  
  // Filter prerequisites to only include courses that exist in the plan
  const validCodes = new Set(courses.map(c => c.course_code.replace(/\s/g, '')).filter(Boolean))
  courses = courses.map(course => {
    if (course.prerequisite && course.prerequisite !== '' && course.prerequisite !== '-') {
      const prereqCodes = course.prerequisite.match(/[A-Z]{2,4}\s*\d{4}/g) || []
      const validPrereqs = prereqCodes
        .map(p => p.replace(/\s/g, ''))
        .filter(p => validCodes.has(p))
      return { ...course, prerequisite: validPrereqs.join(', ') }
    }
    return course
  })
  
  // Validate and clean courses
  courses = validateAndCleanCourses(courses)
  
  // Generate graph
  const graph = generateStudyPlanGraph(courses)
  
  // Generate session ID
  const sessionId = uuidv4()
  
  // Generate CSV and store session
  const csv = generateCSV(courses)
  setSession(sessionId, {
    program_info: programInfo,
    courses,
    session_id: sessionId,
    graph
  }, csv)
  
  return {
    program_info: programInfo,
    courses,
    session_id: sessionId,
    graph
  }
}

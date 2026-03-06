// Electrical & Electronic Engineering major elective configuration
// EE uses the shared elective list PLUS EE-specific electives (e.g. BG2212)

import { sharedMajorElectives } from '../majorElectives'
import type { MajorElectiveCourse } from '../majorElectives'

export const majorId = 'electrical-engineering'
export const majorLabel = 'Electrical & Electronic Engineering'

// EE-only electives (BG2212 is mandatory for CE but a major elective for EE)
const eeOnlyElectives: MajorElectiveCourse[] = [
  { courseCode: 'BG2212', courseName: 'Applied Statistics', credits: 3, category: 'BG' },
]

// EE = shared electives + EE-only electives
export const majorElectives: MajorElectiveCourse[] = [...sharedMajorElectives, ...eeOnlyElectives]
export const electiveCodesSet: Set<string> = new Set(majorElectives.map(c => c.courseCode))
export const electiveLookup: Map<string, MajorElectiveCourse> = new Map(majorElectives.map(c => [c.courseCode, c]))

// Computer Engineering major elective configuration
// CE shares the same elective list as EE

import { sharedMajorElectives, majorElectiveCodesSet, majorElectiveLookup } from '../majorElectives'
import type { MajorElectiveCourse } from '../majorElectives'

export const majorId = 'computer-engineering'
export const majorLabel = 'Computer Engineering'

// CE uses the shared CE/EE elective dataset
export const majorElectives: MajorElectiveCourse[] = sharedMajorElectives
export const electiveCodesSet: Set<string> = majorElectiveCodesSet
export const electiveLookup: Map<string, MajorElectiveCourse> = majorElectiveLookup

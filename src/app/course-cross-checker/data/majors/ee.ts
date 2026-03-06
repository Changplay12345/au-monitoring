// Electrical & Electronic Engineering major elective configuration
// EE shares the same elective list as CE

import { sharedMajorElectives, majorElectiveCodesSet, majorElectiveLookup } from '../majorElectives'
import type { MajorElectiveCourse } from '../majorElectives'

export const majorId = 'electrical-engineering'
export const majorLabel = 'Electrical & Electronic Engineering'

// EE uses the shared CE/EE elective dataset
export const majorElectives: MajorElectiveCourse[] = sharedMajorElectives
export const electiveCodesSet: Set<string> = majorElectiveCodesSet
export const electiveLookup: Map<string, MajorElectiveCourse> = majorElectiveLookup

// Shared Major Elective dataset for CE and EE
// Both Computer Engineering and Electrical Engineering share this elective list.
// Future majors can import this or define their own.

export interface MajorElectiveCourse {
  courseCode: string
  courseName: string
  credits: number
  category: string // e.g., 'CE', 'EE', 'BEN', 'BG', 'CDI', 'GDC', 'IE', 'MCE', 'TE'
}

export const sharedMajorElectives: MajorElectiveCourse[] = [
  // CE Courses
  { courseCode: 'CE3003', courseName: 'Mobile Applications Development', credits: 3, category: 'CE' },
  { courseCode: 'CE3105', courseName: 'Microprocessor Programming Using Assembly & C', credits: 3, category: 'CE' },
  { courseCode: 'CE3106', courseName: 'Programming Languages', credits: 3, category: 'CE' },
  { courseCode: 'CE3111', courseName: 'Design and Analysis of Algorithms', credits: 3, category: 'CE' },
  { courseCode: 'CE3707', courseName: 'Microprocessor Systems Design', credits: 1, category: 'CE' },
  { courseCode: 'CE3901', courseName: 'Digital Audio/Video Coding Technique', credits: 3, category: 'CE' },
  { courseCode: 'CE4002', courseName: 'Introduction to Broadcasting Technology', credits: 3, category: 'CE' },
  { courseCode: 'CE4108', courseName: 'Operations Research', credits: 3, category: 'CE' },
  { courseCode: 'CE4109', courseName: 'Information Systems Analysis and Design', credits: 3, category: 'CE' },
  { courseCode: 'CE4110', courseName: 'Compilers', credits: 3, category: 'CE' },
  { courseCode: 'CE4114', courseName: 'Data Mining', credits: 3, category: 'CE' },
  { courseCode: 'CE4115', courseName: 'Fundamentals of Machine Learning', credits: 3, category: 'CE' },
  { courseCode: 'CE4201', courseName: 'Image Processing and Computer Vision', credits: 3, category: 'CE' },
  { courseCode: 'CE4207', courseName: 'System and Network Programming', credits: 3, category: 'CE' },
  { courseCode: 'CE4223', courseName: 'Advanced Computer Networks', credits: 3, category: 'CE' },
  { courseCode: 'CE4226', courseName: 'Network Systems Analysis and Design', credits: 3, category: 'CE' },
  { courseCode: 'CE4227', courseName: 'Mobile and Wireless Networks', credits: 3, category: 'CE' },
  { courseCode: 'CE4229', courseName: 'Introduction to Cloud Computing', credits: 3, category: 'CE' },
  { courseCode: 'CE4301', courseName: 'Fundamental of Internet of Things', credits: 3, category: 'CE' },
  { courseCode: 'CE4303', courseName: 'Introduction to Big-Data', credits: 3, category: 'CE' },
  { courseCode: 'CE4304', courseName: 'Programming for Data Analytics', credits: 3, category: 'CE' },
  { courseCode: 'CE4310', courseName: 'Introduction to Financial Technology', credits: 3, category: 'CE' },
  { courseCode: 'CE4311', courseName: 'Advanced Financial Technology', credits: 3, category: 'CE' },
  { courseCode: 'CE4713', courseName: 'Advanced Computer Architecture', credits: 3, category: 'CE' },
  { courseCode: 'CE4714', courseName: 'Fault-Tolerant Computer', credits: 3, category: 'CE' },
  { courseCode: 'CE4715', courseName: 'Artificial Intelligence I', credits: 3, category: 'CE' },
  { courseCode: 'CE4716', courseName: 'Artificial Intelligence II', credits: 3, category: 'CE' },
  { courseCode: 'CE4801', courseName: 'Computer Graphics Programming', credits: 3, category: 'CE' },
  { courseCode: 'CE4802', courseName: 'Fundamentals of Virtual Reality', credits: 3, category: 'CE' },
  { courseCode: 'CE4803', courseName: 'Fundamentals of Game Development', credits: 3, category: 'CE' },
  { courseCode: 'CE4804', courseName: 'Introduction to GPU Computing', credits: 3, category: 'CE' },
  { courseCode: 'CE4810', courseName: 'Advanced Topics in Game Development', credits: 3, category: 'CE' },
  { courseCode: 'CE4811', courseName: 'Special Problems in Game Development', credits: 3, category: 'CE' },
  { courseCode: 'CE4903', courseName: 'Advanced Topics in Computer Engineering', credits: 3, category: 'CE' },
  { courseCode: 'CE4904', courseName: 'Special Problems in Computer Engineering', credits: 3, category: 'CE' },
  { courseCode: 'CE4907', courseName: 'Computer Engineering Industrial Training', credits: 3, category: 'CE' },

  // EE Courses
  { courseCode: 'EE3601', courseName: 'Electronic Circuit Design', credits: 3, category: 'EE' },
  { courseCode: 'EE3602', courseName: 'Electronic Circuit Design Laboratory', credits: 1, category: 'EE' },
  { courseCode: 'EE3704', courseName: 'Embedded Systems', credits: 3, category: 'EE' },
  { courseCode: 'EE4305', courseName: 'Digital Signal Processing', credits: 3, category: 'EE' },
  { courseCode: 'EE4403', courseName: 'Basic Mechatronics', credits: 3, category: 'EE' },
  { courseCode: 'EE4602', courseName: 'Industrial Instrumentation and Control', credits: 3, category: 'EE' },
  { courseCode: 'EE4903', courseName: 'Advanced Topics in Electrical and/or Electronic Engineering', credits: 3, category: 'EE' },
  { courseCode: 'EE4904', courseName: 'Special Problems in Electrical and/or Electronic Engineering', credits: 3, category: 'EE' },
  { courseCode: 'EE4907', courseName: 'Electrical Engineering Industrial Training', credits: 3, category: 'EE' },

  // BEN Courses
  { courseCode: 'BEN3303', courseName: 'Entrepreneurial Leadership', credits: 3, category: 'BEN' },
  { courseCode: 'BEN3304', courseName: 'Project Management', credits: 3, category: 'BEN' },
  { courseCode: 'BEN4213', courseName: 'Digital Entrepreneurship', credits: 3, category: 'BEN' },
  { courseCode: 'BEN4315', courseName: 'Family Business Management', credits: 3, category: 'BEN' },

  // CDI Courses
  { courseCode: 'CDI3211', courseName: 'Game Design', credits: 3, category: 'CDI' },

  // GDC Courses
  { courseCode: 'GDC3107', courseName: 'User Interface Design', credits: 3, category: 'GDC' },

  // IE Courses
  { courseCode: 'IE4201', courseName: 'Engineering Management', credits: 3, category: 'IE' },
  { courseCode: 'IE4203', courseName: 'Engineering Economics', credits: 3, category: 'IE' },

  // MCE Courses
  { courseCode: 'MCE3220', courseName: 'Fundamentals of Electric Vehicles', credits: 3, category: 'MCE' },
  { courseCode: 'MCE4102', courseName: 'Introduction to Industrial Automation', credits: 3, category: 'MCE' },
  { courseCode: 'MCE4104', courseName: 'Automation Technology 4.0', credits: 3, category: 'MCE' },

  // TE Courses
  { courseCode: 'TE3102', courseName: 'Communication Networks and Transmission Lines', credits: 3, category: 'TE' },
  { courseCode: 'TE3301', courseName: 'Radio Wave Propagation', credits: 3, category: 'TE' },
  { courseCode: 'TE4111', courseName: 'Antenna Engineering', credits: 3, category: 'TE' },
  { courseCode: 'TE4112', courseName: 'Optical Communications', credits: 3, category: 'TE' },
  { courseCode: 'TE4113', courseName: 'Digital Communications', credits: 3, category: 'TE' },
  { courseCode: 'TE4201', courseName: 'Communication Electronics', credits: 3, category: 'TE' },
  { courseCode: 'TE4202', courseName: 'Communication Electronics Laboratory', credits: 1, category: 'TE' },
  { courseCode: 'TE4204', courseName: 'Optoelectronics', credits: 3, category: 'TE' },
  { courseCode: 'TE4301', courseName: 'Principle of Telecommunications Policies', credits: 3, category: 'TE' },
]

// Quick lookup set of all major elective course codes
export const majorElectiveCodesSet = new Set(sharedMajorElectives.map(c => c.courseCode))

// Lookup map: courseCode -> MajorElectiveCourse
export const majorElectiveLookup = new Map(sharedMajorElectives.map(c => [c.courseCode, c]))

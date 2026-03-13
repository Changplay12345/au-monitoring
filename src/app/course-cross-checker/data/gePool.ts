// GE Pool and Free Elective courses
// Parsed from GE_Pool_Free.Electives_ListOfAllSubjects.txt

export interface GEPoolCourse {
  courseCode: string
  courseName: string
  credits: number
  category: 'Humanity' | 'Social Science' | 'Science and Math' | 'Language' | 'Free Elective'
}

// Humanity Courses
const humanityCourses: GEPoolCourse[] = [
  { courseCode: 'ADX1102', courseName: 'Design Culture Exposure', credits: 2, category: 'Humanity' },
  { courseCode: 'ADX1140', courseName: 'Journey for Urban Art and Culture Exploration', credits: 3, category: 'Humanity' },
  { courseCode: 'FT2003A', courseName: 'Foods Changing the World (Part A)', credits: 2, category: 'Humanity' },
  { courseCode: 'FT2003B', courseName: 'Foods Changing the World (Part B)', credits: 1, category: 'Humanity' },
  { courseCode: 'GE1104', courseName: 'Thai Historical Perspectives', credits: 3, category: 'Humanity' },
  { courseCode: 'GE1107', courseName: 'Perspectives in Politics and Economy', credits: 3, category: 'Humanity' },
  { courseCode: 'GE2102', courseName: 'Human Heritage and Globalization', credits: 3, category: 'Humanity' },
  { courseCode: 'GE2103', courseName: 'Art of Reasoning', credits: 3, category: 'Humanity' },
  { courseCode: 'MU1002', courseName: 'Pop Music Appreciation', credits: 3, category: 'Humanity' },
  { courseCode: 'MU1231', courseName: 'History and Literature of Music', credits: 3, category: 'Humanity' },
  { courseCode: 'MU3602', courseName: 'Music Therapy', credits: 3, category: 'Humanity' },
  { courseCode: 'MU4223', courseName: 'Music in Human Life', credits: 3, category: 'Humanity' },
]

// Social Science Courses
const socialScienceCourses: GEPoolCourse[] = [
  { courseCode: 'AD3280', courseName: 'Inspiration, Lifestyles and Popular Culture', credits: 3, category: 'Social Science' },
  { courseCode: 'ADX1101', courseName: 'Art and Design Appreciation', credits: 3, category: 'Social Science' },
  { courseCode: 'ADX1240', courseName: 'Artist Studio (Painting and Rendering)', credits: 3, category: 'Social Science' },
  { courseCode: 'ADX1303', courseName: 'Design Communication', credits: 3, category: 'Social Science' },
  { courseCode: 'ADX1304', courseName: 'Design Fundamental', credits: 3, category: 'Social Science' },
  { courseCode: 'BBA1001', courseName: 'Business Exploration', credits: 3, category: 'Social Science' },
  { courseCode: 'BBA1004', courseName: 'Essential Marketing for Entrepreneurs', credits: 2, category: 'Social Science' },
  { courseCode: 'BBA1005', courseName: 'Essential Finance for Entrepreneurs', credits: 2, category: 'Social Science' },
  { courseCode: 'BBA1006', courseName: 'Essential Economics for Entrepreneurs', credits: 2, category: 'Social Science' },
  { courseCode: 'BBA1010', courseName: 'Design Thinking in Business', credits: 3, category: 'Social Science' },
  { courseCode: 'BBA1012', courseName: 'Entrepreneurial Marketing', credits: 3, category: 'Social Science' },
  { courseCode: 'BBA1020', courseName: 'Design Thinking Essentials', credits: 2, category: 'Social Science' },
  { courseCode: 'BBA1021', courseName: 'Design Thinking Workshop', credits: 1, category: 'Social Science' },
  { courseCode: 'BBA1022', courseName: 'Building CEO and Leadership Essentials', credits: 2, category: 'Social Science' },
  { courseCode: 'BBA1023', courseName: 'Building CEO and Leadership Workshop', credits: 1, category: 'Social Science' },
  { courseCode: 'BBA1024', courseName: 'Entrepreneurial Marketing Essentials', credits: 2, category: 'Social Science' },
  { courseCode: 'BBA1025', courseName: 'Entrepreneurial Marketing Workshop', credits: 1, category: 'Social Science' },
  { courseCode: 'CA1110', courseName: 'Art and Beauty of Living', credits: 3, category: 'Social Science' },
  { courseCode: 'EG1001', courseName: 'Digital Literacy', credits: 3, category: 'Social Science' },
  { courseCode: 'FT1003', courseName: 'Food Factory Explore Trip (Special course)', credits: 3, category: 'Social Science' },
  { courseCode: 'FT2004', courseName: 'Drinkology: The Art of drinking', credits: 3, category: 'Social Science' },
  { courseCode: 'FT2005', courseName: 'Food Zodiac', credits: 3, category: 'Social Science' },
  { courseCode: 'GE1204', courseName: 'Physical Education', credits: 1, category: 'Social Science' },
  { courseCode: 'GE1205', courseName: 'ASEAN Ways', credits: 3, category: 'Social Science' },
  { courseCode: 'GE1209', courseName: 'Psychology Application in Daily Life', credits: 3, category: 'Social Science' },
  { courseCode: 'GE2207', courseName: 'Sport, Health and Wellness Development', credits: 3, category: 'Social Science' },
  { courseCode: 'GE2209', courseName: 'The Power of Personality in Leadership', credits: 3, category: 'Social Science' },
  { courseCode: 'GE2210', courseName: 'Love and Art of Living', credits: 3, category: 'Social Science' },
  { courseCode: 'GE2212', courseName: 'Exotic Thai Food and Crafts', credits: 3, category: 'Social Science' },
  { courseCode: 'GE2213', courseName: 'Thai Market Vendor Exposure', credits: 3, category: 'Social Science' },
  { courseCode: 'ITX2004', courseName: 'UI/UX Design and Prototyping', credits: 3, category: 'Social Science' },
  { courseCode: 'ITX2005', courseName: 'Design Thinking', credits: 3, category: 'Social Science' },
  { courseCode: 'ITX4502', courseName: 'Tech Startup', credits: 3, category: 'Social Science' },
  { courseCode: 'LLB1501', courseName: 'Business Law', credits: 3, category: 'Social Science' },
  { courseCode: 'LLB1502', courseName: 'Fundamentals of Tax Law', credits: 3, category: 'Social Science' },
  { courseCode: 'LLB4540', courseName: 'International Business Law and Start-Up Business', credits: 3, category: 'Social Science' },
  { courseCode: 'LLB4806', courseName: 'Business and Human Rights', credits: 3, category: 'Social Science' },
  { courseCode: 'MB2531', courseName: 'Music Business', credits: 3, category: 'Social Science' },
  { courseCode: 'NGE0110', courseName: 'First Aid and Basic Life Support', credits: 3, category: 'Social Science' },
  { courseCode: 'NGE0111', courseName: 'Innovative Media and Project Influencing Health Risk Behavior', credits: 3, category: 'Social Science' },
]

// Science and Math Courses
const scienceMathCourses: GEPoolCourse[] = [
  { courseCode: 'BBA1007', courseName: 'Data Analytics for Entrepreneurs', credits: 3, category: 'Science and Math' },
  { courseCode: 'BBA1013', courseName: 'Entrepreneurial Finance', credits: 3, category: 'Science and Math' },
  { courseCode: 'BBA1014', courseName: 'The Art of Data for Business', credits: 3, category: 'Science and Math' },
  { courseCode: 'BBA1026', courseName: 'Entrepreneurial Finance Essentials', credits: 2, category: 'Science and Math' },
  { courseCode: 'BBA1027', courseName: 'Entrepreneurial Finance Workshop', credits: 1, category: 'Science and Math' },
  { courseCode: 'BBA1028', courseName: 'The Art of Data Essentials', credits: 2, category: 'Science and Math' },
  { courseCode: 'BBA1029', courseName: 'The Art of Data Workshop', credits: 1, category: 'Science and Math' },
  { courseCode: 'CA1201', courseName: 'Creative Photography', credits: 3, category: 'Science and Math' },
  { courseCode: 'CA1202', courseName: 'Computer Graphic for Presentation Design for Pitching', credits: 3, category: 'Science and Math' },
  { courseCode: 'CSX3001', courseName: 'Fundamentals of Computer Programming', credits: 3, category: 'Science and Math' },
  { courseCode: 'EG1002', courseName: 'Application Design for Everyone', credits: 3, category: 'Science and Math' },
  { courseCode: 'EG1003', courseName: 'Introduction to Internet of Things (IoTs)', credits: 3, category: 'Science and Math' },
  { courseCode: 'EG1004', courseName: 'Artificial Intelligence for beginners', credits: 3, category: 'Science and Math' },
  { courseCode: 'EG1005', courseName: '3D Modelling and 3D Printing Technology', credits: 3, category: 'Science and Math' },
  { courseCode: 'FT1004', courseName: 'A Food-Agri-Bio Tech Trend Update (Part A)', credits: 2, category: 'Science and Math' },
  { courseCode: 'FT1004B', courseName: 'Food-Agri-Bio Tech Trend Update (Part B)', credits: 1, category: 'Science and Math' },
  { courseCode: 'FT1005', courseName: 'Sustainability and Circular Living', credits: 3, category: 'Science and Math' },
  { courseCode: 'GE1302', courseName: 'Ecology and Sustainability', credits: 3, category: 'Science and Math' },
  { courseCode: 'GE1303', courseName: 'Science for Sustainable Future', credits: 2, category: 'Science and Math' },
  { courseCode: 'GE2304', courseName: 'Lifestyles and Sustainability in Dynamic World', credits: 3, category: 'Science and Math' },
  { courseCode: 'ITX3002', courseName: 'Introduction to Information Technology', credits: 3, category: 'Science and Math' },
]

// Language Courses
const languageCourses: GEPoolCourse[] = [
  { courseCode: 'GE1403', courseName: 'Thai Language for Professional Communication (For Thai students)', credits: 3, category: 'Language' },
  { courseCode: 'GE1409', courseName: 'Thai Language for Intercultural Communication (For Non-Thai students)', credits: 3, category: 'Language' },
  { courseCode: 'GE1410', courseName: 'Thai for Profession Communication (Required course for Thai Student)', credits: 2, category: 'Language' },
  { courseCode: 'GE1411', courseName: 'Thai Language for Multicultural Communication (Required course for non-Thai students)', credits: 2, category: 'Language' },
  { courseCode: 'GE1412', courseName: 'Introductory Thai Usage (Required course for Thai students from International Program)', credits: 2, category: 'Language' },
  { courseCode: 'GE1413', courseName: 'Introduction to Korean Language and K-pop Culture', credits: 3, category: 'Language' },
  { courseCode: 'GE1414', courseName: 'Introduction to Spanish Language and Culture', credits: 3, category: 'Language' },
  { courseCode: 'GE1415', courseName: 'Storytelling and Presentation Skills in English', credits: 3, category: 'Language' },
  { courseCode: 'GE3401', courseName: 'Public Speaking in Thai', credits: 3, category: 'Language' },
]

// All GE Pool courses combined
export const allGEPoolCourses: GEPoolCourse[] = [
  ...humanityCourses,
  ...socialScienceCourses,
  ...scienceMathCourses,
  ...languageCourses,
]

// Quick lookup set of all GE Pool course codes
export const gePoolCodesSet = new Set(allGEPoolCourses.map(c => c.courseCode))

// Lookup map: courseCode -> GEPoolCourse
export const gePoolLookup = new Map(allGEPoolCourses.map(c => [c.courseCode, c]))

// Category-specific lookups
export const humanityCodesSet = new Set(humanityCourses.map(c => c.courseCode))
export const socialScienceCodesSet = new Set(socialScienceCourses.map(c => c.courseCode))
export const scienceMathCodesSet = new Set(scienceMathCourses.map(c => c.courseCode))
export const languageCodesSet = new Set(languageCourses.map(c => c.courseCode))

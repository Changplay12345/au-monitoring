'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GCPLayout } from '@/components/GCPLayout';
import DustBackgroundLight from '@/components/BackGroundAnimatedLight';
import {
  Upload,
  FileText,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Search,
  MinusCircle,
} from 'lucide-react';

// --- Types ---
interface CurriculumCourse {
  year: number;
  semester: number;
  courseCode: string;
  courseTitle: string;
  prerequisite: string;
  orFlag: string;
}

interface SemesterGroup {
  year: number;
  semester: number;
  courses: CurriculumCourse[];
}

interface CrossCheckResult {
  completed: string[];
  missing: CurriculumCourse[];
  extra: string[];
}

// --- Available Majors ---
const MAJORS = [
  { value: 'science', label: 'Computer Science', csvFile: 'science.csv' },
];

// --- CSV Parsing ---
function parseCurriculumCSV(csvText: string): CurriculumCourse[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const courses: CurriculumCourse[] = [];
  let currentYear = 0;
  let currentSemester = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === ',,,,,') continue;

    // Parse CSV respecting quoted fields
    const fields = parseCSVLine(line);
    const year = parseInt(fields[0]) || currentYear;
    const semester = parseInt(fields[1]) || currentSemester;
    const courseCode = (fields[2] || '').replace(/"/g, '').trim();
    const courseTitle = (fields[3] || '').replace(/"/g, '').trim();
    const prerequisite = (fields[4] || '').replace(/"/g, '').trim();
    const orFlag = (fields[5] || '').replace(/"/g, '').trim();

    if (!courseTitle) continue;

    if (year) currentYear = year;
    if (semester) currentSemester = semester;

    courses.push({
      year: currentYear,
      semester: currentSemester,
      courseCode,
      courseTitle,
      prerequisite,
      orFlag,
    });
  }

  return courses;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function groupBySemester(courses: CurriculumCourse[]): SemesterGroup[] {
  const map = new Map<string, SemesterGroup>();
  for (const course of courses) {
    const key = `${course.year}-${course.semester}`;
    if (!map.has(key)) {
      map.set(key, { year: course.year, semester: course.semester, courses: [] });
    }
    map.get(key)!.courses.push(course);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.semester - b.semester
  );
}

// --- Basic PDF text extraction (uses browser FileReader) ---
async function extractTextFromPDF(file: File): Promise<string[]> {
  // Use pdf.js via CDN for client-side PDF parsing
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import of pdf.js
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    allText.push(pageText);
  }

  return allText;
}

// Extract course codes from PDF text
function extractCourseCodes(textPages: string[]): string[] {
  const fullText = textPages.join(' ');
  // Match course codes like CSX3001, ELE1001, GE1302, etc.
  const codePattern = /\b([A-Z]{2,4}\d{4})\b/g;
  const matches = fullText.match(codePattern) || [];
  return [...new Set(matches)];
}

// Cross-check logic
function crossCheck(
  curriculum: CurriculumCourse[],
  completedCodes: string[]
): CrossCheckResult {
  const completedSet = new Set(completedCodes.map(c => c.toUpperCase()));

  // Required courses (ones with actual course codes in curriculum)
  const requiredCourses = curriculum.filter(c => c.courseCode);
  const requiredCodes = new Set(requiredCourses.map(c => c.courseCode.toUpperCase()));

  const completed = completedCodes.filter(code => requiredCodes.has(code.toUpperCase()));
  const missing = requiredCourses.filter(c => !completedSet.has(c.courseCode.toUpperCase()));
  const extra = completedCodes.filter(code => !requiredCodes.has(code.toUpperCase()));

  return { completed, missing, extra };
}

// --- Main Component ---
export default function TestingPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Left panel state
  const [selectedMajor, setSelectedMajor] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Middle panel state
  const [curriculum, setCurriculum] = useState<CurriculumCourse[]>([]);
  const [semesterGroups, setSemesterGroups] = useState<SemesterGroup[]>([]);
  const [crossCheckResult, setCrossCheckResult] = useState<CrossCheckResult | null>(null);
  const [csvLoaded, setCsvLoaded] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load CSV when major changes
  useEffect(() => {
    if (!selectedMajor) {
      setCurriculum([]);
      setSemesterGroups([]);
      setCsvLoaded(false);
      setCrossCheckResult(null);
      return;
    }

    const major = MAJORS.find(m => m.value === selectedMajor);
    if (!major) return;

    fetch(`/${major.csvFile}`)
      .then(res => {
        if (!res.ok) throw new Error(`CSV file not found: ${major.csvFile}`);
        return res.text();
      })
      .then(text => {
        const courses = parseCurriculumCSV(text);
        setCurriculum(courses);
        setSemesterGroups(groupBySemester(courses));
        setCsvLoaded(true);
        setCrossCheckResult(null);
      })
      .catch(err => {
        setError(`Failed to load curriculum: ${err.message}`);
        setCsvLoaded(false);
      });
  }, [selectedMajor]);

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    setPdfFile(file);
    setError(null);
    setCrossCheckResult(null);
  }, []);

  // Handle load / cross-check
  const handleLoad = useCallback(async () => {
    if (!selectedMajor) {
      setError('Please select a major first.');
      return;
    }
    if (!pdfFile) {
      setError('Please upload a student PDF transcript.');
      return;
    }
    if (!csvLoaded || curriculum.length === 0) {
      setError('Curriculum data not loaded. Please select a major.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCrossCheckResult(null);

    try {
      const textPages = await extractTextFromPDF(pdfFile);
      const studentCodes = extractCourseCodes(textPages);

      if (studentCodes.length === 0) {
        setError('No course codes found in the PDF. Please ensure the PDF contains a valid course history.');
        setIsProcessing(false);
        return;
      }

      const result = crossCheck(curriculum, studentCodes);
      setCrossCheckResult(result);
    } catch (err: any) {
      setError(`Failed to process PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMajor, pdfFile, csvLoaded, curriculum]);

  // Loading states
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DustBackgroundLight particleMultiplier={0.5} />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DustBackgroundLight particleMultiplier={0.5} />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <>
      <DustBackgroundLight particleMultiplier={0.5} />
      <GCPLayout activeFeature="Testing" projectName="Testing">
        <div className="max-w-[1800px] mx-auto p-4 sm:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-red-600" />
              Graduation Course Cross-Check
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Verify student course completion against curriculum requirements
            </p>
          </div>

          {/* 3-column layout: 25% | 50% | 25% */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* ===== LEFT PANEL (25%) - Input Panel ===== */}
            <div className="w-full lg:w-1/4 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-5">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-red-500" />
                  Input Panel
                </h2>

                {/* Major Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Major
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMajor}
                      onChange={e => {
                        setSelectedMajor(e.target.value);
                        setError(null);
                        setCrossCheckResult(null);
                      }}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    >
                      <option value="">-- Choose Major --</option>
                      {MAJORS.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload Student Transcript (PDF)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {pdfFile ? (
                      <div className="flex items-center gap-2 justify-center">
                        <FileText className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-gray-700 truncate max-w-[180px]">
                          {pdfFile.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-red-400 transition-colors" />
                        <p className="text-sm text-gray-500">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF only
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Load Button */}
                <button
                  onClick={handleLoad}
                  disabled={isProcessing || !selectedMajor || !pdfFile}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Cross-Check
                    </>
                  )}
                </button>

                {/* Error display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Result Summary */}
                {crossCheckResult && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Summary</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">
                        Completed: <strong className="text-green-600">{crossCheckResult.completed.length}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-gray-700">
                        Missing: <strong className="text-red-600">{crossCheckResult.missing.length}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MinusCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-700">
                        Extra: <strong className="text-amber-600">{crossCheckResult.extra.length}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== MIDDLE PANEL (50%) - Study Plan Visualization ===== */}
            <div className="w-full lg:w-1/2 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 min-h-[600px]">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-red-500" />
                  Study Plan
                  {csvLoaded && (
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      {MAJORS.find(m => m.value === selectedMajor)?.label}
                    </span>
                  )}
                </h2>

                {!csvLoaded ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                    <BookOpen className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">Select a major to view the study plan</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                    {semesterGroups.map(group => (
                      <div key={`${group.year}-${group.semester}`}>
                        {/* Semester Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Year {group.year}
                          </div>
                          <div className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                            Semester {group.semester}
                          </div>
                        </div>

                        {/* Course Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-left">
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 w-[120px]">Code</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500">Course Title</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 w-[100px]">Prerequisite</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 w-[70px] text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.courses.map((course, idx) => {
                                let status: 'completed' | 'missing' | 'none' | 'elective' = 'none';
                                if (crossCheckResult) {
                                  if (!course.courseCode) {
                                    status = 'elective';
                                  } else if (crossCheckResult.completed.includes(course.courseCode)) {
                                    status = 'completed';
                                  } else if (crossCheckResult.missing.some(m => m.courseCode === course.courseCode)) {
                                    status = 'missing';
                                  }
                                }

                                return (
                                  <tr
                                    key={`${course.courseCode || course.courseTitle}-${idx}`}
                                    className={`border-t border-gray-100 transition-colors ${
                                      status === 'completed'
                                        ? 'bg-green-50'
                                        : status === 'missing'
                                        ? 'bg-red-50'
                                        : ''
                                    }`}
                                  >
                                    <td className="px-3 py-2 font-mono text-xs text-gray-700">
                                      {course.courseCode || (
                                        <span className="text-gray-400 italic">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-gray-800">
                                      {course.courseTitle}
                                      {course.orFlag === 'or' && (
                                        <span className="ml-2 text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                                          OR
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-500">
                                      {course.prerequisite || '—'}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {status === 'completed' && (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                                      )}
                                      {status === 'missing' && (
                                        <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                      )}
                                      {status === 'elective' && (
                                        <span className="text-xs text-gray-400">Elective</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT PANEL (25%) - Reserved Panel ===== */}
            <div className="w-full lg:w-1/4 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 min-h-[600px]">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  Analytics
                </h2>
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-300">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    Reserved for future analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extra courses section (shown after cross-check) */}
          {crossCheckResult && crossCheckResult.extra.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <MinusCircle className="w-4 h-4 text-amber-500" />
                Extra Courses (not in curriculum)
              </h3>
              <div className="flex flex-wrap gap-2">
                {crossCheckResult.extra.map(code => (
                  <span
                    key={code}
                    className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono px-2.5 py-1 rounded-md"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </GCPLayout>
    </>
  );
}

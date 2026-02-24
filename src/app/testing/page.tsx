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
  AlertCircle,
  BookOpen,
  GraduationCap,
  Search,
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

// --- Vincent Mary School of Engineering Majors ---
const MAJORS = [
  { value: 'science', label: 'Computer Science', csvFile: 'science.csv' },
  { value: 'computer-engineering', label: 'Computer Engineering', csvFile: 'computer-engineering.csv' },
  { value: 'electrical-engineering', label: 'Electrical & Electronic Engineering', csvFile: 'electrical-engineering.csv' },
  { value: 'mechanical-engineering', label: 'Mechanical Engineering', csvFile: 'mechanical-engineering.csv' },
  { value: 'mechatronics', label: 'Mechatronics Engineering', csvFile: 'mechatronics.csv' },
  { value: 'telecommunications', label: 'Telecommunications Engineering', csvFile: 'telecommunications.csv' },
  { value: 'civil-engineering', label: 'Civil Engineering', csvFile: 'civil-engineering.csv' },
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

// --- Helper: get ordinal suffix (matching TQF Master 2.0 style) ---
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// --- Course card style (matching TQF Master 2.0 node colors) ---
function getCourseStyle(course: CurriculumCourse): { bg: string; border: string; text: string } {
  if (!course.courseCode && course.courseTitle.includes('Major Elective')) {
    return { bg: '#EBF4FF', border: '#93C5FD', text: '#1E40AF' };
  }
  if (!course.courseCode && course.courseTitle.includes('Free Elective')) {
    return { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' };
  }
  if (course.orFlag === 'or') {
    return { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' };
  }
  return { bg: '#FFFFFF', border: '#E5E7EB', text: '#111827' };
}

// --- Main Component ---
export default function TestingPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Left panel state
  const [selectedMajor, setSelectedMajor] = useState('science');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Middle panel state
  const [curriculum, setCurriculum] = useState<CurriculumCourse[]>([]);
  const [semesterGroups, setSemesterGroups] = useState<SemesterGroup[]>([]);
  const [studyPlanLoaded, setStudyPlanLoaded] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load CSV when major changes (preload data, but don't show study plan yet)
  useEffect(() => {
    if (!selectedMajor) {
      setCurriculum([]);
      setSemesterGroups([]);
      setCsvLoaded(false);
      setStudyPlanLoaded(false);
      return;
    }

    const major = MAJORS.find(m => m.value === selectedMajor);
    if (!major) return;

    setCsvLoaded(false);
    setStudyPlanLoaded(false);
    setError(null);

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
  }, []);

  // Handle Crosscheck button - temporarily just loads and renders study plan
  const handleCrosscheck = useCallback(async () => {
    if (!selectedMajor) {
      setError('Please select a major first.');
      return;
    }
    if (!csvLoaded || curriculum.length === 0) {
      setError('Curriculum data not loaded yet.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Simulate brief loading for UX
    await new Promise(resolve => setTimeout(resolve, 400));

    setStudyPlanLoaded(true);
    setIsProcessing(false);
  }, [selectedMajor, csvLoaded, curriculum]);

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
        <div className="max-w-[1920px] mx-auto p-4 sm:p-6">
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

          {/* 3-column layout: 15% | 70% | 15% */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* ===== LEFT PANEL (15%) - Input Panel ===== */}
            <div className="w-full lg:w-[15%] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4 sticky top-20">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  Input
                </h2>

                {/* Major Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Major
                  </label>
                  <div className="relative">
                    <select
                      value={selectedMajor}
                      onChange={e => {
                        setSelectedMajor(e.target.value);
                        setError(null);
                        setStudyPlanLoaded(false);
                      }}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    >
                      <option value="">-- Choose --</option>
                      {MAJORS.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Transcript (PDF)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {pdfFile ? (
                      <div className="flex items-center gap-1.5 justify-center">
                        <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">
                          {pdfFile.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1 group-hover:text-red-400 transition-colors" />
                        <p className="text-xs text-gray-500">Upload PDF</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Crosscheck Button */}
                <button
                  onClick={handleCrosscheck}
                  disabled={isProcessing || !selectedMajor}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-600 text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Crosscheck
                    </>
                  )}
                </button>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                {/* Legend */}
                {studyPlanLoaded && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-600">Legend</h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }} />
                        <span className="text-xs text-gray-600">Required Course</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border" style={{ background: '#EBF4FF', borderColor: '#93C5FD' }} />
                        <span className="text-xs text-gray-600">Major Elective</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border" style={{ background: '#ECFDF5', borderColor: '#6EE7B7' }} />
                        <span className="text-xs text-gray-600">Free Elective</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border" style={{ background: '#FFFBEB', borderColor: '#FCD34D' }} />
                        <span className="text-xs text-gray-600">OR Choice</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== MIDDLE PANEL (70%) - Study Plan Visualization ===== */}
            <div className="w-full lg:w-[70%] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Panel Header */}
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-red-500" />
                    Study Plan
                    {studyPlanLoaded && (
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        — {MAJORS.find(m => m.value === selectedMajor)?.label}
                      </span>
                    )}
                  </h2>
                  {studyPlanLoaded && (
                    <span className="text-xs text-gray-400">
                      {curriculum.length} courses
                    </span>
                  )}
                </div>

                {!studyPlanLoaded ? (
                  <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
                    <BookOpen className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-sm font-medium">No study plan loaded</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Select a major and click Crosscheck to render the study plan
                    </p>
                  </div>
                ) : (
                  <div className="p-5 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {/* Study plan grid - 2 semesters per row (matching TQF Master 2.0 column layout) */}
                    {[1, 2, 3, 4].map(year => {
                      const yearGroups = semesterGroups.filter(g => g.year === year);
                      if (yearGroups.length === 0) return null;

                      return (
                        <div key={year} className="mb-8 last:mb-0">
                          {/* Year Header */}
                          <div className="mb-4">
                            <h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>
                              {year}<sup className="text-xs">{getOrdinal(year)}</sup> Year
                            </h3>
                            <div className="h-0.5 bg-gradient-to-r from-red-500 to-transparent mt-1 rounded-full" />
                          </div>

                          {/* Semesters side by side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {yearGroups.map(group => (
                              <div key={`${group.year}-${group.semester}`}>
                                {/* Semester label */}
                                <div className="mb-3 text-center">
                                  <span className="text-sm font-semibold px-4 py-1 rounded-full" style={{ color: '#1a1a2e', background: '#f3f4f6' }}>
                                    {group.semester}<sup className="text-xs">{getOrdinal(group.semester)}</sup> Semester
                                  </span>
                                </div>

                                {/* Course cards - TQF Master 2.0 style */}
                                <div className="space-y-2">
                                  {group.courses.map((course, idx) => {
                                    const style = getCourseStyle(course);
                                    return (
                                      <div
                                        key={`${course.courseCode || course.courseTitle}-${idx}`}
                                        className="relative rounded-md px-3 py-2.5 transition-all hover:shadow-md"
                                        style={{
                                          background: style.bg,
                                          border: `1px solid ${style.border}`,
                                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                        }}
                                      >
                                        {/* OR badge */}
                                        {course.orFlag === 'or' && (
                                          <div
                                            className="absolute -top-1.5 -left-1.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow z-10 -rotate-12"
                                            style={{ background: '#DC2626' }}
                                          >
                                            OR
                                          </div>
                                        )}

                                        <div className="text-center">
                                          {/* Course code */}
                                          <div className="font-semibold text-sm leading-tight" style={{ color: style.text }}>
                                            {course.courseCode || course.courseTitle}
                                          </div>
                                          {/* Course title (only if code exists) */}
                                          {course.courseCode && (
                                            <div className="text-xs mt-0.5 leading-tight" style={{ color: style.text, opacity: 0.7 }}>
                                              {course.courseTitle}
                                            </div>
                                          )}
                                          {/* Prerequisite */}
                                          {course.prerequisite && (
                                            <div className="text-[10px] mt-1 text-gray-400">
                                              Prereq: {course.prerequisite}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT PANEL (15%) - Reserved Panel ===== */}
            <div className="w-full lg:w-[15%] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-h-[600px] sticky top-20">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">
                  Analytics
                </h2>
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-300">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Reserved for future use
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GCPLayout>
    </>
  );
}

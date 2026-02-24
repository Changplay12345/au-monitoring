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

// --- Grid-Locked Layout Constants (all multiples of GRID_UNIT) ---
const GRID_UNIT = 50;
const COL_SPACING = 250;   // 5 grid units between column starts
const NODE_WIDTH = 200;    // 4 grid units wide
const NODE_HEIGHT = 80;    // card height (top-aligned to grid)
const NODE_GAP = 100;      // 2 grid units stride → 20px gap between cards
const HEADER_Y = 0;        // on grid
const CONTENT_START_Y = GRID_UNIT; // 1 grid unit below header

// --- Compute absolute positions for all course nodes (TQF-style column layout) ---
interface PositionedNode {
  course: CurriculumCourse;
  x: number;
  y: number;
}

interface ColumnHeader {
  year: number;
  semester: number;
  x: number;
  y: number;
}

function computeLayout(groups: SemesterGroup[]): { nodes: PositionedNode[]; headers: ColumnHeader[]; totalWidth: number; totalHeight: number } {
  const nodes: PositionedNode[] = [];
  const headers: ColumnHeader[] = [];
  let maxHeight = 0;

  // Sort groups and assign column indices
  const sorted = [...groups].sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester);

  sorted.forEach((group, colIndex) => {
    const x = colIndex * COL_SPACING;

    // Column header
    headers.push({ year: group.year, semester: group.semester, x, y: HEADER_Y });

    // Course nodes stacked vertically
    group.courses.forEach((course, rowIndex) => {
      const y = CONTENT_START_Y + rowIndex * NODE_GAP;
      nodes.push({ course, x, y });
      if (y + NODE_HEIGHT > maxHeight) maxHeight = y + NODE_HEIGHT;
    });
  });

  const totalWidth = (sorted.length - 1) * COL_SPACING + NODE_WIDTH;
  const totalHeight = maxHeight + GRID_UNIT;

  return { nodes, headers, totalWidth, totalHeight };
}

// --- Pannable Canvas Component (matches TQF Master 2.0 viewport behavior) ---
function PannableCanvas({
  children,
  canvasWidth,
  canvasHeight,
  containerRef,
}: {
  children: React.ReactNode;
  canvasWidth: number;
  canvasHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [dragging, setDragging] = useState(false);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Fit view on mount / content change — compute bounding box and center
  useEffect(() => {
    if (!containerRef.current || canvasWidth === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pad = 40;
    const availW = rect.width - pad * 2;
    const availH = rect.height - pad * 2;
    const scaleX = availW / canvasWidth;
    const scaleY = availH / canvasHeight;
    const fitZoom = Math.min(scaleX, scaleY, 1.2);
    const centerX = (rect.width - canvasWidth * fitZoom) / 2;
    const centerY = (rect.height - canvasHeight * fitZoom) / 2;
    setZoom(fitZoom);
    setPan({ x: Math.max(centerX, pad), y: Math.max(centerY, pad) });
  }, [canvasWidth, canvasHeight, containerRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    setDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    const newZoom = Math.min(Math.max(zoom * delta, 0.2), 2);

    // Zoom toward mouse position
    const scale = newZoom / zoom;
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * scale,
      y: mouseY - (mouseY - prev.y) * scale,
    }));
    setZoom(newZoom);
  }, [zoom, containerRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: 'calc(100vh - 180px)',
        cursor: dragging ? 'grabbing' : 'grab',
        background: '#FAFAFA',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid background (matching TQF Master 2.0) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#EBEBEB 1px, transparent 1px),
            linear-gradient(90deg, #EBEBEB 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_UNIT * zoom}px ${GRID_UNIT * zoom}px`,
          backgroundPosition: `${pan.x % (GRID_UNIT * zoom)}px ${pan.y % (GRID_UNIT * zoom)}px`,
        }}
      />

      {/* Transformed content layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-white/80 border border-gray-200 rounded-md px-2 py-1 text-[10px] text-gray-500 pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
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

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle Crosscheck - temporarily just renders study plan
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
    await new Promise(resolve => setTimeout(resolve, 400));
    setStudyPlanLoaded(true);
    setIsProcessing(false);
  }, [selectedMajor, csvLoaded, curriculum]);

  // Compute layout positions
  const layout = studyPlanLoaded ? computeLayout(semesterGroups) : null;

  // Loading states
  if (authLoading || !isAuthenticated) {
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
        {/* Locked centered container — expanded to use viewport width, with edge padding */}
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          {/* Page Header */}
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-red-600" />
              Graduation Course Cross-Check
            </h1>
            <p className="text-gray-500 mt-0.5 text-xs">
              Verify student course completion against curriculum requirements
            </p>
          </div>

          {/* 3-column layout: 15% | 70% | 15% — aligned top, consistent spacing */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-3">

            {/* ===== LEFT PANEL (15%) ===== */}
            <div className="w-full lg:w-[14%] lg:min-w-[170px] lg:max-w-[220px] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  Input
                </h2>

                {/* Major Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Major</label>
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
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Transcript (PDF)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all group"
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    {pdfFile ? (
                      <div className="flex items-center gap-1.5 justify-center">
                        <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{pdfFile.name}</span>
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
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                  ) : (
                    <><Search className="w-3.5 h-3.5" /> Crosscheck</>
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
                        <span className="text-xs text-gray-600">Required</span>
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

            {/* ===== MIDDLE PANEL (70%) — TQF-Style Pannable Canvas ===== */}
            <div className="w-full lg:flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Panel Header */}
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-red-500" />
                    Study Plan
                    {studyPlanLoaded && (
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        — {MAJORS.find(m => m.value === selectedMajor)?.label}
                      </span>
                    )}
                  </h2>
                  {studyPlanLoaded && (
                    <span className="text-xs text-gray-400">{curriculum.length} courses · drag to pan · scroll to zoom</span>
                  )}
                </div>

                {!studyPlanLoaded ? (
                  <div className="flex flex-col items-center justify-center text-gray-400" style={{ height: 'calc(100vh - 180px)' }}>
                    <BookOpen className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-sm font-medium">No study plan loaded</p>
                    <p className="text-xs text-gray-400 mt-1">Select a major and click Crosscheck</p>
                  </div>
                ) : layout && (
                  <PannableCanvas
                    canvasWidth={layout.totalWidth}
                    canvasHeight={layout.totalHeight}
                    containerRef={canvasContainerRef}
                  >
                    {/* Column Headers — TQF Master 2.0 style */}
                    {layout.headers.map(header => (
                      <div
                        key={`header-${header.year}-${header.semester}`}
                        className="absolute flex items-center justify-center"
                        style={{
                          left: header.x,
                          top: header.y,
                          width: NODE_WIDTH,
                          height: GRID_UNIT,
                        }}
                      >
                        <div
                          className="text-xs leading-tight font-semibold px-3 py-1 rounded-md"
                          style={{ color: '#1a1a2e', background: 'rgba(0,0,0,0.04)' }}
                        >
                          {header.year}<sup className="text-[9px]">{getOrdinal(header.year)}</sup> Year {header.semester}<sup className="text-[9px]">{getOrdinal(header.semester)}</sup> Sem
                        </div>
                      </div>
                    ))}

                    {/* Course Nodes — TQF Master 2.0 card style */}
                    {layout.nodes.map((node, idx) => {
                      const style = getCourseStyle(node.course);
                      return (
                        <div
                          key={`node-${node.course.courseCode || node.course.courseTitle}-${idx}`}
                          className="absolute flex flex-col justify-center relative"
                          style={{
                            left: node.x,
                            top: node.y,
                            width: NODE_WIDTH,
                            height: NODE_HEIGHT,
                            background: style.bg,
                            border: `1px solid ${style.border}`,
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            padding: '6px 10px',
                          }}
                        >
                          {/* OR badge (matching TQF Master 2.0) */}
                          {node.course.orFlag === 'or' && (
                            <div
                              className="absolute -top-2 -left-2 text-white text-[11px] font-bold px-1.5 py-0.5 shadow-lg z-10 -rotate-12 pointer-events-none"
                              style={{ background: '#DC2626', borderRadius: '999px', padding: '2px 6px', fontSize: '11px' }}
                            >
                              OR
                            </div>
                          )}

                          <div className="text-center">
                            <div className="font-semibold text-sm leading-tight break-words" style={{ color: style.text }}>
                              {node.course.courseCode || node.course.courseTitle}
                            </div>
                            {node.course.courseCode && (
                              <div className="text-xs mt-0.5 leading-tight break-words" style={{ color: style.text, opacity: 0.75 }}>
                                {node.course.courseTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </PannableCanvas>
                )}
              </div>
            </div>

            {/* ===== RIGHT PANEL (15%) ===== */}
            <div className="w-full lg:w-[14%] lg:min-w-[170px] lg:max-w-[220px] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-h-[400px]">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Analytics</h2>
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-300">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-400 text-center">Reserved for future use</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </GCPLayout>
    </>
  );
}

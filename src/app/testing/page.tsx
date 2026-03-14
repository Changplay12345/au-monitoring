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
  Zap,
  X,
} from 'lucide-react';
import { electiveCodesSet as ceElectiveCodesSet, electiveLookup as ceElectiveLookup } from '@/app/course-cross-checker/data/majors/ce';
import { electiveCodesSet as eeElectiveCodesSet, electiveLookup as eeElectiveLookup } from '@/app/course-cross-checker/data/majors/ee';
import type { MajorElectiveCourse } from '@/app/course-cross-checker/data/majorElectives';
import { gePoolCodesSet, gePoolLookup, humanityCodesSet, socialScienceCodesSet, scienceMathCodesSet } from '@/app/course-cross-checker/data/gePool';
import type { GEPoolCourse } from '@/app/course-cross-checker/data/gePool';

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

// --- Parsed Transcript Types ---
interface TranscriptCourse {
  code: string;
  credits: number;
}

interface TranscriptSemester {
  semesterLabel: string;
  courses: TranscriptCourse[];
}

interface ParsedTranscript {
  student: {
    name: string;
    id: string;
    major: string;
    totalCredits: number;
  };
  semesters: TranscriptSemester[];
}

// Matched major elective from transcript, with semester info for chronological ordering
interface MajorElectiveMatch {
  courseCode: string;
  courseName: string;
  semesterIndex: number; // index in transcript semesters (for chronological order)
  semesterLabel: string;
}

// Matched GE Pool course from transcript
interface GEPoolMatch {
  courseCode: string;
  courseName: string;
  category: 'Humanity' | 'Social Science' | 'Science and Math';
  semesterIndex: number;
  semesterLabel: string;
}

// --- Vincent Mary School of Engineering Majors ---
const MAJORS = [
  { value: 'science', label: 'Computer Science', csvFile: 'science.csv' },
  { value: 'computer-engineering', label: 'Computer Engineering', csvFile: 'ece.csv' },
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

// --- PDF Text Extraction (pdfjs-dist) ---
async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  const version = pdfjsLib.version || '5.4.624';
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = '';

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const t = item as { str: string; hasEOL?: boolean };
      currentLine += t.str;
      if (t.hasEOL) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    pages.push(lines.join('\n'));
  }

  return pages.join('\n\n');
}

// --- Transcript Text Parser ---
function parseTranscriptText(text: string): ParsedTranscript | null {
  // Extract student ID (first 7-digit number)
  const idMatch = text.match(/\b(\d{7})\b/);
  if (!idMatch) return null;

  // Extract name (uppercase line)
  const nameMatch = text.match(/\n([A-Z][A-Z\s]{3,}[A-Z])\n/);

  // Extract major (stop before digits or "CREDITS")
  const majorMatch = text.match(/([A-Z][A-Z\s]*ENGINEERING)(?:\s|$)/);

  // Split by semester labels
  const semesterLabels = text.match(/SEMESTER\s+\d\/\d{4}/g) || [];
  const semesterSections = text.split(/SEMESTER\s+\d\/\d{4}/);

  const semesters: TranscriptSemester[] = [];

  for (let i = 0; i < semesterLabels.length; i++) {
    const section = semesterSections[i + 1] || '';
    // Match course code (2-4 uppercase + 4 digits) followed by credits
    const courseMatches = [...section.matchAll(/([A-Z]{2,4}\d{4})\s+.*?(\d)\s*CR\./g)];

    const courses: TranscriptCourse[] = courseMatches.map(m => ({
      code: m[1],
      credits: parseInt(m[2]),
    }));

    if (courses.length > 0) {
      semesters.push({ semesterLabel: semesterLabels[i], courses });
    }
  }

  console.log('[Transcript Parser] ID:', idMatch[1]);
  console.log('[Transcript Parser] Semesters found:', semesters.length);
  console.log('[Transcript Parser] Total courses:', semesters.reduce((s, sem) => s + sem.courses.length, 0));

  // Calculate total credits from all semesters
  const totalCredits = semesters.reduce(
    (sum, sem) => sum + sem.courses.reduce((s, c) => s + c.credits, 0),
    0
  );

  return {
    student: {
      name: nameMatch ? nameMatch[1].trim() : 'Unknown',
      id: idMatch[1],
      major: majorMatch ? majorMatch[1].trim() : 'Unknown',
      totalCredits,
    },
    semesters,
  };
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
  if (course.courseCode === 'GE Pool') {
    return { bg: '#F5F3FF', border: '#C4B5FD', text: '#6B21A8' };
  }
  if (course.orFlag === 'or') {
    return { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' };
  }
  return { bg: '#FFFFFF', border: '#E5E7EB', text: '#111827' };
}

// ═══════════════════════════════════════════════════════════════════
// DETERMINISTIC GRID LAYOUT ENGINE
// All values are exact multiples of GRID. No arbitrary offsets.
// ═══════════════════════════════════════════════════════════════════
const GRID = 50;                                    // background grid cell size (px)
const HEADER_HEIGHT = GRID * 1;                     // 50px — 1 grid cell for header
const TOP_OFFSET = 0;                               // 0px — canvas starts at 0
const GLOBAL_Y_START = TOP_OFFSET + HEADER_HEIGHT;  // 50px — SINGLE Y origin for ALL columns

const COLUMN_WIDTH = GRID * 4;                      // 200px — card width = 4 grid cells
const COLUMN_GAP = GRID * 1;                        // 50px — gap between columns = 1 grid cell
const CARD_HEIGHT = GRID * 2;                       // 100px — card height = 2 grid cells
// Card stride = CARD_HEIGHT + GRID = 150px (card + 1 grid gap)
// Card Y = GLOBAL_Y_START + rowIndex * (CARD_HEIGHT + GRID)

// --- Positioned element interfaces ---
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

// ═══════════════════════════════════════════════════════════════════
// computeLayout — deterministic grid positioning
//   X = index * (COLUMN_WIDTH + COLUMN_GAP)
//   Y = GLOBAL_Y_START + rowIndex * (CARD_HEIGHT + GRID)
//   Every first card Y === GLOBAL_Y_START (enforced, not derived)
// ═══════════════════════════════════════════════════════════════════
function computeLayout(groups: SemesterGroup[]): { nodes: PositionedNode[]; headers: ColumnHeader[]; totalWidth: number; totalHeight: number } {
  const nodes: PositionedNode[] = [];
  const headers: ColumnHeader[] = [];
  let maxBottom = 0;

  const sorted = [...groups].sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester);

  sorted.forEach((group, index) => {
    // Column X — depends ONLY on index
    const columnX = index * (COLUMN_WIDTH + COLUMN_GAP);

    // Header — fixed at TOP_OFFSET for ALL columns (same horizontal line)
    headers.push({ year: group.year, semester: group.semester, x: columnX, y: TOP_OFFSET });

    // Cards — GLOBAL_Y_START + rowIndex * (CARD_HEIGHT + GRID)
    group.courses.forEach((course, rowIndex) => {
      const cardY = GLOBAL_Y_START + rowIndex * (CARD_HEIGHT + GRID);
      nodes.push({ course, x: columnX, y: cardY });
      const bottom = cardY + CARD_HEIGHT;
      if (bottom > maxBottom) maxBottom = bottom;
    });
  });

  // === VALIDATION: log first card Y for every semester ===
  if (typeof window !== 'undefined') {
    const validation = sorted.map((g, i) => ({
      col: `Y${g.year}S${g.semester}`,
      x: i * (COLUMN_WIDTH + COLUMN_GAP),
      firstCardY: GLOBAL_Y_START,
    }));
    console.log('[Grid Layout] GLOBAL_Y_START =', GLOBAL_Y_START);
    console.log('[Grid Layout] First card Y per semester:', validation);
    console.log('[Grid Layout] Card stride =', CARD_HEIGHT + GRID, '(card', CARD_HEIGHT, '+ gap', GRID, ')');
  }

  const totalWidth = (sorted.length - 1) * (COLUMN_WIDTH + COLUMN_GAP) + COLUMN_WIDTH;
  const totalHeight = maxBottom + GRID;

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

  // Fit view on mount / content change — double-RAF for reliable layout measurement
  useEffect(() => {
    if (!containerRef.current || canvasWidth === 0 || canvasHeight === 0) return;
    // Double requestAnimationFrame ensures layout is fully settled
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pad = 50;
        const availW = rect.width - pad * 2;
        const availH = rect.height - pad * 2;
        if (availW <= 0 || availH <= 0) return;
        const scaleX = availW / canvasWidth;
        const scaleY = availH / canvasHeight;
        // Clamp zoom: min 0.5 for readability, max 1.0 to avoid over-zoom
        const fitZoom = Math.max(0.5, Math.min(scaleX, scaleY, 1.0));
        const centerX = (rect.width - canvasWidth * fitZoom) / 2;
        const centerY = (rect.height - canvasHeight * fitZoom) / 2;
        setZoom(fitZoom);
        setPan({ x: centerX, y: centerY });
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
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
          backgroundSize: `${GRID * zoom}px ${GRID * zoom}px`,
          backgroundPosition: `${pan.x % (GRID * zoom)}px ${pan.y % (GRID * zoom)}px`,
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
  const [selectedMajor, setSelectedMajor] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Middle panel state
  const [curriculum, setCurriculum] = useState<CurriculumCourse[]>([]);
  const [semesterGroups, setSemesterGroups] = useState<SemesterGroup[]>([]);
  const [studyPlanLoaded, setStudyPlanLoaded] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState(false);

  // Crosscheck state
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [parsedTranscript, setParsedTranscript] = useState<ParsedTranscript | null>(null);
  const [matchedElectives, setMatchedElectives] = useState<MajorElectiveMatch[]>([]);
  const [matchedGEPool, setMatchedGEPool] = useState<GEPoolMatch[]>([]);

  // AU Spark import state
  const [showSparkModal, setShowSparkModal] = useState(false);
  const [sparkUsername, setSparkUsername] = useState('');
  const [sparkPassword, setSparkPassword] = useState('');
  const [isSparkImporting, setIsSparkImporting] = useState(false);

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
      setParsedTranscript(null);
      setCompletedCourses(new Set());
      setMatchedElectives([]);
      setMatchedGEPool([]);
      return;
    }

    const major = MAJORS.find(m => m.value === selectedMajor);
    if (!major) return;

    setCsvLoaded(false);
    setStudyPlanLoaded(false);
    setMatchedElectives([]);
    setMatchedGEPool([]);
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

  // Shared cross-check pipeline — accepts parsed transcript and populates all state
  const runCrosscheckPipeline = useCallback((parsed: ParsedTranscript) => {
    setParsedTranscript(parsed);

    // Build completed course set from ALL parsed semesters
    const completed = new Set(
      parsed.semesters.flatMap(s => s.courses.map(c => c.code))
    );
    setCompletedCourses(completed);
    console.log('[Crosscheck] Completed courses:', [...completed]);

    // Detect major elective matches — load correct config per major
    const electiveCodesSet = selectedMajor === 'computer-engineering' ? ceElectiveCodesSet
      : selectedMajor === 'electrical-engineering' ? eeElectiveCodesSet
      : null;
    const electiveLookup = selectedMajor === 'computer-engineering' ? ceElectiveLookup
      : selectedMajor === 'electrical-engineering' ? eeElectiveLookup
      : null;

    if (electiveCodesSet && electiveLookup) {
      const electives: MajorElectiveMatch[] = [];
      parsed.semesters.forEach((sem, semIdx) => {
        sem.courses.forEach(c => {
          if (electiveCodesSet.has(c.code)) {
            const info = electiveLookup.get(c.code);
            electives.push({
              courseCode: c.code,
              courseName: info?.courseName || c.code,
              semesterIndex: semIdx,
              semesterLabel: sem.semesterLabel,
            });
          }
        });
      });
      electives.sort((a, b) => a.semesterIndex - b.semesterIndex);
      setMatchedElectives(electives);
      console.log('[Crosscheck] Major elective matches:', electives.map(e => e.courseCode));
    }

    // Detect GE Pool matches (Humanity, Social Science, Science/Math)
    const specificCurriculumCodes = new Set(
      curriculum.filter(c => c.courseCode && c.courseCode !== 'GE Pool').map(c => c.courseCode)
    );
    const gePoolMatches: GEPoolMatch[] = [];
    parsed.semesters.forEach((sem, semIdx) => {
      sem.courses.forEach(c => {
        if (gePoolCodesSet.has(c.code) && !specificCurriculumCodes.has(c.code)) {
          const info = gePoolLookup.get(c.code);
          if (info && (info.category === 'Humanity' || info.category === 'Social Science' || info.category === 'Science and Math')) {
            gePoolMatches.push({
              courseCode: c.code,
              courseName: info.courseName,
              category: info.category,
              semesterIndex: semIdx,
              semesterLabel: sem.semesterLabel,
            });
          }
        }
      });
    });
    gePoolMatches.sort((a, b) => a.semesterIndex - b.semesterIndex);
    setMatchedGEPool(gePoolMatches);
    console.log('[Crosscheck] GE Pool matches:', gePoolMatches.map(g => `${g.courseCode} (${g.category})`));

    setStudyPlanLoaded(true);
  }, [selectedMajor, curriculum]);

  // Handle Crosscheck — requires both major AND PDF, then parse + cross-check
  const handleCrosscheck = useCallback(async () => {
    if (!selectedMajor) {
      setError('Please select a major first.');
      return;
    }
    if (!pdfFile) {
      setError('Please upload a transcript PDF first.');
      return;
    }
    if (!csvLoaded || curriculum.length === 0) {
      setError('Curriculum data not loaded yet.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setParsedTranscript(null);
    setCompletedCourses(new Set());
    setMatchedElectives([]);
    setMatchedGEPool([]);

    try {
      const text = await extractPdfText(pdfFile);
      console.log('[PDF Parser] Extracted text (first 600 chars):', text.substring(0, 600));

      const parsed = parseTranscriptText(text);
      if (!parsed) {
        setError('Could not parse transcript. No 7-digit student ID found.');
        setIsProcessing(false);
        return;
      }

      console.log('[PDF Parser] Parsed transcript:', JSON.stringify(parsed, null, 2));
      runCrosscheckPipeline(parsed);
    } catch (err) {
      setError(`PDF parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMajor, csvLoaded, curriculum, pdfFile, runCrosscheckPipeline]);

  // Handle AU Spark import — scrape transcript via server route
  const handleSparkImport = useCallback(async () => {
    if (!selectedMajor) {
      setError('Please select a major first.');
      return;
    }
    if (!csvLoaded || curriculum.length === 0) {
      setError('Curriculum data not loaded yet.');
      return;
    }
    if (!sparkUsername || !sparkPassword) {
      setError('Please enter your AU Spark credentials.');
      return;
    }

    setIsSparkImporting(true);
    setShowSparkModal(false);
    setIsProcessing(true);
    setError(null);
    setParsedTranscript(null);
    setCompletedCourses(new Set());
    setMatchedElectives([]);
    setMatchedGEPool([]);

    try {
      const res = await fetch('/api/scrape-au-spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: sparkUsername, password: sparkPassword }),
      });

      const data = await res.json();

      if (data.status !== 'success' || !data.transcript) {
        setError(data.reason || 'Unable to import from AU Spark. Please try again.');
        return;
      }

      console.log('[AU Spark] Received transcript:', JSON.stringify(data.transcript, null, 2));
      runCrosscheckPipeline(data.transcript);
    } catch (err) {
      setError(`Unable to import from AU Spark. Please try again.`);
      console.error('[AU Spark] Import error:', err);
    } finally {
      setIsProcessing(false);
      setIsSparkImporting(false);
      // Clear credentials from memory immediately
      setSparkUsername('');
      setSparkPassword('');
    }
  }, [selectedMajor, csvLoaded, curriculum, sparkUsername, sparkPassword, runCrosscheckPipeline]);

  // Compute layout positions
  const layout = studyPlanLoaded ? computeLayout(semesterGroups) : null;

  // Pre-compute: map node index → matched major elective (fill slots chronologically)
  const electiveSlotMap = new Map<number, MajorElectiveMatch>();
  if (layout && matchedElectives.length > 0) {
    let electiveIdx = 0;
    layout.nodes.forEach((node, nodeIdx) => {
      const isMajorElectiveSlot = !node.course.courseCode && node.course.courseTitle.includes('Major Elective');
      if (isMajorElectiveSlot && electiveIdx < matchedElectives.length) {
        electiveSlotMap.set(nodeIdx, matchedElectives[electiveIdx]);
        electiveIdx++;
      }
    });
  }

  // Pre-compute: map node index → matched GE Pool course (fill slots chronologically by category)
  const gePoolSlotMap = new Map<number, GEPoolMatch>();
  if (layout && matchedGEPool.length > 0) {
    // Separate by category
    const humanityMatches = matchedGEPool.filter(g => g.category === 'Humanity');
    const socialScienceMatches = matchedGEPool.filter(g => g.category === 'Social Science');
    const scienceMathMatches = matchedGEPool.filter(g => g.category === 'Science and Math');
    
    let humanityIdx = 0, socialIdx = 0, scienceIdx = 0;
    
    layout.nodes.forEach((node, nodeIdx) => {
      // GE Pool slots have courseCode='GE Pool' and courseTitle='Humanity Course'/'Social Science Course'/'Science and Math Course'
      if (node.course.courseCode === 'GE Pool') {
        const title = node.course.courseTitle;
        
        if (title.includes('Humanity') && humanityIdx < humanityMatches.length) {
          gePoolSlotMap.set(nodeIdx, humanityMatches[humanityIdx]);
          humanityIdx++;
        } else if (title.includes('Social Science') && socialIdx < socialScienceMatches.length) {
          gePoolSlotMap.set(nodeIdx, socialScienceMatches[socialIdx]);
          socialIdx++;
        } else if (title.includes('Science') && scienceIdx < scienceMathMatches.length) {
          gePoolSlotMap.set(nodeIdx, scienceMathMatches[scienceIdx]);
          scienceIdx++;
        }
      }
    });
  }

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
      <GCPLayout activeFeature="Course Cross Checker" projectName="Course Cross Checker">
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
                        setParsedTranscript(null);
                        setCompletedCourses(new Set());
                        setMatchedElectives([]);
                        setMatchedGEPool([]);
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
                  disabled={isProcessing || !selectedMajor || !pdfFile}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-600 text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                  ) : (
                    <><Search className="w-3.5 h-3.5" /> Crosscheck</>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">or</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Import From AU Spark */}
                <button
                  onClick={() => {
                    if (!selectedMajor) {
                      setError('Please select a major first.');
                      return;
                    }
                    if (!csvLoaded || curriculum.length === 0) {
                      setError('Curriculum data not loaded yet.');
                      return;
                    }
                    setError(null);
                    setShowSparkModal(true);
                  }}
                  disabled={isProcessing || isSparkImporting}
                  className="w-full flex items-center justify-center gap-1.5 bg-amber-500 text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSparkImporting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</>
                  ) : (
                    <><Zap className="w-3.5 h-3.5" /> Import From AU Spark</>
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
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ background: '#F0FDF4', border: '2px solid #16a34a' }} />
                        <span className="text-xs text-gray-600">Completed</span>
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
                        style={{
                          position: 'absolute',
                          left: header.x,
                          top: header.y,
                          width: COLUMN_WIDTH,
                          height: HEADER_HEIGHT,
                          display: 'grid',
                          placeItems: 'center',
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

                    {/* Course Nodes — with crosscheck completion state */}
                    {layout.nodes.map((node, idx) => {
                      const style = getCourseStyle(node.course);
                      const isGEPoolSlot = node.course.courseCode === 'GE Pool';
                      const isCompleted = !!(node.course.courseCode && node.course.courseCode !== 'GE Pool' && completedCourses.has(node.course.courseCode));
                      const filledElective = electiveSlotMap.get(idx);
                      const filledGEPool = gePoolSlotMap.get(idx);
                      const isMajorElectiveSlot = !node.course.courseCode && node.course.courseTitle.includes('Major Elective');
                      const isFilledElective = isMajorElectiveSlot && !!filledElective;
                      const isFilledGEPool = isGEPoolSlot && !!filledGEPool;

                      return (
                        <div
                          key={`node-${node.course.courseCode || node.course.courseTitle}-${idx}`}
                          data-course={node.course.courseCode || filledElective?.courseCode || filledGEPool?.courseCode || undefined}
                          style={{
                            position: 'absolute',
                            left: node.x,
                            top: node.y,
                            width: COLUMN_WIDTH,
                            height: CARD_HEIGHT,
                            background: isFilledGEPool ? '#F5F3FF' : isFilledElective ? '#EFF6FF' : isCompleted ? '#F0FDF4' : style.bg,
                            border: isFilledGEPool ? '2px solid #8B5CF6' : isFilledElective ? '2px solid #3B82F6' : isCompleted ? '2px solid #16a34a' : `1px solid ${style.border}`,
                            borderRadius: '6px',
                            boxShadow: isFilledGEPool ? '0 2px 8px rgba(139,92,246,0.15)' : isFilledElective ? '0 2px 8px rgba(59,130,246,0.15)' : isCompleted ? '0 2px 8px rgba(22,163,74,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                            display: 'grid',
                            placeItems: 'center',
                            margin: 0,
                            padding: 0,
                            overflow: 'visible',
                          }}
                        >
                          {/* Completed checkmark */}
                          {(isCompleted || isFilledElective || isFilledGEPool) && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 6,
                                fontSize: 14,
                                color: isFilledGEPool ? '#8B5CF6' : isFilledElective ? '#3B82F6' : '#16a34a',
                                fontWeight: 'bold',
                                lineHeight: 1,
                                pointerEvents: 'none',
                              }}
                            >
                              ✓
                            </span>
                          )}

                          {/* OR badge */}
                          {node.course.orFlag === 'or' && (
                            <div
                              className="absolute -top-2 -left-2 text-white text-[11px] font-bold px-1.5 py-0.5 shadow-lg z-10 -rotate-12 pointer-events-none"
                              style={{ background: '#DC2626', borderRadius: '999px', padding: '2px 6px', fontSize: '11px' }}
                            >
                              OR
                            </div>
                          )}

                          {isFilledGEPool ? (
                            <div className="text-center px-2">
                              <div className="font-bold text-sm leading-tight break-words" style={{ color: '#6B21A8' }}>
                                {filledGEPool.courseCode}
                              </div>
                              <div className="text-xs mt-0.5 leading-tight break-words" style={{ color: '#6B21A8', opacity: 0.8 }}>
                                {filledGEPool.courseName}
                              </div>
                              <div className="text-[9px] mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                                GE Pool
                              </div>
                            </div>
                          ) : isFilledElective ? (
                            <div className="text-center px-2">
                              <div className="font-bold text-sm leading-tight break-words" style={{ color: '#1E40AF' }}>
                                {filledElective.courseCode}
                              </div>
                              <div className="text-xs mt-0.5 leading-tight break-words" style={{ color: '#1E40AF', opacity: 0.8 }}>
                                {filledElective.courseName}
                              </div>
                              <div className="text-[9px] mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                                Major Elective
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="font-semibold text-sm leading-tight break-words" style={{ color: isCompleted ? '#166534' : style.text }}>
                                {isGEPoolSlot ? node.course.courseTitle : (node.course.courseCode || node.course.courseTitle)}
                              </div>
                              {node.course.courseCode && !isGEPoolSlot && (
                                <div className="text-xs mt-0.5 leading-tight break-words" style={{ color: isCompleted ? '#166534' : style.text, opacity: 0.75 }}>
                                  {node.course.courseTitle}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </PannableCanvas>
                )}
              </div>
            </div>

            {/* ===== RIGHT PANEL (15%) — Analytics ===== */}
            <div className="w-full lg:w-[14%] lg:min-w-[170px] lg:max-w-[220px] flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4" style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Analytics</h2>

                {parsedTranscript ? (
                  <div className="space-y-3">
                    {/* Student Info */}
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-[10px] font-medium text-gray-400 uppercase">Name</div>
                        <div className="text-xs font-semibold text-gray-800">{parsedTranscript.student.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-gray-400 uppercase">ID</div>
                        <div className="text-xs font-semibold text-gray-800">{parsedTranscript.student.id}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-gray-400 uppercase">Major</div>
                        <div className="text-xs font-semibold text-gray-800 leading-tight">{parsedTranscript.student.major}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-gray-400 uppercase">Credits</div>
                        <div className="text-xs font-semibold text-gray-800">{parsedTranscript.student.totalCredits}</div>
                      </div>
                    </div>

                    {/* Completion Summary */}
                    <div className="border-t border-gray-100 pt-2">
                      <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Completion</div>
                      <div className="text-xs text-gray-700">
                        <span className="font-bold text-green-700">{completedCourses.size}</span>{' '}
                        / {curriculum.filter(c => c.courseCode).length} courses matched
                      </div>
                    </div>

                    {/* Major Electives Summary */}
                    {matchedElectives.length > 0 && (
                      <div className="border-t border-gray-100 pt-2">
                        <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Major Electives</div>
                        <div className="text-xs text-gray-700 mb-1">
                          <span className="font-bold text-blue-700">{matchedElectives.length}</span>{' '}
                          / {curriculum.filter(c => !c.courseCode && c.courseTitle.includes('Major Elective')).length} slots filled
                        </div>
                        <div className="space-y-0.5">
                          {matchedElectives.map((e, i) => (
                            <div key={i} className="text-[11px] text-blue-700 font-mono leading-relaxed">
                              {e.courseCode}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Semester Breakdown */}
                    <div className="border-t border-gray-100 pt-2 space-y-2">
                      {parsedTranscript.semesters.map((sem, i) => (
                        <div key={i}>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">{sem.semesterLabel}</div>
                          {sem.courses.map((c, j) => (
                            <div key={j} className="text-[11px] text-gray-600 font-mono leading-relaxed">
                              {c.code} {c.credits} CR.
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-300">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-2">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-400 text-center">Upload transcript PDF and click Crosscheck</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </GCPLayout>

      {/* AU Spark Credential Modal */}
      {showSparkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-800">Import From AU Spark</h3>
              </div>
              <button
                onClick={() => { setShowSparkModal(false); setSparkUsername(''); setSparkPassword(''); }}
                className="p-1 rounded-lg hover:bg-gray-200/60 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter your AU Spark credentials. They are used only for this request and are never stored.
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Username / Student ID</label>
                <input
                  type="text"
                  value={sparkUsername}
                  onChange={e => setSparkUsername(e.target.value)}
                  placeholder="e.g. 6422000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  value={sparkPassword}
                  onChange={e => setSparkPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => { if (e.key === 'Enter' && sparkUsername && sparkPassword) handleSparkImport(); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
              <button
                onClick={() => { setShowSparkModal(false); setSparkUsername(''); setSparkPassword(''); }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-200/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSparkImport}
                disabled={!sparkUsername || !sparkPassword}
                className="px-4 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

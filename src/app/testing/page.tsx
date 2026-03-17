'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Download,
} from 'lucide-react';
import { electiveCodesSet as ceElectiveCodesSet, electiveLookup as ceElectiveLookup } from '@/app/course-cross-checker/data/majors/ce';
import { electiveCodesSet as eeElectiveCodesSet, electiveLookup as eeElectiveLookup } from '@/app/course-cross-checker/data/majors/ee';
import type { MajorElectiveCourse } from '@/app/course-cross-checker/data/majorElectives';
import { gePoolCodesSet, gePoolLookup, humanityCodesSet, socialScienceCodesSet, scienceMathCodesSet, languageCodesSet, bbaCodesSet } from '@/app/course-cross-checker/data/gePool';
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

// Matched GE Language Pool course from transcript
interface GELanguageMatch {
  courseCode: string;
  courseName: string;
  semesterIndex: number;
  semesterLabel: string;
}

// Matched Free Elective course from transcript (leftover courses)
interface FreeElectiveMatch {
  courseCode: string;
  courseName: string;
  credits: number;
  semesterIndex: number;
  semesterLabel: string;
}

// Unplaced course — could not fit in any slot
interface UnplacedCourse {
  courseCode: string;
  courseName: string;
  credits: number;
  semesterIndex: number;
  semesterLabel: string;
}

// Unified placement entry for any slot (used for swap system)
interface PlacedCourse {
  courseCode: string;
  courseName: string;
  credits: number;
  slotType: 'elective' | 'gePool' | 'geLanguage' | 'freeElective';
  category?: string;
  semesterIndex: number;
  semesterLabel: string;
}

// --- Vincent Mary School of Engineering Majors ---
const MAJORS = [
  { value: 'computer-engineering', label: 'Computer Engineering', degreeName: 'Computer Engineering' },
  { value: 'electrical-engineering', label: 'Electrical & Electronic Engineering', degreeName: 'Electrical & Electronic Engineering' },
  { value: 'mechatronics', label: 'Mechatronics Engineering', degreeName: 'Mechatronics Engineering' },
];

// --- Curriculum versions per major ---
interface CurriculumVersion {
  value: string;
  label: string;
  csvFile: string;
  totalCredits: number;
}

const CURRICULA: Record<string, CurriculumVersion[]> = {
  'computer-engineering': [
    { value: '651', label: '651-xxxx', csvFile: 'ece 651.csv', totalCredits: 132 },
    { value: '651-69x', label: '651-xxxx to 69x-xxxx', csvFile: 'ece 65x-69x.csv', totalCredits: 132 },
  ],
  'electrical-engineering': [
    { value: '651', label: '651-xxxx', csvFile: 'ece 651.csv', totalCredits: 132 },
    { value: '651-69x', label: '651-xxxx to 69x-xxxx', csvFile: 'ece 65x-69x.csv', totalCredits: 132 },
  ],
  'mechatronics': [
    { value: '651', label: '651-xxxx', csvFile: 'ece 651.csv', totalCredits: 132 },
    { value: '651-69x', label: '651-xxxx to 69x-xxxx', csvFile: 'ece 65x-69x.csv', totalCredits: 132 },
  ],
};

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
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
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
  const [matchedGELanguage, setMatchedGELanguage] = useState<GELanguageMatch[]>([]);
  const [matchedFreeElectives, setMatchedFreeElectives] = useState<FreeElectiveMatch[]>([]);
  const [unplacedCourses, setUnplacedCourses] = useState<UnplacedCourse[]>([]);

  // Unified placements map (nodeIndex → PlacedCourse) for swap system
  const [placements, setPlacements] = useState<Map<number, PlacedCourse>>(new Map());
  const [dynamicUnplaced, setDynamicUnplaced] = useState<UnplacedCourse[]>([]);
  const [activeSwapNode, setActiveSwapNode] = useState<number | null>(null);
  const [swapDropdownPos, setSwapDropdownPos] = useState<{ x: number; y: number } | null>(null);

  // AU Spark import state (extension-based with timeout protection)
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [isSparkImporting, setIsSparkImporting] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const sparkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // PWA install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // PWA install prompt
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Load CSV when major or curriculum changes
  useEffect(() => {
    if (!selectedMajor || !selectedCurriculum) {
      setCurriculum([]);
      setSemesterGroups([]);
      setCsvLoaded(false);
      setStudyPlanLoaded(false);
      setParsedTranscript(null);
      setCompletedCourses(new Set());
      setMatchedElectives([]);
      setMatchedGEPool([]);
      setMatchedGELanguage([]);
      setMatchedFreeElectives([]);
      setUnplacedCourses([]);
      return;
    }

    const versions = CURRICULA[selectedMajor];
    const currVer = versions?.find(v => v.value === selectedCurriculum);
    if (!currVer) return;

    setCsvLoaded(false);
    setStudyPlanLoaded(false);
    setMatchedElectives([]);
    setMatchedGEPool([]);
    setMatchedGELanguage([]);
    setMatchedFreeElectives([]);
    setUnplacedCourses([]);
    setError(null);

    fetch(`/${encodeURIComponent(currVer.csvFile)}`)
      .then(res => {
        if (!res.ok) throw new Error(`CSV file not found: ${currVer.csvFile}`);
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
  }, [selectedMajor, selectedCurriculum]);

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

    // Build set of specific curriculum course codes (core courses with explicit codes, excluding GE Pool)
    const specificCurriculumCodes = new Set(
      curriculum.filter(c => c.courseCode && c.courseCode !== 'GE Pool').map(c => c.courseCode)
    );

    // Track which transcript courses have been assigned — prevents duplicates
    const assignedCodes = new Set<string>();

    // 1) Core courses — mark all completed core courses as assigned FIRST
    completed.forEach(code => {
      if (specificCurriculumCodes.has(code)) {
        assignedCodes.add(code);
      }
    });

    // 2) Detect major elective matches — EXCLUDE courses already placed in core
    const electiveCodesSet = selectedMajor === 'computer-engineering' ? ceElectiveCodesSet
      : selectedMajor === 'electrical-engineering' ? eeElectiveCodesSet
      : null;
    const electiveLookup = selectedMajor === 'computer-engineering' ? ceElectiveLookup
      : selectedMajor === 'electrical-engineering' ? eeElectiveLookup
      : null;

    const electives: MajorElectiveMatch[] = [];
    if (electiveCodesSet && electiveLookup) {
      parsed.semesters.forEach((sem, semIdx) => {
        sem.courses.forEach(c => {
          if (assignedCodes.has(c.code)) return; // already used as core — skip
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

    // Mark electives as assigned
    electives.forEach(e => assignedCodes.add(e.courseCode));

    // 3) Normal GE Pool matches (non-BBA, by category)
    const gePoolMatches: GEPoolMatch[] = [];
    parsed.semesters.forEach((sem, semIdx) => {
      sem.courses.forEach(c => {
        if (assignedCodes.has(c.code)) return;
        if (!gePoolCodesSet.has(c.code)) return;
        if (specificCurriculumCodes.has(c.code)) return;
        if (bbaCodesSet.has(c.code)) return; // BBA handled separately in step 5
        const info = gePoolLookup.get(c.code);
        if (!info) return;
        if (info.category === 'Language') return; // Language goes to Language Pool
        if (info.category === 'Humanity' || info.category === 'Social Science' || info.category === 'Science and Math') {
          gePoolMatches.push({
            courseCode: c.code,
            courseName: info.courseName,
            category: info.category as 'Humanity' | 'Social Science' | 'Science and Math',
            semesterIndex: semIdx,
            semesterLabel: sem.semesterLabel,
          });
        }
      });
    });
    gePoolMatches.sort((a, b) => a.semesterIndex - b.semesterIndex);
    const normalGESlotCount = curriculum.filter(c =>
      c.courseCode === 'GE Pool' && !c.courseTitle.includes('Language')
    ).length;
    const usedNormalGE = gePoolMatches.slice(0, normalGESlotCount);
    usedNormalGE.forEach(g => assignedCodes.add(g.courseCode));
    console.log('[Crosscheck] GE Pool matches (non-BBA):', usedNormalGE.map(g => `${g.courseCode} (${g.category})`));

    // 4) GE Language Pool matches
    const geLanguageMatches: GELanguageMatch[] = [];
    parsed.semesters.forEach((sem, semIdx) => {
      sem.courses.forEach(c => {
        if (assignedCodes.has(c.code)) return;
        if (languageCodesSet.has(c.code) && !specificCurriculumCodes.has(c.code)) {
          const info = gePoolLookup.get(c.code);
          geLanguageMatches.push({
            courseCode: c.code,
            courseName: info?.courseName || c.code,
            semesterIndex: semIdx,
            semesterLabel: sem.semesterLabel,
          });
        }
      });
    });
    const langSlotCount = curriculum.filter(c =>
      c.courseCode === 'GE Pool' && c.courseTitle.includes('Language')
    ).length;
    geLanguageMatches.sort((a, b) => a.semesterIndex - b.semesterIndex);
    const usedLangMatches = geLanguageMatches.slice(0, langSlotCount);
    setMatchedGELanguage(usedLangMatches);
    usedLangMatches.forEach(g => assignedCodes.add(g.courseCode));
    console.log('[Crosscheck] GE Language matches:', usedLangMatches.map(g => g.courseCode));

    // 5) BBA courses — fill remaining empty GE slots (any category, LOWEST priority)
    const remainingGESlots = normalGESlotCount - usedNormalGE.length;
    const bbaCandidates: GEPoolMatch[] = [];
    if (remainingGESlots > 0) {
      parsed.semesters.forEach((sem, semIdx) => {
        sem.courses.forEach(c => {
          if (assignedCodes.has(c.code)) return;
          if (specificCurriculumCodes.has(c.code)) return;
          if (!bbaCodesSet.has(c.code) && !c.code.startsWith('BBA')) return;
          const info = gePoolLookup.get(c.code);
          bbaCandidates.push({
            courseCode: c.code,
            courseName: info?.courseName || c.code,
            category: info?.category as 'Humanity' | 'Social Science' | 'Science and Math' || 'Social Science',
            semesterIndex: semIdx,
            semesterLabel: sem.semesterLabel,
          });
        });
      });
      bbaCandidates.sort((a, b) => a.semesterIndex - b.semesterIndex);
    }
    const usedBBA = bbaCandidates.slice(0, remainingGESlots);
    usedBBA.forEach(g => assignedCodes.add(g.courseCode));
    const allNormalGE = [...usedNormalGE, ...usedBBA];
    setMatchedGEPool(allNormalGE);
    if (usedBBA.length > 0) {
      console.log('[Crosscheck] BBA filling GE slots:', usedBBA.map(g => g.courseCode));
    }

    // 6) Free Elective overflow — remaining unassigned courses fill Free Elective slots
    const freeElectiveSlotCount = curriculum.filter(c =>
      !c.courseCode && c.courseTitle.includes('Free Elective')
    ).length;
    const freeElectiveMatches: FreeElectiveMatch[] = [];
    parsed.semesters.forEach((sem, semIdx) => {
      sem.courses.forEach(c => {
        if (assignedCodes.has(c.code)) return;
        if (specificCurriculumCodes.has(c.code)) return;
        const geInfo = gePoolLookup.get(c.code);
        const elInfo = electiveLookup?.get(c.code);
        freeElectiveMatches.push({
          courseCode: c.code,
          courseName: geInfo?.courseName || elInfo?.courseName || c.code,
          credits: c.credits,
          semesterIndex: semIdx,
          semesterLabel: sem.semesterLabel,
        });
      });
    });
    freeElectiveMatches.sort((a, b) => a.semesterIndex - b.semesterIndex);
    const usedFreeElectives = freeElectiveMatches.slice(0, freeElectiveSlotCount);
    setMatchedFreeElectives(usedFreeElectives);
    usedFreeElectives.forEach(f => assignedCodes.add(f.courseCode));
    console.log('[Crosscheck] Free Elective matches:', usedFreeElectives.map(f => f.courseCode));

    // 7) Unplaced courses — overflow that couldn't fit anywhere
    const unplaced: UnplacedCourse[] = freeElectiveMatches.slice(freeElectiveSlotCount).map(f => ({
      courseCode: f.courseCode,
      courseName: f.courseName,
      credits: f.credits,
      semesterIndex: f.semesterIndex,
      semesterLabel: f.semesterLabel,
    }));
    setUnplacedCourses(unplaced);
    if (unplaced.length > 0) {
      console.log('[Crosscheck] Unplaced courses:', unplaced.map(u => u.courseCode));
    }

    // 8) Build unified placements map for swap system
    const tempLayout = computeLayout(semesterGroups);
    if (tempLayout) {
      const newPlacements = new Map<number, PlacedCourse>();

      // Elective slots
      let eIdx = 0;
      const majorElecSlotCount = curriculum.filter(c => !c.courseCode && c.courseTitle.includes('Major Elective')).length;
      const usedElectives = electives.slice(0, majorElecSlotCount);
      tempLayout.nodes.forEach((node, nodeIdx) => {
        if (!node.course.courseCode && node.course.courseTitle.includes('Major Elective') && eIdx < usedElectives.length) {
          newPlacements.set(nodeIdx, {
            courseCode: usedElectives[eIdx].courseCode,
            courseName: usedElectives[eIdx].courseName,
            credits: 3,
            slotType: 'elective',
            semesterIndex: usedElectives[eIdx].semesterIndex,
            semesterLabel: usedElectives[eIdx].semesterLabel,
          });
          eIdx++;
        }
      });

      // GE Pool slots (by category, with BBA overflow to any remaining)
      const humMatches = allNormalGE.filter(g => g.category === 'Humanity');
      const socMatches = allNormalGE.filter(g => g.category === 'Social Science');
      const sciMatches = allNormalGE.filter(g => g.category === 'Science and Math');
      let hIdx = 0, sIdx = 0, scIdx = 0;
      tempLayout.nodes.forEach((node, nodeIdx) => {
        if (node.course.courseCode === 'GE Pool' && !node.course.courseTitle.includes('Language')) {
          const title = node.course.courseTitle;
          let match: GEPoolMatch | undefined;
          if (title.includes('Humanity') && hIdx < humMatches.length) { match = humMatches[hIdx++]; }
          else if (title.includes('Social Science') && sIdx < socMatches.length) { match = socMatches[sIdx++]; }
          else if (title.includes('Science') && scIdx < sciMatches.length) { match = sciMatches[scIdx++]; }
          if (match) {
            newPlacements.set(nodeIdx, {
              courseCode: match.courseCode,
              courseName: match.courseName,
              credits: 3,
              slotType: 'gePool',
              category: match.category,
              semesterIndex: match.semesterIndex,
              semesterLabel: match.semesterLabel,
            });
          }
        }
      });
      // Second pass: fill remaining empty GE slots with unplaced GE matches (BBA overflow)
      const placedGECodes = new Set([...newPlacements.values()].filter(p => p.slotType === 'gePool').map(p => p.courseCode));
      const unplacedGE = allNormalGE.filter(g => !placedGECodes.has(g.courseCode));
      let ugIdx = 0;
      tempLayout.nodes.forEach((node, nodeIdx) => {
        if (node.course.courseCode === 'GE Pool' && !node.course.courseTitle.includes('Language') && !newPlacements.has(nodeIdx) && ugIdx < unplacedGE.length) {
          const g = unplacedGE[ugIdx++];
          newPlacements.set(nodeIdx, {
            courseCode: g.courseCode, courseName: g.courseName, credits: 3,
            slotType: 'gePool', category: g.category,
            semesterIndex: g.semesterIndex, semesterLabel: g.semesterLabel,
          });
        }
      });

      // GE Language slots
      let lIdx = 0;
      tempLayout.nodes.forEach((node, nodeIdx) => {
        if (node.course.courseCode === 'GE Pool' && node.course.courseTitle.includes('Language') && lIdx < usedLangMatches.length) {
          const g = usedLangMatches[lIdx++];
          newPlacements.set(nodeIdx, {
            courseCode: g.courseCode, courseName: g.courseName, credits: 3,
            slotType: 'geLanguage',
            semesterIndex: g.semesterIndex, semesterLabel: g.semesterLabel,
          });
        }
      });

      // Free Elective slots
      let fIdx = 0;
      tempLayout.nodes.forEach((node, nodeIdx) => {
        if (!node.course.courseCode && node.course.courseTitle.includes('Free Elective') && fIdx < usedFreeElectives.length) {
          const f = usedFreeElectives[fIdx++];
          newPlacements.set(nodeIdx, {
            courseCode: f.courseCode, courseName: f.courseName, credits: f.credits,
            slotType: 'freeElective',
            semesterIndex: f.semesterIndex, semesterLabel: f.semesterLabel,
          });
        }
      });

      setPlacements(newPlacements);
      setDynamicUnplaced([...unplaced]);
      setActiveSwapNode(null);
    }

    setStudyPlanLoaded(true);
  }, [selectedMajor, curriculum, semesterGroups]);

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

  // Ref for localStorage polling interval
  const sparkPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Process transcript data from any source (extension event or localStorage)
  const processSparkTranscript = useCallback((data: ParsedTranscript) => {
    console.log('[AU Spark] Processing transcript:', data);
    if (sparkTimeoutRef.current) clearTimeout(sparkTimeoutRef.current);
    sparkTimeoutRef.current = null;
    if (sparkPollingRef.current) clearInterval(sparkPollingRef.current);
    sparkPollingRef.current = null;
    localStorage.removeItem('sparkTranscriptData');
    setIsSparkImporting(false);
    if (selectedMajor && csvLoaded) {
      runCrosscheckPipeline(data);
    }
  }, [selectedMajor, csvLoaded, runCrosscheckPipeline]);

  // Handle AU Spark import — extension-based with localStorage polling fallback
  const handleSparkImport = useCallback(() => {
    if (!selectedMajor) {
      setError('Please select a major first.');
      return;
    }
    if (!csvLoaded || curriculum.length === 0) {
      setError('Curriculum data not loaded yet.');
      return;
    }

    // Clear any previous data
    localStorage.removeItem('sparkTranscriptData');

    setIsSparkImporting(true);
    setError(null);

    // Set timeout to auto-cancel after 90s to prevent infinite loading
    if (sparkTimeoutRef.current) clearTimeout(sparkTimeoutRef.current);
    sparkTimeoutRef.current = setTimeout(() => {
      setIsSparkImporting(false);
      if (sparkPollingRef.current) clearInterval(sparkPollingRef.current);
      sparkPollingRef.current = null;
      setError('AU Spark import timed out. Please try again or use PDF upload.');
    }, 90000);

    // Start polling localStorage every 1s (works cross-origin on production)
    if (sparkPollingRef.current) clearInterval(sparkPollingRef.current);
    sparkPollingRef.current = setInterval(() => {
      const raw = localStorage.getItem('sparkTranscriptData');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as ParsedTranscript;
          processSparkTranscript(parsed);
        } catch (e) {
          console.error('[AU Spark] Failed to parse localStorage data:', e);
        }
      }
    }, 1000);

    // Open AU Spark grade page directly in new tab
    window.open('https://auspark.au.edu/grade', '_blank');
  }, [selectedMajor, csvLoaded, curriculum, processSparkTranscript]);

  // Listen for AU Spark extension events via multiple channels
  useEffect(() => {
    // Check if extension is installed
    const checkExtension = () => {
      if (typeof window !== 'undefined' && (window as any).__auSparkExtension) {
        setExtensionInstalled(true);
      }
    };
    
    checkExtension();
    window.addEventListener('au-spark-extension-ready', checkExtension);

    // Listen for transcript data from extension (custom event - works locally)
    const handleTranscript = (event: CustomEvent) => {
      console.log('[AU Spark] Received transcript via custom event:', event.detail);
      if (event.detail) {
        processSparkTranscript(event.detail);
      }
    };
    window.addEventListener('au-spark-transcript', handleTranscript as EventListener);

    // Listen for postMessage from extension (cross-origin compatible)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'au-spark-transcript' && event.data?.payload) {
        console.log('[AU Spark] Received transcript via postMessage:', event.data.payload);
        processSparkTranscript(event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);

    // BroadcastChannel for same-origin cross-tab communication
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('au-spark-channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'transcript' && event.data?.payload) {
          console.log('[AU Spark] Received transcript via BroadcastChannel:', event.data.payload);
          processSparkTranscript(event.data.payload);
        }
      };
    }

    // Cleanup
    return () => {
      window.removeEventListener('au-spark-extension-ready', checkExtension);
      window.removeEventListener('au-spark-transcript', handleTranscript as EventListener);
      window.removeEventListener('message', handleMessage);
      if (channel) channel.close();
      if (sparkTimeoutRef.current) clearTimeout(sparkTimeoutRef.current);
      if (sparkPollingRef.current) clearInterval(sparkPollingRef.current);
    };
  }, [processSparkTranscript]);

  // Compute layout positions
  const layout = studyPlanLoaded ? computeLayout(semesterGroups) : null;

  // Build set of core curriculum codes (courses with explicit codes, excluding GE Pool placeholder)
  const coreCurriculumCodes = useMemo(() => new Set(
    curriculum.filter(c => c.courseCode && c.courseCode !== 'GE Pool').map(c => c.courseCode)
  ), [curriculum]);

  // Get eligible courses for swap dropdown based on slot type
  // SWAP RULES: show ALL eligible courses INCLUDING already-placed ones (swap overrides placement)
  const getEligibleCourses = useCallback((nodeIdx: number): { code: string; name: string; credits: number }[] => {
    if (!layout) return [];
    const node = layout.nodes[nodeIdx];
    if (!node) return [];
    const currentPlacement = placements.get(nodeIdx);
    const currentCode = currentPlacement?.courseCode;

    const isGEPoolSlot = node.course.courseCode === 'GE Pool';
    const isGELanguageSlot = isGEPoolSlot && node.course.courseTitle.includes('Language');
    const isMajorElectiveSlot = !node.course.courseCode && node.course.courseTitle.includes('Major Elective');
    const isFreeElectiveSlot = !node.course.courseCode && node.course.courseTitle.includes('Free Elective');

    const results: { code: string; name: string; credits: number }[] = [];

    if (isMajorElectiveSlot) {
      // Major Elective: only major elective courses (completed or unmapped)
      const electiveCodesSet = selectedMajor === 'computer-engineering' ? ceElectiveCodesSet
        : selectedMajor === 'electrical-engineering' ? eeElectiveCodesSet : null;
      const electiveLookup = selectedMajor === 'computer-engineering' ? ceElectiveLookup
        : selectedMajor === 'electrical-engineering' ? eeElectiveLookup : null;
      if (electiveCodesSet && electiveLookup) {
        electiveCodesSet.forEach(code => {
          if (!completedCourses.has(code)) return;
          const info = electiveLookup.get(code);
          if (info) results.push({ code, name: info.courseName, credits: info.credits });
        });
      }
      dynamicUnplaced.forEach(u => {
        if (electiveCodesSet?.has(u.courseCode)) {
          results.push({ code: u.courseCode, name: u.courseName, credits: u.credits });
        }
      });
    } else if (isGEPoolSlot && !isGELanguageSlot) {
      // GE Pool: GE courses (non-language) + BBA + unmapped GE-eligible
      gePoolCodesSet.forEach(code => {
        const info = gePoolLookup.get(code);
        if (!info || info.category === 'Language') return;
        if (completedCourses.has(code)) {
          results.push({ code, name: info.courseName, credits: info.credits });
        }
      });
      dynamicUnplaced.forEach(u => {
        if (gePoolCodesSet.has(u.courseCode) || u.courseCode.startsWith('BBA')) {
          results.push({ code: u.courseCode, name: u.courseName, credits: u.credits });
        }
      });
    } else if (isGELanguageSlot) {
      // GE Language: only language courses
      languageCodesSet.forEach(code => {
        const info = gePoolLookup.get(code);
        if (info && completedCourses.has(code)) {
          results.push({ code, name: info.courseName, credits: info.credits });
        }
      });
      dynamicUnplaced.forEach(u => {
        if (languageCodesSet.has(u.courseCode)) {
          results.push({ code: u.courseCode, name: u.courseName, credits: u.credits });
        }
      });
    } else if (isFreeElectiveSlot) {
      // Free Elective: ONLY GE Pool + GE Language + BBA + unmapped (EXCLUDE core courses)
      gePoolCodesSet.forEach(code => {
        if (coreCurriculumCodes.has(code)) return;
        const info = gePoolLookup.get(code);
        if (!info) return;
        if (completedCourses.has(code)) {
          results.push({ code, name: info.courseName, credits: info.credits });
        }
      });
      // Add unmapped courses (non-core)
      dynamicUnplaced.forEach(u => {
        if (coreCurriculumCodes.has(u.courseCode)) return;
        results.push({ code: u.courseCode, name: u.courseName, credits: u.credits });
      });
      // Add BBA courses from transcript that aren't in GE pool set
      if (parsedTranscript) {
        parsedTranscript.semesters.forEach(sem => {
          sem.courses.forEach(c => {
            if (coreCurriculumCodes.has(c.code)) return;
            if (c.code.startsWith('BBA') && !gePoolCodesSet.has(c.code)) {
              results.push({ code: c.code, name: c.code, credits: c.credits });
            }
          });
        });
      }
    }

    // Deduplicate and exclude current course
    const seen = new Set<string>();
    return results.filter(r => {
      if (r.code === currentCode) return false;
      if (seen.has(r.code)) return false;
      seen.add(r.code);
      return true;
    });
  }, [layout, placements, selectedMajor, completedCourses, dynamicUnplaced, parsedTranscript, coreCurriculumCodes]);

  // Handle swap: user selects a course from dropdown for a given node
  const handleSwapSelect = useCallback((targetNodeIdx: number, selectedCode: string) => {
    const newPlacements = new Map(placements);
    const targetCurrent = newPlacements.get(targetNodeIdx);

    // Find if selected course is already placed somewhere else
    let sourceNodeIdx: number | null = null;
    newPlacements.forEach((p, idx) => {
      if (p.courseCode === selectedCode && idx !== targetNodeIdx) {
        sourceNodeIdx = idx;
      }
    });

    // Get info about selected course
    const geInfo = gePoolLookup.get(selectedCode);
    const elLookup = selectedMajor === 'computer-engineering' ? ceElectiveLookup
      : selectedMajor === 'electrical-engineering' ? eeElectiveLookup : null;
    const elInfo = elLookup?.get(selectedCode);
    const courseName = geInfo?.courseName || elInfo?.courseName || selectedCode;
    const credits = geInfo?.credits || elInfo?.credits || 3;

    // Determine slot type for the target
    const node = layout?.nodes[targetNodeIdx];
    let slotType: PlacedCourse['slotType'] = 'freeElective';
    if (node) {
      if (!node.course.courseCode && node.course.courseTitle.includes('Major Elective')) slotType = 'elective';
      else if (node.course.courseCode === 'GE Pool' && node.course.courseTitle.includes('Language')) slotType = 'geLanguage';
      else if (node.course.courseCode === 'GE Pool') slotType = 'gePool';
    }

    const newEntry: PlacedCourse = {
      courseCode: selectedCode, courseName, credits, slotType,
      category: geInfo?.category !== 'Language' && geInfo?.category !== 'Free Elective' ? geInfo?.category : undefined,
      semesterIndex: 0, semesterLabel: '',
    };

    // Find semester info from transcript
    if (parsedTranscript) {
      for (const sem of parsedTranscript.semesters) {
        const found = sem.courses.find(c => c.code === selectedCode);
        if (found) {
          newEntry.semesterIndex = parsedTranscript.semesters.indexOf(sem);
          newEntry.semesterLabel = sem.semesterLabel;
          break;
        }
      }
    }

    let newUnplaced = [...dynamicUnplaced];

    if (sourceNodeIdx !== null) {
      // SWAP: move current course to source slot
      const sourceCurrent = newPlacements.get(sourceNodeIdx)!;
      if (targetCurrent) {
        // Determine slot type for source node
        const srcNode = layout?.nodes[sourceNodeIdx];
        let srcSlotType: PlacedCourse['slotType'] = sourceCurrent.slotType;
        if (srcNode) {
          if (!srcNode.course.courseCode && srcNode.course.courseTitle.includes('Major Elective')) srcSlotType = 'elective';
          else if (srcNode.course.courseCode === 'GE Pool' && srcNode.course.courseTitle.includes('Language')) srcSlotType = 'geLanguage';
          else if (srcNode.course.courseCode === 'GE Pool') srcSlotType = 'gePool';
          else if (!srcNode.course.courseCode && srcNode.course.courseTitle.includes('Free Elective')) srcSlotType = 'freeElective';
        }
        newPlacements.set(sourceNodeIdx, { ...targetCurrent, slotType: srcSlotType });
      } else {
        newPlacements.delete(sourceNodeIdx);
      }
      newPlacements.set(targetNodeIdx, newEntry);
    } else {
      // Course from unmapped list or transcript
      const unmappedIdx = newUnplaced.findIndex(u => u.courseCode === selectedCode);
      if (unmappedIdx !== -1) {
        newUnplaced.splice(unmappedIdx, 1);
      }
      // If current slot has a course, send it to unmapped
      if (targetCurrent) {
        newUnplaced.push({
          courseCode: targetCurrent.courseCode,
          courseName: targetCurrent.courseName,
          credits: targetCurrent.credits,
          semesterIndex: targetCurrent.semesterIndex,
          semesterLabel: targetCurrent.semesterLabel,
        });
      }
      newPlacements.set(targetNodeIdx, newEntry);
    }

    setPlacements(newPlacements);
    setDynamicUnplaced(newUnplaced.sort((a, b) => a.semesterIndex - b.semesterIndex));
    setActiveSwapNode(null);
    setSwapDropdownPos(null);
  }, [placements, dynamicUnplaced, layout, selectedMajor, parsedTranscript]);

  // Handle click on a filled slot to show swap dropdown
  const handleSlotClick = useCallback((e: React.MouseEvent, nodeIdx: number) => {
    e.stopPropagation();
    if (activeSwapNode === nodeIdx) {
      setActiveSwapNode(null);
      setSwapDropdownPos(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSwapDropdownPos({ x: rect.left, y: rect.bottom + 4 });
    setActiveSwapNode(nodeIdx);
  }, [activeSwapNode]);

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
                        setSelectedCurriculum('');
                        setError(null);
                        setStudyPlanLoaded(false);
                        setParsedTranscript(null);
                        setCompletedCourses(new Set());
                        setMatchedElectives([]);
                        setMatchedGEPool([]);
                        setMatchedGELanguage([]);
                        setMatchedFreeElectives([]);
                        setUnplacedCourses([]);
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

                {/* Curriculum Dropdown */}
                {selectedMajor && CURRICULA[selectedMajor] && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Curriculum</label>
                    <div className="relative">
                      <select
                        value={selectedCurriculum}
                        onChange={e => {
                          setSelectedCurriculum(e.target.value);
                          setStudyPlanLoaded(false);
                          setParsedTranscript(null);
                          setCompletedCourses(new Set());
                          setMatchedElectives([]);
                          setMatchedGEPool([]);
                          setMatchedGELanguage([]);
                          setMatchedFreeElectives([]);
                          setUnplacedCourses([]);
                        }}
                        className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      >
                        <option value="">-- Choose --</option>
                        {CURRICULA[selectedMajor].map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

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
                  disabled={isProcessing || !selectedMajor || !selectedCurriculum || !pdfFile}
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
                  onClick={handleSparkImport}
                  disabled={isProcessing || isSparkImporting}
                  className="w-full flex items-center justify-center gap-1.5 bg-amber-500 text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSparkImporting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Waiting for import...</>
                  ) : (
                    <><Zap className="w-3.5 h-3.5" /> Import From AU Spark</>
                  )}
                </button>
                {!extensionInstalled && (
                  <button
                    onClick={() => setShowExtensionModal(true)}
                    className="w-full text-[10px] text-amber-600 hover:text-amber-700 hover:underline text-center transition-colors"
                  >
                    Install the browser extension for auto-import →
                  </button>
                )}

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
                <div className="px-5 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-red-500" />
                      Study Plan
                    </h2>
                    {studyPlanLoaded && (
                      <span className="text-xs text-gray-400">{curriculum.length} courses · drag to pan · scroll to zoom</span>
                    )}
                  </div>
                </div>

                {/* Curriculum Title — fixed above grid, does NOT scroll with canvas */}
                {studyPlanLoaded && selectedMajor && selectedCurriculum && (() => {
                  const major = MAJORS.find(m => m.value === selectedMajor);
                  const currVer = CURRICULA[selectedMajor]?.find(v => v.value === selectedCurriculum);
                  return major && currVer ? (
                    <div className="text-center py-3 border-b border-gray-100 bg-gray-50/60">
                      <div className="text-lg font-bold text-gray-800">
                        Bachelor of {major.degreeName}
                      </div>
                      <div className="text-sm font-medium text-gray-500 mt-0.5">
                        Curriculum for {currVer.label} Students ({currVer.totalCredits} Credits)
                      </div>
                    </div>
                  ) : null;
                })()}

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

                    {/* Course Nodes — with crosscheck completion state + swap click */}
                    {layout.nodes.map((node, idx) => {
                      const style = getCourseStyle(node.course);
                      const isGEPoolSlot = node.course.courseCode === 'GE Pool';
                      const isCompleted = !!(node.course.courseCode && node.course.courseCode !== 'GE Pool' && completedCourses.has(node.course.courseCode));
                      const placement = placements.get(idx);
                      const isMajorElectiveSlot = !node.course.courseCode && node.course.courseTitle.includes('Major Elective');
                      const isFreeElectiveSlot = !node.course.courseCode && node.course.courseTitle.includes('Free Elective');
                      const isGELanguageSlot = isGEPoolSlot && node.course.courseTitle.includes('Language');
                      const isFilledElective = placement?.slotType === 'elective';
                      const isFilledGEPool = placement?.slotType === 'gePool';
                      const isFilledGELanguage = placement?.slotType === 'geLanguage';
                      const isFilledFreeElective = placement?.slotType === 'freeElective';
                      const isFilled = !!placement;
                      const isSwappable = isFilled || isMajorElectiveSlot || isFreeElectiveSlot || isGEPoolSlot;

                      return (
                        <div
                          key={`node-${node.course.courseCode || node.course.courseTitle}-${idx}`}
                          data-course={node.course.courseCode || placement?.courseCode || undefined}
                          onClick={isSwappable && studyPlanLoaded ? (e) => handleSlotClick(e, idx) : undefined}
                          style={{
                            position: 'absolute',
                            left: node.x,
                            top: node.y,
                            width: COLUMN_WIDTH,
                            height: CARD_HEIGHT,
                            background: isFilledFreeElective ? '#FFF7ED' : isFilledGELanguage ? '#F0FDFA' : isFilledGEPool ? '#F5F3FF' : isFilledElective ? '#EFF6FF' : isCompleted ? '#F0FDF4' : style.bg,
                            border: isFilledFreeElective ? '2px solid #F59E0B' : isFilledGELanguage ? '2px solid #14B8A6' : isFilledGEPool ? '2px solid #8B5CF6' : isFilledElective ? '2px solid #3B82F6' : isCompleted ? '2px solid #16a34a' : `1px solid ${style.border}`,
                            borderRadius: '6px',
                            boxShadow: isFilledFreeElective ? '0 2px 8px rgba(245,158,11,0.15)' : isFilledGELanguage ? '0 2px 8px rgba(20,184,166,0.15)' : isFilledGEPool ? '0 2px 8px rgba(139,92,246,0.15)' : isFilledElective ? '0 2px 8px rgba(59,130,246,0.15)' : isCompleted ? '0 2px 8px rgba(22,163,74,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                            display: 'grid',
                            placeItems: 'center',
                            margin: 0,
                            padding: 0,
                            overflow: 'visible',
                            cursor: isSwappable ? 'pointer' : 'default',
                          }}
                        >
                          {/* Completed checkmark */}
                          {(isCompleted || isFilled) && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 6,
                                fontSize: 14,
                                color: isFilledFreeElective ? '#F59E0B' : isFilledGELanguage ? '#14B8A6' : isFilledGEPool ? '#8B5CF6' : isFilledElective ? '#3B82F6' : '#16a34a',
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

                          {isFilledFreeElective ? (
                            <div className="text-center px-2">
                              <div className="font-bold text-base leading-tight break-words" style={{ color: '#B45309' }}>
                                {placement.courseCode}
                              </div>
                              <div className="text-sm mt-0.5 leading-tight break-words" style={{ color: '#B45309', opacity: 0.8 }}>
                                {placement.courseName}
                              </div>
                              <div className="text-[10px] mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                                Free Elective
                              </div>
                            </div>
                          ) : isFilledGELanguage ? (
                            <div className="text-center px-2">
                              <div className="font-bold text-base leading-tight break-words" style={{ color: '#0F766E' }}>
                                {placement.courseCode}
                              </div>
                              <div className="text-sm mt-0.5 leading-tight break-words" style={{ color: '#0F766E', opacity: 0.8 }}>
                                {placement.courseName}
                              </div>
                              <div className="text-[10px] mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                                GE Language
                              </div>
                            </div>
                          ) : isFilledGEPool ? (
                            <div className="text-center px-2">
                              <div className="font-bold text-base leading-tight break-words" style={{ color: '#6B21A8' }}>
                                {placement.courseCode}
                              </div>
                              <div className="text-sm mt-0.5 leading-tight break-words" style={{ color: '#6B21A8', opacity: 0.8 }}>
                                {placement.courseName}
                              </div>
                              <div className="text-[10px] mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                                GE Pool
                              </div>
                            </div>
                          ) : isFilledElective ? (
                            <div className="text-center px-2">
                              <div className="font-bold text-base leading-tight break-words" style={{ color: '#1E40AF' }}>
                                {placement.courseCode}
                              </div>
                              <div className="text-sm mt-0.5 leading-tight break-words" style={{ color: '#1E40AF', opacity: 0.8 }}>
                                {placement.courseName}
                              </div>
                              <div className="text-[10px] mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                                Major Elective
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="font-semibold text-base leading-tight break-words" style={{ color: isCompleted ? '#166534' : style.text }}>
                                {isGEPoolSlot ? node.course.courseTitle : (node.course.courseCode || node.course.courseTitle)}
                              </div>
                              {node.course.courseCode && !isGEPoolSlot && (
                                <div className="text-sm mt-0.5 leading-tight break-words" style={{ color: isCompleted ? '#166534' : style.text, opacity: 0.75 }}>
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

            {/* Swap Dropdown Portal — fixed above everything */}
            {activeSwapNode !== null && swapDropdownPos && (() => {
              const eligible = getEligibleCourses(activeSwapNode);
              return (
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => { setActiveSwapNode(null); setSwapDropdownPos(null); }}
                >
                  <div
                    className="absolute bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden"
                    style={{
                      left: swapDropdownPos.x,
                      top: swapDropdownPos.y,
                      width: 260,
                      maxHeight: 280,
                      zIndex: 9999,
                      animation: 'fadeIn 150ms ease-out',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                      Swap Course ({eligible.length} available)
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 236 }}>
                      {eligible.length === 0 ? (
                        <div className="px-3 py-4 text-xs text-gray-400 text-center">No eligible courses</div>
                      ) : (
                        eligible.map(c => (
                          <button
                            key={c.code}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => handleSwapSelect(activeSwapNode, c.code)}
                          >
                            <div className="text-xs font-bold text-gray-800 font-mono">{c.code}</div>
                            <div className="text-[10px] text-gray-500 leading-tight truncate">{c.name}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Extension Install Modal */}
            {showExtensionModal && (
              <div
                className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
                onClick={() => setShowExtensionModal(false)}
              >
                <div
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                  onClick={e => e.stopPropagation()}
                  style={{ animation: 'fadeIn 200ms ease-out' }}
                >
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Install AU Spark Extension
                    </h3>
                    <p className="text-amber-100 text-sm mt-1">One-time setup for automatic transcript import</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Download the extension</p>
                          <a
                            href="/extension.zip"
                            download="au-spark-extension.zip"
                            className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Extension (.zip)
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Extract the ZIP file</p>
                          <p className="text-xs text-gray-500 mt-0.5">Unzip to a folder on your computer</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Open Chrome Extensions</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Go to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">chrome://extensions</code>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Enable Developer Mode</p>
                          <p className="text-xs text-gray-500 mt-0.5">Toggle the switch in the top-right corner</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Load the extension</p>
                          <p className="text-xs text-gray-500 mt-0.5">Click "Load unpacked" and select the extracted folder</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 text-center">
                        After installation, refresh this page. The extension will auto-detect.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => setShowExtensionModal(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

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

                    {/* GE Pool Summary */}
                    {matchedGEPool.length > 0 && (
                      <div className="border-t border-gray-100 pt-2">
                        <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">GE Pool</div>
                        <div className="text-xs text-gray-700 mb-1">
                          <span className="font-bold text-purple-700">{matchedGEPool.length}</span>{' '}
                          / {curriculum.filter(c => c.courseCode === 'GE Pool' && !c.courseTitle.includes('Language')).length} slots filled
                        </div>
                        <div className="space-y-0.5">
                          {matchedGEPool.map((g, i) => (
                            <div key={i} className="text-[11px] text-purple-700 font-mono leading-relaxed">
                              {g.courseCode} <span className="text-[9px] text-gray-500">({g.category})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GE Language Pool Summary */}
                    {matchedGELanguage.length > 0 && (
                      <div className="border-t border-gray-100 pt-2">
                        <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">GE Language Pool</div>
                        <div className="text-xs text-gray-700 mb-1">
                          <span className="font-bold text-teal-700">{matchedGELanguage.length}</span>{' '}
                          / {curriculum.filter(c => c.courseCode === 'GE Pool' && c.courseTitle.includes('Language')).length} slots filled
                        </div>
                        <div className="space-y-0.5">
                          {matchedGELanguage.map((g, i) => (
                            <div key={i} className="text-[11px] text-teal-700 font-mono leading-relaxed">
                              {g.courseCode}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Free Electives Summary */}
                    {matchedFreeElectives.length > 0 && (
                      <div className="border-t border-gray-100 pt-2">
                        <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">Free Electives</div>
                        <div className="text-xs text-gray-700 mb-1">
                          <span className="font-bold text-amber-700">{matchedFreeElectives.length}</span>{' '}
                          / {curriculum.filter(c => !c.courseCode && c.courseTitle.includes('Free Elective')).length} slots filled
                        </div>
                        <div className="space-y-0.5">
                          {matchedFreeElectives.map((f, i) => (
                            <div key={i} className="text-[11px] text-amber-700 font-mono leading-relaxed">
                              {f.courseCode} <span className="text-[9px] text-gray-500">({f.credits} CR)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unplaced Courses */}
                    {dynamicUnplaced.length > 0 && (
                      <div className="border-t border-gray-100 pt-2">
                        <div className="text-[10px] font-medium text-red-400 uppercase mb-1">Unmapped Courses</div>
                        <div className="space-y-1.5">
                          {dynamicUnplaced.map((u, i) => (
                            <div key={i}>
                              <div className="text-[11px] text-red-600 font-mono font-semibold leading-tight">
                                {u.courseCode}
                              </div>
                              <div className="text-[9px] text-gray-500 leading-tight">
                                {u.courseName !== u.courseCode ? u.courseName : u.semesterLabel}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Semester Breakdown */}
                    <div className="border-t border-gray-100 pt-2 space-y-2">
                      {parsedTranscript.semesters.map((sem, i) => {
                        const semTotalCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
                        return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-gray-700">{sem.semesterLabel}</span>
                            <span className="text-xs font-bold text-gray-700">{semTotalCredits} CR.</span>
                          </div>
                          {sem.courses.map((c, j) => (
                            <div key={j} className="text-[11px] text-gray-600 font-mono leading-relaxed">
                              {c.code} {c.credits} CR.
                            </div>
                          ))}
                        </div>
                        );
                      })}
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

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div
          className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-[260px]"
          style={{
            animation: 'slideInRight 200ms ease-out',
          }}
        >
          <style>{`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(20px) translateY(-10px); }
              to { opacity: 1; transform: translateX(0) translateY(0); }
            }
          `}</style>
          <button
            onClick={dismissInstallPrompt}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="text-sm font-semibold text-gray-800 mb-1">Install Extension</div>
          <div className="text-xs text-gray-500 mb-3">Use this tool faster by installing it</div>
          <button
            onClick={handleInstallClick}
            className="w-full text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors"
          >
            Install
          </button>
        </div>
      )}
    </>
  );
}

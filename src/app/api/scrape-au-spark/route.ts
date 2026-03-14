import { NextRequest, NextResponse } from 'next/server';
import type { Browser, Page } from 'playwright-core';

// ─── Types (mirrors frontend ParsedTranscript) ────────────────────────────
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

// ─── Configuration ─────────────────────────────────────────────────────────
// Adjust these URLs to match AU Spark's actual endpoints
const AU_SPARK_LOGIN_URL =
  process.env.AU_SPARK_LOGIN_URL || 'https://auspark.au.edu/login';
const AU_SPARK_TRANSCRIPT_URL =
  process.env.AU_SPARK_TRANSCRIPT_URL || 'https://auspark.au.edu/student/grade';

const SCRAPE_TIMEOUT_MS = 15_000; // 15 second overall timeout

// ─── Transcript text parser (identical logic to frontend PDF parser) ──────
function parseTranscriptText(text: string): ParsedTranscript | null {
  // Extract student ID (first 7-digit number)
  const idMatch = text.match(/\b(\d{7})\b/);
  if (!idMatch) return null;

  // Extract name (uppercase line)
  const nameMatch = text.match(/\n([A-Z][A-Z\s]{3,}[A-Z])\n/);

  // Extract major
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

// ─── Scraping logic ────────────────────────────────────────────────────────
async function scrapeAUSpark(
  username: string,
  password: string
): Promise<ParsedTranscript> {
  let browser: Browser | null = null;

  try {
    // Dynamic imports for serverless compatibility
    const chromium = (await import('@sparticuz/chromium')).default;
    const { chromium: playwrightChromium } = await import('playwright-core');

    // Launch browser with serverless-safe settings
    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page: Page = await context.newPage();
    page.setDefaultTimeout(SCRAPE_TIMEOUT_MS);

    // ── Step 1: Navigate to login page ──
    console.log('[AU Spark Scraper] Navigating to login page...');
    await page.goto(AU_SPARK_LOGIN_URL, { waitUntil: 'networkidle', timeout: SCRAPE_TIMEOUT_MS });

    // ── Step 2: Fill credentials and submit ──
    // Adjust selectors to match AU Spark's actual login form
    console.log('[AU Spark Scraper] Filling credentials...');
    await page.fill('input[name="username"], input[type="text"]', username);
    await page.fill('input[name="password"], input[type="password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: SCRAPE_TIMEOUT_MS });

    // ── Step 3: Navigate to transcript / grade page ──
    console.log('[AU Spark Scraper] Navigating to transcript page...');
    await page.goto(AU_SPARK_TRANSCRIPT_URL, { waitUntil: 'networkidle', timeout: SCRAPE_TIMEOUT_MS });

    // Wait for the transcript table to load
    // Adjust this selector to match the actual transcript container
    await page.waitForSelector('table, .transcript, .grade-table, #transcript', {
      timeout: SCRAPE_TIMEOUT_MS,
    });

    // ── Step 4: Extract full page text ──
    console.log('[AU Spark Scraper] Extracting transcript text...');
    const pageText = await page.evaluate(() => document.body.innerText);

    console.log('[AU Spark Scraper] Raw text (first 600 chars):', pageText.substring(0, 600));

    // ── Step 5: Parse using same logic as PDF parser ──
    const parsed = parseTranscriptText(pageText);
    if (!parsed) {
      throw new Error('Could not parse transcript data from AU Spark page.');
    }

    console.log('[AU Spark Scraper] Parsed:', parsed.student.id, '—', parsed.semesters.length, 'semesters');

    // Close browser — session is discarded (no credentials stored)
    await context.close();
    await browser.close();
    browser = null;

    return parsed;
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }
  }
}

// ─── POST handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: 'failed', reason: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const transcript = await scrapeAUSpark(username, password);

    return NextResponse.json({
      status: 'success',
      transcript,
    });
  } catch (error) {
    console.error('[AU Spark Scraper] Error:', error);

    const reason =
      error instanceof Error ? error.message : 'Unable to load transcript';

    return NextResponse.json(
      { status: 'failed', reason },
      { status: 500 }
    );
  }
}

# AI Handoff: AU Monitoring (au-monitoring-new)
 
 **Project name:** `au-monitoring-new`
 **Root folder:** `e:\Dowload\Project AU-monitoring\au-monitoring-new`
 **Related folder (legacy PHP):** `e:\Dowload\Project AU-monitoring\AU-MONITORING`
 
 ---
 
 ## 1) Project Overview
 Next.js (App Router) UI for viewing AU course timetable blocks.
 
 Primary UI goals implemented:
 - Course details popup **pops out** from the timetable’s **left edge** (not constrained by container).
 - Clicking a course group shifts the timetable wrapper **right by 20%** while the popup opens.
 - Course blocks show clearer codes (less truncation) and seat availability color cues.
 - Search dropdown with “Google-like” results + live filtering of timetable while typing.
 
 ---
 
 ## 2) Tech Stack / Dependencies (package.json)
 **Framework:** Next.js `16.0.8`
 **React:** `19.2.1`
 **TypeScript:** `^5`
 **Styling:** TailwindCSS `^4`
 
 **Notable deps:**
 - `@supabase/supabase-js` `^2.87.0`
 - `@tanstack/react-query` `^5.90.12`
 - `lucide-react` `^0.556.0`
 - `zustand` `^5.0.9`
 - `clsx`, `tailwind-merge`
 
 **Scripts:**
 - `npm run dev`
 - `npm run build`
 - `npm run start`
 - `npm run lint`
 
 ---
 
 ## 3) Repo/Folders Layout
 - `src/app/`
   - `page.tsx`: main page entry
   - `layout.tsx`, `globals.css`
   - `login/page.tsx`, `simple/page.tsx`, `dashboard/*`: other routes
 - `src/components/`
   - `CourseGrid.tsx`: timetable UI + details popup + search dropdown + filtering
   - `CourseBlock.tsx`: single timetable block rendering
   - other UI components (`CourseDetail.tsx`, etc.)
 - `src/lib/`
   - `courseData.ts`: CSV loader and grouping helpers
   - `supabase.ts`: Supabase client from env vars
 - `src/hooks/`
   - `useCourses.ts`: Supabase-backed data + filters (separate from CSV timetable data)
 - `public/`
   - `data_vme_rows.csv`: timetable input CSV used by `CourseGrid.tsx`
 
 ---
 
 ## 4) How to Run (dev/build/lint/test + URLs/ports)
 **Dev (default port 3000):**
 - `npm run dev`
 - `http://localhost:3000`
 
 **Dev (used for this project during UI work):**
 - `npx next dev -p 3002`
 - `http://localhost:3002`
 
 **Build:** `npm run build`
 
 **Prod:** `npm run start`
 
 **Lint:** `npm run lint`
 
 (No test script configured.)
 
 ---
 
 ## 5) Data / Inputs / Outputs
 ### CSV input (timetable source)
 - **File:** `public/data_vme_rows.csv`
 - **Loaded by:** `src/lib/courseData.ts` (`fetch('/data_vme_rows.csv')`)
 - **Rendered by:** `src/components/CourseGrid.tsx`
 - **Row fields used (mapped into `CSVCourse`):**
   - `courseCode`, `courseTitle`, `prefix`, `section`
   - `seatLimit`, `seatUsed`, `seatLeft`
   - `startTime`, `endTime`, `day`, `instructor`
 
 ### Supabase (secondary / hook-based)
 - Hook: `src/hooks/useCourses.ts` reads table `data_vme`.
 - Client: `src/lib/supabase.ts` requires env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 
 **Outputs:** UI only (no generated files).
 
 ---
 
 ## 6) Key Features
 - Timetable day rows + time grid.
 - Overlap grouping: overlapping courses are grouped into one displayed block.
 - Left details popup:
   - Absolute-positioned to pop from timetable edge.
   - Width `500px`, scrollable, grouped by time slot.
 - Search:
   - Dropdown suggestions list.
   - Each result shows course code + title + colored seat badge.
   - Live timetable filtering while typing; clicking a block shows details only for filtered items.
 
 ---
 
 ## 7) What We Changed (exact files + what changed + why)
 ### `src/components/CourseGrid.tsx`
 - **Popup width / layout:** `POPUP_WIDTH = 500`, popup is `absolute` with `right: '100%'` and animated width.
 - **Timetable shift on click:** wrapper uses `transform: selectedGroup ? 'translateX(20%)' : 'translateX(0)'`.
 - **Removed old slide UI controls:** deleted arrow + 25/50/75 buttons; sliding remains via course click.
 - **Time ticks:** `CELLS = 9` and last tick label is hidden.
 - **Widen timetable area to the right:** timetable content container `style={{ width: '120%' }}`.
 - **Search dropdown:** added suggestion dropdown with animated open/close and seat color badges.
 - **Live filtering inside overlap groups:** when typing, each group filters its internal `courses`; non-matching disappear; clicking opens details for filtered list only.
 
 ### `src/components/CourseBlock.tsx`
 - **Course code placement:** moved to top area and widened (`left-2 right-2 top-2`) to reduce truncation.
 - **Seat badge placement:** moved to bottom-right.
 - **Stack indicator:** moved to bottom-left.
 - **1-hour spacing:** `width: calc(${width}% - ${marginRight})` with `marginRight = '6px'` only for courses whose duration is `<= 60` minutes.
 
 ---
 
 ## 8) Bugs Found & Fixes (symptom -> root cause -> fix)
 - **Dev port command produced “invalid project directory”**
   - Root cause: using `npm run dev -- -p 3002` (arg parsed incorrectly).
   - Fix: `npx next dev -p 3002`.
 
 - **Popup constrained / pushing layout**
   - Root cause: popup participating in layout flow or constrained by parent.
   - Fix: `absolute` popup (`right: 100%`) attached to timetable wrapper.
 
 - **Course code truncation (`C....`)**
   - Root cause: badge/text competing for space.
   - Fix: move course code to top with more width; badge moved away.
 
 - **Search suggestions referencing variable before init**
   - Root cause: search logic used `coursesByDay` before state declaration.
   - Fix: moved search suggestion computation after `coursesByDay` state.
 
 ---
 
 ## 9) Known Gotchas
 - **Two data sources exist:**
   - Timetable rendering in `CourseGrid.tsx` uses CSV state (`coursesByDay`).
   - `useCourses.ts` is Supabase-based and is currently used mainly for header filter state.
 - Search dropdown depends on CSV having loaded.
 - Search bar width was increased but grows in normal flow; if you need “expand only to the left”, you’ll need right-anchored positioning (e.g., absolute/right or transform-origin).
 
 ---
 
 ## 10) Current Status + Next Steps
 **Done:**
 - Popup pop-out from timetable edge + 500px width.
 - Timetable shifts right 20% on selection.
 - Search dropdown + seat badge coloring + live filtering while typing.
 - Course blocks improved readability.
 
 **Next (optional):**
 - Make search input “expand only to the left” (anchor its right edge).
 - Improve search ranking (prefix matches first; de-duplicate by course code/section).
 - Decide single source of truth: CSV vs Supabase for timetable rendering.

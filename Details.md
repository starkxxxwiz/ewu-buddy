# EWU Portal Helper (V4) — Technical & Operational Walkthrough

Welcome to the comprehensive technical documentation for **EWU Portal Helper (v2.0)**. This document explains the extension's entire architecture, design patterns, file structure, operational steps, data flows, and sub-systems from **A to Z** in a way that is clear and understandable for both developers and non-technical readers.

---

## 1. Executive Summary & Capabilities

The **EWU Portal Helper** is a Google Chrome browser extension (built on Manifest V3) designed to significantly enhance the user experience of the East West University (EWU) Student Portal (`https://portal.ewubd.edu`). 

It provides four core modules:
1. **Auto Captcha Solver (Login Helper):** Automatically extracts and solves mathematical captchas on the login screen, inputs the answer, and triggers Angular change detection so students can log in with a single click.
2. **Routine Generator:** Intercepts student advising data from API network responses, parses it, merges course listings, and renders a professional, color-coded, interactive class routine. Users can download this routine as a high-quality image or PDF.
3. **Offered Courses Enhancer:** Intercepts the portal's raw offered course dataset, converts the complex structure into an interactive 9-column spreadsheet-like interface, displays real-time statistics (total courses, seats filled, remaining seats), and adds instant filtering, searching, and PDF exports.
4. **Advising Table Enhancer:** Intercepts the student advising dataset (`GetAllRoutine`), transforms the layout into a clean 10-column spreadsheet table, provides seat color-coding, live search/filtering, interactive section selection, and one-click landscape PDF export.

---

## 2. Extension File Architecture

The codebase consists of the following components:

```
ewu-buddy/V4/
├── manifest.json              # Extension metadata, permissions, content scripts, and page injection rules
├── content.js                 # Primary extension script; executes in isolated world context; runs core logic
├── pageHook.js                # Web-accessible script injected directly into portal page DOM context
├── styles.css                 # Custom glassmorphism interface styles and animations
├── popup.html                 # Settings menu interface rendered when clicking the extension icon
├── popup.js                   # Client-side configuration manager for the popup
├── README.md                  # User guide and developer setup instructions
├── Details.md                 # [This File] Full A to Z technical documentation
├── .gitignore                 # Exclusion rules for OS, IDE, temporary, and scratch files
├── lib/
│   ├── html2canvas.min.js     # Library used to convert HTML preview structures into images
│   └── jspdf.umd.min.js       # Library used to generate and download multi-column PDFs
└── icons/
    ├── icon16.png             # Extension logo (16x16 px)
    ├── icon48.png             # Extension logo (48x48 px)
    └── icon128.png            # Extension logo (128x128 px)
```

### Context Isolation: Isolated World vs. Page DOM
Chrome extensions enforce a boundary between the **Isolated World** (where `content.js` runs) and the **Main Page DOM** (where the portal's Angular code runs).
- **Isolated World (`content.js`):** Has full access to the page's HTML structure (DOM) and Chrome Extension APIs (`chrome.storage`, `chrome.runtime`), but *cannot* read Javascript variables, functions, or network responses bound to the page's global `window` scope.
- **Main Page DOM (`pageHook.js`):** Injected directly into the website's `<head>` by `content.js`. It runs with full access to the portal's native `window` object, allowing it to hook HTTP requests (`fetch` and `XMLHttpRequest`) and intercept raw API datasets. It communicates intercepted data back to `content.js` via browser messaging (`window.postMessage`).

---

## 3. Detailed Data Flow & Messaging Architecture

### Network Interception Sequence
1. Student navigates to `https://portal.ewubd.edu`.
2. `content.js` injects `pageHook.js` into the document head.
3. When the portal makes an API call (`GetAllOfferedCourses` or `GetAllRoutine`), `pageHook.js` intercepts the HTTP response.
4. `pageHook.js` emits a `window.postMessage` event containing the JSON payload (`EWU_OC_API_DATA` or `EWU_ADV_API_DATA`).
5. `content.js` receives the payload, processes course items, and updates the UI tables dynamically.

---

## 4. Sub-System Mechanics & Deep Dive

### A. Login Helper & Auto Captcha Solver
1. **Target:** `/` and `/Account/Login`.
2. **Extraction:** Finds the captcha equation element on page load.
3. **Parsing:** Evaluates simple math additions (e.g. `7 + 5 = ?`).
4. **Filling:** Sets the answer in the captcha input field and dispatches input/change events for Angular data binding.

### B. Class Routine Generator & Schedule Enhancer
1. **Target:** `/Home/ClassSchedule` and `/Home/Advising`.
2. **Weekly Timetable Generator:** Constructs a visual schedule grid (Sun–Thu plus dynamic Sat/Fri detection) with automatic room name trimming (e.g. `638 (Artificial Intelligence Lab)` &rarr; `638`) and downloads as High-Quality PDF or PNG Image.
3. **11-Column Schedule Enhancer:**
   - Automatically unhides and guarantees 11 columns on the Class Schedule page:
     `Serial | Course | Section | Credits | Timing | Room No. | WithDraw Status | Drop Status | Faculty Initial | Faculty Name | Faculty Email`
   - **Timing Day Mapping:** Formats abbreviated schedule codes into clear day strings (e.g. `MW 8:30AM-10:00AM` &rarr; `Mon,Wed 8:30AM-10:00AM`, `ST 11:50AM-1:20PM` &rarr; `Sun,Tue 11:50AM-1:20PM`).
   - **Faculty Email Direct Link:** Renders native-styled mail buttons with blue border and mail icon triggering `mailto:` on click.
   - **Smart Course & Credit Summary Card:** Injects a status card (`Total courses: X | Total Credit: Y`) that groups related theory + lab rows and multi-day slots (e.g. `CSE209` + `CSE209 Lab` Sec 5 counted as 1 course with its true 4 credit value).

### C. Offered Courses Enhancer
1. **Target:** `/Home/OfferedCoursesStudent`.
2. **Spreadsheet UI:** Formats course listings into 9 columns (`Course`, `Section`, `Faculty`, `Seats(A/T)`, `Left`, `Days`, `Time`, `Room No.`, `Dedicated Department`).
3. **Seat Indicators:** Color-coded remaining seats badges.
4. **PDF Export:** Paginated landscape A4 PDF export.

### D. Advising Table Enhancer (Online)
1. **Target:** `/Home/Advising`.
2. **Enhanced 10-Column Spreadsheet Layout:** Upgrades default advising tables (`#div1`, `#div2`, `#div3`, `#div4`) into a unified 10-column layout:
   - **Col 1:** `Course` (e.g. `ECO7101`)
   - **Col 2:** `Section` (e.g. `2`)
   - **Col 3:** `Faculty` (e.g. `AKH`)
   - **Col 4:** `Seat(C/T)` (e.g. `30 / 7`)
   - **Col 5:** `Left` (Calculated remaining seats with green / yellow / red badges)
   - **Col 6:** `Timing` (e.g. `MW 3:10PM-4:40PM`)
   - **Col 7:** `Room` (e.g. `FUB-604`)
   - **Col 8:** `Credit` (e.g. `3`)
   - **Col 9:** `Max cr` (e.g. `15`)
   - **Col 10:** `Prereq` (Prerequisite course codes)
3. **Controls Bar & Live Filter:**
   - Real-time search box (`Ctrl+K` shortcut support).
   - "Show available" toggle to filter out full sections.
   - Real-time total section counter.
4. **One-Click PDF Export:** Injects PDF export icon buttons into both the control bar and beside the **REFRESH SEATS** button. Exports visible table data into an A4 landscape PDF report.
5. **Interactive Row Selection:** Clicking any course row invokes the section addition handler (`AddFlowChartSubject`), adding the section to the student's selected courses panel on the right without interfering with PDF export.

### E. Advising Offline Suite
1. **Target:** `/Home/AdvisingOffline`.
2. **Dedicated Feature Row:** Placed directly below the default portal buttons with modern glassmorphic buttons for **Course Planner** and **Recommended Course**.
3. **Recommended Course Module:** 10-column table view with live code/faculty search, available filter, and live-state landscape PDF report generation.
4. **Course Planner Module:**
   - Intake from live API, JSON files, or client-side PDF routine parser (PDF.js).
   - Course & Lab grouping by `${baseCode}_${section}` into unified course cards with visual icons (📖 Theory, 🧪 Lab, ⚠️ TBA).
   - Multi-combination planning dashboard with conflict detection, credit limit validation, and PNG export.

### F. Notification Toast System
Provides non-intrusive alerts with glassmorphism styling, automated deduplication, and color-coded status backgrounds.

---

## 5. Captures and API Field Map References

### Offered Courses API Mapping (`GetAllOfferedCourses`)
| API Response Property | UI Placement / Action | Description |
| :--- | :--- | :--- |
| `CourseId` / `CourseCode` | **Course** Column | e.g. `CSE103` |
| `CourseTitle` | **Course** Column | e.g. `Structured Programming` |
| `SectionName` | **Section** Column | e.g. `1` |
| `FacultyShortName` / `FacultyName`| **Faculty** Column | e.g. `MSR (Md. Sazid Rahman)` |
| `TotalSeat` | **Seats (A/T)** Column | Denominator (Total capacity) |
| `EnrollSeat` | **Seats (A/T)** Column | Numerator (Enrolled students) |
| `AvailableSeat` | **Left** Column | Computed remaining slots |
| `TimeSlotName` | **Days** & **Time** Columns | Parsed day and time slots |
| `RoomName` | **Room No.** Column | e.g. `124` |
| `DeptName` | **Dedicated Department** Column| Department constraint |

### Class Schedule API Mapping (`GetSemesterStudentWiseAdvisingCourseListStudent`)
| API Response Property | UI Column | Description |
| :--- | :--- | :--- |
| `CourseCode` | **Course** | e.g. `CSE207` |
| `SectionName` | **Section** | e.g. `4` |
| `CreditHour` | **Credits** | e.g. `4.00` |
| `TimeSlotName` | **Timing** | Mapped to clear day format (e.g. `ST 11:50AM-1:20PM` &rarr; `Sun,Tue 11:50AM-1:20PM`) |
| `RoomName` | **Room No.** | e.g. `AB2-502` |
| `WithDrawStatus` | **WithDraw Status** | `No` or `Yes` |
| `DropStatus` | **Drop Status** | `No` or `Yes` |
| `ShortName` | **Faculty Initial** | e.g. `ATIQ` |
| `FacultyName` | **Faculty Name** | e.g. `Dr. Md. Atiqur Rahman` |
| `Email` | **Faculty Email** | Direct `mailto:` link button |

### Advising Routine API Mapping (`GetAllRoutine`)
| API Response Property | UI Column | Description |
| :--- | :--- | :--- |
| `CourseCode` | **Course** | e.g. `ECO7101` |
| `SectionName` | **Section** | e.g. `2` |
| `ShortName` / `FacultyName` | **Faculty** | e.g. `AKH` |
| `SeatCapacity` / `SeatTaken` | **Seat(C/T)** | e.g. `30 / 7` |
| `SeatCapacity - SeatTaken` | **Left** | Remaining seats count |
| `TimeSlotName` | **Timing** | Class schedule time slot |
| `RoomCode` / `RoomName` | **Room** | Classroom number |
| `CreditHour` | **Credit** | Course credit hours |
| `MaxCredit` | **Max cr** | Maximum credit limit |
| `PrerequisiteCourseCodes` | **Prereq** | Required prerequisite courses |

---

## 6. Developer Validation & Testing Checklist

When testing changes locally, make sure to verify:
- [ ] **Captcha Auto-Solve:** Confirm captcha values parse correctly on load and that the Angular login button activates.
- [ ] **Route Changes:** Click around portal tabs (Advising $\rightarrow$ Offered Courses $\rightarrow$ Class Schedule $\rightarrow$ Advising Offline) to verify the SPA handler triggers and loads modules cleanly.
- [ ] **Class Schedule Enhancer:** Confirm 11-column table rendering, day mapped timing, faculty email buttons, and smart total courses/credit summary card.
- [ ] **Offered Courses Table:** Test search input, available toggle, and PDF exports.
- [ ] **Advising Table Enhancer:** Verify 10-column layout sequence, seat color badges, search/filters, section click-to-add, and PDF export function.
- [ ] **Routine Generator:** Open routine generator modal and check image/PDF export output with trimmed room names.
- [ ] **Advising Offline:** Verify Recommended Course table with live-state PDF export and Course Planner multi-plan dashboard with SVG icons and conflict checking.

---
*Document Version: 2.0 | Date: August 2026 | Project: EWU Portal Helper V4*

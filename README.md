# EWU Portal Helper

A browser extension for the East West University (EWU) Student Portal. Automates the login captcha, generates printable class routines, and enhances the offered courses table with search, filtering, and PDF export.

> **Disclaimer:** This is not an official EWU product. It is intended for personal and educational use only and has no affiliation with East West University.

---

## Features

### Login Helper
- Detects the number-sum captcha on the login page
- Fills the answer automatically with a configurable delay
- Optional debug mode for troubleshooting

### Routine Generator
- Captures schedule API data and builds a weekly timetable
- Groups all time slots per course correctly (e.g. a course on both Tuesday and Thursday appears as one column with two entries)
- Supports Sunday through Thursday (5-day week)
- Customisable blue theme intensity — light, medium, or strong
- Export as **PDF** or **Image (PNG)**, with semester name in the filename

### Offered Courses Enhancer
- Replaces the default portal table on page load with an enhanced version
- **9-column layout:** Course | Section | Faculty | Seats(A/T) | Left | Days | Time | Room No. | Dedicated Department
- Colour-coded seat availability: green / yellow / red
- Real-time search across all fields (Ctrl+K shortcut)
- "Show Available" toggle to filter out full courses
- Sticky table header while scrolling
- Dynamic table height that uses available screen space (~15 rows visible without scrolling)
- **PDF Export** of currently visible/filtered courses — landscape A4, paginated

### Toast Notifications
- Glassmorphism design with type-tinted glass backgrounds (green / red / amber / grey)
- White text with subtle shadow for clear readability on any background
- Smooth slide-in from the right, slide-out on exit

---

## Supported Pages

| Page | URL Path | Features |
|------|----------|----------|
| Login | `/`, `/Account/Login` | Auto captcha solver |
| My Class Schedule | `/Home/ClassSchedule` | Routine generator + PDF/Image export |
| Offered Courses | `/Home/OfferedCoursesStudent` | Enhanced table + search + PDF export |

---

## Installation

### Chrome
1. Download or clone this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right)
4. Click **Load unpacked** and select the `ewu-buddy` folder
5. The extension icon will appear in the toolbar

### Edge
1. Open `edge://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `ewu-buddy` folder

### Other Chromium Browsers
Any Chromium-based browser (Brave, Opera, Vivaldi, etc.) that supports Manifest V3 can load this extension via the same **Load unpacked** method.

---

## How to Use

### Login Page
Navigate to the portal login page — the captcha is solved and filled automatically.

### Class Routine
1. Go to **My Class Schedule** (`/Home/ClassSchedule`)
2. Select a semester from the dropdown
3. Click **Generate Routine** (appears next to the Print Slip button)
4. A modal opens with your weekly timetable
5. Use **PDF** or **Image** to export

### Offered Courses
1. Go to **Offered Courses** (`/Home/OfferedCoursesStudent`)
2. Select a department and semester, then click **Show Offered Courses**
3. The enhanced table loads automatically
4. Use the search box (or press **Ctrl+K**) to filter in real time
5. Toggle **Show Available** to hide full courses
6. Click the red PDF icon to export visible rows

---

## Settings

Open the extension popup from the toolbar icon to configure each module.

### General
| Setting | Description | Default |
|---------|-------------|---------|
| Enable Extension | Master on/off switch | ON |
| Toast Notifications | Show status messages | ON |
| Animations | UI transition effects | ON |

### Login Helper
| Setting | Description | Default |
|---------|-------------|---------|
| Enable Login Helper | Auto-solve captcha | ON |
| Auto-fill Sum | Insert the answer automatically | ON |
| Fill Delay | Milliseconds before filling | 300 ms |
| Debug Mode | Verbose console output | OFF |

### Routine Generator
| Setting | Description | Default |
|---------|-------------|---------|
| Enable Routine Generator | Show generate button | ON |
| Compact Mode | Smaller cells and text | OFF |
| Show EWU Logo | Logo in the routine header | ON |
| Blue Theme | Header colour intensity | Medium |
| Export Quality | PDF/Image resolution | Standard |

### Offered Courses Enhancer
| Setting | Description | Default |
|---------|-------------|---------|
| Enable Course Enhancer | Enhanced table + features | ON |
| Seat Colour Indicator | Colour-code the Left column | ON |
| Sticky Table Header | Header stays visible while scrolling | ON |
| Search Box | Filter input above the table | ON |
| Search Placeholder | Custom placeholder text | "Search by course or faculty..." |

---

## Export Details

### Routine Export (PDF or PNG)
- Clean timetable layout with EWU logo and semester name
- Filename includes the semester (e.g. `Routine_Summer2026.pdf`)
- Standard (2×) or High (3×) resolution

### Offered Courses PDF Export
- Landscape A4, paginated with repeated blue header
- Columns: Course | Section | Faculty | Seats(A/T) | Left | Days | Time | Room No.
- Exports only currently visible/filtered rows
- Filename: `EWU_Offered_Courses_YYYY-MM-DD_HH-MM.pdf`

---

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Save settings via `chrome.storage.local` |
| `activeTab` | Sync settings to the active portal tab |
| `https://portal.ewubd.edu/*` | Content script injection |

---

## Folder Structure

```
ewu-buddy/
├── manifest.json          # Extension manifest (MV3)
├── content.js             # Main content script
├── pageHook.js            # Page-context API interceptor
├── styles.css             # Content script styles
├── popup.html             # Settings popup UI
├── popup.js               # Settings popup logic
├── README.md
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── lib/
    ├── html2canvas.min.js
    └── jspdf.umd.min.js
```

---

## Development Notes

- **Manifest Version:** 3 (MV3)
- **Injection:** Runs at `document_idle` on `https://portal.ewubd.edu/*`
- **API Hooking:** Intercepts `fetch` and `XMLHttpRequest` to capture portal API responses
- **SPA Navigation:** Monitors `history.pushState`/`replaceState` for Angular SPA navigation
- **Settings Sync:** Popup changes are broadcast to the active tab via `chrome.tabs.sendMessage`
- **Routine Grouping:** API rows are merged by `CourseCode + SectionName` — one column per course, all time slots preserved

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Extension not loading | Ensure Developer mode is on; check `chrome://extensions/` for errors |
| Captcha not solved | Confirm you are on the correct login page; check the console |
| Routine button disabled | Wait for the schedule table to fully load data |
| PDF export fails | Check the console for library errors; ensure jsPDF loaded correctly |
| Table not enhanced | Verify you are on `/Home/OfferedCoursesStudent`; check for API interception errors |
| Settings not saving | Ensure the `storage` permission is granted |

---

## Changelog

### v2.5.0
- Restored **Dedicated Department** column to the Offered Courses table (mapped from `DedicateDepartmentName`); PDF export remains unchanged at 8 columns
- Toast notification text is now **white** with a subtle shadow for clear readability on all glassmorphism backgrounds
- Increased Offered Courses table height to `calc(100vh - 280px)` for ~15 visible rows on desktop, with proportional scaling on tablet and mobile
- Cleaned up code comments and removed internal dev-notes for a professional codebase

### v2.4.0
- Routine generator correctly groups API rows by `CourseCode + SectionName` — one column per course, all day entries preserved
- DOM fallback also merges rows by course key
- Removed university name text and "Generated by..." footer from routine output
- Search bar styled with background, border, and padding — feels integrated with the page
- Replaced emoji toast icons with professional SVG icons; backgrounds are now dark, type-tinted glass

### v2.3.0
- Initial public release with login helper, routine generator, and offered courses enhancer

---

## License

Provided as-is for educational and personal use. See the disclaimer above regarding affiliation with East West University.

---

## Contact

For questions, suggestions, or content removal requests, reach out through the extension's distribution channel.

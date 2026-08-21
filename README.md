# 🎓 EWU Buddy

<div align="center">
  <img src="icons/icon128.png" alt="EWU Buddy Logo" width="128" />
  <br/>
  <strong>A powerful browser extension for the East West University (EWU) Student Portal.</strong>
  <br/>
  <br/>

  <!-- Badges -->
  <a href="#"><img src="https://img.shields.io/badge/version-2.0-blue.svg?style=for-the-badge" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/commits-200+-orange.svg?style=for-the-badge" alt="Commits"></a>
  <br/>
  <br/>
  <a href="#"><img src="https://img.shields.io/badge/JavaScript-70%25-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/CSS3-20%25-1572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS"></a>
  <a href="#"><img src="https://img.shields.io/badge/HTML5-10%25-E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML"></a>

</div>

---

## 📖 Description

**EWU Buddy** is a comprehensive browser extension designed to enhance the East West University (EWU) Student Portal (`https://portal.ewubd.edu`). It automates login captchas, generates printable, color-coded class routines, upgrades the offered courses table, and transforms the advising page with a 10-column interactive spreadsheet view, live search, seat availability color-coding, and instant PDF export capabilities.

> **Disclaimer:** This is not an official EWU product. It is intended for personal and educational use only and has no affiliation with East West University.

---

## ✨ Core Features

### 🔐 Login Helper (Auto Captcha Solver)
- **Automatic Captcha Solving:** Automatically extracts and solves number-sum captchas on the login screen.
- **Angular Integration:** Triggers form change detection for seamless 1-click logins.

### 📅 My Class Schedule & Routine Generator
- **Visual Weekly Routine Generator:** Intercepts schedule data to build a clean, color-coded weekly timetable with room name trimming (e.g. `638` without long lab brackets) and download as **High-Quality PDF** or **Image (PNG)**.
- **11-Column Schedule Enhancer:**
  - Guarantees that clicking "Show Courses" always reveals all 11 columns:
    `Serial | Course | Section | Credits | Timing | Room No. | WithDraw Status | Drop Status | Faculty Initial | Faculty Name | Faculty Email`
  - **Timing Day Mapping:** Converts abbreviated day codes into clear, readable day strings (e.g. `MW 8:30AM-10:00AM` &rarr; `Mon,Wed 8:30AM-10:00AM`, `ST 11:50AM-1:20PM` &rarr; `Sun,Tue 11:50AM-1:20PM`).
  - **Faculty Email Direct Link:** Email button with blue mail icon and matching border opens `mailto:` for instant faculty contact while preserving natural text styling.
  - **Smart Course & Credit Summary Card:** Clean status card (`Total courses: X | Total Credit: Y`) grouping related theory and lab rows (e.g. `CSE209` + `CSE209 Lab` counted as 1 course with its true 4 credit value).

### 📚 Offered Courses Enhancer
- **Spreadsheet UI:** Replaces the default portal table with an interactive 9-column spreadsheet view.
- **Real-Time Search & Filtering:** Filter courses instantly by code, title, section, or faculty using the search box or `Ctrl+K`.
- **Seat Indicators:** Color-coded seat badges (green for open, yellow for low seats, red for full).
- **PDF Export:** Download filtered offered course tables as paginated A4 landscape PDFs.

### 🎓 Advising & Advising Offline Enhancers
- **Online Advising Table:** Upgrades advising course tables into a clear, 10-column view with live search, seat counters, and instant PDF export.
- **Recommended Course Module (`AdvisingOffline`):**
  - Instant live search, course code filtering, faculty sorting (A &rarr; Z / Z &rarr; A), and seat count sorting.
  - 10-column structured view: `Course | Section | Credit | Faculty | Seat(C/T) | Left | Day | Time | Room | Prereq`.
  - Seat availability toggle with subtle switch styling.
  - Live visual state PDF export formatted to paginated A4 landscape with custom branding.
- **Course Planner Module (`AdvisingOffline`):**
  - Multi-source intake: Fetch courses via API, upload custom JSON routine, or parse PDF routine schedules locally via PDF.js.
  - Smart course & lab grouping: Automatically associates theory classes with corresponding lab sections into unified course cards.
  - Visual schedule icons (📖 Theory, 🧪 Lab, ⚠️ TBA) with day & time breakdown.
  - Multi-combination planning (`Combination 1`, `Combination 2`, etc.) with real-time metrics (Courses, Theory Hrs, Labs, Credits).
  - Conflict detection & credit limit validation.
  - 2x Retina PNG Canvas export for single combinations or all saved plans.

### 🔔 Glassmorphism Notifications
- Sleek, non-intrusive toast notifications for real-time updates and status alerts.

---

## 🚀 Installation & Setup

### For Google Chrome & Chromium Browsers (Brave, Edge, Opera, Vivaldi)
1. Clone or download this repository to your local computer.
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `ewu-buddy/V4` directory.
6. The EWU Buddy icon will appear in your browser toolbar!

---

## 📜 License

This project is provided under the **MIT License**.

*See disclaimer above regarding affiliation with East West University.*

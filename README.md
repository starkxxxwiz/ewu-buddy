# 🎓 EWU Buddy

<div align="center">
  <img src="icons/icon128.png" alt="EWU Buddy Logo" width="128" />
  <br/>
  <strong>A powerful browser extension for the East West University (EWU) Student Portal.</strong>
  <br/>
  <br/>

  <!-- Badges -->
  <a href="#"><img src="https://img.shields.io/badge/version-2.5.0-blue.svg?style=for-the-badge" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/commits-150+-orange.svg?style=for-the-badge" alt="Commits"></a>
  <br/>
  <br/>
  <a href="#"><img src="https://img.shields.io/badge/JavaScript-70%25-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/CSS3-20%25-1572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS"></a>
  <a href="#"><img src="https://img.shields.io/badge/HTML5-10%25-E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML"></a>

</div>

---

## 📖 Description

**EWU Buddy** is a comprehensive browser extension designed to enhance the East West University (EWU) Student Portal (`https://portal.ewubd.edu`). It automates the login captcha, generates printable, color-coded class routines, and significantly upgrades the offered courses table with real-time search, filtering, and PDF export capabilities.

> **Disclaimer:** This is not an official EWU product. It is intended for personal and educational use only and has no affiliation with East West University.

---

## ✨ Features

### 🔐 Login Helper
- **Auto Captcha Solver:** Automatically detects and solves the number-sum captcha on the login page.
- **Auto-Fill:** Inputs the answer with a configurable delay for a seamless 1-click login.

### 📅 Routine Generator
- **Visual Timetable:** Intercepts student schedule data to build a weekly, interactive timetable.
- **Smart Grouping:** Groups time slots correctly, supporting a 5-day week (Sunday to Thursday).
- **Customization:** Choose between light, medium, or strong blue themes.
- **Export Options:** Download your routine as a **High-Quality PDF** or **Image (PNG)**.

### 📚 Offered Courses Enhancer
- **Spreadsheet-like UI:** Replaces the default portal table with an enhanced 9-column layout.
- **Real-Time Search:** Instantly filter courses using the search box or the `Ctrl+K` shortcut.
- **Seat Availability Indicators:** Color-coded seat availability (green / yellow / red) to easily spot open sections.
- **Smart Filtering:** Toggle "Show Available" to hide full courses instantly.
- **PDF Export:** Export currently visible/filtered courses into a paginated, landscape A4 PDF.

### 🌑 Portal-Wide Dark Mode
- **Premium Theming:** Toggle between light and a cohesive dark theme. Custom HSL-tailored styling covers all core elements including select dropdowns, breadcrumbs, profile details, tables, navigation elements, inputs, and popups.
- **Instant Load:** Utilizes a highly optimized initial loader injected at `document_start`. This ensures dark mode loads **instantly** on all internal portal pages with absolutely zero white screen flashing. The login page correctly bypasses this to retain its default layout.
- **Responsive Toggle:** Automatically places a Sun/Moon toggle switch in the top navigation bar (aligned to the left of the notifications bell on PC, and to the right of the profile picture on mobile viewports).
- **Comprehensive Coverage:** Extensively styles components on all pages such as the `Other Details` grid and dropdown menus so they seamlessly blend with the dark interface.

### 🔔 Modern Notifications
- Features sleek, glassmorphism toast notifications with type-tinted backgrounds for updates and alerts.

---

## 🚀 Setup Guide

### For Google Chrome
1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click on **Load unpacked**.
5. Select the `ewu-buddy/V4` folder.
6. The EWU Buddy icon will now appear in your browser toolbar!

### For Microsoft Edge
1. Open Edge and navigate to `edge://extensions/`.
2. Enable **Developer mode** in the left sidebar.
3. Click on **Load unpacked**.
4. Select the `ewu-buddy/V4` folder.

> **Note:** Any Chromium-based browser (Brave, Opera, Vivaldi, etc.) that supports Manifest V3 can load this extension via the same "Load unpacked" method.

---

## 📜 License

This project is provided as-is for educational and personal use under the **MIT License**. 

*See the disclaimer above regarding affiliation with East West University.*

/* =============================================================
   EWU Portal Helper v2.5.0
   Content Script
   ============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     CONFIGURATION
     ----------------------------------------------------------- */
  var CONFIG = {
    PORTAL_BASE: 'https://portal.ewubd.edu',
    LOG_PREFIX: '[EWU Portal Helper]',
    ROUTINE_LOG: '[EWU Helper][Routine]',
    STORAGE_KEY: 'ewu_portal_helper_settings',
    VERSION: '2.5.0',
  };

  /* -----------------------------------------------------------
     DEFAULT SETTINGS
     ----------------------------------------------------------- */
  var DEFAULT_SETTINGS = {
    enabled: true,
    theme: 'light',
    animations: true,
    toastNotifications: true,
    stickyHeader: true,
    compactMode: false,
    modules: {
      loginHelper: true,
      loginHelperAutoFill: true,
      loginHelperDelay: 300,
      loginHelperDebug: false,
      routineGenerator: true,
      routineCompact: false,
      routineShowLogo: true,
      routineBlueIntensity: 'medium',
      routineExportQuality: 'standard',
      offeredCoursesEnhancer: true,
      offeredCoursesColorLeft: true,
      offeredCoursesStickyHeader: true,
      offeredCoursesSearchBox: true,
      offeredCoursesSearchPlaceholder: 'Search by course or faculty...',
    },
  };

  /* -----------------------------------------------------------
     STRICT PAGE DETECTION
     ----------------------------------------------------------- */
  var ALLOWED_PATHS = [
    { path: '/',                          id: 'login',          label: 'Login Page' },
    { path: '/Account/Login',              id: 'login',          label: 'Login Page' },
    { path: '/account/login',              id: 'login',          label: 'Login Page' },
    { path: '/Home/ClassSchedule',         id: 'classSchedule',  label: 'My Class Schedule' },
    { path: '/home/classschedule',         id: 'classSchedule',  label: 'My Class Schedule' },
    { path: '/Home/OfferedCoursesStudent', id: 'offeredCourses', label: 'Offered Courses' },
    { path: '/home/offeredcoursesstudent', id: 'offeredCourses', label: 'Offered Courses' },
  ];

  function detectPage() {
    var pn = location.pathname;
    for (var i = 0; i < ALLOWED_PATHS.length; i++) {
      var ap = ALLOWED_PATHS[i];
      if (pn === ap.path || pn.toLowerCase() === ap.path.toLowerCase()) {
        return { id: ap.id, label: ap.label };
      }
      if (ap.path === '/' && (pn === '/' || pn === '')) {
        return { id: ap.id, label: ap.label };
      }
    }
    return null;
  }


  /* ===========================================================
     UTILITY HELPERS
     =========================================================== */

  function safeQuery(sel) {
    try { return document.querySelector(sel) || null; }
    catch (_) { return null; }
  }

  function safeQueryAll(sel) {
    try { return document.querySelectorAll(sel) || []; }
    catch (_) { return []; }
  }

  function log() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(CONFIG.LOG_PREFIX);
    console.log.apply(console, args);
  }

  function warn() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(CONFIG.LOG_PREFIX);
    console.warn.apply(console, args);
  }

  function routineLog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(CONFIG.ROUTINE_LOG);
    console.log.apply(console, args);
  }

  var _debugEnabled = false;
  function debugLog() {
    if (_debugEnabled) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(CONFIG.LOG_PREFIX, '[DEBUG]');
      console.log.apply(console, args);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function safeText(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }


  /* ===========================================================
     TOAST NOTIFICATION SYSTEM
     =========================================================== */

  var Toast = {
    _container: null,
    _lastMessages: {},

    _ensureContainer: function () {
      if (this._container) return;
      var el = document.createElement('div');
      el.id = 'ewu-toast-container';
      document.body.appendChild(el);
      this._container = el;
    },

    show: function (message, type, duration) {
      type = type || 'info';
      duration = duration || 3000;
      if (!_settings || !_settings.toastNotifications) return;

      var now = Date.now();
      var lastTime = this._lastMessages[message];
      if (lastTime && (now - lastTime) < 4000) return;
      this._lastMessages[message] = now;

      var keys = Object.keys(this._lastMessages);
      for (var k = 0; k < keys.length; k++) {
        if (now - this._lastMessages[keys[k]] > 10000) delete this._lastMessages[keys[k]];
      }

      this._ensureContainer();

      var toast = document.createElement('div');
      toast.className = 'ewu-toast-item ewu-toast-' + type;
      var icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      };
      toast.innerHTML =
        '<span class="ewu-toast-icon">' + (icons[type] || icons.info) + '</span>' +
        '<span class="ewu-toast-text">' + escapeHTML(message) + '</span>';

      this._container.appendChild(toast);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { toast.classList.add('ewu-toast-visible'); });
      });
      setTimeout(function () {
        toast.classList.remove('ewu-toast-visible');
        toast.classList.add('ewu-toast-exit');
        setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
      }, duration);
    },
  };


  /* ===========================================================
     SETTINGS MANAGEMENT
     =========================================================== */

  var _settings = null;

  function loadSettings() {
    return new Promise(function (resolve) {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        var stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        var parsed = stored ? JSON.parse(stored) : {};
        resolve(deepMerge(structuredClone(DEFAULT_SETTINGS), parsed));
        return;
      }
      chrome.storage.local.get(CONFIG.STORAGE_KEY, function (result) {
        var stored = result[CONFIG.STORAGE_KEY] || {};
        resolve(deepMerge(structuredClone(DEFAULT_SETTINGS), stored));
      });
    });
  }

  function saveSettings(settings) {
    return new Promise(function (resolve) {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(settings));
        resolve();
        return;
      }
      chrome.storage.local.set({ ewu_portal_helper_settings: settings }, resolve);
    });
  }

  function deepMerge(target, source) {
    for (var key in source) {
      if (!source.hasOwnProperty(key)) continue;
      if (
        source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] && typeof target[key] === 'object'
      ) {
        Object.assign(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }


  /* ===========================================================
     ANIMATION / THEME CLASS MANAGEMENT
     =========================================================== */

  function applyBodyClasses(settings) {
    document.body.classList.toggle('ewu-no-animations', !settings.animations);
  }


  /* ===========================================================
     PAGE HOOK INJECTION (for Offered Courses page)
     Injects pageHook.js into page context to intercept API calls.
     =========================================================== */

  function injectPageHook() {
    if (safeQuery('#ewu-page-hook-loaded')) return;
    var marker = document.createElement('meta');
    marker.id = 'ewu-page-hook-loaded';
    marker.setAttribute('content', '1');
    document.head.appendChild(marker);

    var script = document.createElement('script');
    script.src = chrome.runtime.getURL('pageHook.js');
    script.onload = function () { script.remove(); };
    script.onerror = function () { routineLog('pageHook.js failed to load'); script.remove(); };
    (document.head || document.documentElement).appendChild(script);
    routineLog('pageHook.js injected');
  }


  /* ===========================================================
     LOGIN HELPER MODULE
     =========================================================== */

  var LoginHelperModule = {
    _hasRun: false,

    init: async function (settings) {
      if (this._hasRun) return;
      var mods = settings.modules || {};
      _debugEnabled = !!mods.loginHelperDebug;
      debugLog('Login Helper: checking...');

      if (!safeQuery('#loginform') && !safeQuery('#lblcaptchaAnswer') && !safeQuery('#username')) {
        debugLog('Not a login page');
        return;
      }

      var fi = safeQuery('input[name="FirstNo"]'), si = safeQuery('input[name="SecondNo"]');
      var firstRaw, secondRaw;
      if (fi && si) {
        firstRaw = fi.getAttribute('value');
        secondRaw = si.getAttribute('value');
      } else {
        var fl = safeQuery('#lblFirstNo'), sl = safeQuery('#lblSecondNo');
        if (!fl || !sl) { debugLog('Sum not found'); Toast.show('Sum question not found', 'error'); return; }
        firstRaw = fl.textContent.trim();
        secondRaw = sl.textContent.trim();
      }

      var a = parseInt(firstRaw, 10), b = parseInt(secondRaw, 10);
      if (isNaN(a) || isNaN(b)) { debugLog('Parse error'); Toast.show('Could not parse sum', 'error'); return; }
      var sum = a + b;

      var el = safeQuery('#lblcaptchaAnswer') || safeQuery('input[name="Answer"]');
      if (!el) { debugLog('Answer field missing'); Toast.show('Answer field not found', 'error'); return; }

      this._hasRun = true;

      if (mods.loginHelperAutoFill !== false) {
        var delay = typeof mods.loginHelperDelay === 'number' ? Math.max(0, mods.loginHelperDelay) : 300;
        setTimeout(function () {
          try {
            el.value = sum;
            var evts = ['focus', 'input', 'change', 'keyup', 'blur'];
            for (var i = 0; i < evts.length; i++) {
              el.dispatchEvent(new Event(evts[i], { bubbles: true, cancelable: evts[i] !== 'blur' && evts[i] !== 'focus' }));
            }
            el.classList.add('ewu-lh-filled');
            setTimeout(function () { el.classList.remove('ewu-lh-filled'); }, 1500);
            debugLog('Sum filled:', sum);
            Toast.show('Sum filled: ' + sum, 'success');
          } catch (_) {
            debugLog('Fill failed');
            Toast.show('Failed to fill sum', 'error');
          }
        }, delay);
      } else {
        debugLog('Sum (manual):', sum);
        Toast.show('Captcha answer: ' + sum, 'info');
      }
    },

    reset: function () { this._hasRun = false; },
  };


  /* ===========================================================
     ROUTINE GENERATOR MODULE
     =========================================================== */

  var RoutineGeneratorModule = {
    DAY_ORDER: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    DAY_MAP: { A: 'Saturday', S: 'Sunday', M: 'Monday', T: 'Tuesday', W: 'Wednesday', R: 'Thursday', F: 'Friday' },
    LOGO_URL: 'https://portal.ewubd.edu/Assets/img/logonn.png',
    API_KW: 'GetSemesterStudentWiseAdvisingCourseListStudent',

    _apiData: null, _tableReady: false, _hooksInstalled: false,
    _observer: null, _modalOpen: false, _currentOpts: null, _btnInjected: false,

    init: async function (settings) {
      var mods = settings.modules || {};
      _debugEnabled = _debugEnabled || !!mods.loginHelperDebug;
      if (location.pathname.toLowerCase().indexOf('/home/classschedule') === -1 &&
          !safeQuery('[ng-controller="ClassScheduleController"]')) return;

      routineLog('Class schedule page detected');
      routineLog('Routine Generator activating');
      this._hookAPI();
      this._watchTable();
      if (this._apiData || this._tableReady) {
        this._injectButton();
        this._updateBtn(true);
      }
    },

    _hookAPI: function () {
      if (this._hooksInstalled) return;
      this._hooksInstalled = true;
      var self = this;

      if (window.fetch) {
        var orig = window.fetch;
        window.fetch = async function () {
          var res = await orig.apply(this, arguments);
          var url = (typeof arguments[0] === 'string') ? arguments[0] : (arguments[0] && arguments[0].url) || '';
          if (url.indexOf(self.API_KW) !== -1) {
            try { var d = await res.clone().json(); self._apiData = d; routineLog('Schedule API captured'); self._tableReady = true; self._injectButton(); self._updateBtn(true); } catch (e) {}
          }
          return res;
        };
      }

      var origOpen = XMLHttpRequest.prototype.open, origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (m, url) { this._ewu_url = url; return origOpen.apply(this, arguments); };
      XMLHttpRequest.prototype.send = function () {
        if (this._ewu_url && this._ewu_url.indexOf(self.API_KW) !== -1) {
          var xhr = this;
          this.addEventListener('load', function () {
            try { self._apiData = JSON.parse(xhr.responseText); self._tableReady = true; self._injectButton(); self._updateBtn(true); } catch (e) {}
          });
        }
        return origSend.apply(this, arguments);
      };
    },

    _watchTable: function () {
      var container = safeQuery('[ng-show="SemesterAdvData.length"]');
      if (!container) {
        routineLog('Schedule table container not found yet');
        return;
      }
      routineLog('Schedule table container found, observing...');
      var self = this;
      this._observer = new MutationObserver(function () {
        if (!self._tableReady && container.querySelectorAll('table tr').length > 2) {
          self._tableReady = true;
          routineLog('Schedule table detected with ' + container.querySelectorAll('table tr').length + ' rows');
          self._injectButton();
          self._updateBtn(true);
        }
      });
      this._observer.observe(container, { childList: true, subtree: true });
      if (container.querySelectorAll('table tr').length > 2) {
        this._tableReady = true;
        routineLog('Schedule table already visible with ' + container.querySelectorAll('table tr').length + ' rows');
        this._injectButton();
        this._updateBtn(true);
      }
    },

    _injectButton: function () {
      if (safeQuery('#ewu-rg-btn-generate')) return;
      var scheduleDiv = safeQuery('[ng-show="SemesterAdvData.length"]');
      if (!scheduleDiv || !this._tableReady) return;
      if (this._btnInjected) return;
      this._btnInjected = true;
      routineLog('Generate Routine button injected');

      var wrapper = document.createElement('div');
      wrapper.id = 'ewu-rg-btn-wrapper';

      var btn = document.createElement('button');
      btn.id = 'ewu-rg-btn-generate';
      btn.type = 'button';
      btn.className = 'ewu-rg-inject-btn';
      btn.disabled = true;
      btn.textContent = 'Generate Routine';
      wrapper.appendChild(btn);

      var printBtn = safeQuery('button[ng-click="PaySlipPrintBySemesterAndStudentId()"]');
      if (printBtn && printBtn.parentNode) {
        var formGroup = printBtn.parentNode;
        var btnRow = document.createElement('div');
        btnRow.id = 'ewu-rg-btn-row';
        btnRow.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px';
        formGroup.insertBefore(btnRow, printBtn);
        btnRow.appendChild(printBtn);
        wrapper.id = 'ewu-rg-btn-wrapper-inline';
        btnRow.appendChild(wrapper);
      } else {
        scheduleDiv.insertBefore(wrapper, scheduleDiv.firstChild);
      }

      var self = this;
      btn.addEventListener('click', function () { self._onGenerate(); });
    },

    _updateBtn: function (on) {
      var btn = safeQuery('#ewu-rg-btn-generate');
      if (!btn) return;
      btn.disabled = !on;
      btn.classList.toggle('ewu-rg-btn-ready', on);
    },

    _extractCourses: function () {
      var rawItems = null;
      if (this._apiData) {
        var items = this._apiData;
        if (Array.isArray(items) && items.length > 0 && Array.isArray(items[0])) items = items[0];
        if (Array.isArray(items)) {
          rawItems = items;
        }
      }

      if (!rawItems) {
        var rows = safeQueryAll('table.table-striped tr');
        if (rows.length >= 2) {
          var domMergeMap = {};
          var domMergeOrder = [];
          for (var j = 1; j < rows.length; j++) {
            var cells = rows[j].querySelectorAll('td');
            if (cells.length >= 6) {
              var code = (cells[1] || {}).textContent;
              var sec  = ((cells[2] || {}).textContent || '').trim();
              if (code && code.trim()) {
                var cc2 = code.trim();
                var key2 = cc2 + '|' + sec;
                if (!domMergeMap[key2]) {
                  domMergeMap[key2] = { courseCode: cc2, sectionName: sec, slots: [] };
                  domMergeOrder.push(key2);
                }
                var tsName2 = ((cells[4] || {}).textContent || '').trim();
                var rmName2 = ((cells[5] || {}).textContent || '').trim();
                if (tsName2) domMergeMap[key2].slots.push({ timeSlotName: tsName2, roomName: rmName2 });
              }
            }
          }
          var domCourses = [];
          for (var di3 = 0; di3 < domMergeOrder.length; di3++) domCourses.push(domMergeMap[domMergeOrder[di3]]);
          if (domCourses.length > 0) {
            routineLog('[Routine] DOM fallback (grouped): ' + domCourses.length + ' unique courses from ' + (rows.length - 1) + ' rows');
            return domCourses;
          }
        }
        return [];
      }

      var mergeMap = {};
      var mergeOrder = [];
      routineLog('[Routine] Raw API items: ' + rawItems.length);

      for (var i = 0; i < rawItems.length; i++) {
        var c = rawItems[i];
        if (!c || !c.CourseCode || !String(c.CourseCode).trim()) continue;
        var cc = String(c.CourseCode).trim();
        var sec = c.SectionName;
        var key = cc + '|' + sec;
        var slotName = (c.TimeSlotName || '').trim();
        var roomName = (c.RoomName || '').trim();

        if (!mergeMap[key]) {
          mergeMap[key] = {
            courseCode: cc,
            sectionName: sec,
            shortName: (c.ShortName || '').trim(),
            slots: []
          };
          mergeOrder.push(key);
          routineLog('[Routine] New course key:', key);
        }
        if (slotName) {
          mergeMap[key].slots.push({ timeSlotName: slotName, roomName: roomName });
          routineLog('[Routine]   Slot added to', key, ':', slotName, '@ Room:', roomName);
        }
      }

      var merged = [];
      for (var ki = 0; ki < mergeOrder.length; ki++) {
        merged.push(mergeMap[mergeOrder[ki]]);
      }
      routineLog('[Routine] Merged unique courses: ' + merged.length + ' (from ' + rawItems.length + ' raw items)');
      return merged;
    },

    _parseSlot: function (ts) {
      if (!ts) return null;
      var m = ts.trim().match(/^([A-Z]+)\s+([\d:]+\s*(?:AM|PM))\s*-\s*([\d:]+\s*(?:AM|PM))$/i);
      if (!m) {
        routineLog('[Routine] _parseSlot: could not parse:', ts);
        return null;
      }
      var self = this, days = [];
      var dayCodes = m[1].toUpperCase();
      for (var i = 0; i < dayCodes.length; i++) {
        if (self.DAY_MAP[dayCodes[i]]) days.push(self.DAY_MAP[dayCodes[i]]);
        else routineLog('[Routine] _parseSlot: unknown day code:', dayCodes[i]);
      }
      if (!days.length) {
        routineLog('[Routine] _parseSlot: no valid days found in:', ts);
        return null;
      }
      var startRaw = m[2].trim().replace(/\s+/g, '');
      var endRaw   = m[3].trim().replace(/\s+/g, '');
      function toMin(t) {
        var p = t.match(/(\d+):(\d+)(AM|PM)/i);
        if (!p) return 0;
        var h = parseInt(p[1], 10);
        if (p[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (p[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + parseInt(p[2], 10);
      }
      // Pretty-print: "4:50PM" → "4:50 PM"
      function prettyTime(t) {
        var p = t.match(/(\d+:\d+)(AM|PM)/i);
        return p ? (p[1] + ' ' + p[2].toUpperCase()) : t.toUpperCase();
      }
      routineLog('[Routine] _parseSlot parsed:', ts, '→ days:', days.join(','), startRaw, '-', endRaw);
      return {
        days: days,
        startTime: prettyTime(startRaw),
        endTime: prettyTime(endRaw),
        sortTime: toMin(startRaw)
      };
    },

    _getSemesterName: function () {
      var sel = safeQuery('select[data-ng-model="selectedSemesterId"]');
      if (sel && sel.selectedIndex > 0 && sel.options[sel.selectedIndex]) {
        var t = sel.options[sel.selectedIndex].text.trim();
        if (t && t !== 'Select Semester') return t;
      }
      return '';
    },

    _onGenerate: async function () {
      this._updateBtn(false);
      routineLog('Generate Routine clicked');
      var courses = this._extractCourses();
      if (!courses.length) {
        Toast.show('No course data found', 'error');
        this._updateBtn(this._tableReady || !!this._apiData);
        return;
      }

      routineLog('Extracted ' + courses.length + ' courses');
      var semName = this._getSemesterName();
      var mods = await loadSettings().then(function (s) { return s.modules || {}; });
      this._currentOpts = {
        compact: !!mods.routineCompact,
        showLogo: mods.routineShowLogo !== false,
        blueIntensity: mods.routineBlueIntensity || 'medium',
        exportQuality: mods.routineExportQuality || 'standard'
      };

      var html = this._buildRoutine(courses, semName, this._currentOpts);
      this._renderModal(html);
      this._updateBtn(true);
    },

    _buildRoutine: function (courses, semesterName, opts) {
      if (!courses || !courses.length) return '<div class="ewu-rt-empty">No courses found.</div>';
      var compact = !!opts.compact, showLogo = opts.showLogo !== false, intensity = opts.blueIntensity || 'medium';
      // pad: vertical cell padding in px. Larger = taller rows = taller export image.
      // At 16px: each data row ~80-90px high × 5 rows × 2x scale ≈ 800-900px row area alone.
      var pad = compact ? 6 : 16, fs = compact ? '11px' : '13px';
      // Horizontal padding kept moderate so column widths don't bloat
      var hpad = compact ? 8 : 12;
      var self = this;

      // Sort alphabetically then deduplicate by courseCode+sectionName (safety net
      // against any duplicate objects that may slip through _extractCourses)
      var sortedRaw = courses.slice().sort(function (a, b) {
        var c = a.courseCode.localeCompare(b.courseCode);
        return c !== 0 ? c : (a.sectionName || 0) - (b.sectionName || 0);
      });
      var _seenKeys = {};
      var sorted = [];
      for (var ddi = 0; ddi < sortedRaw.length; ddi++) {
        var _dk = sortedRaw[ddi].courseCode + '|' + String(sortedRaw[ddi].sectionName);
        if (!_seenKeys[_dk]) { _seenKeys[_dk] = true; sorted.push(sortedRaw[ddi]); }
      }
      routineLog('[Routine] Building routine for', sorted.length, 'unique columns (deduplicated from', sortedRaw.length, 'items)');

      // Build day map: for each day, which course+section entries appear
      // Each entry stores all matching slots for that (course, section, day) pair
      // Key structure: dayMap[day] = Array of { courseCode, sectionName, slots:[] }
      var dayMap = {};
      this.DAY_ORDER.forEach(function (d) { dayMap[d] = []; });

      for (var ci = 0; ci < sorted.length; ci++) {
        var course = sorted[ci];
        var courseSlots = course.slots || [];
        if (!courseSlots.length && course.timeSlotName) {
          // Legacy single-slot fallback
          courseSlots = [{ timeSlotName: course.timeSlotName, roomName: course.roomName || '' }];
        }

        for (var si2 = 0; si2 < courseSlots.length; si2++) {
          var slot = courseSlots[si2];
          var parsed = self._parseSlot(slot.timeSlotName);
          if (!parsed) continue;

          for (var di = 0; di < parsed.days.length; di++) {
            var day = parsed.days[di];
            if (!dayMap[day]) continue; // day not in DAY_ORDER (e.g. Saturday/Friday)

            // Find or create entry for this course on this day
            var existing = null;
            for (var ei2 = 0; ei2 < dayMap[day].length; ei2++) {
              if (dayMap[day][ei2].courseCode === course.courseCode &&
                  String(dayMap[day][ei2].sectionName) === String(course.sectionName)) {
                existing = dayMap[day][ei2]; break;
              }
            }
            if (!existing) {
              existing = { courseCode: course.courseCode, sectionName: course.sectionName, slots: [] };
              dayMap[day].push(existing);
            }
            existing.slots.push({
              startTime: parsed.startTime,
              endTime:   parsed.endTime,
              roomName:  slot.roomName || '',
              sortTime:  parsed.sortTime
            });
            routineLog('[Routine] Mapped', course.courseCode, 'Sec', course.sectionName, '->', day, parsed.startTime + '-' + parsed.endTime, 'Room:', slot.roomName);
          }
        }
      }

      // Sort slots within each day entry by start time
      this.DAY_ORDER.forEach(function (d) {
        dayMap[d].forEach(function (entry) {
          entry.slots.sort(function (a, b) { return a.sortTime - b.sortTime; });
        });
      });

      var themes = {
        light: { hb: '#D6E4F0', hf: '#1A365D', db: '#EDF2F7', bd: '#B0C4DE' },
        medium: { hb: '#1A73E8', hf: '#FFF', db: '#E8F0FE', bd: '#4285F4' },
        strong: { hb: '#0D47A1', hf: '#FFF', db: '#E3F2FD', bd: '#1565C0' }
      };
      var th = themes[intensity] || themes.medium, bdr = th.bd;

      var h = '<div class="ewu-rt-container" style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">';
      h += '<div style="text-align:center;margin-bottom:16px;padding-top:6px;">';
      if (showLogo) h += '<img src="' + this.LOGO_URL + '" crossorigin="anonymous" style="max-height:58px;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;" onerror="this.style.display=\'none\'" />';
      h += '<h2 style="margin:0 0 3px;font-size:16px;font-weight:700;color:#222;letter-spacing:0.5px;">CLASS ROUTINE</h2>';
      if (semesterName) h += '<p style="margin:0;font-size:13px;color:#555;font-weight:500;">' + escapeHTML(semesterName) + '</p>';
      h += '</div>';

      // Day column: fixed, narrow; course columns: auto-width from content.
      // font-size on table sets baseline; cells override with fs for content.
      h += '<table class="ewu-rt-table" style="width:100%;border-collapse:collapse;font-size:' + (compact ? '11px' : '13px') + ';border:2px solid ' + bdr + ';">';
      h += '<thead><tr>';
      h += '<th style="background:' + th.hb + ';color:' + th.hf + ';padding:' + pad + 'px ' + hpad + 'px;border:1px solid ' + bdr + ';font-weight:700;text-align:center;min-width:82px;width:82px;white-space:nowrap;">Day</th>';
      for (var si = 0; si < sorted.length; si++) {
        // min-width per course column: enough to show code + section on two lines comfortably
        h += '<th style="background:' + th.hb + ';color:' + th.hf + ';padding:' + pad + 'px ' + hpad + 'px;border:1px solid ' + bdr + ';font-weight:700;text-align:center;min-width:110px;white-space:nowrap;">';
        h += escapeHTML(sorted[si].courseCode);
        if (sorted[si].sectionName !== undefined && sorted[si].sectionName !== null) {
          h += '<br><span style="font-size:0.82em;opacity:0.88;font-weight:600;">Sec ' + escapeHTML(String(sorted[si].sectionName)) + '</span>';
        }
        h += '</th>';
      }
      h += '</tr></thead><tbody>';

      // Table rows: one per day
      for (var di2 = 0; di2 < this.DAY_ORDER.length; di2++) {
        var day = this.DAY_ORDER[di2];
        h += '<tr>';
        // Day label cell: fixed narrow column
        h += '<td style="background:' + th.db + ';padding:' + pad + 'px ' + hpad + 'px;border:1px solid ' + bdr + ';font-weight:700;text-align:center;white-space:nowrap;font-size:' + (compact ? '11px' : '13px') + ';">' + day + '</td>';

        for (var sci = 0; sci < sorted.length; sci++) {
          // Find this course's entry for this day
          var dayEntry = null;
          for (var dei = 0; dei < dayMap[day].length; dei++) {
            if (dayMap[day][dei].courseCode === sorted[sci].courseCode &&
                String(dayMap[day][dei].sectionName) === String(sorted[sci].sectionName)) {
              dayEntry = dayMap[day][dei]; break;
            }
          }

          if (dayEntry && dayEntry.slots.length) {
            h += '<td style="background:#FFF;padding:' + pad + 'px ' + hpad + 'px;border:1px solid ' + bdr + ';text-align:center;vertical-align:middle;">';
            for (var sli = 0; sli < dayEntry.slots.length; sli++) {
              var sl = dayEntry.slots[sli];
              if (sli > 0) h += '<hr style="margin:5px 0;border:none;border-top:1px solid #E2E8F0;">';
              h += '<div style="font-size:' + fs + ';color:#1A73E8;font-weight:700;white-space:nowrap;line-height:1.5;">' + sl.startTime + ' – ' + sl.endTime + '</div>';
              if (sl.roomName) h += '<div style="font-size:' + fs + ';color:#444;margin-top:2px;line-height:1.4;">' + escapeHTML(sl.roomName) + '</div>';
            }
            h += '</td>';
          } else {
            h += '<td style="background:#FAFAFA;padding:' + pad + 'px ' + hpad + 'px;border:1px solid ' + bdr + ';"></td>';
          }
        }
        h += '</tr>';
      }
      h += '</tbody></table>';
      h += '</div>';
      return h;
    },

    _renderModal: function (html) {
      var old = safeQuery('#ewu-rg-modal'); if (old) old.remove();
      routineLog('Routine modal opened');

      var modal = document.createElement('div');
      modal.id = 'ewu-rg-modal';
      modal.className = 'ewu-rg-modal';
      modal.innerHTML =
        '<div class="ewu-rg-overlay"></div>' +
        '<div class="ewu-rg-content">' +
          '<div class="ewu-rg-toolbar">' +
            '<div class="ewu-rg-toolbar-title">Class Routine Preview</div>' +
            '<div class="ewu-rg-toolbar-actions">' +
              '<button class="ewu-rg-btn ewu-rg-btn-pdf" id="ewu-rg-pdf-btn" title="Save as PDF"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> PDF</button>' +
              '<button class="ewu-rg-btn ewu-rg-btn-img" id="ewu-rg-img-btn" title="Save as Image"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Image</button>' +
              '<button class="ewu-rg-btn ewu-rg-btn-close" id="ewu-rg-close-btn" title="Close">&times;</button>' +
            '</div>' +
          '</div>' +
          '<div class="ewu-rg-body" id="ewu-rg-preview">' + html + '</div>' +
        '</div>' +
        '<div class="ewu-rg-loading" id="ewu-rg-loading" style="display:none;"><div class="ewu-rg-spinner"></div><span>Exporting...</span></div>';

      document.body.appendChild(modal);
      this._modalOpen = true;
      var self = this;
      modal.querySelector('#ewu-rg-close-btn').addEventListener('click', function () { self._closeModal(); });
      modal.querySelector('.ewu-rg-overlay').addEventListener('click', function () { self._closeModal(); });
      modal.querySelector('#ewu-rg-pdf-btn').addEventListener('click', function () { self._exportPDF(); });
      modal.querySelector('#ewu-rg-img-btn').addEventListener('click', function () { self._exportImage(); });
      this._escHandler = function (e) { if (e.key === 'Escape' && self._modalOpen) self._closeModal(); };
      document.addEventListener('keydown', this._escHandler);
      requestAnimationFrame(function () { modal.classList.add('ewu-rg-modal-open'); });
      Toast.show('Routine generated', 'success');
    },

    _closeModal: function () {
      var m = safeQuery('#ewu-rg-modal'); if (!m) return;
      m.classList.remove('ewu-rg-modal-open');
      var self = this;
      setTimeout(function () { if (m.parentNode) m.remove(); self._modalOpen = false; }, 300);
      if (this._escHandler) { document.removeEventListener('keydown', this._escHandler); this._escHandler = null; }
    },

    /**
     * _loadLibs – ensure html2canvas and jsPDF are available.
     * Libraries are pre-loaded via manifest.json content_scripts, so they
     * should already be in the content-script isolated world.
     * As a last resort, attempt dynamic fetch + blob-URL injection.
     */
    _loadLibs: async function () {
      // Fast path – libraries already available from manifest pre-load
      if (typeof html2canvas === 'function' && window.jspdf && typeof window.jspdf.jsPDF === 'function') {
        routineLog('Export libraries ready (pre-loaded)');
        return true;
      }
      // Retry with window-prefixed checks (some bundles attach differently)
      if (typeof window.html2canvas === 'function' && window.jspdf && typeof window.jspdf.jsPDF === 'function') {
        routineLog('Export libraries ready (via window)');
        return true;
      }

      // Fallback: dynamic fetch + eval in content-script context
      routineLog('Libraries not pre-loaded, attempting dynamic fetch...');
      try {
        var base = chrome.runtime.getURL('lib/');
        var h2cURL = base + 'html2canvas.min.js';
        var jspdfURL = base + 'jspdf.umd.min.js';

        var h2cResp = await fetch(h2cURL);
        var h2cText = await h2cResp.text();
        window._ewuH2C = h2cText;
        var h2cBlob = new Blob([h2cText], { type: 'text/javascript' });
        var h2cBlobURL = URL.createObjectURL(h2cBlob);

        await new Promise(function (resolve, reject) {
          var s = document.createElement('script');
          s.src = h2cBlobURL;
          s.onload = resolve;
          s.onerror = reject;
          (document.head || document.documentElement).appendChild(s);
        });
        URL.revokeObjectURL(h2cBlobURL);
        window._ewuH2C = null;

        var jsResp = await fetch(jspdfURL);
        var jsText = await jsResp.text();
        var jsBlob = new Blob([jsText], { type: 'text/javascript' });
        var jsBlobURL = URL.createObjectURL(jsBlob);

        await new Promise(function (resolve, reject) {
          var s2 = document.createElement('script');
          s2.src = jsBlobURL;
          s2.onload = resolve;
          s2.onerror = reject;
          (document.head || document.documentElement).appendChild(s2);
        });
        URL.revokeObjectURL(jsBlobURL);

        // Validate after dynamic load
        if (typeof html2canvas === 'function' || typeof window.html2canvas === 'function') {
          routineLog('Dynamic load: html2canvas OK');
        } else {
          routineLog('Dynamic load: html2canvas still not a function');
          return false;
        }
        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
          routineLog('Dynamic load: jsPDF OK');
        } else {
          routineLog('Dynamic load: jsPDF still not available');
          return false;
        }
        routineLog('Export libraries loaded via dynamic fetch');
        return true;
      } catch (e) {
        warn('Dynamic library load failed:', e.message);
        routineLog('Dynamic library load failed:', e.message);
        return false;
      }
    },

    /** Helper: resolve the actual html2canvas function */
    _getHtml2Canvas: function () {
      if (typeof html2canvas === 'function') return html2canvas;
      if (typeof window.html2canvas === 'function') return window.html2canvas;
      return null;
    },

    /** Helper: resolve the jsPDF constructor */
    _getJsPDF: function () {
      if (window.jspdf && typeof window.jspdf.jsPDF === 'function') return window.jspdf.jsPDF;
      return null;
    },

    _exportPDF: async function () {
      routineLog('PDF export started');
      this._showLoad(true);
      try {
        var loaded = await this._loadLibs();
        if (!loaded) {
          var prev = safeQuery('#ewu-rg-preview');
          if (prev) {
            var w = window.open('', '_blank');
            if (w) {
              w.document.write('<html><head><title>EWU Routine</title></head><body>' + prev.innerHTML + '</body></html>');
              w.document.close();
              w.print();
            }
          }
          this._showLoad(false);
          Toast.show('Print dialog opened (libs unavailable)', 'warning');
          routineLog('PDF export: libs unavailable, using print fallback');
          return;
        }

        var prev = safeQuery('#ewu-rg-preview');
        if (!prev) {
          routineLog('PDF export: preview element not found');
          this._showLoad(false);
          Toast.show('Preview not found', 'error');
          return;
        }
        routineLog('Export target element found. Size: ' + prev.scrollWidth + 'x' + prev.scrollHeight);

        // Hide overlay and loading during capture
        var overlay = safeQuery('.ewu-rg-overlay');
        var loading = safeQuery('.ewu-rg-loading');
        if (overlay) overlay.style.visibility = 'hidden';
        if (loading) loading.style.display = 'none';

        var scale = (this._currentOpts && this._currentOpts.exportQuality === 'high') ? 3 : 2;
        routineLog('PDF export: capturing at scale ' + scale + 'x');

        var h2cFn = this._getHtml2Canvas();
        if (!h2cFn) {
          throw new Error('html2canvas is not available');
        }
        var canvas = await h2cFn(prev, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scrollX: 0,
          scrollY: -window.scrollY,
          width: prev.scrollWidth,
          height: prev.scrollHeight,
          windowWidth: prev.scrollWidth,
          windowHeight: prev.scrollHeight,
        });

        routineLog('PDF export: canvas captured, size: ' + canvas.width + 'x' + canvas.height);

        // Restore overlay
        if (overlay) overlay.style.visibility = '';
        if (loading) loading.style.display = 'none';

        var JsPDFCtor = this._getJsPDF();
        if (!JsPDFCtor) {
          throw new Error('jsPDF is not available');
        }
        // A4 PDF with proper fit-to-page scaling
        var orient = canvas.width > canvas.height ? 'landscape' : 'portrait';
        var pdf = new JsPDFCtor({ orientation: orient, unit: 'mm', format: 'a4' });
        var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
        var margin = 10, uw = pw - margin * 2, uh = ph - margin * 2;
        var ratio = Math.min(uw / canvas.width, uh / canvas.height);
        var sw = canvas.width * ratio, sh = canvas.height * ratio;
        var xOff = (pw - sw) / 2, yOff = (ph - sh) / 2;

        routineLog('PDF export: A4 ' + orient + ', placing at ' + sw.toFixed(1) + 'x' + sh.toFixed(1) + 'mm');

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOff, yOff, sw, sh, undefined, 'FAST');
        var semClean = this._getSemesterName();
        if (semClean) {
          semClean = semClean.replace(/[^a-zA-Z0-9]/g, '');
          semClean = semClean.substring(0, 20);
        }
        var pdfName = semClean ? ('Routine_' + semClean + '.pdf') : 'EWU_Class_Routine.pdf';
        pdf.save(pdfName);
        routineLog('PDF export success');
        Toast.show('PDF saved successfully', 'success');
      } catch (e) {
        routineLog('PDF export failed:', e.message || e);
        warn('PDF export failed:', e);
        Toast.show('PDF export failed: ' + (e.message || 'Unknown error'), 'error');
      }
      this._showLoad(false);
    },

    _exportImage: async function () {
      routineLog('Image export started');
      this._showLoad(true);
      try {
        if (!await this._loadLibs()) {
          Toast.show('Export libraries not available', 'error');
          this._showLoad(false);
          return;
        }
        var prev = safeQuery('#ewu-rg-preview');
        if (!prev) {
          routineLog('Image export: preview element not found');
          this._showLoad(false);
          Toast.show('Preview not found', 'error');
          return;
        }
        routineLog('Image export: target element found. Size: ' + prev.scrollWidth + 'x' + prev.scrollHeight);

        var overlay = safeQuery('.ewu-rg-overlay');
        var loading = safeQuery('.ewu-rg-loading');
        if (overlay) overlay.style.visibility = 'hidden';
        if (loading) loading.style.display = 'none';

        var scale = (this._currentOpts && this._currentOpts.exportQuality === 'high') ? 3 : 2;
        routineLog('Image export: capturing at scale ' + scale + 'x');

        var h2cFn = this._getHtml2Canvas();
        if (!h2cFn) {
          throw new Error('html2canvas is not available');
        }
        var canvas = await h2cFn(prev, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scrollX: 0,
          scrollY: -window.scrollY,
          width: prev.scrollWidth,
          height: prev.scrollHeight,
          windowWidth: prev.scrollWidth,
          windowHeight: prev.scrollHeight,
        });

        routineLog('Image export: canvas captured, size: ' + canvas.width + 'x' + canvas.height);

        if (overlay) overlay.style.visibility = '';
        if (loading) loading.style.display = 'none';

        var self = this;
        canvas.toBlob(function (blob) {
          if (!blob) {
            routineLog('Image export: blob generation failed');
            Toast.show('Image generation failed', 'error');
            return;
          }
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          var semClean2 = self._getSemesterName();
          if (semClean2) {
            semClean2 = semClean2.replace(/[^a-zA-Z0-9]/g, '');
            semClean2 = semClean2.substring(0, 20);
          }
          a.download = semClean2 ? ('Routine_' + semClean2 + '.png') : 'EWU_Class_Routine.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          routineLog('Image export success');
          Toast.show('Image saved successfully', 'success');
        }, 'image/png');
      } catch (e) {
        routineLog('Image export failed:', e.message || e);
        warn('Image export failed:', e);
        Toast.show('Image export failed: ' + (e.message || 'Unknown error'), 'error');
      }
      this._showLoad(false);
    },

    _showLoad: function (show) {
      var el = safeQuery('#ewu-rg-loading');
      if (el) el.style.display = show ? 'flex' : 'none';
    },

    reset: function () {
      this._apiData = null;
      this._tableReady = false;
      this._hooksInstalled = false;
      this._modalOpen = false;
      this._currentOpts = null;
      this._btnInjected = false;
      if (this._observer) { this._observer.disconnect(); this._observer = null; }
      // If we created a flex row, restore the Print Slip button to its original parent first
      var btnRow = safeQuery('#ewu-rg-btn-row');
      if (btnRow) {
        var printBtn2 = btnRow.querySelector('button[ng-click="PaySlipPrintBySemesterAndStudentId()"]');
        if (printBtn2) btnRow.parentNode.insertBefore(printBtn2, btnRow);
        btnRow.remove();
      }
      document.querySelectorAll('#ewu-rg-btn-wrapper, #ewu-rg-btn-wrapper-inline').forEach(function(el) { el.remove(); });
      var m = safeQuery('#ewu-rg-modal');
      if (m) m.remove();
    },
  };


  /* ===========================================================
     OFFERED COURSES ENHANCER MODULE
     =========================================================== */

  var OfferedCoursesEnhancerModule = {
    API_KW: 'GetAllOfferedCourses',
    TBL: 'tblData',
    CONT: 'courseTable',
    DELAY: 300,
    _apiData: [],
    _extractedData: [],    // last extracted course objects for filtering
    _hasRealData: false,    // only true after API data received
    _hooksInstalled: false,
    _observer: null,
    _timer: null,
    _settings: {},
    _enhanced: false,
    _searchTimer: null,
    _lastBuildHash: '',
    _pageHookListener: null,
    _buttonWatcherAttached: false,
    _showAvailable: false,  // toggle state

    // Known header/placeholder labels from the portal table
    _PLACEHOLDER_LABELS: ['section', 'timing', 'room no', 'room no.', 'dedicated', 'dedicated department'],

    init: async function (settings) {
      this._settings = settings.modules || {};
      if (location.pathname.toLowerCase().indexOf('/home/offeredcoursesstudent') === -1 &&
          !safeQuery('[ng-controller="OfferedCoursesStudentController"]')) return;

      log('Offered Courses Enhancer activating');
      debugLog('OC: active');

      // Inject page hook for API interception
      injectPageHook();

      // Listen for postMessage from pageHook.js
      this._listenForPageHookMessages();

      // Also hook from content script context (as backup)
      this._hookAPI();

      // Watch for table DOM changes
      this._watchTable();

      // Inject controls bar (search, stats, toggle) outside the table scroll container
      this._injectControlsBar();

      // Immediately inject enhanced table headers on page load
      this._injectImmediateHeaders();

      // Attach button watcher for Show Offered Course click
      this._attachButtonWatcher();
    },

    _listenForPageHookMessages: function () {
      if (this._pageHookListener) return;
      this._pageHookListener = true;
      var self = this;
      window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'EWU_OC_API_DATA' && event.data.data) {
          debugLog('OC: Received API data from page hook');
          self._handleData(event.data.data);
        }
      });
    },

    _hookAPI: function () {
      if (this._hooksInstalled) return;
      this._hooksInstalled = true;
      var self = this;

      if (window.fetch) {
        var orig = window.fetch;
        window.fetch = async function () {
          var res = await orig.apply(this, arguments);
          var url = (typeof arguments[0] === 'string') ? arguments[0] : (arguments[0] && arguments[0].url) || '';
          if (url.indexOf(self.API_KW) !== -1) {
            try { var d = await res.clone().json(); self._handleData(d); } catch (e) {}
          }
          return res;
        };
      }

      var origOpen = XMLHttpRequest.prototype.open, origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (m, url) { this._ewu_oc = url; return origOpen.apply(this, arguments); };
      XMLHttpRequest.prototype.send = function () {
        if (this._ewu_oc && this._ewu_oc.indexOf(self.API_KW) !== -1) {
          var xhr = this;
          this.addEventListener('load', function () { try { self._handleData(JSON.parse(xhr.responseText)); } catch (e) {} });
        }
        return origSend.apply(this, arguments);
      };
    },

    _handleData: function (data) {
      var items = data;
      if (Array.isArray(items) && items.length > 0 && Array.isArray(items[0])) items = items[0];
      if (!Array.isArray(items)) return;

      // Always replace with new data on fresh search
      this._apiData = items;
      this._hasRealData = true;

      debugLog('OC: ' + this._apiData.length + ' items captured');
      Toast.show('Enhanced course data loaded (' + this._apiData.length + ' courses)', 'success', 2500);
      this._scheduleEnhance();
    },

    _watchTable: function () {
      var container = safeQuery('#' + this.CONT);
      if (!container) return;
      var self = this;
      this._observer = new MutationObserver(function () {
        if (!self._timer) self._scheduleEnhance();
      });
      this._observer.observe(container, { childList: true, subtree: true });
      var table = safeQuery('#' + this.TBL);
      if (table && table.querySelectorAll('tr').length > 2 && this._hasRealData) this._scheduleEnhance();
    },

    _attachButtonWatcher: function () {
      if (this._buttonWatcherAttached) return;
      this._buttonWatcherAttached = true;
      var self = this;
      document.addEventListener('click', function (event) {
        var text = event.target ? (event.target.innerText || event.target.textContent || '') : '';
        if (text.indexOf('Show Offered Courses') !== -1 || text.indexOf('Show Offered Course') !== -1) {
          self._apiData = [];
          self._extractedData = [];
          self._hasRealData = false;
          self._lastBuildHash = '';
          Toast.show('Loading courses...', 'info', 2500);
          debugLog('OC: Show Offered Courses clicked, waiting for API...');
        }
      });
    },

    /* -----------------------------------------------------------
       CONTROLS BAR (search, stats, toggle) – placed OUTSIDE #courseTable
       so it never scrolls with the table.
       ----------------------------------------------------------- */
    _injectControlsBar: function () {
      if (safeQuery('#ewu-oc-controls')) return;
      var container = safeQuery('#' + this.CONT);
      if (!container) return;
      // Insert wrapper ABOVE the courseTable scroll container
      var parent = container.parentNode;
      if (!parent) return;

      var bar = document.createElement('div');
      bar.id = 'ewu-oc-controls';
      bar.className = 'ewu-oc-controls';

      // Search
      if (this._settings.offeredCoursesSearchBox !== false) {
        // Outer group: label above, wrapper below
        var searchGroup = document.createElement('div');
        searchGroup.className = 'ewu-oc-search-group';

        // "Search" label
        var searchLabel = document.createElement('label');
        searchLabel.className = 'ewu-oc-search-label';
        searchLabel.setAttribute('for', 'ewu-oc-search-input');
        searchLabel.textContent = 'Search';
        searchGroup.appendChild(searchLabel);

        var searchWrap = document.createElement('div');
        searchWrap.className = 'ewu-oc-search-wrapper';

        // Magnifier icon inside wrapper (left side)
        var searchIcon = document.createElement('span');
        searchIcon.className = 'ewu-oc-search-icon';
        searchIcon.setAttribute('aria-hidden', 'true');
        searchIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        searchWrap.appendChild(searchIcon);

        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'ewu-oc-search-input';
        input.className = 'ewu-oc-search-input';
        input.placeholder = this._settings.offeredCoursesSearchPlaceholder || 'Search by course or faculty...';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');

        var clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.id = 'ewu-oc-search-clear';
        clearBtn.className = 'ewu-oc-search-clear';
        clearBtn.innerHTML = '\u00D7';
        clearBtn.title = 'Clear';

        searchWrap.appendChild(input);
        searchWrap.appendChild(clearBtn);
        searchGroup.appendChild(searchWrap);
        bar.appendChild(searchGroup);

        var self = this;
        input.addEventListener('input', function () {
          if (self._searchTimer) clearTimeout(self._searchTimer);
          self._searchTimer = setTimeout(function () {
            self._searchTimer = null;
            self._applyFilters();
            clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
          }, 200);
        });
        clearBtn.addEventListener('click', function () {
          input.value = '';
          self._applyFilters();
          clearBtn.style.display = 'none';
          input.focus();
        });
      }

      // Right side: stats + toggle
      var rightWrap = document.createElement('div');
      rightWrap.className = 'ewu-oc-controls-right';

      // Total count
      var statsEl = document.createElement('span');
      statsEl.id = 'ewu-oc-stats';
      statsEl.className = 'ewu-oc-stats';
      statsEl.textContent = 'Total Courses: 0';
      rightWrap.appendChild(statsEl);

      // Show Available toggle
      var toggleWrap = document.createElement('label');
      toggleWrap.className = 'ewu-oc-toggle-label';
      toggleWrap.title = 'Show only courses with available seats';

      var toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.id = 'ewu-oc-toggle-available';
      toggleInput.className = 'ewu-oc-toggle-input';

      var toggleTrack = document.createElement('span');
      toggleTrack.className = 'ewu-oc-toggle-track';

      var toggleText = document.createElement('span');
      toggleText.className = 'ewu-oc-toggle-text';
      toggleText.textContent = 'Show available';

      toggleWrap.appendChild(toggleInput);
      toggleWrap.appendChild(toggleTrack);
      toggleWrap.appendChild(toggleText);
      rightWrap.appendChild(toggleWrap);

      bar.appendChild(rightWrap);
      parent.insertBefore(bar, container);

      // Toggle listener
      var self2 = this;
      toggleInput.addEventListener('change', function () {
        self2._showAvailable = toggleInput.checked;
        self2._applyFilters();
      });
    },

    /* -----------------------------------------------------------
       FILTERING (search + show available) + count update
       ----------------------------------------------------------- */
    _applyFilters: function () {
      var searchInput = safeQuery('#ewu-oc-search-input');
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';

      var rows = safeQueryAll('.ewu-oc-row');
      var visible = 0;
      for (var i = 0; i < rows.length; i++) {
        var searchText = (rows[i].getAttribute('data-search') || '').toLowerCase();
        var hasLeft = (rows[i].getAttribute('data-left') || '') !== '0';
        var matchSearch = !q || searchText.indexOf(q) !== -1;
        var matchAvail = !this._showAvailable || hasLeft;
        var show = matchSearch && matchAvail;
        rows[i].style.display = show ? '' : 'none';
        if (show) visible++;
      }
      this._updateCount(visible);
    },

    _updateCount: function (count) {
      var el = safeQuery('#ewu-oc-stats');
      if (el) el.textContent = 'Total Courses: ' + count;
    },

    _scheduleEnhance: function () {
      if (this._timer) return;
      var self = this;
      this._timer = setTimeout(function () {
        self._timer = null;
        self._doEnhance();
      }, this.DELAY);
    },

    _doEnhance: function () {
      // Do NOT enhance without real API data
      if (!this._hasRealData) return;

      var data = this._extractData();
      if (!data || !data.length) return;

      this._extractedData = data;

      var hash = data.length + ':' + (data[0] ? data[0].courseCode : '');
      if (hash === this._lastBuildHash && this._enhanced) return;
      this._lastBuildHash = hash;

      var table = safeQuery('#' + this.TBL);
      if (!table) return;

      this._buildTable(data, table);
      this._enhanced = true;
    },

    _extractData: function () {
      if (this._apiData.length > 0) {
        var courses = [];
        for (var i = 0; i < this._apiData.length; i++) {
          var item = this._apiData[i];
          if (!item) continue;
          var cc = safeText(item.CourseCode);
          if (!cc) continue; // skip items without a valid CourseCode
          var cap   = parseInt(item.SeatCapacity, 10) || 0;
          var taken = parseInt(item.SeatTaken, 10)    || 0;
          var left  = Math.max(0, cap - taken);

          // Faculty: use ShortName primarily, fallback to FacultyName
          var faculty = safeText(item.ShortName) || safeText(item.FacultyName) || '-';

          // Parse days and time from TimeSlotName
          var tsName = safeText(item.TimeSlotName);
          var daysParsed = this._parseDaysTime(tsName);

          courses.push({
            courseCode:  cc,
            courseName:  safeText(item.CourseName),
            section:     safeText(item.SectionName),
            faculty:     faculty,
            seatsTaken:  taken,
            seatsTotal:  cap,
            seatsLabel:  taken + ' / ' + cap,   // Seats(A/T) = Taken / Total
            left:        left,
            days:        daysParsed.days,         // e.g. "Mon, Wed"
            time:        daysParsed.time,         // e.g. "08:00 AM - 10:00 AM"
            room:        safeText(item.RoomCode) || safeText(item.RoomName) || '-',
            dedicatedDept: safeText(item.DedicateDepartmentName) || '-'
          });

          if (i < 3) {
            debugLog('OC: item[' + i + '] ' + cc + ' Sec' + item.SectionName +
              ' | TimeSlot:', tsName, '| Days:', daysParsed.days, '| Time:', daysParsed.time +
              ' | Seats:', taken + '/' + cap);
          }
        }
        if (courses.length) return courses;
      }

      // Fallback: parse from DOM – but ONLY if we have real data context
      if (!this._hasRealData) return [];

      var table = safeQuery('#' + this.TBL);
      if (!table) return [];
      var rows = table.querySelectorAll('tr');
      var domCourses = [];
      var self = this;
      for (var j = 1; j < rows.length; j++) {
        var cells = rows[j].querySelectorAll('td');
        if (cells.length < 4) continue;
        var rawCode = cells[0] ? (cells[0].textContent || '') : '';
        var code = rawCode.trim();
        if (!code) continue;
        if (self._isPlaceholderLabel(code)) continue;
        // DOM fallback: cells[5] = seats in old format
        var seatsRaw = ((cells[3] || {}).textContent || '').split('/');
        domCourses.push({
          courseCode:  code,
          courseName:  '',
          section:     ((cells[1] || {}).textContent || '').trim(),
          faculty:     '-',
          seatsTaken:  parseInt(seatsRaw[0], 10) || 0,
          seatsTotal:  parseInt(seatsRaw[1], 10) || 0,
          seatsLabel:  (((cells[3] || {}).textContent || '')).trim() || '-',
          left:        Math.max(0, (parseInt(seatsRaw[1], 10) || 0) - (parseInt(seatsRaw[0], 10) || 0)),
          days:        '-',
          time:        '-',
          room:        ((cells[4] || {}).textContent || '').trim() || '-'
        });
      }
      return domCourses;
    },

    /* -----------------------------------------------------------
       Parse days and time string from a TimeSlotName value.
       E.g. "MW 08:00 AM - 10:00 AM" → { days: "Mon, Wed", time: "08:00 AM - 10:00 AM" }
            "M 4:50PM-6:50PM"        → { days: "Mon",      time: "4:50 PM - 6:50 PM" }
       ----------------------------------------------------------- */
    _DAY_CODE_MAP: {
      'A': 'Sat', 'S': 'Sun', 'M': 'Mon', 'T': 'Tue', 'W': 'Wed', 'R': 'Thu', 'F': 'Fri'
    },
    _parseDaysTime: function (tsName) {
      if (!tsName) return { days: '-', time: '-' };
      // Match: "<dayCodes> <time1> - <time2>"  (flexible spacing, AM/PM with/without space)
      var m = tsName.trim().match(/^([A-Z]+)\s+([\d:]+\s*(?:AM|PM))\s*-\s*([\d:]+\s*(?:AM|PM))$/i);
      if (!m) {
        debugLog('OC: _parseDaysTime could not parse:', tsName);
        return { days: tsName, time: '-' };
      }
      var dayCodes = m[1].toUpperCase();
      var dayNames = [];
      var self = this;
      for (var i = 0; i < dayCodes.length; i++) {
        var dn = self._DAY_CODE_MAP[dayCodes[i]];
        if (dn) dayNames.push(dn);
      }
      // Normalize times: ensure space before AM/PM
      function normTime(t) {
        return t.trim().replace(/(\d)(AM|PM)/i, '$1 $2').toUpperCase();
      }
      var timeStr = normTime(m[2]) + ' - ' + normTime(m[3]);
      return {
        days: dayNames.length ? dayNames.join(', ') : dayCodes,
        time: timeStr
      };
    },

    /* -----------------------------------------------------------
       IMMEDIATE TABLE HEADER INJECTION (on page load, before API data)
       Replaces the portal default table headers with enhanced ones
       immediately, so the new headers are always visible.
       ----------------------------------------------------------- */
    _injectImmediateHeaders: function () {
      var table = safeQuery('#' + this.TBL);
      if (!table) return;
      var existingHeaderRow = table.querySelector('tr');
      if (!existingHeaderRow) return;
      var sticky = this._settings.offeredCoursesStickyHeader !== false ? ' ewu-oc-sticky-header' : '';
      var h = '<thead><tr class="ewu-oc-header-placeholder-row ' + sticky + '">';
      // New headers: Course | Section | Faculty | Seats(A/T) | Left | Days | Time | Room No. | Dedicated Department
      var headers = ['Course', 'Section', 'Faculty', 'Seats(A/T)', 'Left', 'Days', 'Time', 'Room No.', 'Dedicated Department'];
      for (var i = 0; i < headers.length; i++) {
        h += '<th class="ewu-oc-th ewu-oc-th-placeholder">' + escapeHTML(headers[i]) + '</th>';
      }
      h += '</tr></thead><tbody class="ewu-oc-placeholder-body"></tbody>';
      table.innerHTML = h;
      table.className = 'table table-striped grid-table ewu-oc-table';
      if (table.getAttribute('border') !== '1') table.setAttribute('border', '1');
      debugLog('OC: Immediate enhanced headers injected (new structure: Course|Section|Faculty|Seats(A/T)|Left|Days|Time|Room|DedicatedDept)');
    },

    /** Check if a text value matches a known portal placeholder/header label */
    _isPlaceholderLabel: function (text) {
      var lower = (text || '').toLowerCase().trim();
      for (var i = 0; i < this._PLACEHOLDER_LABELS.length; i++) {
        if (lower === this._PLACEHOLDER_LABELS[i]) return true;
      }
      return false;
    },

    _buildTable: function (data, table) {
      var colorLeft = this._settings.offeredCoursesColorLeft !== false;
      var sticky = this._settings.offeredCoursesStickyHeader !== false ? ' ewu-oc-sticky-header' : '';

      // New headers: Course | Section | Faculty | Seats(A/T) | Left | Days | Time | Room No. | Dedicated Department
      var h = '<thead><tr class="' + sticky + '">';
      var headers = ['Course', 'Section', 'Faculty', 'Seats(A/T)', 'Left', 'Days', 'Time', 'Room No.', 'Dedicated Department'];
      for (var i = 0; i < headers.length; i++) {
        h += '<th class="ewu-oc-th">' + escapeHTML(headers[i]) + '</th>';
      }
      h += '</tr></thead><tbody id="ewu-oc-tbody">';

      debugLog('OC: _buildTable rendering', data.length, 'rows with new structure');

      for (var j = 0; j < data.length; j++) {
        var c = data[j];
        var rc = 'ewu-oc-row' + (j % 2 === 0 ? ' ewu-oc-row-even' : ' ewu-oc-row-odd');
        // Search text includes course, section, faculty, days, time, room
        var searchText = [c.courseCode, c.section, c.faculty, c.days, c.time, c.room, c.courseName].join(' ').toLowerCase();
        h += '<tr class="' + rc + '" data-search="' + escapeHTML(searchText) + '" data-left="' + c.left + '">';

        h += '<td class="ewu-oc-td ewu-oc-td-course">'  + escapeHTML(c.courseCode)  + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-section">' + escapeHTML(c.section)     + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-faculty">' + escapeHTML(c.faculty)     + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-seats">'   + escapeHTML(c.seatsLabel)  + '</td>';

        var lc = 'ewu-oc-left';
        if (colorLeft) {
          if (c.left === 0)       lc += ' ewu-oc-left-red';
          else if (c.left <= 10)  lc += ' ewu-oc-left-yellow';
          else                    lc += ' ewu-oc-left-green';
        }
        h += '<td class="ewu-oc-td ' + lc + '">'        + c.left                    + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-days">'    + escapeHTML(c.days)        + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-time">'    + escapeHTML(c.time)        + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-room">'    + escapeHTML(c.room)        + '</td>';
        h += '<td class="ewu-oc-td ewu-oc-td-dept">'    + escapeHTML(c.dedicatedDept || '-') + '</td>';
        h += '</tr>';
      }
      h += '</tbody>';
      table.innerHTML = h;
      table.className = 'table table-striped grid-table ewu-oc-table';
      if (table.getAttribute('border') !== '1') table.setAttribute('border', '1');

      // Apply current filters and update count
      this._applyFilters();

      // Inject Export PDF button after table is built
      this._injectExportPDFButton();
    },

    /* -----------------------------------------------------------
       EXPORT PDF BUTTON for Offered Courses
       Injects a PDF export icon button beside the portal Print button.
       ----------------------------------------------------------- */
    _injectExportPDFButton: function () {
      if (safeQuery('#ewu-oc-export-pdf-btn')) return;
      // Find the Print button in the portal controls
      var printBtn = safeQuery('a[onclick*="printDiv"]');
      if (!printBtn) {
        // Fallback: find by text content
        var allLinks = safeQueryAll('a.btn');
        for (var i = 0; i < allLinks.length; i++) {
          if ((allLinks[i].textContent || '').indexOf('Print') !== -1) {
            printBtn = allLinks[i]; break;
          }
        }
      }
      if (!printBtn) return;

      var parent = printBtn.parentNode;
      if (!parent) return;

      var pdfBtn = document.createElement('a');
      pdfBtn.href = '';
      pdfBtn.id = 'ewu-oc-export-pdf-btn';
      pdfBtn.className = 'btn btn-primary ewu-oc-export-pdf-btn';
      pdfBtn.title = 'Export to PDF';
      pdfBtn.innerHTML = '<span class="fa fa-file-pdf"></span>';
      pdfBtn.style.cssText = 'margin-left:8px;cursor:pointer;';

      var self = this;
      pdfBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self._exportCoursesPDF();
      });

      // Insert after the Print button
      parent.appendChild(pdfBtn);
      debugLog('OC: Export PDF button injected');
    },

    /* -----------------------------------------------------------
       EXPORT COURSES PDF
       Uses jsPDF to create a landscape PDF from currently visible rows.
       ----------------------------------------------------------- */
    _exportCoursesPDF: async function () {
      // Collect currently visible rows: Course | Section | Faculty | Seats(A/T) | Left | Days | Time | Room No.
      var rows = safeQueryAll('.ewu-oc-row');
      var visibleData = [];
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].style.display === 'none') continue;
        var cells = rows[i].querySelectorAll('.ewu-oc-td');
        if (cells.length < 8) continue;
        visibleData.push({
          course:  ((cells[0] || {}).textContent || '').trim(),
          section: ((cells[1] || {}).textContent || '').trim(),
          faculty: ((cells[2] || {}).textContent || '').trim(),
          seats:   ((cells[3] || {}).textContent || '').trim(),
          left:    ((cells[4] || {}).textContent || '').trim(),
          days:    ((cells[5] || {}).textContent || '').trim(),
          time:    ((cells[6] || {}).textContent || '').trim(),
          room:    ((cells[7] || {}).textContent || '').trim()
        });
      }

      if (!visibleData.length) {
        Toast.show('No course data available to export', 'error');
        return;
      }

      debugLog('OC: PDF export starting with', visibleData.length, 'rows');
      Toast.show('Generating PDF...', 'info', 2000);

      try {
        var JsPDFCtor = null;
        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') JsPDFCtor = window.jspdf.jsPDF;
        if (!JsPDFCtor) { Toast.show('PDF library not available', 'error'); return; }

        // A4 landscape (297 × 210 mm)
        var pdf = new JsPDFCtor({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        var pw = pdf.internal.pageSize.getWidth();
        var ph = pdf.internal.pageSize.getHeight();
        var margin  = 10;
        var usableW = pw - margin * 2;   // ~277 mm
        var headerH = 9;
        var cellPad = 1.8;
        var baseRowH = 7;  // minimum row height (mm)
        var lineH    = 3.8; // height per text line (mm)

        // Column widths (raw): Course and Faculty narrowed; Room significantly widened
        // Course | Section | Faculty | Seats(A/T) | Left | Days | Time | Room No.
        var colWRaw = [24, 16, 26, 22, 14, 28, 36, 54];
        var totalRaw = 0;
        for (var ci = 0; ci < colWRaw.length; ci++) totalRaw += colWRaw[ci];
        var sf = usableW / totalRaw;
        var colW = colWRaw.map(function (w) { return w * sf; });

        var headers = ['Course', 'Section', 'Faculty', 'Seats(A/T)', 'Left', 'Days', 'Time', 'Room No.'];
        var pageNum = 1;

        /* ---- Helper: draw blue header row, return new y ---- */
        function drawHeader(yPos) {
          var xp = margin;
          pdf.setFillColor(26, 115, 232);
          pdf.rect(xp, yPos, usableW, headerH, 'F');
          pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(255, 255, 255);
          xp = margin;
          for (var hi = 0; hi < headers.length; hi++) {
            pdf.text(headers[hi], xp + cellPad, yPos + headerH / 2 + 1.5, { maxWidth: colW[hi] - cellPad * 2 });
            xp += colW[hi];
          }
          return yPos + headerH;
        }

        /* ---- Helper: draw footer for current page ---- */
        function drawFooter() {
          pdf.setFontSize(7); pdf.setTextColor(160, 160, 160); pdf.setFont('helvetica', 'normal');
          pdf.text('Page ' + pageNum + '  |  EWU Portal Helper v' + CONFIG.VERSION, pw / 2, ph - 4, { align: 'center' });
        }

        var y = drawHeader(margin);
        var rowAlt = 0;

        debugLog('OC: PDF col widths (mm):', colW.map(function (w) { return w.toFixed(1); }).join(' | '));

        for (var ri = 0; ri < visibleData.length; ri++) {
          var d = visibleData[ri];
          var vals = [d.course, d.section, d.faculty, d.seats, d.left, d.days, d.time, d.room];

          // Compute word-wrapped lines for every column
          pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal');
          var cellLines = vals.map(function (v, idx) {
            return pdf.splitTextToSize((v || '').trim(), colW[idx] - cellPad * 2);
          });
          // Max lines across columns (cap at 3 to avoid oversized rows)
          var maxLines = Math.min(3, cellLines.reduce(function (mx, ls) { return Math.max(mx, ls.length); }, 1));
          var actualRowH = Math.max(baseRowH, maxLines * lineH + 2);

          // Page break: add a new page if this row won't fit
          if (y + actualRowH > ph - 10) {
            drawFooter();
            pdf.addPage();
            pageNum++;
            y = drawHeader(margin);
            rowAlt = 0;
            pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal');
          }

          // Alternating row background
          if (rowAlt % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(margin, y, usableW, actualRowH, 'F');
          }
          // Row border
          pdf.setDrawColor(220, 225, 235);
          pdf.rect(margin, y, usableW, actualRowH, 'S');

          // Draw each column's text (word-wrapped)
          var x = margin;
          pdf.setTextColor(30, 41, 59);
          for (var vi = 0; vi < vals.length; vi++) {
            var lns = cellLines[vi].slice(0, maxLines); // honour the cap
            for (var lli = 0; lli < lns.length; lli++) {
              pdf.text(lns[lli], x + cellPad, y + cellPad + (lli + 0.7) * lineH);
            }
            x += colW[vi];
          }

          y += actualRowH;
          rowAlt++;
        }

        drawFooter();

        var now = new Date();
        var ts = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') + '-' +
          String(now.getMinutes()).padStart(2, '0');
        pdf.save('EWU_Offered_Courses_' + ts + '.pdf');
        Toast.show('PDF exported successfully (' + visibleData.length + ' courses)', 'success');
        debugLog('OC: PDF export done —', visibleData.length, 'rows,', pageNum, 'page(s)');
      } catch (e) {
        debugLog('OC: PDF export failed:', e.message || e);
        Toast.show('PDF export failed: ' + (e.message || 'Unknown error'), 'error');
      }
    },

    reset: function () {
      this._apiData = [];
      this._extractedData = [];
      this._hasRealData = false;
      this._hooksInstalled = false;
      this._enhanced = false;
      this._lastBuildHash = '';
      this._pageHookListener = false;
      this._buttonWatcherAttached = false;
      this._showAvailable = false;
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      if (this._searchTimer) { clearTimeout(this._searchTimer); this._searchTimer = null; }
      if (this._observer) { this._observer.disconnect(); this._observer = null; }
      var sb = safeQuery('#ewu-oc-search');
      if (sb) sb.remove();
      var ctrl = safeQuery('#ewu-oc-controls');
      if (ctrl) ctrl.remove();
    },
  };


  /* ===========================================================
     KEYBOARD SHORTCUTS (Ctrl+K for offered courses search)
     =========================================================== */

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      var searchInput = safeQuery('#ewu-oc-search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });


  /* ===========================================================
     MODULE LOADER
     =========================================================== */

  function loadModules(pageInfo, settings) {
    if (!settings.enabled || !pageInfo) return;
    if (pageInfo.id === 'login' && settings.modules.loginHelper) {
      LoginHelperModule.reset();
      LoginHelperModule.init(settings);
    }
    if (pageInfo.id === 'classSchedule' && settings.modules.routineGenerator) {
      RoutineGeneratorModule.reset();
      RoutineGeneratorModule.init(settings);
    }
    if (pageInfo.id === 'offeredCourses' && settings.modules.offeredCoursesEnhancer) {
      OfferedCoursesEnhancerModule.reset();
      OfferedCoursesEnhancerModule.init(settings);
    }
  }


  /* ===========================================================
     SETTINGS LISTENER (from popup)
     =========================================================== */

  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener(function (msg, _s, respond) {
      if (msg && msg.type === 'EWU_SETTINGS_UPDATED') {
        handleSettingsUpdate(msg.settings);
        respond({ ok: true });
      }
    });
  }

  async function handleSettingsUpdate(ns) {
    _settings = ns;
    applyBodyClasses(ns);
    applyDarkMode(ns.enabled && ns.theme === 'dark');
    injectThemeToggle();
    if (!ns.enabled) {
      LoginHelperModule.reset();
      RoutineGeneratorModule.reset();
      OfferedCoursesEnhancerModule.reset();
    } else {
      var pi = detectPage();
      loadModules(pi, ns);
    }
  }

  function applyDarkMode(isDark) {
    var pn = location.pathname.toLowerCase();
    if (pn === '/' || pn === '/account/login' || pn === '/account/login/' || safeQuery('#loginform') || safeQuery('#lblcaptchaAnswer')) {
      isDark = false;
    }
    var existing = safeQuery('#ewu-portal-dark-css');
    if (isDark) {
      if (!existing) {
        var link = document.createElement('link');
        link.id = 'ewu-portal-dark-css';
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('portal-dark.css');
        document.head.appendChild(link);
        log('Dark Mode CSS injected');
      }
    } else {
      if (existing) {
        existing.remove();
        log('Dark Mode CSS removed');
      }
    }
  }

  function injectThemeToggle() {
    var pn = location.pathname.toLowerCase();
    if (pn === '/' || pn === '/account/login' || safeQuery('#loginform') || safeQuery('#lblcaptchaAnswer')) {
      var toggle = safeQuery('#ewu-theme-toggle');
      if (toggle) toggle.remove();
      return;
    }

    var navNotify = safeQuery('.navbar-right .nav-notify');
    if (!navNotify) return;

    var isDark = (_settings && _settings.theme === 'dark');

    var existingToggle = safeQuery('#ewu-theme-toggle');
    if (existingToggle) {
      existingToggle.classList.toggle('dark-active', isDark);
      updateIcon(existingToggle.querySelector('svg'), isDark);
      return;
    }

    var toggleContainer = document.createElement('div');
    toggleContainer.id = 'ewu-theme-toggle';
    toggleContainer.className = 'ewu-theme-toggle-container';
    if (isDark) {
      toggleContainer.classList.add('dark-active');
    }

    toggleContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>';
    var svg = toggleContainer.querySelector('svg');
    updateIcon(svg, isDark);

    navNotify.parentNode.insertBefore(toggleContainer, navNotify);

    toggleContainer.addEventListener('click', async function () {
      var nextTheme = (_settings.theme === 'dark') ? 'light' : 'dark';
      _settings.theme = nextTheme;

      toggleContainer.classList.toggle('dark-active', nextTheme === 'dark');
      updateIcon(toggleContainer.querySelector('svg'), nextTheme === 'dark');
      applyDarkMode(_settings.enabled && nextTheme === 'dark');

      await saveSettings(_settings);
      Toast.show(nextTheme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled', 'info', 2000);
    });

    function updateIcon(svgEl, isDarkTheme) {
      if (!svgEl) return;
      if (isDarkTheme) {
        svgEl.innerHTML = '<circle cx="12" cy="12" r="5" stroke="#FBBF24" stroke-width="2.2" fill="#FBBF24" />' +
                          '<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FBBF24" stroke-width="2.2" />';
      } else {
        svgEl.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#FFFFFF" stroke-width="2.2" fill="#FFFFFF" />';
      }
    }
  }


  /* ===========================================================
     SPA NAVIGATION HANDLER
     =========================================================== */

  function setupSPA() {
    var origPS = history.pushState, origRS = history.replaceState;
    history.pushState = function () {
      var r = origPS.apply(this, arguments);
      window.dispatchEvent(new Event('locationchange'));
      return r;
    };
    history.replaceState = function () {
      var r = origRS.apply(this, arguments);
      window.dispatchEvent(new Event('locationchange'));
      return r;
    };
    window.addEventListener('popstate', function () {
      window.dispatchEvent(new Event('locationchange'));
    });
    window.addEventListener('locationchange', function () {
      log('SPA nav:', location.pathname);
      handleNav();
    });
  }

  var _navTimer = null;
  async function handleNav() {
    if (_navTimer) clearTimeout(_navTimer);
    _navTimer = setTimeout(async function () {
      _navTimer = null;
      LoginHelperModule.reset();
      RoutineGeneratorModule.reset();
      OfferedCoursesEnhancerModule.reset();

      if (_settings) {
        applyDarkMode(_settings.enabled && _settings.theme === 'dark');
        injectThemeToggle();
      }

      var pi = detectPage();
      log('Nav ->', pi ? pi.id : 'not a target page');

      if (_settings && _settings.enabled) loadModules(pi, _settings);
    }, 500);
  }


  /* ===========================================================
     MAIN INITIALIZATION
     =========================================================== */

  async function main() {
    log('EWU Portal Helper v' + CONFIG.VERSION + ' starting...');
    _settings = await loadSettings();

    if (!location.href.startsWith(CONFIG.PORTAL_BASE)) return;

    applyDarkMode(_settings.enabled && _settings.theme === 'dark');

    var toggleInterval = setInterval(function () {
      if (safeQuery('.navbar-right')) {
        injectThemeToggle();
        clearInterval(toggleInterval);
      }
    }, 250);
    setTimeout(function () { clearInterval(toggleInterval); }, 8000);

    // Set up tab sync via storage listener
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName === 'local' && changes[CONFIG.STORAGE_KEY]) {
          var ns = changes[CONFIG.STORAGE_KEY].newValue;
          if (ns) {
            handleSettingsUpdate(ns);
          }
        }
      });
    }

    setupSPA();

    var pageInfo = detectPage();
    if (!pageInfo) {
      log('Not a target page, extension idle.');
      return;
    }

    log('Target page:', pageInfo.id, '-', pageInfo.label);
    applyBodyClasses(_settings);

    if (_settings.enabled) {
      Toast.show('Extension active', 'success', 2500);
    }

    loadModules(pageInfo, _settings);
    log('Ready');
  }

  main();

})();

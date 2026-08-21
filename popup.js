/* =============================================================
   EWU Buddy - Cyber Command Settings Popup Script
   ============================================================= */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     CONSTANTS & DEFAULTS
     ----------------------------------------------------------- */
  const STORAGE_KEY = 'ewu_portal_helper_settings';
  const LOG_PREFIX = '[EWU Cyber Settings]';

  const DEFAULT_SETTINGS = {
    enabled: true,
    theme: 'dark',
    animations: true,
    toastNotifications: true,
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
      scheduleEnhancer: true,
      scheduleEmailLink: true,
      scheduleSummaryCard: true,
      offeredCoursesEnhancer: true,
      offeredCoursesColorLeft: true,
      offeredCoursesStickyHeader: true,
      offeredCoursesSearchBox: true,
      offeredCoursesSearchPlaceholder: 'Search by course or faculty...',
      advisingTableEnhancer: true,
      advisingColorLeft: true,
      advisingSearchBox: true,
      advisingOffline: true,
      advisingOfflineRecommended: true,
      advisingOfflinePlanner: true,
      plannerCreditLimit: 15.0
    }
  };

  /* -----------------------------------------------------------
     DOM REFERENCES
     ----------------------------------------------------------- */
  const els = {
    // Quick Search & Tabs
    settingsSearch: document.getElementById('settingsSearch'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    settingGroups: document.querySelectorAll('.setting-group'),
    settingCards: document.querySelectorAll('.setting-card'),

    // Master / General
    toggleEnabled: document.getElementById('toggleEnabled'),
    toggleToast: document.getElementById('toggleToast'),
    toggleAnimations: document.getElementById('toggleAnimations'),

    // Advising Offline
    toggleAdvisingOffline: document.getElementById('toggleAdvisingOffline'),
    toggleOfflineRecommended: document.getElementById('toggleOfflineRecommended'),
    toggleOfflinePlanner: document.getElementById('toggleOfflinePlanner'),
    inputPlannerCreditLimit: document.getElementById('inputPlannerCreditLimit'),
    subAdvisingOffline: document.getElementById('subAdvisingOffline'),

    // Online Advising
    toggleAdvisingEnhancer: document.getElementById('toggleAdvisingEnhancer'),
    toggleAdvColorLeft: document.getElementById('toggleAdvColorLeft'),
    toggleAdvSearchBox: document.getElementById('toggleAdvSearchBox'),
    subAdvisingOnline: document.getElementById('subAdvisingOnline'),

    // Offered Courses
    toggleOfferedCourses: document.getElementById('toggleOfferedCourses'),
    toggleOCStickyHeader: document.getElementById('toggleOCStickyHeader'),
    toggleOCColorLeft: document.getElementById('toggleOCColorLeft'),
    toggleOCSearchBox: document.getElementById('toggleOCSearchBox'),
    inputOCSearchPlaceholder: document.getElementById('inputOCSearchPlaceholder'),
    subOfferedCourses: document.getElementById('subOfferedCourses'),

    // Routine Generator & Schedule Enhancer
    toggleRoutine: document.getElementById('toggleRoutine'),
    toggleCompact: document.getElementById('toggleCompact'),
    toggleShowLogo: document.getElementById('toggleShowLogo'),
    selectBlueIntensity: document.getElementById('selectBlueIntensity'),
    selectExportQuality: document.getElementById('selectExportQuality'),
    subRoutine: document.getElementById('subRoutine'),

    toggleScheduleEnhancer: document.getElementById('toggleScheduleEnhancer'),
    toggleScheduleEmailLink: document.getElementById('toggleScheduleEmailLink'),
    toggleScheduleSummaryCard: document.getElementById('toggleScheduleSummaryCard'),
    subScheduleEnhancer: document.getElementById('subScheduleEnhancer'),

    // Login Helper
    toggleLoginHelper: document.getElementById('toggleLoginHelper'),
    toggleAutoFill: document.getElementById('toggleAutoFill'),
    inputDelay: document.getElementById('inputDelay'),
    toggleDebug: document.getElementById('toggleDebug'),
    subLogin: document.getElementById('subLogin'),

    // Data Management
    btnExport: document.getElementById('btnExport'),
    btnImport: document.getElementById('btnImport'),
    btnReset: document.getElementById('btnReset'),
    fileImport: document.getElementById('fileImport'),

    // Toast
    toast: document.getElementById('toast'),
  };

  /* -----------------------------------------------------------
     UTILITY HELPERS
     ----------------------------------------------------------- */
  function log(...args) { console.log(LOG_PREFIX, ...args); }

  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
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

  function showToast(message, duration) {
    duration = duration || 2000;
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('show');
    setTimeout(() => { els.toast.classList.remove('show'); }, duration);
  }

  /* -----------------------------------------------------------
     SETTINGS STORAGE & BROADCAST
     ----------------------------------------------------------- */
  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        const stored = result[STORAGE_KEY] || {};
        resolve(deepMerge(structuredClone(DEFAULT_SETTINGS), stored));
      });
    });
  }

  function saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: settings }, resolve);
    });
  }

  function broadcastSettings(settings) {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;
    chrome.tabs.query({ url: 'https://portal.ewubd.edu/*' }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EWU_SETTINGS_UPDATED',
          settings: settings,
        }).catch(() => {});
      }
    });
  }

  /* -----------------------------------------------------------
     RENDER UI FROM SETTINGS
     ----------------------------------------------------------- */
  function renderUI(settings) {
    const mods = settings.modules || {};

    // General
    els.toggleEnabled.checked = settings.enabled !== false;
    els.toggleToast.checked = settings.toastNotifications !== false;
    els.toggleAnimations.checked = settings.animations !== false;

    // Advising Offline
    els.toggleAdvisingOffline.checked = mods.advisingOffline !== false;
    els.toggleOfflineRecommended.checked = mods.advisingOfflineRecommended !== false;
    els.toggleOfflinePlanner.checked = mods.advisingOfflinePlanner !== false;
    els.inputPlannerCreditLimit.value = typeof mods.plannerCreditLimit === 'number' ? mods.plannerCreditLimit : 15.0;
    updateSubVisibility(els.subAdvisingOffline, mods.advisingOffline !== false);

    // Online Advising
    els.toggleAdvisingEnhancer.checked = mods.advisingTableEnhancer !== false;
    els.toggleAdvColorLeft.checked = mods.advisingColorLeft !== false;
    els.toggleAdvSearchBox.checked = mods.advisingSearchBox !== false;
    updateSubVisibility(els.subAdvisingOnline, mods.advisingTableEnhancer !== false);

    // Offered Courses
    els.toggleOfferedCourses.checked = mods.offeredCoursesEnhancer !== false;
    els.toggleOCStickyHeader.checked = mods.offeredCoursesStickyHeader !== false;
    els.toggleOCColorLeft.checked = mods.offeredCoursesColorLeft !== false;
    els.toggleOCSearchBox.checked = mods.offeredCoursesSearchBox !== false;
    els.inputOCSearchPlaceholder.value = mods.offeredCoursesSearchPlaceholder || 'Search by course or faculty...';
    updateSubVisibility(els.subOfferedCourses, mods.offeredCoursesEnhancer !== false);

    // Routine Generator & Schedule Enhancer
    els.toggleRoutine.checked = mods.routineGenerator !== false;
    els.toggleCompact.checked = !!mods.routineCompact;
    els.toggleShowLogo.checked = mods.routineShowLogo !== false;
    els.selectBlueIntensity.value = mods.routineBlueIntensity || 'medium';
    els.selectExportQuality.value = mods.routineExportQuality || 'standard';
    updateSubVisibility(els.subRoutine, mods.routineGenerator !== false);

    els.toggleScheduleEnhancer.checked = mods.scheduleEnhancer !== false;
    els.toggleScheduleEmailLink.checked = mods.scheduleEmailLink !== false;
    els.toggleScheduleSummaryCard.checked = mods.scheduleSummaryCard !== false;
    updateSubVisibility(els.subScheduleEnhancer, mods.scheduleEnhancer !== false);

    // Login Helper
    els.toggleLoginHelper.checked = mods.loginHelper !== false;
    els.toggleAutoFill.checked = mods.loginHelperAutoFill !== false;
    els.inputDelay.value = typeof mods.loginHelperDelay === 'number' ? mods.loginHelperDelay : 300;
    els.toggleDebug.checked = !!mods.loginHelperDebug;
    updateSubVisibility(els.subLogin, mods.loginHelper !== false);
  }

  function updateSubVisibility(containerEl, isVisible) {
    if (!containerEl) return;
    containerEl.style.display = isVisible ? 'flex' : 'none';
  }

  /* -----------------------------------------------------------
     BIND EVENTS
     ----------------------------------------------------------- */
  function bindEvents() {

    // Tab Filter Navigation
    els.tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        els.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');

        els.settingGroups.forEach((grp) => {
          const groupName = grp.getAttribute('data-group');
          if (tab === 'all' || groupName === tab) {
            grp.style.display = 'block';
          } else {
            grp.style.display = 'none';
          }
        });
      });
    });

    // Quick Search Settings
    if (els.settingsSearch) {
      els.settingsSearch.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        if (!query) {
          els.settingCards.forEach(c => c.style.display = 'block');
          els.settingGroups.forEach(g => g.style.display = 'block');
          return;
        }

        els.settingCards.forEach((card) => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(query) ? 'block' : 'none';
        });

        els.settingGroups.forEach((grp) => {
          const hasVisible = Array.from(grp.querySelectorAll('.setting-card')).some(c => c.style.display !== 'none');
          grp.style.display = hasVisible ? 'block' : 'none';
        });
      });
    }

    // Helper to mutate & persist
    async function updateSetting(fn, toastMsg) {
      const s = await loadSettings();
      fn(s);
      await saveSettings(s);
      broadcastSettings(s);
      if (toastMsg) showToast(toastMsg);
    }

    // Master & General
    els.toggleEnabled.addEventListener('change', () => {
      updateSetting(s => { s.enabled = els.toggleEnabled.checked; }, els.toggleEnabled.checked ? 'Extension Enabled' : 'Extension Paused');
    });
    els.toggleToast.addEventListener('change', () => {
      updateSetting(s => { s.toastNotifications = els.toggleToast.checked; }, 'Toast setting saved');
    });
    els.toggleAnimations.addEventListener('change', () => {
      updateSetting(s => { s.animations = els.toggleAnimations.checked; }, 'Animations updated');
    });

    // Advising Offline Suite
    els.toggleAdvisingOffline.addEventListener('change', () => {
      const checked = els.toggleAdvisingOffline.checked;
      updateSubVisibility(els.subAdvisingOffline, checked);
      updateSetting(s => { s.modules.advisingOffline = checked; }, checked ? 'Advising Offline Enabled' : 'Advising Offline Disabled');
    });
    els.toggleOfflineRecommended.addEventListener('change', () => {
      updateSetting(s => { s.modules.advisingOfflineRecommended = els.toggleOfflineRecommended.checked; }, 'Recommended Course updated');
    });
    els.toggleOfflinePlanner.addEventListener('change', () => {
      updateSetting(s => { s.modules.advisingOfflinePlanner = els.toggleOfflinePlanner.checked; }, 'Course Planner updated');
    });
    els.inputPlannerCreditLimit.addEventListener('change', () => {
      const limit = parseFloat(els.inputPlannerCreditLimit.value) || 15.0;
      updateSetting(s => { s.modules.plannerCreditLimit = limit; }, `Credit limit set to ${limit}`);
    });

    // Online Advising
    els.toggleAdvisingEnhancer.addEventListener('change', () => {
      const checked = els.toggleAdvisingEnhancer.checked;
      updateSubVisibility(els.subAdvisingOnline, checked);
      updateSetting(s => { s.modules.advisingTableEnhancer = checked; }, 'Advising Enhancer updated');
    });
    els.toggleAdvColorLeft.addEventListener('change', () => {
      updateSetting(s => { s.modules.advisingColorLeft = els.toggleAdvColorLeft.checked; }, 'Seat indicators updated');
    });
    els.toggleAdvSearchBox.addEventListener('change', () => {
      updateSetting(s => { s.modules.advisingSearchBox = els.toggleAdvSearchBox.checked; }, 'Advising Search updated');
    });

    // Offered Courses
    els.toggleOfferedCourses.addEventListener('change', () => {
      const checked = els.toggleOfferedCourses.checked;
      updateSubVisibility(els.subOfferedCourses, checked);
      updateSetting(s => { s.modules.offeredCoursesEnhancer = checked; }, 'Offered Courses updated');
    });
    els.toggleOCStickyHeader.addEventListener('change', () => {
      updateSetting(s => { s.modules.offeredCoursesStickyHeader = els.toggleOCStickyHeader.checked; }, 'Sticky header updated');
    });
    els.toggleOCColorLeft.addEventListener('change', () => {
      updateSetting(s => { s.modules.offeredCoursesColorLeft = els.toggleOCColorLeft.checked; }, 'Seat indicators updated');
    });
    els.toggleOCSearchBox.addEventListener('change', () => {
      updateSetting(s => { s.modules.offeredCoursesSearchBox = els.toggleOCSearchBox.checked; }, 'Course search updated');
    });
    els.inputOCSearchPlaceholder.addEventListener('change', () => {
      updateSetting(s => { s.modules.offeredCoursesSearchPlaceholder = els.inputOCSearchPlaceholder.value.trim(); }, 'Placeholder saved');
    });

    // Routine Generator
    els.toggleRoutine.addEventListener('change', () => {
      const checked = els.toggleRoutine.checked;
      updateSubVisibility(els.subRoutine, checked);
      updateSetting(s => { s.modules.routineGenerator = checked; }, 'Routine Generator updated');
    });
    els.toggleCompact.addEventListener('change', () => {
      updateSetting(s => { s.modules.routineCompact = els.toggleCompact.checked; }, 'Compact mode updated');
    });
    els.toggleShowLogo.addEventListener('change', () => {
      updateSetting(s => { s.modules.routineShowLogo = els.toggleShowLogo.checked; }, 'Logo visibility updated');
    });
    els.selectBlueIntensity.addEventListener('change', () => {
      updateSetting(s => { s.modules.routineBlueIntensity = els.selectBlueIntensity.value; }, 'Theme intensity saved');
    });
    els.selectExportQuality.addEventListener('change', () => {
      updateSetting(s => { s.modules.routineExportQuality = els.selectExportQuality.value; }, 'Export quality saved');
    });

    // Schedule Enhancer
    els.toggleScheduleEnhancer.addEventListener('change', () => {
      const checked = els.toggleScheduleEnhancer.checked;
      updateSubVisibility(els.subScheduleEnhancer, checked);
      updateSetting(s => { s.modules.scheduleEnhancer = checked; }, checked ? 'Schedule Enhancer Enabled' : 'Schedule Enhancer Disabled');
    });
    els.toggleScheduleEmailLink.addEventListener('change', () => {
      updateSetting(s => { s.modules.scheduleEmailLink = els.toggleScheduleEmailLink.checked; }, 'Faculty email links updated');
    });
    els.toggleScheduleSummaryCard.addEventListener('change', () => {
      updateSetting(s => { s.modules.scheduleSummaryCard = els.toggleScheduleSummaryCard.checked; }, 'Summary card updated');
    });

    // Login Helper
    els.toggleLoginHelper.addEventListener('change', () => {
      const checked = els.toggleLoginHelper.checked;
      updateSubVisibility(els.subLogin, checked);
      updateSetting(s => { s.modules.loginHelper = checked; }, 'Login Helper updated');
    });
    els.toggleAutoFill.addEventListener('change', () => {
      updateSetting(s => { s.modules.loginHelperAutoFill = els.toggleAutoFill.checked; }, 'Auto-fill updated');
    });
    els.inputDelay.addEventListener('change', () => {
      const delay = parseInt(els.inputDelay.value, 10) || 300;
      updateSetting(s => { s.modules.loginHelperDelay = delay; }, `Delay set to ${delay}ms`);
    });
    els.toggleDebug.addEventListener('change', () => {
      updateSetting(s => { s.modules.loginHelperDebug = els.toggleDebug.checked; }, 'Debug mode updated');
    });

    // Export Data
    els.btnExport.addEventListener('click', async () => {
      const s = await loadSettings();
      const jsonStr = JSON.stringify(s, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ewu_buddy_settings_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Settings exported successfully!');
    });

    // Import Data
    els.btnImport.addEventListener('click', () => {
      els.fileImport.click();
    });

    els.fileImport.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          const merged = deepMerge(structuredClone(DEFAULT_SETTINGS), parsed);
          await saveSettings(merged);
          broadcastSettings(merged);
          renderUI(merged);
          showToast('Settings imported successfully!');
        } catch (err) {
          showToast('Invalid JSON settings file!');
        }
      };
      reader.readAsText(file);
      els.fileImport.value = '';
    });

    // Reset Defaults
    els.btnReset.addEventListener('click', async () => {
      if (confirm('Reset all EWU Buddy settings to factory default?')) {
        const defaults = structuredClone(DEFAULT_SETTINGS);
        await saveSettings(defaults);
        broadcastSettings(defaults);
        renderUI(defaults);
        showToast('Settings reset to default!');
      }
    });

  }

  /* -----------------------------------------------------------
     INITIALIZATION
     ----------------------------------------------------------- */
  async function init() {
    log('Initializing Cyber Settings UI...');
    const settings = await loadSettings();
    renderUI(settings);
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);

})();

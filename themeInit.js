(function () {
  'use strict';
  var STORAGE_KEY = 'ewu_portal_helper_settings';
  var pn = location.pathname.toLowerCase();
  if (pn === '/' || pn === '/account/login' || pn === '/account/login/') {
    return;
  }
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(STORAGE_KEY, function (result) {
      var settings = result[STORAGE_KEY];
      if (settings && settings.enabled && settings.theme === 'dark') {
        var link = document.createElement('link');
        link.id = 'ewu-portal-dark-css';
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('portal-dark.css');
        (document.head || document.documentElement).appendChild(link);
      }
    });
  }
})();

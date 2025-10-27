/*!
 * Copy as Org-Mode - Edge/Chrome Extension
 * Refactored for Manifest V3 compatibility
 * 
 * Original work derived from copy-selection-as-markdown by 0x6b
 * https://github.com/0x6b/copy-selection-as-markdown
 *
 * MIT License
 *
 * Copyright (c) 2021 ono ono (kuanyui)
 * Copyright (c) 2017-2019 0x6b
 * Copyright (c) 2025 Seth Jano (Edge refactor)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Manifest V3 Service Worker for Chrome/Edge
// Note: Import statements may need adjustment based on build setup

interface CopyAsOrgModeOptions {
  decodeUri: boolean;
  // Add other options as needed
}

interface MyMsg {
  type: 'showBgNotification' | 'copyStringToClipboard';
  title?: string;
  message?: string;
  org?: string;
  html?: string;
}

// Default storage configuration
const DEFAULT_STORAGE: CopyAsOrgModeOptions = {
  decodeUri: true
};

let STORAGE: CopyAsOrgModeOptions = { ...DEFAULT_STORAGE };

// Initialize storage
chrome.storage.sync.get(DEFAULT_STORAGE, (result) => {
  STORAGE = { ...DEFAULT_STORAGE, ...result };
  console.log('[background] Loaded config from storage:', STORAGE);
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in STORAGE) {
        (STORAGE as any)[key] = newValue;
      }
    }
    console.log('[background] Storage changed:', STORAGE);
  }
});

// Create context menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copy-current-page-url-as-org-mode",
    title: "Copy Current Page's Title and URL as Org-Mode",
    contexts: ["page", "frame"],
    documentUrlPatterns: ["<all_urls>"]
  });

  chrome.contextMenus.create({
    id: "copy-selection-as-org-mode",
    title: "Copy Selection as Org-Mode",
    contexts: ["selection"],
    documentUrlPatterns: ["<all_urls>"]
  });

  chrome.contextMenus.create({
    id: "copy-link-as-org-mode",
    title: "Copy This Link as Org-Mode",
    contexts: ["link"],
    documentUrlPatterns: ["<all_urls>"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) {
    console.error('[background] No tab ID available');
    return;
  }

  switch (info.menuItemId) {
    case "copy-selection-as-org-mode":
    case "copy-current-page-url-as-org-mode":
      // Inject content script to handle copying
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['dist/content.js']
      }).then(() => {
        // Send message to content script
        chrome.tabs.sendMessage(tab.id!, {
          type: info.menuItemId,
          action: 'copy'
        });
      }).catch(console.error);
      break;

    case "copy-link-as-org-mode":
      if (info.linkText && info.linkUrl) {
        const linkText = info.linkText.replace(/([\\`*_[\]<>])/g, "\\$1");
        let linkUrl = info.linkUrl;
        
        if (STORAGE.decodeUri) {
          try {
            linkUrl = decodeURI(linkUrl);
          } catch (e) {
            console.warn('[background] Failed to decode URI:', e);
          }
        }
        
        const orgText = `[[${linkUrl}][${linkText}]]`;
        copyToClipboard(orgText, tab.id);
      }
      break;
  }
});

// Handle action button clicks (toolbar button)
chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) {
    console.error('[background] No tab ID available');
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['dist/content.js']
  }).then(() => {
    chrome.tabs.sendMessage(tab.id!, {
      type: 'copy-selection-as-org-mode',
      action: 'copy'
    });
  }).catch(console.error);
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message: MyMsg, sender, sendResponse) => {
  switch (message.type) {
    case 'showBgNotification':
      if (message.title && message.message) {
        showNotification(message.title, message.message);
      }
      break;

    case 'copyStringToClipboard':
      if (message.org && sender.tab?.id) {
        copyToClipboard(message.org, sender.tab.id);
      }
      break;
  }
});

// Utility functions
function getDigest(str: string, maxLen: number): string {
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

function showNotification(title: string, message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'img/icon-48.png',
    title: title,
    message: getDigest(message, 200)
  });
}

function copyToClipboard(text: string, tabId: number) {
  // Use the newer chrome.scripting API for Manifest V3
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (textToCopy: string) => {
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('[content] Successfully copied to clipboard');
      }).catch((err) => {
        console.error('[content] Failed to copy to clipboard:', err);
        // Fallback to older method
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    },
    args: [text]
  }).then(() => {
    showNotification('Copied!', `Copied as Org-mode: ${getDigest(text, 100)}`);
  }).catch((err) => {
    console.error('[background] Failed to execute copy script:', err);
  });
}

// Export for use in other modules if needed
export { showNotification, copyToClipboard };


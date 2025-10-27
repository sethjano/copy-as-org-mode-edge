/*!
 * Content Script for Copy as Org-Mode Extension
 * Handles page content extraction and conversion to Org-mode format
 */

// Import the conversion functionality (will need to adapt these)
// import { getSelectionAndConvertToOrgMode } from "./converter/selection";

interface MessageFromBackground {
  type: string;
  action: string;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: MessageFromBackground, sender, sendResponse) => {
  switch (message.type) {
    case 'copy-selection-as-org-mode':
      handleCopySelection();
      break;
    case 'copy-current-page-url-as-org-mode':
      handleCopyPageUrl();
      break;
  }
});

function handleCopySelection() {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === '') {
    showInPageNotification('No text selected', 'Please select some text to copy as Org-mode format.');
    return;
  }

  try {
    // For now, let's do a basic conversion
    // TODO: Implement full HTML to Org-mode conversion
    const selectedText = selection.toString();
    const orgText = convertToBasicOrgMode(selectedText);
    
    // Send to background script for clipboard handling
    chrome.runtime.sendMessage({
      type: 'copyStringToClipboard',
      org: orgText,
      html: getSelectionHTML()
    });

  } catch (error) {
    console.error('[content] Error converting selection:', error);
    showInPageNotification('Error', 'Failed to convert selection to Org-mode format.');
  }
}

function handleCopyPageUrl() {
  const title = document.title;
  const url = window.location.href;
  const orgText = `[[${url}][${title}]]`;
  
  chrome.runtime.sendMessage({
    type: 'copyStringToClipboard',
    org: orgText,
    html: `<a href="${url}">${title}</a>`
  });
}

function getSelectionHTML(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';
  
  const range = selection.getRangeAt(0);
  const div = document.createElement('div');
  div.appendChild(range.cloneContents());
  return div.innerHTML;
}

function convertToBasicOrgMode(text: string): string {
  // Basic conversion - this should be enhanced with the full converter
  let orgText = text;
  
  // Convert basic formatting (this is very basic, needs enhancement)
  orgText = orgText.replace(/\n\s*\n/g, '\n\n'); // Normalize paragraphs
  orgText = orgText.replace(/^\s*[-*]\s+/gm, '- '); // Normalize list items
  
  return orgText;
}

function showInPageNotification(title: string, message: string) {
  // Create a simple in-page notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
    <div>${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Export for testing if needed
export { handleCopySelection, handleCopyPageUrl, convertToBasicOrgMode };

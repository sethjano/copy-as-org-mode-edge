/*!
 * Options management for Copy as Org-Mode Extension
 * Simplified version for Edge/Chrome compatibility
 * 
 * Original work by ono ono (kuanyui)
 * Adapted for Manifest V3 by Seth Jano
 */

// Simplified options interface for Edge/Chrome version
export interface CopyAsOrgModeOptions {
  decodeUri: boolean;
  preserveFormatting: boolean;
  convertTables: boolean;
  showNotifications: boolean;
}

// Default options
export const DEFAULT_OPTIONS: CopyAsOrgModeOptions = {
  decodeUri: true,
  preserveFormatting: true,
  convertTables: true,
  showNotifications: true
};

// Options management class
export class OptionsManager {
  private options: CopyAsOrgModeOptions = { ...DEFAULT_OPTIONS };

  async loadOptions(): Promise<CopyAsOrgModeOptions> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_OPTIONS, (result) => {
        this.options = { ...DEFAULT_OPTIONS, ...result };
        resolve(this.options);
      });
    });
  }

  async saveOptions(options: Partial<CopyAsOrgModeOptions>): Promise<void> {
    return new Promise((resolve, reject) => {
      const updatedOptions = { ...this.options, ...options };
      chrome.storage.sync.set(updatedOptions, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          this.options = updatedOptions;
          resolve();
        }
      });
    });
  }

  getOptions(): CopyAsOrgModeOptions {
    return { ...this.options };
  }

  onOptionsChanged(callback: (options: CopyAsOrgModeOptions) => void): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        let hasChanges = false;
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key in this.options) {
            (this.options as any)[key] = newValue;
            hasChanges = true;
          }
        }
        if (hasChanges) {
          callback(this.options);
        }
      }
    });
  }
}

// Options page functionality
export function initializeOptionsPage(): void {
  const optionsManager = new OptionsManager();

  // Load current options and populate form
  optionsManager.loadOptions().then((options) => {
    const decodeUriCheckbox = document.getElementById('decodeUri') as HTMLInputElement;
    const preserveFormattingCheckbox = document.getElementById('preserveFormatting') as HTMLInputElement;
    const convertTablesCheckbox = document.getElementById('convertTables') as HTMLInputElement;
    const showNotificationsCheckbox = document.getElementById('showNotifications') as HTMLInputElement;

    if (decodeUriCheckbox) decodeUriCheckbox.checked = options.decodeUri;
    if (preserveFormattingCheckbox) preserveFormattingCheckbox.checked = options.preserveFormatting;
    if (convertTablesCheckbox) convertTablesCheckbox.checked = options.convertTables;
    if (showNotificationsCheckbox) showNotificationsCheckbox.checked = options.showNotifications;

    // Add change listeners
    const checkboxes = [decodeUriCheckbox, preserveFormattingCheckbox, convertTablesCheckbox, showNotificationsCheckbox];
    checkboxes.forEach(checkbox => {
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          const newOptions: Partial<CopyAsOrgModeOptions> = {};
          if (decodeUriCheckbox) newOptions.decodeUri = decodeUriCheckbox.checked;
          if (preserveFormattingCheckbox) newOptions.preserveFormatting = preserveFormattingCheckbox.checked;
          if (convertTablesCheckbox) newOptions.convertTables = convertTablesCheckbox.checked;
          if (showNotificationsCheckbox) newOptions.showNotifications = showNotificationsCheckbox.checked;

          optionsManager.saveOptions(newOptions).then(() => {
            showSaveStatus();
          }).catch((error) => {
            console.error('Failed to save options:', error);
          });
        });
      }
    });
  });
}

function showSaveStatus(): void {
  const saveStatus = document.getElementById('saveStatus');
  if (saveStatus) {
    saveStatus.style.display = 'block';
    saveStatus.classList.add('success');
    setTimeout(() => {
      saveStatus.style.display = 'none';
      saveStatus.classList.remove('success');
    }, 2000);
  }
}

// Initialize options page when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeOptionsPage);
}

/**
 * QC Portal Documentation File Watcher (Root-Level Version)
 * Run this script to keep docs.json updated automatically during development.
 * Command: node watch-docs.js
 */

const { watch } = require('fs');
const { exec } = require('child_process');
const path = require('path');

const ROOT_DIR = __dirname;
const BUILD_SCRIPT = path.join(__dirname, 'update-docs.js');

console.log(`[Watcher] Starting to monitor: ${ROOT_DIR}`);
console.log(`[Watcher] Will automatically run: node update-docs.js on file changes.`);

let debounceTimer = null;

// System folders to ignore
const ignoredFolders = ['images', 'brain', 'node_modules', '.git', '.github', '.gemini', 'docs'];

function triggerBuild() {
  if (debounceTimer) clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(() => {
    console.log('[Watcher] File change detected. Rebuilding docs.json...');
    exec(`node "${BUILD_SCRIPT}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Watcher] Rebuild error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`[Watcher] Rebuild stderr: ${stderr}`);
        return;
      }
      console.log(`[Watcher] Rebuild success:\n${stdout.trim()}`);
    });
  }, 200); // 200ms debounce
}

// Initial run on startup to ensure in-sync state
triggerBuild();

try {
  // Watch recursively on macOS
  watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      // Check if filename path starts with any of the ignored folders
      const firstPart = filename.split(path.sep)[0].toLowerCase();
      if (ignoredFolders.includes(firstPart)) {
        return;
      }
      console.log(`[Watcher] Change in ${filename} (${eventType})`);
      triggerBuild();
    }
  });
} catch (err) {
  console.error('[Watcher] Failed to start watcher recursively. Falling back to non-recursive watch.', err);
  // Fallback to non-recursive watch
  watch(ROOT_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      triggerBuild();
    }
  });
}

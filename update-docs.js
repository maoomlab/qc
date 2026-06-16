/**
 * QC Portal Static Document Indexer
 * Run this script with: node update-docs.js
 * 
 * It scans the docs/ folder recursively, reads each markdown file's title and description,
 * It scans the root folder recursively, reads each markdown file's title and description,
 * groups them by subfolders, and generates/updates docs.json.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const CONFIG_FILE = path.join(__dirname, 'docs.json');

// Category mapping dictionary
const categoryMap = {
  'legal': '차량 개발 법규',
  'guide': '기술문서 작성 가이드',
  'docs': '기타 문서',
  'EU-Legal': '차량 개발 법규',
  'QC-Guide': '기술문서 작성 가이드',
  'eu-legal': '차량 개발 법규',
  'qc-guide': '기술문서 작성 가이드'
};

// Emoji Shortcode Translation Map
const emojiMap = {
  'open_book': '📖',
  'dart': '🎯',
  'writing_hand': '✍️',
  'pushpin': '📌',
  'o': '⭕',
  'x': '❌',
  'bulb': '💡',
  'warning': '⚠️',
  'info': 'ℹ️',
  'check': '✔️',
  'white_check_mark': '✅',
  'link': '🔗',
  'bookmark': '🔖',
  'file_folder': '📁',
  'calendar': '📅',
  'gear': '⚙️',
  'wrench': '🔧',
  'shield': '🛡️',
  'lock': '🔒',
  'key': '🔑'
};

function replaceEmojiShortcodes(text) {
  if (!text) return '';
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, name) => {
    return emojiMap[name] || match;
  });
}

// System folders/files to ignore
const ignoredFolders = ['images', 'brain', 'node_modules', '.git', '.github', '.gemini', 'docs'];
const ignoredFiles = ['index.html', 'styles.css', 'style.css', 'app.js', 'update-docs.js', 'watch-docs.js', 'docs.json', 'package.json', 'package-lock.json', 'readme.md', '.ds_store'];

function scanFolder() {
  console.log('Scanning root folder for categories...');
  const mdFiles = [];
  
  const items = fs.readdirSync(ROOT_DIR);
  
  items.forEach(item => {
    const fullPath = path.join(ROOT_DIR, item);
    const stat = fs.statSync(fullPath);
    const lowerItem = item.toLowerCase();
    
    // Ignore ignored folders/files and hidden directories
    if (ignoredFolders.includes(lowerItem) || ignoredFiles.includes(lowerItem) || item.startsWith('.')) {
      return;
    }
    
    if (stat.isFile() && item.endsWith('.md')) {
      mdFiles.push({ relativePath: item, category: '기타 문서' });
    } else if (stat.isDirectory()) {
      // Scan subdirectory (1-level deep)
      const subItems = fs.readdirSync(fullPath);
      subItems.forEach(subItem => {
        const subFullPath = path.join(fullPath, subItem);
        const subStat = fs.statSync(subFullPath);
        
        if (subStat.isFile() && subItem.endsWith('.md')) {
          mdFiles.push({
            relativePath: path.join(item, subItem),
            category: item
          });
        }
      });
    }
  });

  const categoriesMap = {};

  mdFiles.forEach(fileInfo => {
    try {
      const absoluteMdPath = path.join(ROOT_DIR, fileInfo.relativePath);
      const fileContent = fs.readFileSync(absoluteMdPath, 'utf-8');
      
      let title = '';
      let description = '';
      let markdownBody = fileContent;
      
      // Define path of the separate metadata JSON file (e.g. EU-Legal/EU_Legal.json)
      const baseNameWithoutExt = fileInfo.relativePath.substring(0, fileInfo.relativePath.lastIndexOf('.'));
      const jsonMetaPath = path.join(ROOT_DIR, baseNameWithoutExt + '.json');
      // Define path of the separate metadata markdown file (e.g. EU-Legal/EU_Legal.meta.md)
      const mdMetaPath = path.join(ROOT_DIR, baseNameWithoutExt + '.meta.md');
      
      if (fs.existsSync(jsonMetaPath)) {
        // Option 1: Parse from a separate metadata JSON file
        try {
          const jsonContent = JSON.parse(fs.readFileSync(jsonMetaPath, 'utf-8'));
          title = jsonContent.title || '';
          description = jsonContent.description || '';
        } catch (e) {
          console.error(`Failed to parse separate JSON metadata at ${jsonMetaPath}:`, e);
        }
      } else if (fs.existsSync(mdMetaPath)) {
        // Option 2: Parse from a separate metadata markdown file
        try {
          const metaContent = fs.readFileSync(mdMetaPath, 'utf-8');
          const titleMatch = metaContent.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : '';
          
          const paragraphs = metaContent.split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 15 && !p.startsWith('#') && !p.startsWith('>') && !p.startsWith('|') && !p.startsWith('-') && !p.startsWith('*') && !p.startsWith('!'));
          description = paragraphs.length > 0 ? paragraphs[0].substring(0, 140).trim() + '...' : '';
        } catch (e) {
          console.error(`Failed to parse separate markdown metadata at ${mdMetaPath}:`, e);
        }
      }
      
      // Fallback: If not parsed from separate files, check for embedded Front Matter or auto-extract
      if (!title || !description) {
        let embeddedTitle = '';
        let embeddedDescription = '';
        
        const frontMatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (frontMatterMatch) {
          markdownBody = fileContent.substring(frontMatterMatch[0].length);
          const lines = frontMatterMatch[1].split('\n');
          lines.forEach(line => {
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0) {
              const key = line.substring(0, colonIdx).trim().toLowerCase();
              let val = line.substring(colonIdx + 1).trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.substring(1, val.length - 1);
              }
              if (key === 'title') embeddedTitle = val;
              else if (key === 'description') embeddedDescription = val;
            }
          });
        }
        
        if (!title) {
          if (embeddedTitle) {
            title = embeddedTitle;
          } else {
            const titleMatch = markdownBody.match(/^#\s+(.+)$/m);
            title = titleMatch ? titleMatch[1].trim() : path.basename(fileInfo.relativePath, '.md');
          }
        }
        
        if (!description) {
          if (embeddedDescription) {
            description = embeddedDescription;
          } else {
            const paragraphs = markdownBody.split('\n')
              .map(p => p.trim())
              .filter(p => p.length > 15 && !p.startsWith('#') && !p.startsWith('>') && !p.startsWith('|') && !p.startsWith('-') && !p.startsWith('*') && !p.startsWith('!'));
            description = paragraphs.length > 0 ? paragraphs[0].substring(0, 140).trim() + '...' : '문서의 세부 사항 및 작성 가이드 내용입니다.';
          }
        }
      }
      
      title = replaceEmojiShortcodes(title);
      description = replaceEmojiShortcodes(description);
      
      // Category routing for original files at root
      let finalCategory = fileInfo.category;
      const normalizedPath = fileInfo.relativePath.replace(/\\/g, '/'); // Normalize windows paths
      
      const filename = path.basename(normalizedPath);
      if (filename === 'eu-legal.md' || filename === 'EU_Legal.md') {
        finalCategory = '차량 개발 법규';
      } else if (filename === 'qc-guide.md' || filename === 'QC_Guide.md') {
        finalCategory = '기술문서 작성 가이드';
      } else if (fileInfo.category === '기타 문서') {
        // Auto-detect based on filename keywords for root-level added documents
        const nameLower = normalizedPath.toLowerCase();
        if (nameLower.includes('legal') || nameLower.includes('법규') || nameLower.includes('rule') || nameLower.includes('eu')) {
          finalCategory = '차량 개발 법규';
        } else if (nameLower.includes('guide') || nameLower.includes('가이드') || nameLower.includes('write') || nameLower.includes('writing') || nameLower.includes('standard') || nameLower.includes('tw') || nameLower.includes('qc')) {
          finalCategory = '기술문서 작성 가이드';
        }
      }
      
      const catName = categoryMap[finalCategory] || finalCategory;
      
      if (!categoriesMap[catName]) {
        categoriesMap[catName] = [];
      }
      
      const fileId = normalizedPath.replace(/\.md$/, '').replace(/\//g, '-');
      
      let icon = 'file-lines';
      if (catName.includes('법규') || catName.toLowerCase().includes('legal')) {
        icon = 'shield';
      } else if (catName.includes('가이드') || catName.toLowerCase().includes('guide') || catName.toLowerCase().includes('writing')) {
        icon = 'edit';
      }
      
      categoriesMap[catName].push({
        id: fileId,
        title: title,
        file: normalizedPath,
        description: description,
        icon: icon
      });
    } catch (e) {
      console.error(`Failed to parse file: ${fileInfo.relativePath}`, e);
    }
  });

  // Convert categories map to configuration list
  const categories = Object.keys(categoriesMap).map(name => ({
    name: name,
    items: categoriesMap[name]
  }));

  // Alphabetical sort within category
  categories.forEach(cat => {
    cat.items.sort((a, b) => a.title.localeCompare(b.title));
  });

  const configData = { categories };
  
  // Write to docs.json
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8');
  console.log(`Success! Dynamic config saved to ${CONFIG_FILE}`);
  console.log(`Indexed ${mdFiles.length} markdown documents.`);
}

scanFolder();

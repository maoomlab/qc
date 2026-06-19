// ==========================================================================
// QC Document Portal JavaScript Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    config: null,
    currentView: 'landing',
    activeDocId: null,
    docsCache: {},
    searchIndex: [],
    theme: 'light',
    isManualScrolling: false,
    manualScrollTimeout: null,
    clickedActiveId: null,
    expectedScrollY: null
  };

  // DOM Elements
  const headerSearch = document.getElementById('header-search');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const searchResultsDropdown = document.getElementById('search-results-dropdown');
  const landingSearch = document.getElementById('landing-search');
  const landingSearchResults = document.getElementById('landing-search-results');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const logoBtn = document.getElementById('logo-btn');
  
  // Header Navigation links
  const navHome = document.getElementById('nav-home');
  const navDocsBtn = document.getElementById('nav-docs-btn');
  const docsDropdownMenu = document.getElementById('docs-dropdown-menu');
  
  const landingView = document.getElementById('landing-view');
  const docView = document.getElementById('doc-view');
  const landingCardsContainer = document.getElementById('landing-cards-container');
  const sidebarNavContainer = document.getElementById('sidebar-nav-container');
  const markdownContainer = document.getElementById('markdown-container');
  const docMainTitle = document.getElementById('doc-main-title');
  const docMainDesc = document.getElementById('doc-main-desc');
  const docBreadcrumbs = document.getElementById('doc-breadcrumbs');
  const readingTimeSpan = document.getElementById('reading-time');
  const tocListContainer = document.getElementById('toc-list-container');
  const printDocBtn = document.getElementById('print-doc-btn');
  const imageModal = document.getElementById('image-modal');
  const imageModalContent = document.getElementById('image-modal-content');
  
  // Mobile elements
  const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  const sidebarLeft = document.getElementById('sidebar-left');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const mobileActiveDoc = document.querySelector('.mobile-active-doc');


  // Release TOC highlight lock on direct user scroll interaction
  const releaseTOCLock = () => {
    state.clickedActiveId = null;
    state.expectedScrollY = null;
  };
  window.addEventListener('wheel', releaseTOCLock, { passive: true });
  window.addEventListener('touchmove', releaseTOCLock, { passive: true });
  window.addEventListener('keydown', (e) => {
    const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'];
    if (keys.includes(e.key)) {
      releaseTOCLock();
    }
    
    // Close image modal on ESC key
    if (e.key === 'Escape' && imageModal && imageModal.classList.contains('open')) {
      imageModal.classList.remove('open');
      setTimeout(() => {
        imageModal.style.display = 'none';
      }, 200);
    }
  }, { passive: true });

  // Close image zoom modal when clicked anywhere inside it
  if (imageModal) {
    imageModal.addEventListener('click', () => {
      imageModal.classList.remove('open');
      setTimeout(() => {
        imageModal.style.display = 'none';
      }, 200);
    });
  }



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

  // Initialize Theme
  initTheme();
  
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

  // Load configuration exclusively from docs.json (bypassing brittle directory scans)
  async function scanDocsFolder() {
    try {
      const res = await fetch('docs.json');
      if (!res.ok) throw new Error('docs.json 파일을 불러오는데 실패했습니다.');
      return await res.json();
    } catch (error) {
      console.error('Failed to load docs.json:', error);
      throw error;
    }
  }

  // Fetch Config and Start Application
  scanDocsFolder()
    .then(configData => {
      state.config = configData;
      buildNavigation();
      buildSearchIndex();
      handleRouting();
    })
    .catch(error => {
      console.error('Portal startup failed:', error);
      markdownContainer.innerHTML = `<div class="no-results"><i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: #ef4444;"></i><br><br>문서 설정을 초기화하는 데 실패했습니다.</div>`;
    });

  // Hash change routing
  window.addEventListener('hashchange', handleRouting);

  // Theme Toggler
  themeToggleBtn.addEventListener('click', () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });

  // Nav actions
  logoBtn.addEventListener('click', () => { window.location.hash = '#/'; });
  printDocBtn.addEventListener('click', () => { window.print(); });

  // Toggle Docs Dropdown
  navDocsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    docsDropdownMenu.classList.toggle('open');
  });

  // Mobile sidebar triggers
  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener('click', () => {
      sidebarLeft.classList.add('open');
      sidebarOverlay.style.display = 'block';
    });
  }
  
  const closeSidebarMobile = () => {
    sidebarLeft.classList.remove('open');
    sidebarOverlay.style.display = 'none';
  };
  
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebarMobile);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarMobile);

  // Setup Search functionality
  setupSearch(headerSearch, searchResultsDropdown, clearSearchBtn);
  setupSearch(landingSearch, landingSearchResults);

  // Close search dropdowns and Docs menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper') && !e.target.closest('.landing-search-container')) {
      searchResultsDropdown.style.display = 'none';
      landingSearchResults.style.display = 'none';
    }
    if (!e.target.closest('.header-dropdown-container')) {
      docsDropdownMenu.classList.remove('open');
    }
  });

  // ==========================================================================
  // Router
  // ==========================================================================
  function handleRouting() {
    const hash = window.location.hash || '#/';
    closeSidebarMobile();
    
    // Reset active header links
    if (navHome) navHome.classList.remove('active');
    navDocsBtn.classList.remove('active');
    
    if (hash === '#/' || hash === '') {
      // Show Landing Page
      state.currentView = 'landing';
      state.activeDocId = null;
      
      landingView.classList.add('active');
      docView.classList.remove('active');
      if (navHome) navHome.classList.add('active');
      document.title = "QC Document Portal";
      window.scrollTo(0, 0);
    } else if (hash.startsWith('#/docs/')) {
      // Show Doc Viewer
      state.currentView = 'doc';
      const docId = hash.split('?')[0].replace('#/docs/', '');
      state.activeDocId = docId;
      
      landingView.classList.remove('active');
      docView.classList.add('active');
      
      // Highlight Docs dropdown link in header when reading any doc
      navDocsBtn.classList.add('active');
      
      // Update sidebar nav highlighting
      document.querySelectorAll('.nav-item-btn').forEach(btn => {
        if (btn.dataset.id === docId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      loadDocument(docId);
    }
  }

  // ==========================================================================
  // Theme Helper
  // ==========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      themeToggleBtn.style.color = '#fbbf24';
    } else {
      icon.className = 'fa-solid fa-moon';
      themeToggleBtn.style.color = 'var(--text-secondary)';
    }
  }

  // ==========================================================================
  // Navigation Builder
  // ==========================================================================
  function buildNavigation() {
    if (!state.config) return;
    
    // Clear containers
    landingCardsContainer.innerHTML = '';
    sidebarNavContainer.innerHTML = '';
    docsDropdownMenu.innerHTML = '';
    
    state.config.categories.forEach(category => {
      // 1. Sidebar Category
      const groupDiv = document.createElement('div');
      groupDiv.className = 'nav-group';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'nav-group-title';
      titleDiv.textContent = category.name;
      groupDiv.appendChild(titleDiv);
      
      const ul = document.createElement('ul');
      ul.className = 'nav-group-list';
      
      // 2. Dropdown Category Group
      const dropdownGroup = document.createElement('div');
      dropdownGroup.className = 'dropdown-group';
      dropdownGroup.innerHTML = `<div class="dropdown-group-title">${category.name}</div>`;
      
      const dropdownGroupList = document.createElement('div');
      dropdownGroupList.className = 'dropdown-group-list';
      
      category.items.forEach(item => {
        // Sidebar item button
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'nav-item-btn';
        button.dataset.id = item.id;
        
        let iconClass = 'fa-file-lines';
        if (item.icon === 'shield') iconClass = 'fa-shield-halved';
        if (item.icon === 'edit') iconClass = 'fa-pen-to-square';
        
        button.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${item.title}</span>`;
        button.addEventListener('click', () => {
          window.location.hash = `#/docs/${item.id}`;
        });
        
        li.appendChild(button);
        ul.appendChild(li);
        
        // Landing Page Card
        const card = document.createElement('div');
        card.className = 'premium-card';
        card.innerHTML = `
          <div class="card-icon"><i class="fa-solid ${iconClass}"></i></div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="card-footer-link">문서 바로 읽기 <i class="fa-solid fa-arrow-right"></i></div>
        `;
        card.addEventListener('click', () => {
          window.location.hash = `#/docs/${item.id}`;
        });
        landingCardsContainer.appendChild(card);

        // Header Dropdown Menu item
        const dropdownItem = document.createElement('a');
        dropdownItem.className = 'dropdown-menu-item';
        dropdownItem.href = `#/docs/${item.id}`;
        dropdownItem.innerHTML = `
          <i class="fa-solid ${iconClass} dropdown-item-icon"></i>
          <div class="dropdown-item-content">
            <div class="dropdown-item-title">${item.title}</div>
            <div class="dropdown-item-desc">${item.description.substring(0, 50)}...</div>
          </div>
        `;
        dropdownItem.addEventListener('click', () => {
          docsDropdownMenu.classList.remove('open');
        });
        dropdownGroupList.appendChild(dropdownItem);
      });
      
      groupDiv.appendChild(ul);
      sidebarNavContainer.appendChild(groupDiv);
      
      dropdownGroup.appendChild(dropdownGroupList);
      docsDropdownMenu.appendChild(dropdownGroup);
    });
  }

  // ==========================================================================
  // Document Loader & Custom Marked Renderers
  // ==========================================================================
  function loadDocument(docId) {
    // Show skeleton loader or message
    markdownContainer.innerHTML = `<div class="no-results"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem;"></i><br><br>문서를 불러오는 중입니다...</div>`;
    
    // Find item configuration
    let activeItem = null;
    state.config.categories.forEach(cat => {
      const found = cat.items.find(i => i.id === docId);
      if (found) activeItem = found;
    });
    
    if (!activeItem) {
      markdownContainer.innerHTML = `<div class="no-results"><i class="fa-solid fa-circle-xmark"></i><br>문서를 찾을 수 없습니다.</div>`;
      return;
    }
    
    // Update breadcrumbs and active document title & description
    docMainTitle.textContent = activeItem.title;
    mobileActiveDoc.textContent = activeItem.title;
    if (docMainDesc) {
      docMainDesc.textContent = activeItem.description || '';
      docMainDesc.style.display = activeItem.description ? 'block' : 'none';
    }
    docBreadcrumbs.innerHTML = `
      <span onclick="window.location.hash='#/'">홈</span> &gt; 
      <span>문서</span> &gt; 
      <span class="active">${activeItem.title}</span>
    `;

    // Fetch markdown file contents
    const filePath = activeItem.file;
    
    if (state.docsCache[docId]) {
      renderMarkdown(state.docsCache[docId], docId);
    } else {
      fetch(filePath)
        .then(response => {
          if (!response.ok) throw new Error('File not found');
          return response.text();
        })
        .then(markdownText => {
          state.docsCache[docId] = markdownText;
          renderMarkdown(markdownText, docId);
        })
        .catch(error => {
          console.error('Error fetching document:', error);
          markdownContainer.innerHTML = `<div class="no-results"><i class="fa-solid fa-circle-exclamation"></i><br><br>문서 파일(${filePath})을 읽는 데 실패했습니다.<br>파일이 올바른 경로에 존재하는지 확인해주세요.</div>`;
        });
    }
  }

  function renderMarkdown(markdownText, docId) {
    // Strip Front Matter metadata block from rendered output
    let cleanMarkdown = markdownText;
    const frontMatterMatch = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (frontMatterMatch) {
      cleanMarkdown = markdownText.substring(frontMatterMatch[0].length);
    }

    // Set custom marked.js renderer rules
    const renderer = new marked.Renderer();
    
    // Find item configuration to get its file path
    let activeItem = null;
    if (state.config) {
      state.config.categories.forEach(cat => {
        const found = cat.items.find(i => i.id === docId);
        if (found) activeItem = found;
      });
    }

    // Rule 1: Custom Image Renderer (handles missing images gracefully)
    renderer.image = function(href, title, text) {
      let resolvedHref = href;
      if (href && activeItem && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('/') && !href.startsWith('data:')) {
        // Extract the parent directory of the current file (e.g. "EU-Legal/EU_Legal.md" -> "EU-Legal")
        const fileParts = activeItem.file.split('/');
        fileParts.pop(); // remove filename
        const dirPath = fileParts.join('/');
        if (dirPath) {
          let cleanHref = href;
          if (cleanHref.startsWith('./')) {
            cleanHref = cleanHref.substring(2);
          }
          resolvedHref = `${dirPath}/${cleanHref}`;
        }
      }

      return `<img src="${resolvedHref}" alt="${text}" onerror="handleImageError(this, '${resolvedHref}', '${text || ''}')" class="markdown-image">`;
    };

    // Rule 2: Custom Blockquote Renderer (for warning and note alerts)
    renderer.blockquote = function(quoteHtml) {
      // Analyze text of the blockquote to assign beautiful styles
      let alertClass = 'alert-note';
      let icon = '<i class="fa-solid fa-circle-info" style="margin-right:8px; font-size:1.05rem;"></i>';
      
      const cleanText = quoteHtml.toLowerCase();
      if (cleanText.includes('death') || cleanText.includes('serious injury') || cleanText.includes('사망') || cleanText.includes('부상') || cleanText.includes('경고') || cleanText.includes('위험') || cleanText.includes('금지')) {
        alertClass = 'alert-warning';
        icon = '<i class="fa-solid fa-circle-exclamation" style="margin-right:8px; font-size:1.05rem;"></i>';
      } else if (cleanText.includes('실무자') || cleanText.includes('확인') || cleanText.includes('성능') || cleanText.includes('결론')) {
        alertClass = 'alert-success';
        icon = '<i class="fa-solid fa-circle-check" style="margin-right:8px; font-size:1.05rem;"></i>';
      }
      
      // Inject icon inside the first paragraph if possible, or wrap it
      let formattedQuote = quoteHtml.trim();
      if (formattedQuote.startsWith('<p>')) {
        formattedQuote = formattedQuote.replace('<p>', `<p>${icon} `);
      } else {
        formattedQuote = `<p>${icon}</p>${formattedQuote}`;
      }
      
      return `<blockquote class="${alertClass}">${formattedQuote}</blockquote>`;
    };

    // Rule 3: Custom List Item Renderer (for checklist checkbox styling)
    renderer.listitem = function(text, task, checked) {
      if (task) {
        const checkedClass = checked ? 'checked' : 'unchecked';
        const checkedIcon = checked ? '<i class="fa-solid fa-check"></i>' : '';
        const itemClass = checked ? 'completed-task' : 'pending-task';
        
        // Strips out the default input checkbox that marked.js adds
        const cleanText = text.replace(/<input[^>]*checkbox[^>]*>/, '').trim();
        
        return `
          <li class="task-list-item ${itemClass}">
            <span class="custom-checkbox ${checkedClass}">${checkedIcon}</span>
            <span class="task-list-text">${cleanText}</span>
          </li>
        `;
      }
      return `<li>${text}</li>`;
    };

    // Rule 4: Custom Text Renderer (translates emoji shortcodes like :open_book: into unicode emojis)
    renderer.text = function(text) {
      return replaceEmojiShortcodes(text);
    };

    // Parse Markdown
    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
      headerIds: true
    });
    
    let rawHtml = marked.parse(cleanMarkdown);
    
    // Sanitize generated HTML to prevent vulnerabilities
    let cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['iframe', 'embed'], // Add any custom tags if needed
      ADD_ATTR: ['onerror', 'onload'] // Allow onerror for handles
    });
    
    markdownContainer.innerHTML = cleanHtml;
    
    // Process markdown images (resolve paths, add classes, setup error fallback cards)
    processMarkdownImages(docId);
    
    // Process code blocks for syntax highlighting and copy buttons
    processCodeBlocks();
    
    // Setup Image Zoom/Modal listeners
    setupImageZoom();
    
    // Calculate Reading Time
    calculateReadingTime(markdownText);
    
    // Generate Table of Contents
    generateTOC();
    
    // Force browser scroll to top or specific header anchor if search directed
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
    const anchor = urlParams.get('section');
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) {
          state.clickedActiveId = el.id;
          const targetScrollY = el.getBoundingClientRect().top + window.scrollY - 100;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          state.expectedScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));

          state.isManualScrolling = true;
          if (state.manualScrollTimeout) clearTimeout(state.manualScrollTimeout);

          el.scrollIntoView({ behavior: 'smooth', block: 'start' });

          state.manualScrollTimeout = setTimeout(() => {
            state.isManualScrolling = false;
          }, 800);
        }
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Set up click-to-zoom modal listeners on content images
  function setupImageZoom() {
    // Select only actual images rendered from markdown (which have the 'markdown-image' class)
    const images = markdownContainer.querySelectorAll('img.markdown-image');
    images.forEach(img => {
      img.addEventListener('click', () => {
        if (imageModal && imageModalContent) {
          imageModalContent.src = img.src;
          imageModal.style.display = 'flex';
          // Trigger browser reflow for transitions
          imageModal.offsetHeight;
          imageModal.classList.add('open');
        }
      });
    });
  }

  // Post-process all images inside the markdown container (standard markdown and raw HTML img tags)
  function processMarkdownImages(docId) {
    let activeItem = null;
    if (state.config) {
      state.config.categories.forEach(cat => {
        const found = cat.items.find(i => i.id === docId);
        if (found) activeItem = found;
      });
    }

    const images = markdownContainer.querySelectorAll('img');
    images.forEach(img => {
      // 1. Add class for styling and query ease
      if (!img.classList.contains('markdown-image')) {
        img.classList.add('markdown-image');
      }
      
      // 2. Resolve relative path based on active document directory
      const src = img.getAttribute('src');
      if (src && activeItem && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/') && !src.startsWith('data:')) {
        const fileParts = activeItem.file.split('/');
        fileParts.pop(); // remove filename
        const dirPath = fileParts.join('/');
        if (dirPath) {
          let cleanHref = src;
          if (cleanHref.startsWith('./')) {
            cleanHref = cleanHref.substring(2);
          }
          // Only prepend dirPath if it hasn't been prepended already by the marked renderer
          if (!cleanHref.startsWith(dirPath + '/')) {
            const resolvedHref = `${dirPath}/${cleanHref}`;
            img.src = resolvedHref;
          }
        }
      }
      
      // 3. Programmatically attach onerror fallback handler if not already present
      if (!img.onerror) {
        img.onerror = function() {
          handleImageError(img, img.src, img.alt || '');
        };
        
        // If image has already failed to load before we bound the handler
        if (img.complete && img.naturalWidth === 0) {
          handleImageError(img, img.src, img.alt || '');
        }
      }
    });
  }

  // Code blocks post-processing: Adding language headers and copy buttons
  function processCodeBlocks() {
    const codeBlocks = markdownContainer.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
      const codeEl = pre.querySelector('code');
      if (!codeEl) return;
      
      // Determine language name
      let language = 'CODE';
      const classes = codeEl.className.split(' ');
      const langClass = classes.find(c => c.startsWith('language-'));
      if (langClass) {
        language = langClass.replace('language-', '').toUpperCase();
      }
      
      // Create Header wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-header-container';
      wrapper.innerHTML = `
        <span>${language}</span>
        <button class="copy-code-btn"><i class="fa-regular fa-copy"></i> 복사</button>
      `;
      
      // Insert header before pre block
      pre.parentNode.insertBefore(wrapper, pre);
      
      // Setup copy click action
      const copyBtn = wrapper.querySelector('.copy-code-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeEl.textContent)
          .then(() => {
            copyBtn.innerHTML = `<i class="fa-solid fa-check" style="color: #4ade80;"></i> 완료`;
            setTimeout(() => {
              copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> 복사`;
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy code text:', err);
          });
      });
    });
    
    // Trigger Prism highlight
    if (typeof Prism !== 'undefined') {
      Prism.highlightAllUnder(markdownContainer);
    }
  }

  function calculateReadingTime(text) {
    const KoreanWpm = 250; // Korean words per minute
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / KoreanWpm));
    readingTimeSpan.textContent = minutes;
  }

  // ==========================================================================
  // Table of Contents (TOC) & Scroll Spy
  // ==========================================================================
  function generateTOC() {
    tocListContainer.innerHTML = '';
    
    // Query headings in document container
    const headings = markdownContainer.querySelectorAll('h1, h2, h3');
    
    if (headings.length === 0) {
      tocListContainer.innerHTML = `<li style="padding: 10px 12px; font-size: 0.8rem; color: var(--text-muted);">섹션이 없습니다.</li>`;
      return;
    }
    
    headings.forEach((heading, idx) => {
      // Ensure heading has an ID
      if (!heading.id) {
        // Generate slug from text
        heading.id = 'heading-' + idx + '-' + heading.textContent.toLowerCase()
          .replace(/[^\wㄱ-힣\s-]/g, '') // Keep words, space, Korean characters
          .trim()
          .replace(/\s+/g, '-');
      }
      
      const li = document.createElement('li');
      li.className = 'toc-item';
      
      const a = document.createElement('a');
      a.className = `toc-link toc-depth-${heading.tagName.substring(1)}`;
      a.textContent = heading.textContent;
      a.href = `${window.location.hash.split('?')[0]}?section=${heading.id}`;
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Save the target active ID and expected scroll position
        state.clickedActiveId = heading.id;
        const targetScrollY = heading.getBoundingClientRect().top + window.scrollY - 100;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        state.expectedScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
        
        // Disable scroll spy during manual smooth scrolling
        state.isManualScrolling = true;
        if (state.manualScrollTimeout) clearTimeout(state.manualScrollTimeout);
        
        // Highlight active link immediately
        document.querySelectorAll('.toc-link').forEach(link => link.classList.remove('active'));
        a.classList.add('active');
        
        // Add parameter to URL hash silently without trigger re-load
        const cleanHash = window.location.hash.split('?')[0];
        history.pushState(null, null, `${cleanHash}?section=${heading.id}`);
        
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        state.manualScrollTimeout = setTimeout(() => {
          state.isManualScrolling = false;
        }, 800);
      });
      
      li.appendChild(a);
      tocListContainer.appendChild(li);
    });

    // Initialize Scroll Spy functionality
    setupScrollSpy(headings);
  }

  function setupScrollSpy(headings) {
    const docLayout = document.querySelector('.doc-body');
    const scrollContainer = window; // Since document scrolls globally on this layout

    const scrollSpyHandler = () => {
      // Helper function to update active TOC link styling
      const highlightActiveTOC = (activeId) => {
        let activeLink = null;
        document.querySelectorAll('.toc-link').forEach(link => {
          const hrefSection = link.href.substring(link.href.indexOf('?section=') + 9);
          if (hrefSection === activeId) {
            if (!link.classList.contains('active')) {
              link.classList.add('active');
              activeLink = link;
            }
          } else {
            link.classList.remove('active');
          }
        });

        // Smoothly scroll the active TOC link into view within the scrollable sidebar panel
        if (activeLink) {
          activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      };

      if (state.clickedActiveId !== null) {
        if (state.isManualScrolling) {
          highlightActiveTOC(state.clickedActiveId);
          return;
        }
        if (state.expectedScrollY !== null) {
          const diff = Math.abs(window.scrollY - state.expectedScrollY);
          if (diff < 50) { // Extended threshold to 50px to handle OS bounce and minor scroll offset differences
            highlightActiveTOC(state.clickedActiveId);
            return;
          }
        }
        // Release lock if scroll position changed significantly
        state.clickedActiveId = null;
        state.expectedScrollY = null;
      }

      if (state.isManualScrolling) return; // Skip updating active item during manual click scrolling
      
      let currentActiveId = null;
      const triggerOffset = 150; // Scroll offset
      
      headings.forEach(heading => {
        const top = heading.getBoundingClientRect().top;
        if (top < triggerOffset) {
          currentActiveId = heading.id;
        }
      });
      
      if (currentActiveId) {
        highlightActiveTOC(currentActiveId);
      }
    };

    window.removeEventListener('scroll', scrollSpyHandler);
    window.addEventListener('scroll', scrollSpyHandler);
    // Trigger once
    scrollSpyHandler();
  }

  // ==========================================================================
  // Client-Side Search Engine (Index & Dynamic Query UI)
  // ==========================================================================
  function buildSearchIndex() {
    if (!state.config) return;
    
    // Index Categories and Documents description
    state.config.categories.forEach(category => {
      category.items.forEach(item => {
        // Fetch each document to index its details dynamically
        fetch(item.file)
          .then(res => res.text())
          .then(mdText => {
            // Index raw headers and paragraphs
            const lines = mdText.split('\n');
            let currentHeading = item.title;
            let currentHeadingId = '';
            
            lines.forEach((line, idx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('#')) {
                // Keep heading text
                currentHeading = trimmed.replace(/^#+\s+/, '');
                currentHeadingId = 'heading-' + idx + '-' + currentHeading.toLowerCase()
                  .replace(/[^\wㄱ-힣\s-]/g, '')
                  .trim()
                  .replace(/\s+/g, '-');
                  
                state.searchIndex.push({
                  docId: item.id,
                  docTitle: item.title,
                  type: 'heading',
                  title: currentHeading,
                  headingId: currentHeadingId,
                  content: currentHeading
                });
              } else if (trimmed.length > 20 && !trimmed.startsWith('!') && !trimmed.startsWith('|') && !trimmed.startsWith('---')) {
                // Index text content
                state.searchIndex.push({
                  docId: item.id,
                  docTitle: item.title,
                  type: 'paragraph',
                  title: currentHeading,
                  headingId: currentHeadingId,
                  content: trimmed.replace(/[*_`\[\]()#\-+]/g, '') // clean formatting markup
                });
              }
            });
          })
          .catch(e => console.error('Failed to index file:', item.file));
      });
    });
  }

  function setupSearch(inputEl, dropdownEl, clearBtnEl) {
    inputEl.addEventListener('input', () => {
      const query = inputEl.value.trim().toLowerCase();
      
      if (clearBtnEl) {
        clearBtnEl.style.display = query.length > 0 ? 'block' : 'none';
      }
      
      if (query.length < 2) {
        dropdownEl.innerHTML = '';
        dropdownEl.style.display = 'none';
        return;
      }
      
      // Perform local search match
      const matches = state.searchIndex.filter(indexItem => {
        return indexItem.content.toLowerCase().includes(query) || 
               indexItem.docTitle.toLowerCase().includes(query) || 
               indexItem.title.toLowerCase().includes(query);
      });
      
      // Limit search results to 10
      const limitedMatches = matches.slice(0, 10);
      
      renderSearchResults(limitedMatches, query, dropdownEl, inputEl);
    });

    if (clearBtnEl) {
      clearBtnEl.addEventListener('click', () => {
        inputEl.value = '';
        clearBtnEl.style.display = 'none';
        dropdownEl.innerHTML = '';
        dropdownEl.style.display = 'none';
      });
    }

    inputEl.addEventListener('focus', () => {
      if (inputEl.value.trim().length >= 2 && dropdownEl.children.length > 0) {
        dropdownEl.style.display = 'block';
      }
    });
  }

  function renderSearchResults(results, query, dropdownEl, inputEl) {
    dropdownEl.innerHTML = '';
    
    if (results.length === 0) {
      dropdownEl.innerHTML = `<div class="no-results">"${query}"에 대한 검색 결과가 없습니다.</div>`;
      dropdownEl.style.display = 'block';
      return;
    }
    
    results.forEach(result => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'search-result-item';
      
      // Highlight query inside content snippet
      const highlightText = (text, queryTerm) => {
        const index = text.toLowerCase().indexOf(queryTerm);
        if (index === -1) return text;
        
        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + queryTerm.length + 60);
        let snippet = text.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        // Escape HTML
        const safeSnippet = snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        // Match regex for highlighting case insensitively
        const regex = new RegExp(`(${queryTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        return safeSnippet.replace(regex, '<mark>$1</mark>');
      };

      const displaySnippet = highlightText(result.content, query);
      
      itemDiv.innerHTML = `
        <div class="search-result-title">
          <span>${result.title}</span>
          <span class="search-result-category">${result.docTitle}</span>
        </div>
        <div class="search-result-snippet">${displaySnippet}</div>
      `;
      
      itemDiv.addEventListener('click', () => {
        // Go to doc
        window.location.hash = `#/docs/${result.docId}?section=${result.headingId}`;
        dropdownEl.style.display = 'none';
        inputEl.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      });
      
      dropdownEl.appendChild(itemDiv);
    });
    
    dropdownEl.style.display = 'block';
  }
});

// ==========================================================================
// Image Error / Fallback Card Handler (global namespace for onclick/onerror)
// ==========================================================================
function handleImageError(imgEl, originalSrc, altText) {
  // Prevent infinite loops if fallback logo fails
  imgEl.onerror = null;
  
  // Custom fallbacks metadata
  // We can customize the details based on alt text or source filepath to make it premium
  let title = "QC 규격 시각자료";
  let description = "이해를 돕기 위한 차량 설명 및 부품 규정 예시 이미지입니다.";
  let iconClass = "fa-solid fa-car-tunnel";
  
  const altLower = altText.toLowerCase();
  const srcLower = originalSrc.toLowerCase();
  
  if (altLower.includes('airbag') || srcLower.includes('image-2') || srcLower.includes('image.')) {
    title = "CRS 장착 및 에어백 안전 경고 라벨";
    description = "조수석 에어백 경고 라벨 시인성 확보 및 후향식 카시트 설치 금지 경고 라벨 예시.";
    iconClass = "fa-solid fa-child-reaching";
  } else if (altLower.includes('sbr') || srcLower.includes('image-3') || srcLower.includes('image-4')) {
    title = "SBR (Seat Belt Reminder) 작동 예시";
    description = "안전벨트 미착용에 대한 지속적인 경고등 점등 시인성 확보 및 타향지 연동 로직 표시.";
    iconClass = "fa-solid fa-circle-exclamation";
  } else if (srcLower.includes('image-6') || srcLower.includes('image-7')) {
    title = "폴딩 시트 및 벨트 간섭 설명";
    description = "가변형 시트 조작 과정에서의 안전벨트 손상 방지 및 점검 유도 오너스 매뉴얼 문구 예시.";
    iconClass = "fa-solid fa-chair";
  } else if (srcLower.includes('image-12') || srcLower.includes('image-13')) {
    title = "i-Size 및 ISOFIX CRS 호환성 테이블";
    description = "유아용 카시트 인증 방식(ISOFIX / Non-ISOFIX)에 따른 좌석 호환성 데이터 매뉴얼 정리 예시.";
    iconClass = "fa-solid fa-table-list";
  } else if (srcLower.includes('image-15') || srcLower.includes('image-16')) {
    title = "EDR (Event Data Recorder) 수집 데이터 고지";
    description = "차량 주행 정보 데이터 보존성, 개인 정보 및 데이터 처리에 대한 사용자 고지 사항 예시.";
    iconClass = "fa-solid fa-database";
  } else if (srcLower.includes('image-21') || srcLower.includes('image-22')) {
    title = "브레이크 디스크/패드 마모 경고 지표";
    description = "마찰재 마모 인디케이터 점등 시 경고등 안내 및 Scheduled Maintenance 정보 연동 예시.";
    iconClass = "fa-solid fa-circle-notch";
  } else if (srcLower.includes('image-23') || srcLower.includes('image-24')) {
    title = "배출가스 저감 장치 점검 주기 및 GPF 안내";
    description = "내연기관 배기 정화용 후처리 장치(GPF, DPF 등) 파워트레인별 점검/유지보수 연계 항목 예시.";
    iconClass = "fa-solid fa-leaf";
  } else if (srcLower.includes('image-25') || srcLower.includes('image-26') || srcLower.includes('image-27') || srcLower.includes('image-28')) {
    title = "eCall System SOS 버튼 및 호출 프로세스";
    description = "EU Pan-European, UAE, Russia GLONASS 등 향지별 SOS 작동 조건과 안테나/배터리 점검 주기 고지 예시.";
    iconClass = "fa-solid fa-phone-volume";
  } else if (srcLower.includes('image-30') || srcLower.includes('image-31') || srcLower.includes('image-32')) {
    title = "EURO 7 비배기 환경 규제 대상 범위";
    description = "엔진 배출가스 외 브레이크 패드 분진, 타이어 마모, 냉매 전 생애 주기 환경 지표 고지 예시.";
    iconClass = "fa-solid fa-cloud-sun";
  } else if (srcLower.includes('image-33') || srcLower.includes('image-34') || srcLower.includes('image-35')) {
    title = "무선 적합성 선언문 (CE/UKCA DoC) 양식";
    description = "ADAS, 스마트키, 블루투스 등 무선 기기 모듈 법적 인증 라벨의 매뉴얼 수록 양식 예시.";
    iconClass = "fa-solid fa-square-rss";
  } else if (srcLower.includes('image-36')) {
    title = "외장 램프 전구 교체 서비스센터 권유";
    description = "LED 및 전구 교체 가능 범위 설명과 공인 정비소(Professional Workshop) 방문 안내 문구 예시.";
    iconClass = "fa-solid fa-lightbulb";
  } else if (srcLower.includes('image-37') || srcLower.includes('image-39')) {
    title = "디지털 키 보안 및 스마트폰 연동 해제";
    description = "복제 방지 암호화 작동 방식과 전자 보안 잠금 상태 유지 매뉴얼 작동법 예시.";
    iconClass = "fa-solid fa-mobile-screen-button";
  } else if (srcLower.includes('image-40') || srcLower.includes('image-42') || srcLower.includes('image-45')) {
    title = "파워 윈도우/선루프 핀치 방지 경고 및 조작";
    description = "신체 끼임 방지 주의사항 및 단시간 하차 시 스마트키 회수 강조, 오사용 방지 경고 예시.";
    iconClass = "fa-solid fa-window-maximize";
  } else if (srcLower.includes('image-46') || srcLower.includes('image-47')) {
    title = "친환경 에어컨 냉매 라벨 규정";
    description = "지구온난화 지수(GWP) 관련 F-가스 제원 표시 및 A/C 냉매 시스템 주의 라벨 예시.";
    iconClass = "fa-solid fa-temperature-arrow-down";
  } else if (srcLower.includes('image-48') || srcLower.includes('image-49')) {
    title = "전기차 AC/DC 충전기 커넥터 식별 라벨";
    description = "유럽 연합 2014/94/EU 표준 규격에 맞춘 충전구 및 커넥터 호환성 식별 심볼 매뉴얼 고지 예시.";
    iconClass = "fa-solid fa-bolt-lightning";
  } else if (srcLower.includes('image-50') || srcLower.includes('image-51')) {
    title = "오토 플러시 도어 핸들 비상 도어 개폐";
    description = "비상 탈출 rescue 대응 및 핸들 판넬 삽입 형태의 손잡이 수동 조작 및 비상 해제 프로세스 예시.";
    iconClass = "fa-solid fa-door-open";
  } else if (srcLower.includes('image-52') || srcLower.includes('image-53')) {
    title = "보행자 보호용 가상 엔진 사운드 시스템 (VESS)";
    description = "조용한 친환경 차량 접근 인지를 위한 가상음 출력 유지 의무 및 임의 비활성화 금지 법규 예시.";
    iconClass = "fa-solid fa-volume-high";
  } else if (srcLower.includes('image-54')) {
    title = "오토 헤드라이트 자동 점등 로직 설명";
    description = "낮 주간주행등(DRL)에서 하향등(Low Beam)으로의 센서 기반 자동 전환 및 조작 제한 규칙 예시.";
    iconClass = "fa-solid fa-eye-slash";
  }

  // Create a premium SVG/HTML placeholder box in place of the image
  const fallbackDiv = document.createElement('div');
  fallbackDiv.className = 'image-fallback-card';
  fallbackDiv.innerHTML = `
    <div class="image-fallback-icon"><i class="${iconClass}"></i></div>
    <h5>${title}</h5>
    <p>${description}</p>
    <div class="image-path-badge"><i class="fa-regular fa-file-image"></i> ${originalSrc}</div>
  `;
  
  // Replace the image element with this beautiful custom box
  imgEl.parentNode.replaceChild(fallbackDiv, imgEl);
}

const toggles = document.querySelectorAll('.section-toggle');
const searchInput = document.getElementById('searchInput');
const sections = document.querySelectorAll('.law-section');
const tocLinks = document.querySelectorAll('.toc a');

toggles.forEach((btn) => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });
});

document.getElementById('expandAll').addEventListener('click', () => {
  toggles.forEach((btn) => {
    btn.setAttribute('aria-expanded', 'true');
    btn.nextElementSibling.hidden = false;
  });
});

document.getElementById('collapseAll').addEventListener('click', () => {
  toggles.forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.nextElementSibling.hidden = true;
  });
});

searchInput.addEventListener('input', (event) => {
  const q = event.target.value.trim().toLowerCase();

  sections.forEach((section) => {
    const text = section.textContent.toLowerCase();
    const match = !q || text.includes(q);
    section.style.display = match ? '' : 'none';

    if (q && match) {
      const btn = section.querySelector('.section-toggle');
      const panel = section.querySelector('.section-panel');
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    tocLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, {rootMargin: '-30% 0px -65% 0px'});

sections.forEach((section) => observer.observe(section));

document.getElementById('topButton').addEventListener('click', () => {
  window.scrollTo({top:0, behavior:'smooth'});
});

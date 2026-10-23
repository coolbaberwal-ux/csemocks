import { institutes, testModules } from './institute-data.js';
import { isUserLoggedIn, getCurrentUser, logoutCandidate } from './auth-engine.js';

let activeInstitute = "all";
let searchKeyword = "";

document.addEventListener("DOMContentLoaded", () => {
  initThemeEngine();
  initBackToTopEngine();
  initUserStatus();
  renderInstituteTabs();
  renderTestsGrid();
  bindSearch();
});

/**
 * Light Mode as Primary Default Engine
 */
function initThemeEngine() {
  const toggleBtn = document.getElementById("themeToggle");
  // Default to light if no theme has been selected previously
  const storedTheme = localStorage.getItem("csemocks_theme") || "light";
  
  document.documentElement.setAttribute("data-theme", storedTheme);
  updateThemeIcon(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const nextTheme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("csemocks_theme", nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;
  toggleBtn.innerHTML = theme === "dark" 
    ? `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

/**
 * Bottom-to-Top Button with Smooth Scrolling
 */
function initBackToTopEngine() {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 350) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

function initUserStatus() {
  const navAuthSlot = document.getElementById("navAuthSlot");
  const pricingSection = document.getElementById("pricingSection");

  if (isUserLoggedIn()) {
    const user = getCurrentUser();
    if (pricingSection) pricingSection.style.display = "none";
    if (navAuthSlot) {
      navAuthSlot.innerHTML = `
        <span style="font-size:0.85rem; font-weight:700; color:var(--brand-gold);">Hello, ${user ? user.name.split(' ')[0] : 'Aspirant'}</span>
        <button id="logoutBtn" class="btn-cta btn-cta-ghost" style="padding: 6px 12px; font-size: 0.8rem;">Log Out</button>
      `;
      document.getElementById("logoutBtn").addEventListener("click", logoutCandidate);
    }
  } else {
    if (navAuthSlot) {
      navAuthSlot.innerHTML = `<a href="/login.html" class="btn-cta btn-cta-ghost">Aspirant Login</a>`;
    }
  }
}

function renderInstituteTabs() {
  const container = document.getElementById("instituteTabs");
  if (!container) return;

  container.innerHTML = institutes.map(inst => `
    <button class="tab-institute ${inst.id === activeInstitute ? 'active' : ''}" data-id="${inst.id}">
      ${inst.name}
    </button>
  `).join("");

  container.querySelectorAll(".tab-institute").forEach(btn => {
    btn.addEventListener("click", (e) => {
      container.querySelectorAll(".tab-institute").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      activeInstitute = e.currentTarget.getAttribute("data-id");
      renderTestsGrid();
    });
  });
}

function bindSearch() {
  const input = document.getElementById("searchTestInput");
  if (!input) return;
  input.addEventListener("input", (e) => {
    searchKeyword = e.target.value.toLowerCase().trim();
    renderTestsGrid();
  });
}

function renderTestsGrid() {
  const grid = document.getElementById("testsGrid");
  if (!grid) return;

  const filtered = testModules.filter(t => {
    const matchesInstitute = (activeInstitute === "all") || (t.institute === activeInstitute);
    const matchesSearch = t.title.toLowerCase().includes(searchKeyword) || t.desc.toLowerCase().includes(searchKeyword);
    return matchesInstitute && matchesSearch;
  });

  const loggedIn = isUserLoggedIn();

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No tests found matching the selected institute or keyword.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(test => {
    const unlocked = loggedIn || test.isFree;
    return `
      <div class="card-test">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="badge-institute">${test.instituteLabel} · ${test.targetYear}</span>
            <span class="badge-status ${test.isFree ? 'status-free' : 'status-pro'}">
              ${test.isFree ? 'FREE DEMO' : (loggedIn ? 'PRO UNLOCKED' : 'PRO LOCKED')}
            </span>
          </div>
          <h3 style="font-size: 1.18rem; font-weight:800; margin-bottom: 8px;">${test.title}</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 18px;">${test.desc}</p>
          <div style="display: flex; gap: 14px; font-size: 0.82rem; color: var(--text-tertiary); margin-bottom: 22px;">
            <span>📝 ${test.questions} MCQs</span>
            <span>⏱️ ${test.duration} Mins</span>
            <span>⚖️ +2.0 / -0.66</span>
          </div>
        </div>
        <div>
          ${unlocked 
            ? `<a href="${test.url}" class="btn-cta btn-cta-gold" style="width: 100%; justify-content: center;">Start Online Mock &rarr;</a>`
            : `<a href="/login.html" class="btn-cta btn-cta-ghost" style="width: 100%; justify-content: center;">🔒 Login to Access Pro Test</a>`
          }
        </div>
      </div>
    `;
  }).join("");
}
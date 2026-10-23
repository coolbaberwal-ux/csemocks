/**
 * Generic & Scalable UPSC CSE CBT Test Engine & Analytics
 * Supports variable question counts (1 to 100+) with automated timing,
 * palette generation, performance analytics, and responsive drawer controls.
 */

const CBT_ENGINE = (() => {
  let currentIndex = 0;
  let totalQuestions = 0;
  let timeRemaining = 0;
  let totalElapsedSeconds = 0;
  let timerTicker = null;
  let currentLanguage = 'en';

  let marksPerCorrect = 2.0;
  let penaltyPerIncorrect = 0.66;

  let candidateState = [];
  let evaluatedQuestions = [];

  function init() {
    setupSecurityLocks();
    initMobileNavigation();

    // 1. Read test scoring configs
    marksPerCorrect = parseFloat(document.body.getAttribute('data-marks') || "2.0");
    penaltyPerIncorrect = parseFloat(document.body.getAttribute('data-penalty') || "0.66");

    // 2. Discover all questions dynamically
    const questions = document.querySelectorAll('.question-item');
    totalQuestions = questions.length;

    if (totalQuestions === 0) {
      console.warn("No .question-item elements found in the document.");
      return;
    }

    // 3. Normalise question indices in DOM to prevent manual data-qindex mismatch
    questions.forEach((q, idx) => {
      q.setAttribute('data-qindex', idx);
      const headingNum = q.querySelector('.q-statement strong');
      // Ensure active state on initial load
      if (idx === 0) {
        q.classList.add('active-item');
      } else {
        q.classList.remove('active-item');
      }
    });

    // 4. Compute Exam Duration dynamically
    // If data-duration-mins is defined, use it; otherwise compute 72s per question (standard 120 mins / 100 questions)
    const customDuration = parseInt(document.body.getAttribute('data-duration-mins'), 10);
    if (!isNaN(customDuration) && customDuration > 0) {
      timeRemaining = customDuration * 60;
    } else {
      // Minimum duration 2 mins, otherwise 72s per question
      timeRemaining = Math.max(120, totalQuestions * 72);
    }

    // 5. Initialize Candidate Session State
    candidateState = [];
    for (let i = 0; i < totalQuestions; i++) {
      candidateState.push({
        selected: null,
        visited: i === 0,
        markedForReview: false,
        secondsSpent: 0
      });
    }

    // 6. Build Layout Components
    renderPalette();
    bindEvents();
    startTimer();
    renderQuestion(0);
    applyLanguage();
  }

  // 1. MOBILE NAVIGATION & PALETTE DRAWER CONTROLS
  function initMobileNavigation() {
    const hamburgerBtn = document.getElementById('btnHamburger');
    const drawer = document.getElementById('mobileNavDrawer');
    const closeDrawerBtn = document.getElementById('btnCloseDrawer');
    const backdrop = document.getElementById('drawerBackdrop');

    const togglePaletteBar = document.getElementById('mobilePaletteToggleBar');
    const palettePane = document.getElementById('paletteSidebarPane');

    hamburgerBtn?.addEventListener('click', () => {
      drawer?.classList.add('open');
      backdrop?.classList.add('active');
    });

    const closeDrawer = () => {
      drawer?.classList.remove('open');
      backdrop?.classList.remove('active');
    };
    closeDrawerBtn?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    togglePaletteBar?.addEventListener('click', () => {
      const isVisible = palettePane.style.display === 'block';
      palettePane.style.display = isVisible ? 'none' : 'block';
      const indicator = document.getElementById('paletteToggleIndicator');
      if (indicator) {
        indicator.textContent = isVisible ? 'Show ▲' : 'Hide ▼';
      }
    });
  }

  // 2. EXAM ENVIRONMENT SECURITY LOCKS
  function setupSecurityLocks() {
    document.body.classList.add('secure-exam');
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => e.preventDefault());

    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        return false;
      }
    });
  }

  // 3. ADAPTIVE TIMER
  function startTimer() {
    const clock = document.getElementById('examClock');
    clearInterval(timerTicker);

    const updateClockText = () => {
      const h = Math.floor(timeRemaining / 3600);
      const m = Math.floor((timeRemaining % 3600) / 60);
      const s = timeRemaining % 60;
      if (clock) {
        if (h > 0) {
          clock.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else {
          clock.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
      }
    };

    updateClockText();

    timerTicker = setInterval(() => {
      if (timeRemaining <= 0) {
        clearInterval(timerTicker);
        completeExam(true);
        return;
      }
      timeRemaining--;
      totalElapsedSeconds++;
      if (candidateState[currentIndex]) {
        candidateState[currentIndex].secondsSpent++;
      }
      updateClockText();
    }, 1000);
  }

  // 4. DYNAMIC PALETTE RENDERER
  function renderPalette() {
    const grid = document.getElementById('paletteContainer');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < totalQuestions; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-node';
      btn.textContent = i + 1;
      btn.id = `palette-node-${i}`;
      btn.setAttribute('aria-label', `Question ${i + 1}`);

      btn.addEventListener('click', () => {
        renderQuestion(i);
        if (window.innerWidth <= 900) {
          document.getElementById('examWorkspaceSection')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
      grid.appendChild(btn);
    }
  }

  // 5. QUESTION DISPLAY CONTROLLER
  function renderQuestion(index) {
    if (index < 0 || index >= totalQuestions) return;

    currentIndex = index;
    candidateState[currentIndex].visited = true;

    // Toggle active card
    document.querySelectorAll('.question-item').forEach((q, idx) => {
      q.classList.toggle('active-item', idx === currentIndex);
    });

    // Update Counter Heading and Metadata
    const badge = document.getElementById('questionCounterHeading');
    if (badge) {
      badge.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
    }

    const activeQ = document.querySelector(`.question-item[data-qindex="${currentIndex}"]`);
    const subjectPill = document.getElementById('currentSubjectPill');
    if (activeQ && subjectPill) {
      subjectPill.textContent = activeQ.getAttribute('data-subject') || 'General Studies';
    }

    // Reflect existing user selection state
    if (activeQ) {
      activeQ.querySelectorAll('.opt-row').forEach(row => {
        const val = row.getAttribute('data-value');
        row.classList.toggle('selected', val === candidateState[currentIndex].selected);
      });
    }

    // Manage Prev/Next button states
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    if (btnPrev) btnPrev.disabled = (currentIndex === 0);
    if (btnNext) btnNext.disabled = (currentIndex === totalQuestions - 1);

    refreshPaletteUI();
  }

  // 6. EVENT BINDING
  function bindEvents() {
    // Option Click Delegations
    document.querySelectorAll('.opt-row').forEach(row => {
      row.addEventListener('click', () => {
        const card = row.closest('.question-item');
        const qIdx = parseInt(card.getAttribute('data-qindex'), 10);
        const val = row.getAttribute('data-value');

        candidateState[qIdx].selected = val;
        card.querySelectorAll('.opt-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');

        refreshPaletteUI();
      });
    });

    // Next Button
    document.getElementById('btnNext')?.addEventListener('click', () => {
      if (currentIndex < totalQuestions - 1) {
        renderQuestion(currentIndex + 1);
        if (window.innerWidth <= 900) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    // Previous Button
    document.getElementById('btnPrev')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        renderQuestion(currentIndex - 1);
        if (window.innerWidth <= 900) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    // Mark for Review
    document.getElementById('btnMarkReview')?.addEventListener('click', () => {
      candidateState[currentIndex].markedForReview = !candidateState[currentIndex].markedForReview;
      if (currentIndex < totalQuestions - 1) {
        renderQuestion(currentIndex + 1);
      } else {
        refreshPaletteUI();
      }
    });

    // Clear Response
    document.getElementById('btnClearResponse')?.addEventListener('click', () => {
      candidateState[currentIndex].selected = null;
      const currentCard = document.querySelector(`.question-item[data-qindex="${currentIndex}"]`);
      if (currentCard) {
        currentCard.querySelectorAll('.opt-row').forEach(r => r.classList.remove('selected'));
      }
      refreshPaletteUI();
    });

    // Submit Exam
    document.getElementById('btnSubmitExam')?.addEventListener('click', () => {
      const answeredCount = candidateState.filter(s => s.selected !== null).length;
      const unattemptedCount = totalQuestions - answeredCount;
      const promptMsg = `Are you sure you want to finish the exam?\n\nAttempted: ${answeredCount}/${totalQuestions}\nUnattempted: ${unattemptedCount}`;
      
      if (confirm(promptMsg)) {
        completeExam(false);
      }
    });

    // Toggle Language
    document.getElementById('btnToggleLang')?.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
      const langBtn = document.getElementById('btnToggleLang');
      if (langBtn) {
        langBtn.textContent = currentLanguage === 'en' ? 'हिन्दी' : 'English';
      }
      applyLanguage();
    });
  }

  function applyLanguage() {
    document.querySelectorAll('.lang-en').forEach(el => el.style.display = currentLanguage === 'en' ? 'block' : 'none');
    document.querySelectorAll('.lang-hi').forEach(el => el.style.display = currentLanguage === 'hi' ? 'block' : 'none');
  }

  // 7. PALETTE & SUMMARY SYNC
  function refreshPaletteUI() {
    let answered = 0;
    let visitedUnanswered = 0;
    let review = 0;
    let ansReview = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const node = document.getElementById(`palette-node-${i}`);
      if (!node) continue;

      node.className = 'palette-node';
      if (i === currentIndex) node.classList.add('current-view');

      const s = candidateState[i];
      if (s.selected && s.markedForReview) {
        node.classList.add('status-ans-review');
        ansReview++;
      } else if (s.markedForReview) {
        node.classList.add('status-review');
        review++;
      } else if (s.selected) {
        node.classList.add('status-answered');
        answered++;
      } else if (s.visited) {
        node.classList.add('status-visited');
        visitedUnanswered++;
      }
    }

    const cAns = document.getElementById('countAnswered');
    const cNotAns = document.getElementById('countVisited');
    const cRev = document.getElementById('countReview');
    const cAnsRev = document.getElementById('countAnsReview');

    if (cAns) cAns.textContent = answered;
    if (cNotAns) cNotAns.textContent = visitedUnanswered;
    if (cRev) cRev.textContent = review;
    if (cAnsRev) cAnsRev.textContent = ansReview;

    const mobSummary = document.getElementById('mobileSummaryBadge');
    if (mobSummary) {
      mobSummary.textContent = `${answered}/${totalQuestions} Attempted`;
    }
  }

  // 8. EXAM CONCLUSION & SCORE CALCULATION
  function completeExam(forced = false) {
    clearInterval(timerTicker);

    const layout = document.getElementById('examLayoutContainer');
    if (layout) layout.style.display = 'none';

    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';

    const resultView = document.getElementById('resultCanvas');
    if (resultView) resultView.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    buildDiagnosticReport();
  }

  // 9. DIAGNOSTIC ANALYTICS & RESULT ENGINE
  function buildDiagnosticReport() {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const cards = document.querySelectorAll('.question-item');
    evaluatedQuestions = [];
    const subjectMap = {};
    const diffMap = {
      easy: { total: 0, right: 0 },
      medium: { total: 0, right: 0 },
      hard: { total: 0, right: 0 }
    };

    cards.forEach((card, idx) => {
      const official = (card.getAttribute('data-answer') || '').trim().toUpperCase();
      const userChoice = candidateState[idx]?.selected || null;
      const spent = candidateState[idx]?.secondsSpent || 0;
      const subject = card.getAttribute('data-subject') || 'General Studies';
      const difficulty = (card.getAttribute('data-difficulty') || 'medium').toLowerCase();

      const statementHTML = card.querySelector('.q-statement')?.innerHTML || '';
      const expHTML = card.querySelector('.q-solution-content')?.innerHTML || 'Explanation not available.';

      const optionsData = [];
      card.querySelectorAll('.opt-row').forEach(opt => {
        optionsData.push({
          value: opt.getAttribute('data-value'),
          html: opt.querySelector('.opt-text')?.innerHTML || ''
        });
      });

      if (!subjectMap[subject]) {
        subjectMap[subject] = { total: 0, right: 0, wrong: 0, totalTime: 0 };
      }
      subjectMap[subject].total++;
      subjectMap[subject].totalTime += spent;

      if (!diffMap[difficulty]) {
        diffMap[difficulty] = { total: 0, right: 0 };
      }
      diffMap[difficulty].total++;

      let status = 'unattempted';
      if (userChoice) {
        if (userChoice === official) {
          correct++;
          status = 'correct';
          subjectMap[subject].right++;
          diffMap[difficulty].right++;
        } else {
          incorrect++;
          status = 'incorrect';
          subjectMap[subject].wrong++;
        }
      } else {
        unattempted++;
      }

      evaluatedQuestions.push({
        num: idx + 1,
        official,
        userChoice: userChoice || '—',
        status,
        spent,
        subject,
        difficulty,
        statementHTML,
        optionsData,
        markedForReview: candidateState[idx]?.markedForReview || false,
        expHTML
      });
    });

    const maxMarks = (totalQuestions * marksPerCorrect).toFixed(1);
    const grossPositive = correct * marksPerCorrect;
    const grossNegative = incorrect * penaltyPerIncorrect;
    const netMarks = Math.max(0, grossPositive - grossNegative).toFixed(2);
    const netPct = totalQuestions > 0 ? Math.max(0, ((parseFloat(netMarks) / parseFloat(maxMarks)) * 100)).toFixed(2) : "0.00";
    const attemptedCount = correct + incorrect;
    const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;
    const attemptedPct = totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0;
    const avgTimeSec = totalQuestions > 0 ? Math.round(totalElapsedSeconds / totalQuestions) : 0;

    let perfRating = 'NEEDS WORK';
    if (netPct >= 70) perfRating = 'EXCELLENT';
    else if (netPct >= 50) perfRating = 'GOOD';
    else if (netPct >= 35) perfRating = 'AVERAGE';

    // HERO BLOCK DATA INJECTION
    document.getElementById('resScoreTarget').textContent = `🎯 ${netMarks} / ${maxMarks}`;
    document.getElementById('resScorePct').textContent = `${netPct}%`;
    document.getElementById('resPerfRating').textContent = perfRating;
    document.getElementById('resTotalTime').textContent = `⏱ ${formatTimeHM(totalElapsedSeconds)}`;
    document.getElementById('resMeterFill').style.width = `${Math.min(100, Math.max(0, netPct))}%`;

    // TRI-STAT BAR
    document.getElementById('resStatCorrect').textContent = correct;
    document.getElementById('resStatIncorrect').textContent = incorrect;
    document.getElementById('resStatUnattempted').textContent = unattempted;

    // DONUT & STATS LIST
    const donutCircumference = 377;
    const donutOffset = donutCircumference - (donutCircumference * (accuracy / 100));
    const donutCircle = document.getElementById('resDonutCircle');
    if (donutCircle) donutCircle.style.strokeDashoffset = donutOffset;
    document.getElementById('resDonutAccuracyVal').textContent = `${accuracy}%`;

    document.getElementById('resStatAccuracy').textContent = `${accuracy}%`;
    document.getElementById('resStatAttempted').textContent = `${attemptedPct}%`;
    document.getElementById('resStatAvgTime').textContent = formatTimeMS(avgTimeSec);
    document.getElementById('resStatGross').textContent = `+${grossPositive.toFixed(2)} Marks`;
    document.getElementById('resStatNegative').textContent = `-${grossNegative.toFixed(2)} Marks`;
    document.getElementById('resStatNet').textContent = `Net ${netMarks}`;

    renderInsights(subjectMap, diffMap);
    renderSubjectBars(subjectMap);
    renderDifficultyStats(diffMap);
    renderTimeStats(evaluatedQuestions);
    initQuestionAnalysisFilters();
    showQuestionDetail(0);
    bindActionButtons();
  }

  function formatTimeHM(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  }

  function formatTimeMS(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
  }

  function renderInsights(subMap, diffMap) {
    let strongestSub = 'N/A';
    let weakestSub = 'N/A';
    let slowestSub = 'N/A';
    let maxSubAcc = -1;
    let minSubAcc = 999;
    let maxSubTime = -1;

    const subjects = Object.keys(subMap);
    if (subjects.length > 0) {
      subjects.forEach(sub => {
        const data = subMap[sub];
        const acc = data.total > 0 ? (data.right / data.total) : 0;
        if (acc > maxSubAcc) { maxSubAcc = acc; strongestSub = sub; }
        if (acc < minSubAcc) { minSubAcc = acc; weakestSub = sub; }
        if (data.totalTime > maxSubTime) { maxSubTime = data.totalTime; slowestSub = sub; }
      });
    }

    document.getElementById('insightStrongest').textContent = `🔥 Strongest: ${strongestSub}`;
    document.getElementById('insightWeakest').textContent = `⚠ Needs Work: ${weakestSub}`;
    document.getElementById('insightTimeHeavy').textContent = `⏱ Time Heavy: ${slowestSub}`;

    const hardTotal = diffMap.hard ? diffMap.hard.total : 0;
    const hardRight = diffMap.hard ? diffMap.hard.right : 0;
    const hardAcc = hardTotal > 0 ? (hardRight / hardTotal) * 100 : 0;
    const cognitiveEl = document.getElementById('insightCognitive');
    if (cognitiveEl) {
      if (hardTotal === 0) {
        cognitiveEl.textContent = `💡 Balanced performance across test sections`;
      } else if (hardAcc < 50) {
        cognitiveEl.textContent = `💡 Accuracy drops on difficult questions`;
      } else {
        cognitiveEl.textContent = `💡 High accuracy maintained across challenging questions`;
      }
    }
  }

  function renderSubjectBars(subMap) {
    const container = document.getElementById('resSubjectBarsContainer');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(subMap).forEach(sub => {
      const item = subMap[sub];
      const pct = item.total > 0 ? Math.round((item.right / item.total) * 100) : 0;

      const barWrap = document.createElement('div');
      barWrap.className = 'sub-bar-item';
      barWrap.innerHTML = `
        <div class="sub-bar-meta">
          <span>${sub}</span>
          <span>${pct}% · ${item.right}/${item.total}</span>
        </div>
        <div class="sub-bar-track">
          <div class="sub-bar-fill" style="width: ${pct}%;"></div>
        </div>
      `;
      container.appendChild(barWrap);
    });
  }

  function renderDifficultyStats(diffMap) {
    ['easy', 'medium', 'hard'].forEach(level => {
      const el = document.getElementById(`diff-${level}`);
      if (!el) return;
      const data = diffMap[level] || { total: 0, right: 0 };
      const pct = data.total > 0 ? Math.round((data.right / data.total) * 100) : 0;
      el.querySelector('.diff-pct').textContent = `${pct}% ✓`;
      el.querySelector('.diff-ratio').textContent = `${data.right}/${data.total}`;
    });
  }

  function renderTimeStats(qList) {
    if (!qList || qList.length === 0) return;

    let fastest = qList[0];
    let slowest = qList[0];

    qList.forEach(q => {
      if (q.spent < fastest.spent && q.spent > 0) fastest = q;
      if (q.spent > slowest.spent) slowest = q;
    });

    document.getElementById('fastestQNum').textContent = `Q${fastest.num}`;
    document.getElementById('fastestQTime').textContent = formatTimeMS(fastest.spent);
    document.getElementById('slowestQNum').textContent = `Q${slowest.num}`;
    document.getElementById('slowestQTime').textContent = formatTimeMS(slowest.spent);

    const graphBox = document.getElementById('timeGraphBox');
    if (!graphBox) return;
    graphBox.innerHTML = '';
    const maxSpent = Math.max(...qList.map(q => q.spent), 1);

    qList.forEach(q => {
      const col = document.createElement('div');
      col.className = 'time-graph-col';
      const heightPct = Math.max(8, Math.round((q.spent / maxSpent) * 100));
      col.style.height = `${heightPct}%`;
      col.title = `Q${q.num}: ${formatTimeMS(q.spent)}`;
      col.addEventListener('click', () => showQuestionDetail(q.num - 1));
      graphBox.appendChild(col);
    });
  }

  function initQuestionAnalysisFilters() {
    const toolbar = document.getElementById('resFilterToolbar');
    if (!toolbar) return;

    toolbar.querySelectorAll('.filter-pill-btn').forEach(btn => {
      btn.onclick = () => {
        toolbar.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        renderQuestionChips(filter);
      };
    });

    renderQuestionChips('all');
  }

  function renderQuestionChips(filter) {
    const grid = document.getElementById('resChipsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const avgTime = totalQuestions > 0 ? Math.round(totalElapsedSeconds / totalQuestions) : 0;

    evaluatedQuestions.forEach((q, idx) => {
      let matches = false;
      if (filter === 'all') matches = true;
      else if (filter === 'correct' && q.status === 'correct') matches = true;
      else if (filter === 'incorrect' && q.status === 'incorrect') matches = true;
      else if (filter === 'unattempted' && q.status === 'unattempted') matches = true;
      else if (filter === 'review' && q.markedForReview) matches = true;
      else if (filter === 'slow' && q.spent > avgTime) matches = true;

      if (!matches) return;

      const chip = document.createElement('div');
      chip.className = 'q-chip-node';
      chip.id = `q-chip-${idx}`;
      let icon = '—';
      if (q.status === 'correct') {
        chip.classList.add('q-chip-correct');
        icon = '✓';
      } else if (q.status === 'incorrect') {
        chip.classList.add('q-chip-wrong');
        icon = '✕';
      } else {
        chip.classList.add('q-chip-skip');
      }

      chip.textContent = `Q${q.num} ${icon}`;
      chip.addEventListener('click', () => showQuestionDetail(idx));
      grid.appendChild(chip);
    });
  }

  function showQuestionDetail(index) {
    const q = evaluatedQuestions[index];
    if (!q) return;

    document.querySelectorAll('.q-chip-node').forEach(c => c.style.outline = 'none');
    const activeChip = document.getElementById(`q-chip-${index}`);
    if (activeChip) activeChip.style.outline = '2px solid var(--navy-dark)';

    let statusText = 'Unattempted';
    let statusClass = 'text-muted';
    if (q.status === 'correct') {
      statusText = 'Correct (✓)';
      statusClass = 'color-green';
    } else if (q.status === 'incorrect') {
      statusText = 'Incorrect (✕)';
      statusClass = 'color-red';
    }

    const detailHeader = document.getElementById('detailHeader');
    if (detailHeader) {
      detailHeader.innerHTML = `
        <span>Question ${q.num} · <strong class="${statusClass}">${statusText}</strong> · ${formatTimeMS(q.spent)}</span>
        <span class="detail-subj-tag">${q.subject}</span>
      `;
    }

    const statementContainer = document.getElementById('detailQuestionStatement');
    if (statementContainer) {
      statementContainer.innerHTML = q.statementHTML;
    }

    const optionsContainer = document.getElementById('detailOptionsDisplay');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      q.optionsData.forEach(opt => {
        const row = document.createElement('div');
        row.className = 'detail-opt-row';

        const isUserSelected = (q.userChoice === opt.value);
        const isOfficialCorrect = (q.official === opt.value);

        if (isOfficialCorrect) {
          row.classList.add('opt-highlight-correct');
        } else if (isUserSelected && !isOfficialCorrect) {
          row.classList.add('opt-highlight-wrong');
        }

        row.innerHTML = `
          <div class="detail-opt-badge">${opt.value}</div>
          <div class="detail-opt-text">${opt.html}</div>
          <div class="detail-opt-status-tag">
            ${isOfficialCorrect ? '<span class="tag-correct-key">✓ Correct</span>' : ''}
            ${isUserSelected && !isOfficialCorrect ? '<span class="tag-wrong-key">✕ Your Pick</span>' : ''}
            ${isUserSelected && isOfficialCorrect ? '<span class="tag-your-correct">✓ Your Pick</span>' : ''}
          </div>
        `;
        optionsContainer.appendChild(row);
      });
    }

    document.getElementById('detailYourAns').textContent = q.userChoice;
    document.getElementById('detailCorrectAns').textContent = q.official;

    const expContent = document.getElementById('detailExpContent');
    if (expContent) {
      expContent.innerHTML = q.expHTML;
      expContent.style.display = 'none';
      const toggleExpBtn = document.getElementById('btnToggleExp');
      if (toggleExpBtn) toggleExpBtn.textContent = 'Show Explanation ▼';
    }

    applyLanguage();

    if (window.innerWidth <= 900) {
      document.getElementById('resDetailBox')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function bindActionButtons() {
    const toggleBtn = document.getElementById('btnToggleExp');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const expContent = document.getElementById('detailExpContent');
        const isHidden = expContent.style.display === 'none';
        expContent.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? 'Hide Explanation ▲' : 'Show Explanation ▼';
      };
    }

    document.getElementById('btnActionReview').onclick = () => {
      document.querySelector('[data-filter="all"]')?.click();
      document.getElementById('resChipsGrid')?.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('btnActionSolutions').onclick = () => {
      const expContent = document.getElementById('detailExpContent');
      if (expContent) expContent.style.display = 'block';
      const toggleB = document.getElementById('btnToggleExp');
      if (toggleB) toggleB.textContent = 'Hide Explanation ▲';
      document.getElementById('resDetailBox')?.scrollIntoView({ behavior: 'smooth' });
    };

    document.getElementById('btnActionRetryIncorrect').onclick = () => {
      if (confirm("Reset and retry all questions?")) {
        window.location.reload();
      }
    };

    document.getElementById('btnActionRetryUnattempted').onclick = () => {
      if (confirm("Reset and retry all questions?")) {
        window.location.reload();
      }
    };

    document.getElementById('btnActionTakeAnother').onclick = () => {
      window.location.href = '/';
    };
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', CBT_ENGINE.init);
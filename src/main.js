import './styles.css';

(() => {
  const views = document.querySelectorAll('.view');
  const navLinks = document.querySelectorAll('#nv a');
  const routeMap = { cs1: 'work', cs2: 'work', cs3: 'work', concept: 'work' };

  function route() {
    let hash = (location.hash || '#home').slice(1);
    if (!document.getElementById('v-' + hash)) hash = 'home';
    views.forEach(view => view.classList.toggle('on', view.id === 'v-' + hash));
    navLinks.forEach(link => link.classList.toggle('on', link.dataset.r === (routeMap[hash] || hash)));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  window.addEventListener('hashchange', route);
  route();

  document.querySelectorAll('.tabs').forEach(group => {
    group.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(item => item.classList.toggle('on', item === button));
      document.querySelectorAll('[data-g="' + group.dataset.tg + '"]').forEach(panel => {
        panel.classList.toggle('on', panel.id === button.dataset.t);
      });
    }));
  });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('[data-tg="m3"] [data-t="' + button.dataset.go + '"]')?.click();
  }));

  document.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.jump);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // Clinician annotation prototype: illustrative local-only state.
  const cases = [
    { id: 'H-014', detail: 'Image 1 of 3 · H&E cardiac histopathology' },
    { id: 'H-021', detail: 'Image 2 of 3 · H&E cardiac histopathology' },
    { id: 'H-033', detail: 'Image 3 of 3 · H&E cardiac histopathology' }
  ];
  const annState = cases.map((_, index) => index === 2 ? ({ status: 'Flagged', label: 'Uncertain', note: 'Needs a second expert opinion.' }) : ({ status: 'Pending review', label: '', note: '' }));
  let activeCase = 0;
  let zoom = 100;
  const annFeedback = document.getElementById('ann-feedback');

  function updateAnnotation() {
    const item = cases[activeCase];
    const state = annState[activeCase];
    document.getElementById('case-title').textContent = 'Case ' + item.id;
    document.getElementById('case-meta').textContent = item.detail;
    document.getElementById('case-state').textContent = state.status;
    document.getElementById('ann-note').value = state.note;
    document.querySelectorAll('.queue-item').forEach((button, index) => {
      button.classList.toggle('active', index === activeCase);
      const stateText = annState[index].status;
      button.querySelector('.queue-dot').textContent = stateText === 'Reviewed' ? '✓' : stateText === 'Flagged' ? '⚑' : '';
      button.classList.toggle('is-reviewed', stateText === 'Reviewed');
      button.classList.toggle('is-flagged', stateText === 'Flagged');
    });
    document.querySelectorAll('#ann-choices .choice').forEach(button => button.classList.toggle('selected', button.dataset.label === state.label));
    const pending = annState.filter(entry => entry.status === 'Pending review').length;
    const reviewed = annState.filter(entry => entry.status === 'Reviewed').length;
    document.getElementById('queue-count').textContent = pending + ' pending';
    document.getElementById('ann-status').textContent = reviewed + ' reviewed · ' + pending + ' pending';
    annFeedback.textContent = state.label ? 'Selected: ' + state.label + '. Submit when your review is ready.' : 'Select an annotation to enable submission.';
    document.getElementById('ann-submit').disabled = !state.label || state.status === 'Reviewed';
    document.getElementById('ann-retry').hidden = true;
  }
  document.querySelectorAll('.queue-item').forEach(button => button.addEventListener('click', () => {
    activeCase = Number(button.dataset.case);
    updateAnnotation();
  }));
  document.querySelectorAll('#ann-choices .choice').forEach(button => button.addEventListener('click', () => {
    annState[activeCase].label = button.dataset.label;
    annState[activeCase].status = button.dataset.label === 'Uncertain' ? 'Flagged' : 'Pending review';
    updateAnnotation();
  }));
  document.getElementById('ann-note').addEventListener('input', event => { annState[activeCase].note = event.target.value; });
  function saveAnnotation(forceFailure) {
    const state = annState[activeCase];
    if (!state.label) {
      annFeedback.textContent = 'Choose Present, Absent or Uncertain before submitting.';
      return;
    }
    if (forceFailure) {
      annFeedback.textContent = 'Save failed: the demo could not reach the server. Your selected label and note are still here.';
      annFeedback.classList.add('error');
      document.getElementById('ann-retry').hidden = false;
      return;
    }
    state.status = state.label === 'Uncertain' ? 'Flagged' : 'Reviewed';
    annFeedback.classList.remove('error');
    annFeedback.textContent = 'Saved in this prototype session. ' + state.status + ' — ' + cases[activeCase].id + '.';
    updateAnnotation();
    annFeedback.textContent = 'Saved in this prototype session. ' + state.status + ' — ' + cases[activeCase].id + '.';
  }
  document.getElementById('ann-submit').addEventListener('click', () => saveAnnotation(false));
  document.getElementById('ann-fail').addEventListener('click', () => saveAnnotation(true));
  document.getElementById('ann-retry-button').addEventListener('click', () => saveAnnotation(false));
  document.getElementById('ann-discard').addEventListener('click', () => { document.getElementById('ann-retry').hidden = true; annFeedback.classList.remove('error'); annFeedback.textContent = 'Save attempt dismissed. Your draft remains selected.'; });
  document.getElementById('ann-reset').addEventListener('click', () => {
    annState.forEach(entry => { entry.status = 'Pending review'; entry.label = ''; entry.note = ''; });
    activeCase = 0; zoom = 100; document.getElementById('zoom-level').textContent = '100%';
    document.querySelector('.tissue-art').style.transform = 'scale(1)';
    annFeedback.classList.remove('error'); updateAnnotation();
  });
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.zoom === 'in') zoom = Math.min(180, zoom + 20);
    if (button.dataset.zoom === 'out') zoom = Math.max(80, zoom - 20);
    if (button.dataset.zoom === 'reset') zoom = 100;
    document.querySelector('.tissue-art').style.transform = 'scale(' + zoom / 100 + ')';
    document.getElementById('zoom-level').textContent = zoom + '%';
  }));
  updateAnnotation();

  // Learning companion: local navigation and stateful practice interactions.
  const learning = document.getElementById('learning-prototype');
  if (learning) {
    function showScreen(name) {
      learning.querySelectorAll('.learn-screen').forEach(screen => screen.classList.toggle('active', screen.id === 'screen-' + name));
      learning.querySelectorAll('.learn-nav').forEach(button => button.classList.toggle('active', button.dataset.screen === name));
    }
    learning.querySelectorAll('.learn-nav').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.screen)));
    learning.querySelectorAll('[data-open-screen]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.openScreen)));

    let completedLessons = 6;
    document.getElementById('complete-lesson').addEventListener('click', () => {
      completedLessons = Math.min(10, completedLessons + 1);
      const percent = completedLessons * 10;
      document.getElementById('lesson-count').textContent = completedLessons + ' of 10 lessons complete';
      document.getElementById('lesson-progress').style.width = percent + '%';
      document.getElementById('course-progress').textContent = percent + '%';
      document.getElementById('course-bar').style.width = percent + '%';
      document.getElementById('lesson-feedback').textContent = completedLessons === 10 ? 'Course complete. You can now revisit lessons or move to a practice set.' : 'Progress updated to ' + percent + '%. Next up: keep practising with a short question set.';
    });

    const answers = {
      'Explain SQL joins simply': 'Think of two spreadsheets connected by a shared ID. A JOIN combines matching rows. INNER JOIN keeps matches in both tables; LEFT JOIN keeps every row from the left table and adds matching details when available.',
      'What is recursion?': 'Recursion is when a function solves a problem by calling itself on a smaller version. Two essentials: a base case that stops the calls, and progress toward that base case. Try tracing factorial(3): 3 × factorial(2), then 2 × factorial(1).',
      'How do I debug a Python loop?': 'First inspect one iteration: print the loop variable and the condition. Then check whether the variable changes, whether the loop boundary is correct, and whether the loop can reach its stopping condition. Reduce the input to the smallest failing example.'
    };
    const chatMessages = document.getElementById('chat-messages');
    function addMessage(text, type) {
      const message = document.createElement('div');
      message.className = 'chat-message ' + (type === 'user' ? 'user-message' : 'assistant-message');
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      message.appendChild(paragraph);
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function respond(question) {
      const normalized = question.toLowerCase();
      let answer = answers[question];
      if (!answer && (normalized.includes('join') || normalized.includes('sql'))) answer = answers['Explain SQL joins simply'];
      if (!answer && normalized.includes('recurs')) answer = answers['What is recursion?'];
      if (!answer && (normalized.includes('loop') || normalized.includes('debug'))) answer = answers['How do I debug a Python loop?'];
      if (!answer) answer = 'Let’s break that down. Start by describing what you expect, what actually happens and one small example. Then identify the concept involved and test one step at a time. This portfolio demo uses prepared responses rather than a live AI model.';
      addMessage(answer, 'assistant');
    }
    learning.querySelectorAll('.prompt-chip').forEach(button => button.addEventListener('click', () => {
      addMessage(button.textContent, 'user'); respond(button.textContent);
    }));
    document.getElementById('chat-form').addEventListener('submit', event => {
      event.preventDefault();
      const input = document.getElementById('chat-input');
      const question = input.value.trim();
      if (!question) return;
      addMessage(question, 'user'); respond(question); input.value = '';
    });

    const planChecks = learning.querySelectorAll('.plan-list input');
    function updatePlan() {
      const count = [...planChecks].filter(input => input.checked).length;
      document.getElementById('plan-feedback').textContent = count + ' of 5 sessions completed.';
    }
    planChecks.forEach(input => input.addEventListener('change', updatePlan));

    const quizFeedback = document.getElementById('quiz-feedback');
    learning.querySelectorAll('.quiz-options button').forEach(button => button.addEventListener('click', () => {
      learning.querySelectorAll('.quiz-options button').forEach(item => item.classList.remove('correct', 'incorrect'));
      const correct = button.dataset.answer === 'b';
      button.classList.add(correct ? 'correct' : 'incorrect');
      quizFeedback.textContent = correct ? 'Correct. LEFT JOIN preserves every row from Students, even when there is no matching Enrollments row. The enrollment columns are NULL when no match exists.' : 'Not quite. Think about which table should be preserved in full. A LEFT JOIN keeps every row from the left-hand table, Students.';
      quizFeedback.classList.toggle('error', !correct);
    }));
    document.getElementById('quiz-reset').addEventListener('click', () => {
      learning.querySelectorAll('.quiz-options button').forEach(item => item.classList.remove('correct', 'incorrect'));
      quizFeedback.classList.remove('error'); quizFeedback.textContent = 'Choose an answer to see an explanation.';
    });

    const interviewQuestions = [
      'Tell me about a project where you translated a complex user or domain need into a working tool.',
      'Describe a design or technical decision you changed after learning more about the problem.',
      'How would you decide what to simplify in a workflow used by time-constrained experts?'
    ];
    let questionIndex = 0;
    document.getElementById('next-question').addEventListener('click', () => {
      questionIndex = (questionIndex + 1) % interviewQuestions.length;
      document.getElementById('interview-question').textContent = interviewQuestions[questionIndex];
    });
  }

  // Toast utility used by any existing data-toast controls.
  document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => {
    const toast = document.getElementById('ts');
    toast.textContent = button.dataset.toast;
    toast.style.display = 'block';
    window.clearTimeout(window.__portfolioToast);
    window.__portfolioToast = window.setTimeout(() => { toast.style.display = 'none'; }, 3500);
  }));
})();

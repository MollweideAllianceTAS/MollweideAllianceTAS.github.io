/* Homepage-only motion. Every effect has a no-motion fallback. */
(function () {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = Array.from(document.querySelectorAll('.c-reveal'));

  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  const progress = document.querySelector('.c-progress span');
  let paintStory = () => {};
  let frame = 0;
  const paint = () => {
    frame = 0;
    if (progress) {
      const room = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${room > 0 ? Math.min(1, scrollY / room) : 0})`;
    }
    paintStory();
  };
  addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });

  const story = document.querySelector('.c-story');
  const chapters = Array.from(document.querySelectorAll('[data-story-step]'));
  const phases = Array.from(document.querySelectorAll('[data-map-phase]'));
  const counter = document.querySelector('[data-story-number]');
  if (story && chapters.length) {
    const setActive = step => {
      story.dataset.active = String(step);
      chapters.forEach(chapter => chapter.classList.toggle('is-active', Number(chapter.dataset.storyStep) === step));
      phases.forEach(phase => phase.classList.toggle('is-active', Number(phase.dataset.mapPhase) === step));
      if (counter) counter.textContent = String(step).padStart(2, '0');
    };
    setActive(1);

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    paintStory = () => {
      if (reduce) return;

      const rect = story.getBoundingClientRect();
      const travel = Math.max(1, rect.height - innerHeight);
      const progressThroughStory = clamp(-rect.top / travel, 0, 1);
      const arc = Math.sin(progressThroughStory * Math.PI);
      const wave = Math.sin(progressThroughStory * Math.PI * 2);
      const flight = Math.pow(progressThroughStory, 1.5);

      story.style.setProperty('--story-progress', progressThroughStory.toFixed(4));
      story.style.setProperty('--plane-x', `${(58 - flight * 126).toFixed(2)}vw`);
      story.style.setProperty('--plane-y', `${(8 - progressThroughStory * 6 - arc * 22).toFixed(2)}vh`);
      story.style.setProperty('--plane-scale', (.6 + arc * .1).toFixed(3));
      story.style.setProperty('--plane-roll', `${(-1 + wave * 1.2).toFixed(2)}deg`);
      story.style.setProperty('--plane-opacity', clamp((progressThroughStory - .055) / .12, 0, 1).toFixed(3));
      story.style.setProperty('--map-scale', (1 + arc * .05).toFixed(3));

      const activeStep = Math.min(chapters.length, Math.floor(progressThroughStory * chapters.length) + 1);
      setActive(activeStep);

      const chapterPeaks = [.12, .5, .88];
      chapters.forEach((chapter, index) => {
        const distance = Math.abs(progressThroughStory - chapterPeaks[index]);
        chapter.style.setProperty('--chapter-opacity', clamp(1 - distance * 2.4, .28, 1).toFixed(3));
        chapter.style.setProperty('--chapter-shift', `${Math.min(34, distance * 70).toFixed(2)}px`);
      });
    };
  }

  addEventListener('resize', () => {
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
  paint();
})();

function startCountdown(el) {
  const target = new Date(el.dataset.eventDatetime).getTime();
  const values = {
    days: el.querySelector('[data-unit="days"]'),
    hours: el.querySelector('[data-unit="hours"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
    seconds: el.querySelector('[data-unit="seconds"]'),
  };
  let intervalId;

  function finish() {
    clearInterval(intervalId);
    el.innerHTML = '<p class="countdown__done-message">🎉 It\'s Bree\'s big day!</p>';
  }

  function tick() {
    const diff = Math.max(0, target - Date.now());

    if (diff <= 0) {
      finish();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    values.days.textContent = String(days);
    values.hours.textContent = String(hours).padStart(2, '0');
    values.minutes.textContent = String(minutes).padStart(2, '0');
    values.seconds.textContent = String(seconds).padStart(2, '0');
  }

  tick();
  intervalId = setInterval(tick, 1000);
}

function initRevealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('reveal--visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initScrollProgress() {
  const bar = document.getElementById('nav-progress');
  if (!bar) return;

  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = `${pct.toFixed(1)}%`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = 14;
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const left = (i * 7.3 + 3) % 100;
    const duration = 14 + (i % 5) * 3;
    const delay = -(i * 2.7);
    const size = 14 + (i % 4) * 5;
    petal.style.left = `${left}%`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    container.appendChild(petal);
  }
}

const countdownEl = document.getElementById('countdown');
if (countdownEl) startCountdown(countdownEl);

initRevealOnScroll();
initScrollProgress();
initPetals();

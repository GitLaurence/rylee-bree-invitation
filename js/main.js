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

const countdownEl = document.getElementById('countdown');
if (countdownEl) startCountdown(countdownEl);

initRevealOnScroll();

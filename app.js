// NAV TOGGLE
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('nav--open');
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const tgt = document.querySelector(link.getAttribute('href'));
    if (tgt) {
      tgt.scrollIntoView({ behavior: 'smooth' });
      nav.classList.remove('nav--open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// SCROLL DO KONTAKTU
document.querySelectorAll('.js-scroll-to-contact').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const contact = document.querySelector('#contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });
  });
});

// HERO FADE‑IN & PARALLAX
const hero = document.getElementById('hero');
new IntersectionObserver((entries, obs) => {
  entries.forEach(ent => {
    if (ent.isIntersecting) {
      ent.target.classList.add('hero--visible');
      obs.disconnect();
    }
  });
}, { threshold: 0.3 }).observe(hero);
window.addEventListener('scroll', () => {
  hero.style.backgroundPositionY = `${window.pageYOffset * 0.5}px`;
});

// TYPER EFFECT
const text = "Zacznij trenować z profesjonalistą";
let idx = 0;
const typeEl = document.querySelector('.typed-text');
function type() {
  if (idx < text.length) {
    typeEl.textContent += text[idx++];
    setTimeout(type, 100);
  }
}
document.addEventListener('DOMContentLoaded', type);

// RIPPLE EFFECT
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const circle = document.createElement('span');
    const d = Math.max(this.clientWidth, this.clientHeight);
    const r = d / 2;
    circle.style.width = circle.style.height = `${d}px`;
    circle.style.left = `${e.clientX - this.offsetLeft - r}px`;
    circle.style.top = `${e.clientY - this.offsetTop - r}px`;
    circle.classList.add('ripple');
    const rip = this.querySelector('.ripple');
    if (rip) rip.remove();
    this.appendChild(circle);
  });
});

// FOCUS TRAP IN MODAL
const openBtns = document.querySelectorAll('.js-open-modal');
const closeElems = document.querySelectorAll('.js-close-modal');
const modal = document.getElementById('modal');
const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let firstF, lastF;
function trap(e) {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstF) {
      e.preventDefault(); lastF.focus();
    } else if (!e.shiftKey && document.activeElement === lastF) {
      e.preventDefault(); firstF.focus();
    }
  }
}
openBtns.forEach(btn => btn.addEventListener('click', () => {
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');
  const nodes = modal.querySelectorAll(focusable);
  firstF = nodes[0]; lastF = nodes[nodes.length-1];
  firstF.focus();
  document.addEventListener('keydown', trap);
}));
closeElems.forEach(el => el.addEventListener('click', () => {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', trap);
}));

// PREFETCH CALENDAR.JS
const prefetchBtn = document.querySelector('.js-open-modal');
prefetchBtn.addEventListener('mouseenter', () => {
  if (!document.querySelector('script[src="calendar.js"]')) {
    const s = document.createElement('script');
    s.src = 'calendar.js';
    document.body.appendChild(s);
  }
}, { once: true });

// REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// DARK MODE TOGGLE
const darkToggle = document.querySelector('.dark-toggle');
darkToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  darkToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', newTheme);
});
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    darkToggle.textContent = saved === 'light' ? '🌙' : '☀️';
  }
});

// ANIMACJA KART USŁUG
const serviceCards = document.querySelectorAll('.service-card');
const ioServices = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('service-card--visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
serviceCards.forEach(card => ioServices.observe(card));

// FADE‑IN PUNKTÓW O MNIE
const aboutItems = document.querySelectorAll('.about__list li');
const ioList = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
aboutItems.forEach(li => ioList.observe(li));

// FILTER USŁUG
const filters = document.querySelectorAll('.services__filter input[type="checkbox"]');
filters.forEach(chk => chk.addEventListener('change', () => {
  const active = Array.from(filters)
    .filter(i => i.checked)
    .map(i => i.value);
  serviceCards.forEach(card => {
    const type = card.dataset.type;
    card.classList.toggle('service-card--hidden', !active.includes(type));
  });
}));
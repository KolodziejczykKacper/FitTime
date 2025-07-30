// ---- Dark Mode przy użyciu data-theme i prefers-color-scheme ----
const themeToggle = document.getElementById('themeToggle');
const iconTheme = document.getElementById('iconTheme');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  iconTheme.src = theme === 'dark' ? 'icons/sun.svg' : 'icons/moon.svg';
  localStorage.setItem('theme', theme);
}

let saved = localStorage.getItem('theme');
if (!saved) {
  saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
applyTheme(saved);

themeToggle.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ---- Sticky CTA z IntersectionObserver ----
const stickyBtn = document.getElementById('stickyBtn');
const heroSection = document.getElementById('hero');

const io = new IntersectionObserver(([e]) => {
  if (!e.isIntersecting) {
    stickyBtn.style.display = 'block';
    stickyBtn.style.animation = 'fadeInUp .3s ease-out';
  } else {
    stickyBtn.style.display = 'none';
  }
}, { rootMargin: '-200px 0px 0px 0px' });

io.observe(heroSection);

// --------------------------
// Dane treningów
// --------------------------
const trainings = [
  { title: 'EMS', image: 'img/ems.jpg', description: 'Trening elektrostymulacyjny...', cta: 'Wybierz EMS' },
  { title: 'Cardio', image: 'img/cardio.jpg', description: 'Spalanie kalorii...', cta: 'Wybierz Cardio' },
  { title: 'Siłowy', image: 'img/strength.jpg', description: 'Budowanie siły...', cta: 'Wybierz Siłowy' },
  { title: 'Mobilność', image: 'img/mobility.jpg', description: 'Poprawa zakresu ruchu...', cta: 'Wybierz Mobilność' }
];

// --------------------------
// Dane pakietów (cennik)
// --------------------------
const packagesList = [
  { title: 'Basic', price: '99 zł', benefits: ['1x trening tyg.', 'Dostęp online'], cta: 'Kup Basic' },
  { title: 'Pro', price: '179 zł', benefits: ['2x treningi tyg.', 'Plan żywieniowy'], cta: 'Kup Pro', featured: true },
  { title: 'Premium', price: '249 zł', benefits: ['3x treningi tyg.', 'Wsparcie 24/7'], cta: 'Kup Premium' }
];

// --------------------------
// Funkcja tworząca kartę
// --------------------------
function createCard(data, type) {
  const card = document.createElement('div');
  card.className = 'card' + (data.featured ? ' featured' : '');

  // Obraz
  const img = document.createElement('img');
  img.src = data.image;
  img.alt = data.title;
  img.loading = 'lazy';
  card.appendChild(img);

  // Treść
  const content = document.createElement('div');
  content.className = 'card-content';
  content.innerHTML = `
    <h3>${data.title} ${type === 'package' ? `– ${data.price}` : ''}</h3>
    <p>${data.description || ''}</p>
    ${ type === 'package'
        ? `<ul>${ data.benefits.map(b => `<li>✔️ ${b}</li>`).join('') }</ul>`
        : ''
    }
  `;
  // Przycisk
  const btn = document.createElement('a');
  btn.className = 'btn primary';
  btn.href = type === 'training' ? '#formularz' : '#formularz';
  btn.textContent = data.cta;
  content.appendChild(btn);

  card.appendChild(content);
  return card;
}

// --------------------------
// Wstrzyknięcie do DOM
// --------------------------
window.addEventListener('DOMContentLoaded', () => {
  const trenGrid = document.getElementById('trainingsGrid');
  trainings.forEach(t => trenGrid.appendChild(createCard(t, 'training')));

  const priceGrid = document.getElementById('pricingGrid');
  packagesList.forEach(p => priceGrid.appendChild(createCard(p, 'package')));
});


// ===========================
// 6. KALENDARZ + filtr, tooltip
// ===========================
const calendarGrid = document.getElementById('calendarGrid');
const filterInputs = document.querySelectorAll('#kalendarz .filter input');
let allSlots = [];

// Generuj sloty (poniedziałek–niedziela, 9:00–17:00 co 30 min)
function generateSlots() {
  const days = ['Pon','Wt','Śr','Czw','Pt','Sob','Nd'];
  const slots = [];
  days.forEach((day, di) => {
    for (let h = 9; h < 17; h++) {
      ['00','30'].forEach(m => {
        // przykładowy typ na zmianę co drugie
        const type = ['EMS','Cardio','Siłowy','Mobilność'][Math.floor(Math.random()*4)];
        const status = Math.random()<0.2 ? 'busy' : 'available';
        slots.push({ day, time:`${h}:${m}`, type, status });
      });
    }
  });
  return slots;
}

// Wyświetl sloty na stronie
function renderCalendar() {
  calendarGrid.innerHTML = '';
  // Filtruj wg checkboxów
  const active = Array.from(filterInputs).filter(i=>i.checked).map(i=>i.value);
  allSlots.forEach(slot => {
    if (!active.includes(slot.type)) return;
    const div = document.createElement('div');
    div.className = `slot ${slot.status}`;
    div.innerHTML = `${slot.day}<br>${slot.time}`;
    // Tooltip
    const tip = document.createElement('div');
    tip.className='tooltip';
    tip.textContent = `${slot.type}, ${slot.time}, ${slot.status}`;
    div.appendChild(tip);
    calendarGrid.appendChild(div);
  });
}

// Po załadowaniu
window.addEventListener('DOMContentLoaded',()=>{
  allSlots = generateSlots();
  renderCalendar();
  filterInputs.forEach(i=>i.addEventListener('change', renderCalendar));
});

// ===========================
// 7. FORMULARZ + .ICS
// ===========================
const form = document.getElementById('bookingForm');
const slotSelect = form.querySelector('select[name="slot"]');
const icsLinks = document.getElementById('icsLinks');

// Wypełnij select opcjami z allSlots
function populateSlotsSelect() {
  slotSelect.innerHTML = '<option value="">-- wybierz --</option>';
  allSlots.filter(s=>s.status==='available').forEach((s,idx)=>{
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${s.day} ${s.time} (${s.type})`;
    slotSelect.appendChild(opt);
  });
}

// Generuj plik .ics
function generateICS(data) {
  const dt = new Date();
  const start = dt.toISOString().replace(/[-:]|\.\d+/g,'');
  const uid = Date.now();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${uid}@twojadomena.pl`,
    `DTSTAMP:${start}`,
    `DTSTART:${data.start}`,
    `SUMMARY:Trening ${data.type}`,
    `DESCRIPTION:Rezerwacja treningu ${data.type}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return new Blob([ics],{type:'text/calendar'});
}

// Obsługa submit
form.addEventListener('submit', e=>{
  e.preventDefault();
  const idx = slotSelect.value;
  if (idx==='') return alert('Wybierz slot');
  const slot = allSlots[idx];
  // przygotuj datę w formacie YYYYMMDDThhmm00Z
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth()+1).padStart(2,'0');
  const day = String(now.getDate()).padStart(2,'0');
  const [h,m] = slot.time.split(':');
  const start = `${year}${month}${day}T${h.padStart(2,'0')}${m}00Z`;
  const blob = generateICS({ start, type: slot.type });
  const url = URL.createObjectURL(blob);

  icsLinks.innerHTML = `
    <a href="${url}" download="rezerwacja.ics">Pobierz .ICS</a>
    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${start}/${start}&text=Trening+${slot.type}" target="_blank">Dodaj do Google Calendar</a>
  `;
});

// Po załadowaniu wypełnij select
window.addEventListener('DOMContentLoaded', populateSlotsSelect);

// =============================
// 8. Testimonials Slider
// =============================
const slider = document.querySelector('.testimonial-slider');
const slidesContainer = slider.querySelector('.slides');
const slides = Array.from(slidesContainer.children);
const prevBtn = slider.querySelector('.prev');
const nextBtn = slider.querySelector('.next');
const dotsContainer = slider.querySelector('.dots');

let currentIndex = 0;

// Inicjalizacja kropek
slides.forEach((_, i) => {
  const btn = document.createElement('button');
  btn.setAttribute('role','tab');
  btn.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(btn);
});
const dots = Array.from(dotsContainer.children);

// Funkcja przejścia
function goToSlide(index) {
  currentIndex = index;
  const offset = -index * 100;
  slidesContainer.style.transform = `translateX(${offset}%)`;
  updateDots();
  slides[index].focus();
}

// Aktualizacja kropek
function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

// Obsługa przycisków
prevBtn.addEventListener('click', () => {
  const idx = (currentIndex - 1 + slides.length) % slides.length;
  goToSlide(idx);
});
nextBtn.addEventListener('click', () => {
  const idx = (currentIndex + 1) % slides.length;
  goToSlide(idx);
});

// Obsługa klawiatury (strzałki)
slider.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') prevBtn.click();
  if (e.key === 'ArrowRight') nextBtn.click();
});

// Start: pierwsze włączenie
goToSlide(0);

//Teraz wygeneruj sekcje:
//FAQ (Accordion) oraz Stopka (Footer)

//pamietaj o wczesniejszym planie projektu oraz załozeniach , funkcjonalnosciach a takze prosbach o raporty itd
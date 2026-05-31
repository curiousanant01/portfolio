async function loadAdmin(){
  try{
    const res = await fetch('./admin.json', { cache: 'no-store' });
    if(!res.ok) return null;
    return await res.json();
  }catch{ return null; }
}

function safeText(el, value){
  if(!el) return;
  el.textContent = value ?? '';
}

function renderAdmin(data){
  if(!data) return;

  // Contact
  document.querySelectorAll('[data-admin="email"]').forEach(el => el.setAttribute('href', 'mailto:' + data.contact?.email));
  document.querySelectorAll('[data-admin="emailText"]').forEach(el => el.textContent = data.contact?.email ?? '');
  document.querySelectorAll('[data-admin="phoneText"]').forEach(el => el.textContent = data.contact?.phone ?? '');
  const phoneLinks = document.querySelectorAll('[data-admin="phone"]');
  phoneLinks.forEach(a => a.setAttribute('href', 'tel:' + (data.contact?.phone ?? '')));

  document.querySelectorAll('[data-admin="linkedin"]').forEach(a => a.setAttribute('href', data.contact?.linkedin ?? '#'));

  // Skills
  const skillsGrid = document.querySelector('.skills-grid');
  if(skillsGrid && Array.isArray(data.skills)){
    skillsGrid.innerHTML = data.skills.map(group => `
      <div class="skill-group">
        <h3>${group.category ?? ''}</h3>
        <ul class="list">${(group.items||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
      </div>
    `).join('');
  }

  // Experience
  const timeline = document.querySelector('.timeline');
  if(timeline && Array.isArray(data.experience)){
    timeline.innerHTML = data.experience.map(job => `
      <article class="timeline-item" role="listitem">
        <div class="timeline-dot" aria-hidden="true"></div>
        <div class="timeline-body">
          <div class="timeline-top">
            <h3>${job.role ?? ''} — ${job.org ?? ''}</h3>
            <span class="timeline-date">${job.start ?? ''} – ${job.end ?? ''}</span>
          </div>
          <p>${job.description ?? ''}</p>
        </div>
      </article>
    `).join('');
  }

  // Projects
  const cards = document.querySelector('.cards-grid');
  const projectsSection = document.querySelector('#projects');
  if(projectsSection && cards && Array.isArray(data.projects)){
    cards.innerHTML = data.projects.map(p => `
      <article class="card">
        <div class="card-icon" aria-hidden="true">${p.icon ?? '🧩'}</div>
        <h3>${p.title ?? ''}</h3>
        <p>${p.description ?? ''}</p>
        <ul class="list">${(p.bullets||[]).map(b=>`<li>${b}</li>`).join('')}</ul>
      </article>
    `).join('');
  }

  // Certifications
  const certCards = document.querySelector('#certifications .cards-grid');
  if(certCards && Array.isArray(data.certifications)){
    certCards.innerHTML = data.certifications.map(c => `
      <article class="card card-compact">
        <div class="card-icon" aria-hidden="true">${c.icon ?? '✅'}</div>
        <h3>${c.title ?? ''}</h3>
        <p class="muted">${c.issuer ?? ''} • ${c.date ?? ''}</p>
      </article>
    `).join('');
  }
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#nav-menu');

function setOpen(isOpen){
  if (!menu) return;
  toggle?.setAttribute('aria-expanded', String(isOpen));
  menu.dataset.open = String(isOpen);
}

toggle?.addEventListener('click', () => {
  const isOpen = menu?.dataset.open === 'true';
  setOpen(!isOpen);
});

menu?.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  setOpen(false);
});

function hscrollBy(btnDir){
  const hscroll = btnDir?.closest?.('.hscroll');
  const track = hscroll?.querySelector('.hscroll-track');
  if(!track) return;
  const amount = Math.max(280, Math.floor(track.clientWidth * 0.75));
  track.scrollBy({ left: btnDir.dataset.dir === 'left' ? -amount : amount, behavior: 'smooth' });
}

document.querySelectorAll('.hscroll-btn').forEach(btn => {
  btn.addEventListener('click', () => hscrollBy(btn));
});

// Active section highlighting
const links = Array.from(document.querySelectorAll('.nav-link'));
const sections = links
  .map(l => document.querySelector(l.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

    if (!visible) return;
    const id = visible.target.id;
    links.forEach(l => {
      const href = l.getAttribute('href');
      const match = href === `#${id}`;
      l.style.color = match ? '#1d4ed8' : '';
      l.style.background = match ? 'rgba(37,99,235,.08)' : '';
    });
  },
  { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: '-20% 0px -60% 0px' }
);

sections.forEach(s => observer.observe(s));

// Optional: render dynamic sections from admin.json if present
// (Some deployments may not include README or other static assets; this is safe to ignore.)
loadAdmin().then(renderAdmin).catch(()=>{});



// ============================================================
// Script comun pentru toate paginile.
// ============================================================

// ---------- Tema (luminoasă / întunecată) ----------
// Tema e setată deja în <head>, înainte de afișare; aici adăugăm butonul.
const root = document.documentElement;
const btn = document.createElement('button');
btn.className = 'theme-toggle';
btn.innerHTML =
  '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
  '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
function label(){
  const light = root.dataset.theme === 'light';
  btn.setAttribute('aria-label', light ? 'Treci la tema întunecată' : 'Treci la tema luminoasă');
  btn.title = btn.getAttribute('aria-label');
}
btn.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('tema', next); } catch(e) {}
  label(); readColors();
});
label();
// Pune butonul în meniu, lângă linkuri
const nav = document.querySelector('nav'), ul = nav && nav.querySelector('ul');
if (ul) { const w = document.createElement('div'); w.className = 'nav-right'; ul.replaceWith(w); w.append(ul, btn); }

// Dacă vizitatorul nu a ales o temă, urmează setarea sistemului și când aceasta se schimbă
matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  let saved = null; try { saved = localStorage.getItem('tema'); } catch(err) {}
  if (!saved) { root.dataset.theme = e.matches ? 'light' : 'dark'; label(); readColors(); }
});

// Culorile fundalului animat se citesc din CSS, ca să se potrivească temei
let COL = {};
function readColors(){
  const cs = getComputedStyle(root);
  COL = { dot: cs.getPropertyValue('--dot').trim(), link: cs.getPropertyValue('--link').trim(),
          da: parseFloat(cs.getPropertyValue('--dot-alpha')), la: parseFloat(cs.getPropertyValue('--link-alpha')) };
}
readColors();

// Anul curent în subsol
document.querySelectorAll('.an').forEach(el => el.textContent = new Date().getFullYear());

// Marchează în meniu pagina curentă (după atributul data-page de pe <body>)
const page = document.body.dataset.page;
document.querySelectorAll('nav ul a').forEach(a => {
  if (a.dataset.page === page) a.classList.add('active');
});

// Secțiunile apar lin la scroll
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('show');
}), {threshold: .12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Fundal animat: puncte conectate între ele
const c = document.getElementById('bg');
if (c) {
  const ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, pts = [];
  const mouse = {x: -999, y: -999};
  function resize(){
    W = c.width = innerWidth; H = c.height = innerHeight;
    const n = Math.min(90, Math.floor(W * H / 16000));
    pts = Array.from({length: n}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: reduce ? 0 : (Math.random()-.5)*.35, vy: reduce ? 0 : (Math.random()-.5)*.35
    }));
  }
  addEventListener('resize', resize);
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();
  (function draw(){
    ctx.clearRect(0, 0, W, H);
    for (const p of pts){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = `rgba(${COL.dot},${COL.da})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++){
      for (let j = i+1; j < pts.length; j++){
        const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
        if (d < 130){
          ctx.strokeStyle = `rgba(${COL.link},${COL.la*(1-d/130)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      const dm = Math.hypot(pts[i].x-mouse.x, pts[i].y-mouse.y);
      if (dm < 160){
        ctx.strokeStyle = `rgba(${COL.dot},${2*COL.la*(1-dm/160)})`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
}

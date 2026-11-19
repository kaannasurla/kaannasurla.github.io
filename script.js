// ============================================================
// Script comun pentru toate paginile.
// ============================================================

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
      ctx.fillStyle = 'rgba(62,224,181,.55)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++){
      for (let j = i+1; j < pts.length; j++){
        const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
        if (d < 130){
          ctx.strokeStyle = `rgba(74,168,255,${.18*(1-d/130)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      const dm = Math.hypot(pts[i].x-mouse.x, pts[i].y-mouse.y);
      if (dm < 160){
        ctx.strokeStyle = `rgba(62,224,181,${.35*(1-dm/160)})`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
}

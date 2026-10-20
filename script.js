/* Birthday site for Basma — vanilla JS, no dependencies */
(() => {
'use strict';

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

const BIRTHDAY_MESSAGE = `Dear Basma,

Happy Birthday, my favorite human! 🎂 I tried to think of the perfect words, but honestly you already gave me the best thing: a friend who makes every ordinary day feel like a little party. 💗

Thank you for the laughs that hurt, the inside jokes nobody else gets, and for being the person I can call about literally anything. 🥹 Every memory with you is one I’d happily replay on repeat. 🎀

This year, I hope you get big joy, tiny miracles, good news that makes you scream, and all the cake you can handle. 🍰✨ Whatever comes, I’ll be right here cheering the loudest (and probably taking way too many photos of you 📸).

Love you loads,
Your bestie 💌`;

const SECRET_MESSAGE = 'Basma, you deserve all the happiness, laughter, love, and beautiful surprises in the world. Never stop being the amazing person you are. I’m so lucky to have you in my life. Happy Birthday, Bestie! 💗🎂🎀';

/* ---------- Floating particles ---------- */
const ambient = $('#ambient');
// 'o' = soft glowing orb
function spawn(chars, o = {}) {
  if (reduce || document.hidden) return;
  const { cls = 'rise', min = 18, max = 38, dur = [8, 14], into = ambient } = o;
  const c = pick(chars), el = document.createElement('span');
  el.className = `fl ${cls}${c === 'o' ? ' glow' : ''}`;
  if (c !== 'o') el.textContent = c;
  el.style.cssText = `--x:${rand(2, 96)}vw;--s:${rand(min, max)}px;--d:${rand(...dur)}s;--dx:${rand(-80, 80)}px`;
  el.addEventListener('animationend', () => el.remove());
  into.appendChild(el);
}
function shower(chars, n, o) { for (let i = 0; i < n; i++) setTimeout(() => spawn(chars, o), i * 90); }
setInterval(() => spawn(['💗', '✨', '🦋', '⭐', 'o', 'o', '🌸', '🎀']), 900);

/* ---------- Confetti (canvas) ---------- */
const cv = $('#confetti'), cx = cv.getContext('2d');
const COLORS = ['#ff7eb0', '#ffc2d6', '#ffffff', '#c8ccd6', '#ff4d94', '#ffe0ec'];
let parts = [], running = false;
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
fit(); addEventListener('resize', fit);

function burst(x, y, n = 90) {
  n = reduce ? Math.ceil(n / 5) : n;
  for (let i = 0; i < n; i++) parts.push({
    x, y, vx: rand(-7, 7), vy: rand(-14, -3), w: rand(5, 10), h: rand(3, 7),
    c: pick(COLORS), a: rand(0, 6.3), va: rand(-.3, .3), l: 1, heart: Math.random() < .18
  });
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.l > 0 && p.y < cv.height + 30);
  for (const p of parts) {
    p.vy += .28; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; p.l -= .006;
    cx.save(); cx.globalAlpha = Math.min(1, p.l * 2); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c;
    if (p.heart) { cx.font = '16px serif'; cx.fillText('💗', -8, 6); } else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cx.restore();
  }
  if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
function celebrate() {
  [0, 300, 600, 900, 1300, 1700, 2200].forEach(t =>
    setTimeout(() => burst(rand(.15, .85) * innerWidth, rand(.25, .55) * innerHeight, 110), t));
  shower(['💖', '💗', '✨', '🎀', '⭐', '🦋'], 30, { min: 24, max: 50, dur: [5, 9] });
}

/* ---------- Scene switching ---------- */
const scenes = { gift: $('#gift'), game: $('#game'), bday: $('#bday') };
function go(name) {
  for (const [k, el] of Object.entries(scenes)) el.classList.toggle('active', k === name);
  scrollTo(0, 0);
  const h = scenes[name].querySelector('h1,h2');
  if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
}

/* ---------- Experience 1: gift ---------- */
$('#open').addEventListener('click', e => {
  e.currentTarget.disabled = true;
  const box = $('#giftbox'), r = box.getBoundingClientRect();
  box.classList.add('open');
  setTimeout(() => { burst(r.left + r.width / 2, r.top + 30, 120); shower(['💗', '✨', '⭐', '🎀', '💖'], 24, { min: 22, max: 44, dur: [4, 8] }); }, 350);
  setTimeout(() => go('game'), 1900);
});

/* ---------- Experience 2: yes / no game ---------- */
const yes = $('#yes'), no = $('#no'), msg = $('#msg'), count = $('#count'), btns = $('#btns');
const MSGS = ['Excuse me?! 😭', 'Basma, think againnn! 🥹', 'That button is getting suspicious... 👀',
  'Girl, you have ONE job! 😂💕', 'The YES button is taking overrr! 💗', 'Wrong button, bestie! 🙈',
  'The NO button is scared now 🥺', 'Okay, this is getting embarrassing 😭', 'Just press YES, we both know it 💖'];
let noClicks = 0, won = false;

function growYes() {
  // Cap the growth so YES never overflows the card on small screens
  const max = Math.min(3.2, ($('.card', scenes.game).clientWidth - 40) / yes.offsetWidth);
  const s = Math.min(max, 1 + noClicks * .35);
  yes.style.transform = `scale(${s})`;
  btns.style.minHeight = `${yes.offsetHeight * s + 20}px`;
}
// Move NO to a random spot that doesn't cover the text or the YES button
function dodge() {
  const b = no.getBoundingClientRect(), m = 10;
  const avoid = ['#q', '#msg', '#count'].map(s => $(s).getBoundingClientRect()).concat(yes.getBoundingClientRect());
  let x = m, y = m;
  for (let i = 0; i < 40; i++) {
    x = rand(m, Math.max(m, innerWidth - b.width - m)); y = rand(m, Math.max(m, innerHeight - b.height - m));
    if (!avoid.some(r => x < r.right + 8 && x + b.width > r.left - 8 && y < r.bottom + 8 && y + b.height > r.top - 8)) break;
  }
  no.style.left = x + 'px'; no.style.top = y + 'px';
}
no.addEventListener('click', () => {
  if (won) return;
  noClicks++;
  count.textContent = `NO clicks: ${noClicks}`;
  msg.textContent = MSGS[(noClicks - 1) % MSGS.length];
  if (!no.classList.contains('flee')) {            // lift NO out of the layout on first click
    const r = no.getBoundingClientRect();
    no.style.left = r.left + 'px'; no.style.top = r.top + 'px';
    no.classList.add('flee'); void no.offsetWidth;
  }
  no.style.transform = `scale(${Math.max(.55, 1 - noClicks * .06)})`;
  growYes(); dodge();
});
// Desktop only: NO playfully dodges the cursor (touch just moves it on tap)
no.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && noClicks > 0 && !won) dodge(); });
addEventListener('resize', () => { if (noClicks && !won) { growYes(); dodge(); } });

yes.addEventListener('click', () => {
  won = true;
  $('#play').hidden = true; no.hidden = true; count.hidden = true; $('#win').hidden = false;
  $('#win h2').focus({ preventScroll: true });
  celebrate();
});

/* ---------- Experience 3: birthday reveal ---------- */
const typeEl = $('#type'), letter = $('#letter');
let typer;
function typeText(text) {
  clearInterval(typer);
  if (reduce) { typeEl.textContent = text; return; }
  const chars = [...text]; let i = 0;
  typeEl.classList.add('typing');
  typer = setInterval(() => {
    typeEl.textContent = chars.slice(0, ++i).join('');
    if (i >= chars.length) { clearInterval(typer); typeEl.classList.remove('typing'); }
  }, 22);
}
letter.addEventListener('click', () => { clearInterval(typer); typeEl.textContent = BIRTHDAY_MESSAGE; typeEl.classList.remove('typing'); });

function runCountdown() {
  const cd = $('#cd'), steps = ['3', '2', '1'];
  let i = 0;
  const t = setInterval(() => {
    if (i < steps.length) cd.innerHTML = `<b class="num">${steps[i++]}</b>`;
    else {
      clearInterval(t);
      cd.innerHTML = '<b>YOUR SPECIAL DAY IS HERE!</b>';
      burst(innerWidth / 2, innerHeight * .4, 140);
      letter.classList.add('show'); typeText(BIRTHDAY_MESSAGE);
    }
  }, 850);
}
// Cake: tap to blow out / relight
$('#cake').addEventListener('click', e => {
  const c = e.currentTarget, r = c.getBoundingClientRect();
  c.classList.toggle('out');
  if (c.classList.contains('out')) { burst(r.left + r.width / 2, r.top, 100); shower(['🎈', '🎉', '💗'], 6, { min: 30, max: 56 }); }
});
let started = false;
$('#toBday').addEventListener('click', () => {
  go('bday');
  if (started) return; started = true;
  setInterval(() => scenes.bday.classList.contains('active') && spawn(['🎈', '🎈', '💗', '✨', '⭐'], { min: 32, max: 64, dur: [9, 15] }), 1100);
  shower(['🎈'], 8, { min: 40, max: 64, dur: [8, 14] });
  burst(innerWidth / 2, innerHeight * .35, 120);
  setTimeout(runCountdown, 700);
});

/* ---------- Experience 4: secret surprise ---------- */
const secret = $('#secret'), sm = $('#sm'), petals = $('#petals');
let petalTimer;
$('#surprise').addEventListener('click', () => {
  secret.hidden = false;
  sm.innerHTML = '';
  const words = SECRET_MESSAGE.split(' ');
  words.forEach((w, i) => {
    const s = document.createElement('span'); s.textContent = w; s.style.animationDelay = `${0.6 + i * .16}s`;
    sm.append(s, ' ');
  });
  const end = 0.6 + words.length * .16;
  secret.style.setProperty('--sd', `${end + .4}s`);
  secret.style.setProperty('--bd', `${end + 3.8}s`);
  // restart the signature + button animations
  ['#sig', '#back'].forEach(s => { const el = $(s); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
  burst(innerWidth / 2, innerHeight / 2, 160);
  petalTimer = setInterval(() => spawn(['🌸', '🌸', '💗', '✨', 'o'], { cls: 'fall', min: 18, max: 40, dur: [6, 11], into: petals }), 260);
  $('#back').focus({ preventScroll: true });
});
function closeSecret() { secret.hidden = true; clearInterval(petalTimer); petals.innerHTML = ''; }
$('#back').addEventListener('click', closeSecret);
addEventListener('keydown', e => { if (e.key === 'Escape' && !secret.hidden) closeSecret(); });

/* ---------- Music (user-triggered only; site works without the file) ---------- */
const audio = $('#music'), mb = $('#music-btn'), toastEl = $('#toast');
let toastT;
function toast(t) { toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 3200); }
mb.addEventListener('click', () => {
  if (audio.paused) audio.play().catch(() => toast('Add your song as music/birthday.mp3 to hear music 🎵'));
  else audio.pause();
});
audio.addEventListener('play', () => { mb.textContent = '⏸'; mb.setAttribute('aria-pressed', 'true'); mb.setAttribute('aria-label', 'Pause music'); });
audio.addEventListener('pause', () => { mb.textContent = '🎵'; mb.setAttribute('aria-pressed', 'false'); mb.setAttribute('aria-label', 'Play music'); });
})();
/* ══════════════════════════════════════════════════════
   Vega Fotografía — página de sesión
   ══════════════════════════════════════════════════════ */

/* WhatsApp de contacto: el mismo que en app.js */
const WHATSAPP = '5492604630599';

const SESIONES = window.SESIONES || [];
const id = new URLSearchParams(location.search).get('id');
const s  = SESIONES.find(x => x.id === id);

const $titulo  = document.getElementById('titulo');
const $meta    = document.getElementById('meta');
const $galeria = document.getElementById('galeria');

if (!s) {
  $titulo.textContent = 'No encontramos esta sesión';
  $meta.innerHTML = '<span>Puede que el enlace esté incompleto. Volvé al listado y elegila de nuevo.</span>';
  document.querySelector('.sesion-acciones').style.display = 'none';
} else {
  document.title = `${s.x} · ${s.p} — Vega Fotografía`;
  $titulo.textContent = s.x;
  $meta.innerHTML =
    `<span>Año <b>${s.p}</b></span>` +
    (s.n ? `<span>Negativo <b>N.º ${s.n}</b></span>` : '') +
    `<span><b>${s.fotos.length}</b> ${s.fotos.length === 1 ? 'foto' : 'fotos'}</span>`;

  const frag = document.createDocumentFragment();
  s.fotos.forEach((f, i) => {
    const fig = document.createElement('figure');
    fig.innerHTML =
      `<img src="fotos/${s.id}/th/${f.f}" width="${f.w}" height="${f.h}"
            loading="lazy" alt="${s.x} — foto ${i + 1} de ${s.fotos.length}">`;
    fig.addEventListener('click', () => abrir(i));
    frag.appendChild(fig);
  });
  $galeria.appendChild(frag);

  const ref = s.n ? `${s.p}, negativo N.º ${s.n}` : s.p;
  const texto =
    `¡Hola! Vi la sesión "${s.x}" (${ref}) en la página de Vega Fotografía y quería consultar por las fotos.`;
  const $wsp = document.getElementById('wspSesion');
  $wsp.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

  /* Meta Pixel: evento Contact, indicando de qué sesión salió la consulta.
     Si el visitante bloquea el pixel, fbq no existe y no pasa nada. */
  $wsp.addEventListener('click', () => {
    if (typeof fbq === 'function') {
      fbq('track', 'Contact', { content_name: s.x, content_ids: [s.id], content_type: 'sesion' });
    }
  });
}

/* ── Copiar enlace ───────────────────────────────── */
const $comp = document.getElementById('compartir');
if ($comp) {
  $comp.addEventListener('click', async () => {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title: document.title, url }); return; }
      await navigator.clipboard.writeText(url);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
    const antes = $comp.textContent;
    $comp.textContent = '¡Enlace copiado!';
    setTimeout(() => { $comp.textContent = antes; }, 2000);
  });
}

/* ── Visor ───────────────────────────────────────── */
const $visor = document.getElementById('visor');
const $vImg  = document.getElementById('vImg');
const $vCont = document.getElementById('vCont');
let actual = 0;

function abrir(i) {
  if (!s) return;
  actual = i;
  $vImg.src = `fotos/${s.id}/${s.fotos[i].f}`;
  $vImg.alt = `${s.x} — foto ${i + 1}`;
  $vCont.textContent = `${i + 1} / ${s.fotos.length}`;
  $visor.classList.add('abierto');
  document.body.style.overflow = 'hidden';
}
function cerrar() {
  $visor.classList.remove('abierto');
  document.body.style.overflow = '';
  $vImg.src = '';
}
function mover(d) {
  if (!s) return;
  abrir((actual + d + s.fotos.length) % s.fotos.length);
}

document.getElementById('vCerrar').addEventListener('click', cerrar);
document.getElementById('vAnt').addEventListener('click', e => { e.stopPropagation(); mover(-1); });
document.getElementById('vSig').addEventListener('click', e => { e.stopPropagation(); mover(1); });
$visor.addEventListener('click', e => { if (e.target === $visor) cerrar(); });
document.addEventListener('keydown', e => {
  if (!$visor.classList.contains('abierto')) return;
  if (e.key === 'Escape')     cerrar();
  if (e.key === 'ArrowLeft')  mover(-1);
  if (e.key === 'ArrowRight') mover(1);
});

/* Deslizar en celular */
let x0 = null;
$visor.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
$visor.addEventListener('touchend', e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 55) mover(dx < 0 ? 1 : -1);
  x0 = null;
}, { passive: true });

/* ══════════════════════════════════════════════════════
   Vega Fotografía — buscador y portada
   ══════════════════════════════════════════════════════ */

/* WhatsApp de contacto: 54 (país) + 9 (celular) + 2604 (área) + número */
const WHATSAPP = '5492604630599';

const CLIENTES = window.CLIENTES || [];
const SESIONES = window.SESIONES || [];

/* ── Utilidades ──────────────────────────────────── */
const SIN_TILDE = /[\u0300-\u036f]/g;
const norm = s => (s || '')
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const fmt = n => n.toLocaleString('es-AR');

const clave = c => c.p + '|' + c.n + '|' + c.x;

/* ── Índices ─────────────────────────────────────── */
const porClave = {};
SESIONES.forEach(s => { porClave[clave(s)] = s; });

const INDICE = CLIENTES.map(c => ({
  p: c.p,
  n: c.n,
  x: c.x,
  s: porClave[clave(c)] || null,
  b: norm(c.x + ' ' + c.n + ' ' + c.p)
}));

const totalFotos = SESIONES.reduce((a, s) => a + s.fotos.length, 0);

/* ── Cifras ──────────────────────────────────────── */
const setTxt = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
setTxt('c-registros', fmt(CLIENTES.length));
setTxt('c-sesiones', fmt(SESIONES.length));
setTxt('c-fotos', fmt(totalFotos));
setTxt('sub-total', fmt(CLIENTES.length));

/* ── Filtro de períodos ──────────────────────────── */
const selPeriodo = document.getElementById('periodo');
if (selPeriodo) {
  [...new Set(CLIENTES.map(c => c.p))].sort().forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p;
    selPeriodo.appendChild(o);
  });
}

/* ── Buscador ────────────────────────────────────── */
const $q       = document.getElementById('q');
const $res     = document.getElementById('resultados');
const $estado  = document.getElementById('estado');
const $mas     = document.getElementById('verMas');
const $limpiar = document.getElementById('limpiar');
const $soloF   = document.getElementById('soloFotos');

const TANDA = 40;
let encontrados = [];
let mostrados = 0;

function resaltar(texto, tokens) {
  if (!tokens.length) return texto;
  const nt = norm(texto);
  const marcas = [];
  tokens.forEach(t => {
    let i = nt.indexOf(t);
    while (i !== -1) { marcas.push([i, i + t.length]); i = nt.indexOf(t, i + 1); }
  });
  if (!marcas.length) return texto;
  marcas.sort((a, b) => a[0] - b[0]);
  const unidas = [];
  marcas.forEach(m => {
    const u = unidas[unidas.length - 1];
    if (u && m[0] <= u[1]) u[1] = Math.max(u[1], m[1]);
    else unidas.push([...m]);
  });
  let out = '', pos = 0;
  unidas.forEach(([a, b]) => {
    out += texto.slice(pos, a) + '<mark>' + texto.slice(a, b) + '</mark>';
    pos = b;
  });
  return out + texto.slice(pos);
}

function fila(r, tokens) {
  const div = document.createElement('div');
  div.className = 'fila' + (r.s ? ' fila--conFoto' : '');
  const accion = r.s
    ? `<a class="btn btn--principal" href="sesion.html?id=${r.s.id}">Ver sesión · ${r.s.fotos.length}</a>`
    : `<span class="fila__sinfoto">Sin digitalizar</span>`;
  div.innerHTML =
    `<div class="fila__num">${r.n || '·'}</div>
     <div class="fila__datos">
       <div class="fila__nombre">${resaltar(r.x, tokens)}</div>
       <div class="fila__periodo">${r.p}</div>
     </div>
     <div class="fila__accion">${accion}</div>`;
  return div;
}

function pintar(reset) {
  if (reset) { $res.innerHTML = ''; mostrados = 0; }
  const tokens = norm($q.value).split(/\s+/).filter(Boolean);
  const trozo = encontrados.slice(mostrados, mostrados + TANDA);
  const frag = document.createDocumentFragment();
  trozo.forEach(r => frag.appendChild(fila(r, tokens)));
  $res.appendChild(frag);
  mostrados += trozo.length;
  $mas.hidden = mostrados >= encontrados.length;
  if (!$mas.hidden) $mas.textContent = `Ver más (${fmt(encontrados.length - mostrados)} restantes)`;
}

function buscar() {
  const txt = $q.value.trim();
  const tokens = norm(txt).split(/\s+/).filter(Boolean);
  const per = selPeriodo ? selPeriodo.value : '';
  const soloF = $soloF && $soloF.checked;
  $limpiar.hidden = !txt;

  if (!tokens.length && !per && !soloF) {
    encontrados = [];
    $res.innerHTML = '';
    $mas.hidden = true;
    $estado.textContent = 'Empezá a escribir para buscar.';
    return;
  }

  encontrados = INDICE.filter(r =>
    (!per || r.p === per) &&
    (!soloF || r.s) &&
    tokens.every(t => r.b.includes(t))
  );

  if (!encontrados.length) {
    $res.innerHTML = '';
    $mas.hidden = true;
    $estado.innerHTML = `Sin resultados para <strong>${txt || 'ese filtro'}</strong>. Probá con otra forma de escribir el apellido — en los cuadernos hay variantes.`;
    return;
  }

  const conFotos = encontrados.filter(r => r.s).length;
  $estado.innerHTML =
    `<strong>${fmt(encontrados.length)}</strong> ${encontrados.length === 1 ? 'resultado' : 'resultados'}` +
    (conFotos ? ` · <strong>${fmt(conFotos)}</strong> con fotos para ver` : '');
  pintar(true);
}

if ($q) {
  let t;
  $q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(buscar, 110); });
  selPeriodo.addEventListener('change', buscar);
  $soloF.addEventListener('change', buscar);
  $mas.addEventListener('click', () => pintar(false));
  $limpiar.addEventListener('click', () => { $q.value = ''; $q.focus(); buscar(); });
}

/* ── Grilla de sesiones ──────────────────────────── */
const $grilla = document.getElementById('grilla');
if ($grilla) {
  const frag = document.createDocumentFragment();
  SESIONES.forEach(s => {
    const a = document.createElement('a');
    a.className = 'tarjeta revelar';
    a.href = 'sesion.html?id=' + s.id;
    a.innerHTML =
      `<div class="tarjeta__foto" style="background-image:url('fotos/${s.id}/th/${s.fotos[0].f}')">
         <span class="tarjeta__cant">${s.fotos.length} fotos</span>
       </div>
       <div class="tarjeta__cuerpo">
         <h3 class="tarjeta__nombre">${s.x}</h3>
         <div class="tarjeta__meta">${s.p} · N.º ${s.n}</div>
       </div>`;
    frag.appendChild(a);
  });
  $grilla.appendChild(frag);
}

/* ── WhatsApp ────────────────────────────────────── */
const wspURL = txt => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;

const $wsp = document.getElementById('wspGeneral');
if ($wsp) $wsp.href = wspURL('¡Hola! Estuve buscando en el archivo de Vega Fotografía y encontré un registro. Quería consultar por esta sesión:');

const $form = document.getElementById('historiaForm');
if ($form) {
  $form.addEventListener('submit', e => {
    e.preventDefault();
    const nom = document.getElementById('h-nombre').value.trim();
    const txt = document.getElementById('h-texto').value.trim();
    if (!nom || !txt) return;
    window.open(wspURL(`Hola, quiero dejar mi historia para el muro de Vega Fotografía.\n\nNombre: ${nom}\n\n${txt}`), '_blank');
  });
}

/* ── Navegación y aparición ──────────────────────── */
const $nav = document.querySelector('.nav');
const marcarNav = () => $nav.classList.toggle('solido', window.scrollY > 40);
marcarNav();
window.addEventListener('scroll', marcarNav, { passive: true });

document.querySelectorAll('.seccion, .cifra').forEach(el => el.classList.add('revelar'));
const obs = new IntersectionObserver((entradas, o) => {
  entradas.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visible'); o.unobserve(en.target); }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.revelar').forEach(el => obs.observe(el));

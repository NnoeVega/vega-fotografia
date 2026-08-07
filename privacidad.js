/* ══════════════════════════════════════════════════════
   Vega Fotografía — página de privacidad
   ══════════════════════════════════════════════════════ */

/* El mismo número que en app.js y sesion.js */
const WHATSAPP = '5492604630599';

const texto =
  'Hola, escribo por el archivo de Vega Fotografía. Encontré un registro mío ' +
  'y quisiera pedir que lo quiten de la página. Mis datos son:';

const $wsp = document.getElementById('wspPrivacidad');
if ($wsp) {
  $wsp.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  $wsp.addEventListener('click', () => {
    if (typeof fbq === 'function') fbq('track', 'Contact', { content_name: 'baja-de-registro' });
  });
}

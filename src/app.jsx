const { useState, useMemo, useEffect, useRef } = React;

/* ---------- Íconos (paths estilo Lucide, inline) ---------- */
const PATHS = {
  inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  mail: <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  check: <><path d="M20 6 9 17l-5-5"/></>,
  search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  hand: <><path d="M18 11V6a2 2 0 0 0-4 0v1"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></>,
  undo: <><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></>,
  headset: <><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></>,
  paperclip: <><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>,
  zap: <><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></>,
  sliders: <><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></>,
  bar: <><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></>,
  pause: <><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></>,
  play: <><polygon points="6 3 20 12 6 21 6 3"/></>,
  alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
  moon: <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></>,
  pencil: <><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></>,
  send: <><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>,
  x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  minus: <><path d="M5 12h14"/></>,
  plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
};
const Icon = ({ name, size = 16, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{PATHS[name]}</svg>
);

/* ---------- Datos ---------- */
const ADVISORS = [
  { id: 'a1', name: 'Ana Martínez', color: 'bg-sky-500' },
  { id: 'a2', name: 'Bruno Hernández', color: 'bg-emerald-500' },
  { id: 'a3', name: 'Carla Ramírez', color: 'bg-violet-500' },
  { id: 'a4', name: 'Diego Torres', color: 'bg-amber-500' },
  { id: 'a5', name: 'Elena Cruz', color: 'bg-rose-500' },
  { id: 'a6', name: 'Fernando López', color: 'bg-cyan-600' },
  { id: 'a7', name: 'Gabriela Soto', color: 'bg-indigo-500' },
  { id: 'a8', name: 'Héctor Vega', color: 'bg-teal-600' },
  { id: 'a9', name: 'Irma Flores', color: 'bg-fuchsia-500' },
];
const advisorById = (id) => ADVISORS.find(a => a.id === id);
const initials = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('');

let NOW0 = Date.now();
const mk = (id, name, from, subject, min, priority, status, assignee, body, o = {}) => {
  const receivedAt = NOW0 - min * 60000;
  const assignedAt = assignee ? receivedAt + (o.wait ?? 5) * 60000 : null;
  const resolvedAt = status === 'resolved' ? assignedAt + (o.res ?? 20) * 60000 : null;
  const firstReplyAt = (status === 'resolved' || status === 'in_progress') && assignedAt ? assignedAt + (o.fr ?? Math.min(o.res ?? 20, 8)) * 60000 : null;
  const files = o.attach ? (o.files || [{ name: 'adjunto.pdf', size: 204800 }]) : [];
  return { id, name, from, subject, priority, status, assignee, body, attach: files.length > 0, files, replies: [], receivedAt, assignedAt, firstReplyAt, resolvedAt };
};

const HIST_SUBJ = ['Cambio de titular del contrato', 'Reporte de falla en internet en casa', 'Solicitud de factura duplicada', 'Configuración de APN corporativo', 'Reubicación de servicio', 'Consulta de consumo del mes', 'Restablecer contraseña del portal'];
const HIST_CO = ['Gym Fuerza', 'Tortillería La Esperanza', 'Óptica Visión', 'Autolavado Centro', 'Estética Bella', 'Imprenta Gómez', 'Veterinaria Patitas', 'Mueblería Oriente', 'Farmacia San José', 'Contadores Asociados', 'Lavandería Express', 'Panadería Trigo', 'Radio Taxi Sur', 'Dental Plus'];
const buildHistory = () => HIST_CO.map((co, i) =>
  mk(100 + i, co, `contacto${i}@ejemplo.mx`, HIST_SUBJ[i % 7], 130 + i * 24, ['media', 'baja', 'alta'][i % 3], 'resolved', ADVISORS[i % 9].id,
     'Caso atendido y cerrado por correo.', { wait: 2 + (i * 5) % 16, res: 10 + (i * 9) % 38 }));

const buildEmails = () => [
  mk(1, 'Ferretería El Sol', 'compras@ferreteriaelsol.mx', 'Internet en casa sin servicio desde ayer', 4, 'alta', 'unassigned', null,
    'Buen día, desde ayer por la tarde nuestro módem Telcel en casa pospago no tiene internet. Ya reiniciamos el equipo y sigue la luz roja. Necesitamos soporte urgente porque operamos con punto de venta en línea.\n\nLínea: 55 1234 5678\nSaludos.'),
  mk(2, 'Grupo Lomas – TI', 'ti@grupolomas.com.mx', 'Solicitud de cambio de APN en 25 líneas corporativas', 11, 'media', 'unassigned', null,
    'Hola equipo de soporte, requerimos cambiar el APN de 25 líneas corporativas (listado adjunto). Favor de confirmar el procedimiento y tiempos estimados.\n\nAtentamente,\nÁrea de TI', { attach: true, files: [{ name: 'listado_lineas.xlsx', size: 48210 }] }),
  mk(3, 'Despacho Reyes', 'contabilidad@despachoreyes.com', 'Duda sobre factura del mes de octubre', 18, 'baja', 'unassigned', null,
    'Buen día, la factura de octubre muestra un cargo por equipo que no reconocemos. Adjunto el PDF. ¿Pueden revisar?\n\nGracias.', { attach: true, files: [{ name: 'factura_octubre.pdf', size: 318400 }] }),
  mk(4, 'Jorge Páez', 'jorge.paez@clinicasanta.mx', 'URGENTE: Se cayó el internet en sucursal Coyoacán', 23, 'alta', 'unassigned', null,
    'Tenemos toda la sucursal sin conexión desde las 8:10 am. Pacientes esperando y no podemos acceder al expediente electrónico. Por favor atiendan lo antes posible.'),
  mk(5, 'Taller Hermanos', 'admin@tallerhermanos.mx', 'Cómo configurar correo corporativo en mi celular', 35, 'baja', 'unassigned', null,
    'Buenas tardes, ¿me pueden indicar los pasos para configurar el correo de la empresa en un Android? Gracias.'),
  mk(6, 'Logística Norte', 'sistemas@logisticanorte.com', 'Velocidad lenta en internet en casa pospago (RE: Folio 88421)', 52, 'media', 'unassigned', null,
    'Damos seguimiento al folio 88421. Seguimos con velocidades por debajo de lo contratado, 8 Mbps contra 50 Mbps. Solicitamos visita técnica.'),
  mk(7, 'Papelería Modelo', 'rh@papeleriamodelo.mx', 'Portabilidad de 3 líneas empresariales', 74, 'media', 'unassigned', null,
    'Queremos portar 3 líneas a un plan empresarial. ¿Qué documentos necesitan y cuánto tarda?'),
  mk(8, 'Escuela Luz María', 'direccion@escuelaluzmaria.edu.mx', 'No tenemos acceso al portal Mi Telcel Empresas', 95, 'baja', 'unassigned', null,
    'Intentamos entrar al portal pero marca contraseña inválida. Ya probamos recuperar y no llega el correo.'),
  mk(9, 'Aceros Latam', 'it@aceroslatam.com', 'Reconfiguración de router por cambio de domicilio', 130, 'media', 'in_progress', 'a2',
    'Nos cambiamos de domicilio y necesitamos reubicar el servicio de internet en casa pospago.', { wait: 6 }),
  mk(10, 'Pastelería Dulce', 'gerencia@pasteleriadulce.mx', 'Cobro duplicado en recibo', 160, 'alta', 'assigned', 'a1',
    'Nos cobraron dos veces el mes de octubre. Adjunto comprobantes.', { attach: true, wait: 4, files: [{ name: 'comprobante_1.jpg', size: 912000 }, { name: 'comprobante_2.jpg', size: 874000 }] }),
  ...buildHistory(),
];

const NEW_EMAIL_POOL = [
  ['Refaccionaria Pérez', 'contacto@refaccionariaperez.mx', 'Línea sin señal en zona Iztapalapa', 'alta'],
  ['Estudio Jurídico Ríos', 'admin@juridicorios.com', 'Solicitud de carta de no adeudo', 'baja'],
  ['Hotel Plaza Sur', 'sistemas@hotelplazasur.mx', 'Wi-Fi de huéspedes intermitente', 'media'],
  ['Distribuidora Azteca', 'ti@distazteca.com', 'Alta de 10 líneas nuevas con equipo', 'media'],
];

const MODES = {
  pull:   { label: 'Libre',      icon: 'hand',  title: 'Libre (los asesores toman)',
            desc: 'Los asesores ven la bandeja general y toman el caso que quieran.',
            visible: 'Los asesores VEN la bandeja general y pueden tomar casos.' },
  auto:   { label: 'Automático', icon: 'zap',   title: 'Automático',
            desc: 'Cada correo se asigna solo al asesor disponible con menos carga. Al terminar un caso, entra el siguiente.',
            visible: 'Los asesores NO ven la bandeja general; solo los casos que se les asignan.' },
  manual: { label: 'Manual',     icon: 'user',  title: 'Manual (lo asigno yo)',
            desc: 'Los correos esperan en la bandeja hasta que tú los asignes a cada asesor.',
            visible: 'Los asesores NO ven la bandeja general; solo los casos que tú les asignas.' },
};

const PRIORITY = {
  alta:  'bg-rose-50 text-rose-700 ring-rose-200',
  media: 'bg-amber-50 text-amber-700 ring-amber-200',
  baja:  'bg-slate-100 text-slate-600 ring-slate-200',
};
const PRANK = { alta: 0, media: 1, baja: 2 };
const STATUS = {
  unassigned:  { label: 'Sin asignar', cls: 'bg-slate-100 text-slate-700 ring-slate-300', dot: 'bg-slate-400' },
  assigned:    { label: 'Asignado',    cls: 'bg-sky-50 text-sky-700 ring-sky-200',         dot: 'bg-sky-500' },
  in_progress: { label: 'En proceso',  cls: 'bg-amber-50 text-amber-700 ring-amber-200',   dot: 'bg-amber-500' },
  resolved:    { label: 'Resuelto',    cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
};

const PRESENCE = {
  available: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', on: 'bg-emerald-600 text-white ring-emerald-600' },
  lunch:     { label: 'Comida',     cls: 'bg-amber-50 text-amber-700 ring-amber-200',       on: 'bg-amber-500 text-white ring-amber-500' },
  bathroom:  { label: 'Baño',       cls: 'bg-sky-50 text-sky-700 ring-sky-200',             on: 'bg-sky-600 text-white ring-sky-600' },
  quality:   { label: 'Calidad',    cls: 'bg-violet-50 text-violet-700 ring-violet-200',    on: 'bg-violet-600 text-white ring-violet-600' },
};

/* ---------- Utilidades ---------- */
const mins = (ms) => Math.max(0, Math.round(ms / 60000));
const fmtMin = (m) => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`;
const ago = (t, now) => { const m = mins(now - t); return m < 1 ? 'ahora' : `hace ${fmtMin(m)}`; };
const isOpen = (e) => e.status === 'assigned' || e.status === 'in_progress';
const openCount = (emails, id) => emails.filter(e => e.assignee === id && isOpen(e)).length;
const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

/* Motor de reparto automático: asigna correos libres a asesores disponibles con espacio */
function distribute(emails, paused, capacity, order) {
  const open = {}, lastAt = {};
  ADVISORS.forEach(a => { open[a.id] = openCount(emails, a.id); lastAt[a.id] = 0; });
  emails.forEach(e => { if (e.assignee && e.assignedAt) lastAt[e.assignee] = Math.max(lastAt[e.assignee], e.assignedAt); });
  const queue = emails.filter(e => e.status === 'unassigned').sort((a, b) =>
    order === 'priority' ? (PRANK[a.priority] - PRANK[b.priority]) || (a.receivedAt - b.receivedAt) : a.receivedAt - b.receivedAt);
  const avail = ADVISORS.filter(a => !paused[a.id]);
  const map = {}; let t = Date.now();
  for (const e of queue) {
    const cand = avail.filter(a => open[a.id] < capacity).sort((x, y) => (open[x.id] - open[y.id]) || (lastAt[x.id] - lastAt[y.id]));
    if (!cand.length) break;
    const a = cand[0]; open[a.id]++; lastAt[a.id] = ++t; map[e.id] = a.id;
  }
  const n = Object.keys(map).length;
  if (!n) return { emails, n: 0 };
  return { n, emails: emails.map(e => map[e.id] ? { ...e, assignee: map[e.id], status: 'assigned', assignedAt: Date.now() } : e) };
}

/* ---------- Componentes base ---------- */
const Badge = ({ cls, children }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls}`}>{children}</span>
);
const StatusBadge = ({ status }) => (
  <Badge cls={STATUS[status].cls}><span className={`h-1.5 w-1.5 rounded-full ${STATUS[status].dot}`} />{STATUS[status].label}</Badge>
);
const Avatar = ({ advisor, size = 'h-6 w-6 text-[10px]' }) => (
  <span className={`inline-flex shrink-0 ${size} items-center justify-center rounded-full font-semibold text-white ${advisor.color}`}>{initials(advisor.name)}</span>
);
function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} style={{ background: '#fff' }} />
    </button>
  );
}
function Stepper({ value, onChange, min, max, step = 1, suffix = '' }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
      <button onClick={() => onChange(Math.max(min, value - step))} className="px-2.5 py-2 text-slate-500 hover:bg-slate-50"><Icon name="minus" size={14} /></button>
      <span className="min-w-[4.5rem] text-center text-sm font-semibold text-slate-800">{value}{suffix}</span>
      <button onClick={() => onChange(Math.min(max, value + step))} className="px-2.5 py-2 text-slate-500 hover:bg-slate-50"><Icon name="plus" size={14} /></button>
    </div>
  );
}
function Kpi({ icon, label, value, sub, tone, onClick }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm ${onClick ? 'hover:border-slate-300 hover:shadow' : 'cursor-default'}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon name={icon} size={19} /></div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold leading-none text-slate-900">{value}</div>
        <div className="mt-1 truncate text-xs text-slate-500">{label}</div>
        {sub && <div className="truncate text-[11px] text-slate-400">{sub}</div>}
      </div>
    </button>
  );
}

/* ---------- Fila de correo ---------- */
function Row({ e, now, onClick, slaMin, hasDraft }) {
  const adv = e.assignee && advisorById(e.assignee);
  const waited = e.status === 'unassigned' ? mins(now - e.receivedAt) : 0;
  const late = e.status === 'unassigned' && waited >= slaMin;
  const preview = (e.body || '').replace(/\s+/g, ' ').slice(0, 150);
  const nReplies = (e.replies || []).filter(r => !r.auto).length;
  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(ev) => { if (ev.key === 'Enter') onClick(); }}
      className={`cursor-pointer border-l-[3px] px-5 py-3.5 transition hover:bg-slate-50 ${late ? 'border-rose-400' : 'border-transparent'}`}>
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-semibold text-slate-900">{e.name}</span>
        {e.attach && <Icon name="paperclip" size={12} className="shrink-0 text-slate-400" />}
        <span className={`ml-auto shrink-0 text-[11px] ${late ? 'font-semibold text-rose-600' : 'text-slate-400'}`}>{ago(e.receivedAt, now)}</span>
      </div>
      <div className="truncate text-sm text-slate-800">{e.subject}</div>
      <div className="truncate text-xs text-slate-500">{preview}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={e.status} />
        <Badge cls={PRIORITY[e.priority]}>{e.priority}</Badge>
        {late && <Badge cls="bg-rose-50 text-rose-700 ring-rose-200"><Icon name="alert" size={11} />Fuera de SLA</Badge>}
        {hasDraft && <Badge cls="bg-violet-50 text-violet-700 ring-violet-200"><Icon name="pencil" size={11} />Borrador</Badge>}
        {nReplies > 0 && <Badge cls="bg-emerald-50 text-emerald-700 ring-emerald-200"><Icon name="send" size={11} />Respondido · {nReplies}</Badge>}
        {adv && <span className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500"><Avatar advisor={adv} size="h-5 w-5 text-[9px]" />{adv.name.split(' ')[0]}</span>}
      </div>
    </div>
  );
}

/* ---------- Adjuntos y respuestas ---------- */
const BLOCKED_EXT = ['exe', 'bat', 'cmd', 'msi', 'js', 'vbs', 'scr', 'com', 'jar'];
const MAX_FILE = 10 * 1024 * 1024, MAX_TOTAL = 20 * 1024 * 1024;
const fmtSize = (b) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
const renderTemplate = (text, vars) => String(text || '').replace(/\{(\w+)\}/g, (all, k) => (vars[k] !== undefined ? vars[k] : all));
const folioOf = (e) => e.folio || 'TC-' + String(e.id).slice(-5).padStart(5, '0');
const DEFAULT_TEMPLATES = [
  { id: 't1', name: 'Saludo y solicitud de datos', body: 'Buen día, {cliente}.\n\nGracias por contactar a Soporte Telcel Trato Compartido / Pyme. Para ayudarle necesitamos que nos confirme el número de línea o folio y una breve descripción de la falla.\n\nQuedamos atentos.\n\nSaludos cordiales,\n{asesor}' },
  { id: 't2', name: 'Reinicio del equipo', body: 'Buen día, {cliente}.\n\nLe pedimos reiniciar el módem: desconéctelo de la corriente 30 segundos, vuelva a conectarlo y espere unos 3 minutos. Si la falla continúa, responda a este correo con una foto de las luces del equipo.\n\nSaludos cordiales,\n{asesor}' },
  { id: 't3', name: 'Caso escalado', body: 'Buen día, {cliente}.\n\nSu caso {folio} fue escalado al área técnica. Le daremos seguimiento por este mismo medio en cuanto tengamos novedades.\n\nSaludos cordiales,\n{asesor}' },
  { id: 't4', name: 'Cierre del caso', body: 'Buen día, {cliente}.\n\nDamos por atendido su caso {folio}. Si necesita algo más, responda a este correo y con gusto le ayudamos.\n\nSaludos cordiales,\n{asesor}' },
];
const DEFAULT_AUTOREPLY = {
  enabled: true,
  subject: 'Recibimos su correo · Folio {folio}',
  body: 'Buen día, {cliente}.\n\nHemos recibido su correo con el asunto «{asunto}» y quedó registrado con el folio {folio}. Un asesor de Soporte Telcel Trato Compartido / Pyme lo atenderá a la brevedad.\n\nEste es un mensaje automático, por favor no lo responda.\n\nSaludos cordiales,\nSoporte Telcel Trato Compartido / Pyme',
};
function FileChip({ f, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700">
      <Icon name="paperclip" size={12} className="text-slate-400" />
      <span className="max-w-[180px] truncate font-medium">{f.name}</span>
      <span className="text-slate-400">{fmtSize(f.size)}</span>
      {onRemove && <button onClick={onRemove} aria-label={`Quitar ${f.name}`} className="text-slate-400 hover:text-rose-600"><Icon name="x" size={13} /></button>}
    </span>
  );
}

/* ---------- Ventana del correo (borrador / enviados) ---------- */
function EmailWindow({ e, now, view, mode, meId, capacity, emails, presence, templates, authorName, draft, onDraft, onSend, onFlash, onAssign, onRelease, onStatus, onClose }) {
  const mine = e.assignee === meId;
  const adv = e.assignee && advisorById(e.assignee);
  const canReply = !!e.assignee && ((view === 'asesor' && mine) || view === 'supervisor');
  const composeOpen = canReply && (e.status === 'assigned' || e.status === 'in_progress');
  const replies = e.replies || [];
  const dr = draft || { body: '', files: [] };
  const hasDraft = !!(dr.body && dr.body.trim()) || dr.files.length > 0;
  const [tab, setTab] = useState(composeOpen ? 'draft' : 'sent');
  const [sending, setSending] = useState(false);
  const myOpen = openCount(emails, meId);
  const atLimit = myOpen >= capacity;

  useEffect(() => { const h = (ev) => { if (ev.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);
  useEffect(() => { setTab(composeOpen ? 'draft' : 'sent'); }, [composeOpen]);

  const addFiles = (list) => {
    const next = [...dr.files]; let total = next.reduce((t, f) => t + f.size, 0);
    for (const f of Array.from(list)) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (BLOCKED_EXT.includes(ext)) { onFlash(`"${f.name}": tipo de archivo no permitido`); continue; }
      if (f.size > MAX_FILE) { onFlash(`"${f.name}" pasa de 10 MB`); continue; }
      if (total + f.size > MAX_TOTAL) { onFlash('Los adjuntos no pueden pasar de 20 MB en total'); break; }
      total += f.size; next.push({ name: f.name, size: f.size });
    }
    onDraft(e.id, { files: next });
  };
  const send = (resolve) => {
    if (!dr.body.trim()) { onFlash('Escribe el mensaje antes de enviar'); return; }
    setSending(true);
    setTimeout(() => { onSend(e.id, dr.body.trim(), dr.files, resolve); setSending(false); setTab('sent'); }, 700);
  };
  const tabCls = (on) => `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${on ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`;
  const subject = /^re:/i.test(e.subject) ? e.subject : `Re: ${e.subject}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6" onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={e.subject} className="pop flex h-[94vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Encabezado */}
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={e.status} />
              <Badge cls={PRIORITY[e.priority]}>Prioridad {e.priority}</Badge>
              {adv && <Badge cls="bg-white text-slate-700 ring-slate-200"><Avatar advisor={adv} size="h-4 w-4 text-[8px]" />{adv.name}</Badge>}
            </div>
            <h2 className="truncate text-lg font-semibold text-slate-900">{e.subject}</h2>
            <div className="truncate text-sm text-slate-500">De: <span className="font-medium text-slate-700">{e.name}</span> &lt;{e.from}&gt;</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar ventana" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="x" size={20} /></button>
        </div>

        {/* Acciones del caso */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          {view === 'asesor' && e.status === 'unassigned' && mode === 'pull' && (
            <button onClick={() => onAssign(e.id, meId)} disabled={atLimit}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              <Icon name="hand" size={15} />Tomar caso
            </button>
          )}
          {view === 'asesor' && e.status === 'unassigned' && mode === 'pull' && atLimit && (
            <span className="text-xs text-amber-700">Ya tienes {myOpen} caso(s) abiertos (límite {capacity}). Termina uno para tomar otro.</span>
          )}
          {view === 'supervisor' && (
            <select value="" onChange={(ev) => ev.target.value && onAssign(e.id, ev.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300">
              <option value="" disabled>{e.status === 'unassigned' ? 'Asignar a…' : 'Reasignar a…'}</option>
              {ADVISORS.map(a => { const ps = presence[a.id]?.s || 'available'; return <option key={a.id} value={a.id}>{a.name} · {openCount(emails, a.id)}/{capacity}{ps !== 'available' ? ` (${PRESENCE[ps].label})` : ''}</option>; })}
            </select>
          )}
          {e.assignee && ((view === 'asesor' && mine) || view === 'supervisor') && (
            <select value={e.status} onChange={(ev) => onStatus(e.id, ev.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300">
              <option value="assigned">Asignado</option>
              <option value="in_progress">En proceso</option>
              <option value="resolved">Resuelto</option>
            </select>
          )}
          {e.assignee && e.status !== 'resolved' && (view === 'supervisor' || (mine && mode === 'pull')) && (
            <button onClick={() => onRelease(e.id)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Icon name="undo" size={14} />{view === 'supervisor' ? 'Devolver a la bandeja' : 'Liberar'}
            </button>
          )}
          {view === 'asesor' && mine && mode !== 'pull' && e.status !== 'resolved' && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><Icon name="lock" size={13} />Caso asignado por {mode === 'auto' ? 'el sistema' : 'tu supervisor'}</span>
          )}
        </div>

        {/* Cuerpo: original a la izquierda, borrador / enviados a la derecha */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="scroll-thin max-h-[26vh] shrink-0 overflow-y-auto border-b border-slate-200 p-5 lg:max-h-none lg:w-[38%] lg:border-b-0 lg:border-r">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Correo original</div>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
              <span>Recibido {ago(e.receivedAt, now)}</span>
              {e.assignedAt && <span>Espera hasta asignar: {fmtMin(mins(e.assignedAt - e.receivedAt))}</span>}
              {e.resolvedAt && <span>Atención: {fmtMin(mins(e.resolvedAt - e.assignedAt))}</span>}
            </div>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{e.body}</p>
            {(e.files || []).length > 0 && <div className="mt-5 flex flex-wrap gap-2">{e.files.map((f, i) => <FileChip key={i} f={f} />)}</div>}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1 border-b border-slate-200 px-3">
              <button onClick={() => setTab('draft')} className={tabCls(tab === 'draft')}>
                <Icon name="pencil" size={15} />Borrador
                {hasDraft && <span className="h-2 w-2 rounded-full bg-violet-500" title="Tiene un borrador guardado" />}
              </button>
              <button onClick={() => setTab('sent')} className={tabCls(tab === 'sent')}>
                <Icon name="send" size={15} />Enviados
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{replies.length}</span>
              </button>
            </div>

            {tab === 'draft' && (composeOpen ? (
              <div className="flex min-h-0 flex-1 flex-col" onDragOver={(ev) => ev.preventDefault()} onDrop={(ev) => { ev.preventDefault(); addFiles(ev.dataTransfer.files); }}>
                <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
                <div className="mb-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2"><span className="w-14 shrink-0 text-xs text-slate-400">Para</span><span className="truncate font-medium text-slate-700">{e.from}</span></div>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-14 shrink-0 text-xs text-slate-400">Asunto</span><span className="min-w-0 flex-1 truncate font-medium text-slate-700">{subject}</span>
                    <select value="" onChange={(ev) => { const t = templates.find(x => x.id === ev.target.value); if (t) onDraft(e.id, { body: (dr.body ? dr.body + '\n\n' : '') + renderTemplate(t.body, { cliente: e.name, asesor: authorName, folio: folioOf(e), asunto: e.subject }) }); }}
                      className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700">
                      <option value="" disabled>Respuesta rápida…</option>
                      {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <textarea value={dr.body} onChange={(ev) => onDraft(e.id, { body: ev.target.value })} placeholder="Escribe tu respuesta…"
                  className="min-h-[130px] w-full flex-1 resize-none rounded-lg border border-slate-300 bg-white p-4 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" />
                {dr.files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dr.files.map((f, i) => <FileChip key={i} f={f} onRemove={() => onDraft(e.id, { files: dr.files.filter((_, j) => j !== i) })} />)}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Icon name="paperclip" size={14} />Adjuntar archivos
                    <input type="file" multiple className="hidden" onChange={(ev) => { addFiles(ev.target.files); ev.target.value = ''; }} />
                  </label>
                  <span className="text-[11px] text-slate-400">Máx. 10 MB por archivo y 20 MB en total. También puedes arrastrarlos aquí.</span>
                </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon name="pencil" size={12} />{hasDraft && dr.savedAt ? `Borrador guardado ${ago(dr.savedAt, now)}` : 'Se guarda solo mientras escribes'}
                  </span>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <button onClick={() => { onFlash(hasDraft ? 'Borrador guardado' : 'Nada que guardar'); onClose(); }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Guardar y cerrar</button>
                    <button disabled={sending} onClick={() => send(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                      <Icon name="check" size={14} />Enviar y resolver
                    </button>
                    <button disabled={sending} onClick={() => send(false)}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60">
                      <Icon name="send" size={14} />{sending ? 'Enviando…' : 'Enviar'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
                {e.status === 'unassigned'
                  ? (view === 'asesor' ? 'Toma el caso para poder redactar una respuesta.' : 'Asigna el caso a un asesor para que pueda redactar y responder.')
                  : e.status === 'resolved' ? 'Caso resuelto. Cámbialo a «En proceso» para redactar otra respuesta.'
                  : 'Este caso lo atiende otro asesor.'}
              </div>
            ))}

            {tab === 'sent' && (
              <div className="scroll-thin min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {replies.length === 0 && <div className="py-10 text-center text-sm text-slate-400">Aún no se ha enviado ninguna respuesta en este caso.</div>}
                {replies.map(r => (
                  <div key={r.id} className={`rounded-xl border p-4 ${r.auto ? 'border-violet-100 bg-violet-50/40' : 'border-emerald-100 bg-emerald-50/40'}`}>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge cls={r.auto ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}><Icon name={r.auto ? 'zap' : 'check'} size={11} />{r.auto ? 'Respuesta automática' : 'Enviado'}</Badge>
                      <span className="font-medium text-slate-700">{r.author} → {e.from}</span>
                      <span className="ml-auto">{fmtDT(r.at)} · {ago(r.at, now)}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Asunto: <span className="font-medium text-slate-700">{r.subject || subject}</span></div>
                    <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{r.body}</p>
                    {r.files.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{r.files.map((f, i) => <FileChip key={i} f={f} />)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Estadísticas y exportación ---------- */
const pad2 = (n) => String(n).padStart(2, '0');
const fmtDT = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const dayKey = (t) => fmtDT(t).slice(0, 10);
const m = (ms) => ms / 60000;
const avgOf = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
const fmtAvg = (v) => v == null ? '—' : fmtMin(Math.round(v));
const r1 = (x) => x == null ? '' : Math.round(x * 10) / 10;

function computeStats(list, slaMin, now) {
  const resolved = list.filter(e => e.status === 'resolved');
  const waits = list.filter(e => e.assignedAt).map(e => m(e.assignedAt - e.receivedAt));
  const firsts = list.filter(e => e.firstReplyAt).map(e => m(e.firstReplyAt - e.receivedAt));
  const handling = resolved.filter(e => e.assignedAt && e.resolvedAt).map(e => m(e.resolvedAt - e.assignedAt));
  const unassigned = list.filter(e => e.status === 'unassigned');
  const lateNow = unassigned.filter(e => m(now - e.receivedAt) >= slaMin).sort((a, b) => a.receivedAt - b.receivedAt);
  const within = list.filter(e => e.assignedAt && m(e.assignedAt - e.receivedAt) <= slaMin).length;
  const base = waits.length + lateNow.length;
  return {
    received: list.length, resolved: resolved.length, unassigned: unassigned.length, active: list.filter(isOpen).length,
    resolvedPct: list.length ? Math.round(resolved.length / list.length * 100) : 0,
    avgWait: avgOf(waits), avgFirst: avgOf(firsts), avgHandling: avgOf(handling),
    maxWaitNow: unassigned.length ? Math.max(...unassigned.map(e => m(now - e.receivedAt))) : 0,
    sla: base ? Math.round(within / base * 100) : 100, lateNow,
  };
}
function advisorStats(list) {
  return ADVISORS.map(a => {
    const mine = list.filter(e => e.assignee === a.id);
    const res = mine.filter(e => e.status === 'resolved');
    return { a, assigned: mine.length, resolved: res.length,
      avgHandling: avgOf(res.filter(e => e.assignedAt && e.resolvedAt).map(e => m(e.resolvedAt - e.assignedAt))),
      avgFirst: avgOf(mine.filter(e => e.firstReplyAt).map(e => m(e.firstReplyAt - e.receivedAt))) };
  });
}

/* Datos de demostración de meses completos (en producción salen de Firestore) */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function genMonth(year, month, startTodayMs) {
  const rnd = mulberry32(year * 100 + month + 7);
  const dim = new Date(year, month + 1, 0).getDate();
  const out = []; let id = 1000000 + year * 100 + month;
  for (let d = 1; d <= dim; d++) {
    if (new Date(year, month, d).getTime() >= startTodayMs) break;
    const dow = new Date(year, month, d).getDay();
    const base = dow === 0 ? 6 : dow === 6 ? 18 : 40;
    const n = Math.round(base + rnd() * base * 0.5);
    for (let i = 0; i < n; i++) {
      const hour = 7 + Math.floor(rnd() * 12);
      const received = new Date(year, month, d, hour, Math.floor(rnd() * 60), Math.floor(rnd() * 60)).getTime();
      const r = rnd(); const priority = r < 0.2 ? 'alta' : r < 0.65 ? 'media' : 'baja';
      const wait = (priority === 'alta' ? 1 : 3) + rnd() * (priority === 'alta' ? 8 : 22);
      const assignedAt = received + wait * 60000;
      const firstReplyAt = assignedAt + (3 + rnd() * 22) * 60000;
      const ok = rnd() < 0.94;
      out.push({ id: id++, name: HIST_CO[Math.floor(rnd() * HIST_CO.length)], from: '', subject: HIST_SUBJ[Math.floor(rnd() * HIST_SUBJ.length)],
        priority, status: ok ? 'resolved' : 'in_progress', assignee: ADVISORS[Math.floor(rnd() * 9)].id,
        receivedAt: received, assignedAt, firstReplyAt, resolvedAt: ok ? firstReplyAt + (8 + rnd() * 50) * 60000 : null, replies: [], files: [] });
    }
  }
  return out;
}

async function saveFile(filename, data, mime) {
  try {
    if (window.claude && window.claude.use) {
      const dl = await window.claude.use('downloads');
      if (dl) { await dl.save({ filename, data: typeof data === 'string' ? data : data.slice(0) }); return 'ok'; }
    }
  } catch (err) { if (err && err.code === 'declined') return 'declined'; }
  try {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return 'ok';
  } catch (_) { return 'error'; }
}

function buildSheets(label, data, stats, advRows, slaMin) {
  const days = {};
  data.forEach(e => { (days[dayKey(e.receivedAt)] = days[dayKey(e.receivedAt)] || []).push(e); });
  const dayRows = Object.keys(days).sort().map(k => { const st = computeStats(days[k], slaMin, Date.now()); return [k, st.received, st.resolved, r1(st.avgWait), r1(st.avgFirst), r1(st.avgHandling)]; });
  const resumen = [
    ['Reporte mensual de correos'], ['Campaña', 'Telcel Trato Compartido / Pyme'], ['Mes', label], ['Generado', fmtDT(Date.now())], ['SLA de asignación (min)', slaMin], [],
    ['Métrica', 'Valor'],
    ['Correos recibidos', stats.received], ['Correos resueltos', stats.resolved], ['Tasa de resolución (%)', stats.resolvedPct],
    ['Espera promedio hasta asignar (min)', r1(stats.avgWait)], ['Primera respuesta promedio (min)', r1(stats.avgFirst)],
    ['Tiempo de atención promedio (min)', r1(stats.avgHandling)], ['Asignados dentro de SLA (%)', stats.sla], [],
    ['Nota: datos de demostración generados automáticamente.'],
  ];
  const asesor = [['Asesor', 'Casos asignados', 'Resueltos', 'Atención prom. (min)', '1ª respuesta prom. (min)'],
    ...advRows.map(r => [r.a.name, r.assigned, r.resolved, r1(r.avgHandling), r1(r.avgFirst)])];
  const dia = [['Día', 'Recibidos', 'Resueltos', 'Espera prom. (min)', '1ª respuesta prom. (min)', 'Atención prom. (min)'], ...dayRows];
  const detalle = [['Recibido', 'Remitente', 'Asunto', 'Prioridad', 'Asesor', 'Estado', 'Espera (min)', '1ª respuesta (min)', 'Atención (min)', 'Dentro de SLA'],
    ...[...data].sort((a, b) => a.receivedAt - b.receivedAt).map(e => [
      fmtDT(e.receivedAt), e.name, e.subject, e.priority, e.assignee ? advisorById(e.assignee).name : '', STATUS[e.status].label,
      e.assignedAt ? r1(m(e.assignedAt - e.receivedAt)) : '', e.firstReplyAt ? r1(m(e.firstReplyAt - e.receivedAt)) : '',
      e.assignedAt && e.resolvedAt ? r1(m(e.resolvedAt - e.assignedAt)) : '',
      e.assignedAt ? (m(e.assignedAt - e.receivedAt) <= slaMin ? 'Sí' : 'No') : ''])];
  return [['Resumen', resumen, [38, 34]], ['Por asesor', asesor, [22, 16, 12, 20, 24]], ['Por día', dia, [12, 12, 12, 18, 24, 20]],
          ['Detalle', detalle, [17, 28, 46, 11, 20, 12, 13, 17, 14, 13]]];
}
const toCsv = (sheets) => '﻿' + sheets.map(([n, rows]) => [n, ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')).join('\n\n');

/* ---------- Métricas (supervisor) ---------- */
function Bars({ data, labels, color = 'bg-sky-400/80', height = 'h-32', showValues = false }) {
  const max = Math.max(1, ...data);
  return (
    <div className={`flex ${height} items-end gap-1`}>
      {data.map((n, i) => (
        <div key={i} title={`${labels[i]}: ${n}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          {showValues && <span className="text-[10px] font-medium text-slate-500">{n}</span>}
          <div className={`w-full rounded-t ${color}`} style={{ height: `${(n / max) * 100}%`, minHeight: n ? 3 : 1 }} />
          <span className="h-3 text-[9px] leading-3 text-slate-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Metrics({ emails, now, settings, presence, onOpen, flash }) {
  const [sub, setSub] = useState('rt');
  const [mi, setMi] = useState(0);
  const months = useMemo(() => {
    const b = new Date();
    return [0, 1, 2].map(i => { const d = new Date(b.getFullYear(), b.getMonth() - i, 1);
      return { y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) }; });
  }, []);
  const sel = months[mi];

  const monthData = useMemo(() => {
    const st = new Date(); st.setHours(0, 0, 0, 0);
    const cur = sel.y === st.getFullYear() && sel.m === st.getMonth();
    const base = genMonth(sel.y, sel.m, st.getTime());
    return cur ? [...base, ...emails.filter(e => e.receivedAt >= st.getTime())] : base;
  }, [emails, mi]);

  const rt = useMemo(() => computeStats(emails, settings.slaMin, now), [emails, settings.slaMin, now]);
  const ms = useMemo(() => computeStats(monthData, settings.slaMin, now), [monthData, settings.slaMin, now]);
  const rtAdv = useMemo(() => advisorStats(emails), [emails]);
  const mAdv = useMemo(() => advisorStats(monthData).sort((a, b) => b.resolved - a.resolved), [monthData]);

  /* tiempo real */
  const hours = Array(8).fill(0);
  emails.forEach(e => { const h = Math.floor((now - e.receivedAt) / 3600000); if (h >= 0 && h < 8) hours[7 - h]++; });
  const prio = ['alta', 'media', 'baja'].map(p => ({ p, n: emails.filter(e => e.status !== 'resolved' && e.priority === p).length }));
  const maxP = Math.max(1, ...prio.map(x => x.n));
  const PCOLOR = { alta: 'bg-rose-400', media: 'bg-amber-400', baja: 'bg-slate-400' };
  const availCount = ADVISORS.filter(a => (presence[a.id]?.s || 'available') === 'available').length;
  const occ = availCount ? Math.round(emails.filter(isOpen).length / (availCount * settings.capacity) * 100) : null;

  /* mensual */
  const dim = new Date(sel.y, sel.m + 1, 0).getDate();
  const perDay = Array(dim).fill(0); monthData.forEach(e => { perDay[new Date(e.receivedAt).getDate() - 1]++; });
  const perHour = Array(24).fill(0); monthData.forEach(e => { perHour[new Date(e.receivedAt).getHours()]++; });
  const hrs = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const monthPrio = ['alta', 'media', 'baja'].map(p => ({ p, n: monthData.filter(e => e.priority === p).length }));
  const maxMP = Math.max(1, ...monthPrio.map(x => x.n));

  const doExport = async (fmt) => {
    const sheets = buildSheets(sel.label, monthData, ms, mAdv, settings.slaMin);
    const fname = `metricas_trato-compartido_${sel.y}-${pad2(sel.m + 1)}`;
    let res;
    if (fmt === 'xlsx' && window.XLSX) {
      const wb = XLSX.utils.book_new();
      sheets.forEach(([name, rows, widths]) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = widths.map(w => ({ wch: w })); XLSX.utils.book_append_sheet(wb, ws, name); });
      res = await saveFile(`${fname}.xlsx`, XLSX.write(wb, { bookType: 'xlsx', type: 'array' }), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      res = await saveFile(`${fname}.csv`, toCsv(sheets), 'text/csv;charset=utf-8');
    }
    flash(res === 'ok' ? `Reporte de ${sel.label} exportado` : res === 'declined' ? 'Exportación cancelada' : 'No se pudo exportar el archivo');
  };

  const SubBtn = ({ k, children }) => (
    <button onClick={() => setSub(k)} className={`rounded-md px-3 py-1.5 font-medium transition ${sub === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{children}</button>
  );
  const Th = ({ children, cls = '' }) => <th className={`px-3 py-2 font-medium ${cls}`}>{children}</th>;

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto scroll-thin pr-1">
      {/* Barra: pestañas + mes + exportar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-sm"><SubBtn k="rt">En tiempo real</SubBtn><SubBtn k="month">Reporte mensual</SubBtn></div>
        {sub === 'rt' && (
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            Actualizado {new Date(now).toLocaleTimeString('es-MX')}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select value={mi} onChange={(e) => setMi(Number(e.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-700">
            {months.map((mo, i) => <option key={i} value={i}>{mo.label}</option>)}
          </select>
          <button onClick={() => doExport('xlsx')} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Icon name="download" size={15} />Exportar Excel
          </button>
          <button onClick={() => doExport('csv')} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Icon name="download" size={14} />CSV
          </button>
        </div>
      </div>

      {sub === 'rt' && (<>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Kpi icon="mail" label="Recibidos hoy" value={rt.received} tone="bg-slate-100 text-slate-600" />
          <Kpi icon="inbox" label="Sin asignar" value={rt.unassigned} sub={rt.unassigned ? `Más antiguo: ${fmtMin(Math.round(rt.maxWaitNow))}` : 'Cola vacía'} tone="bg-slate-100 text-slate-600" />
          <Kpi icon="clock" label="En atención" value={rt.active} tone="bg-sky-50 text-sky-600" />
          <Kpi icon="check" label="Resueltos hoy" value={rt.resolved} sub={`Tasa de resolución ${rt.resolvedPct}%`} tone="bg-emerald-50 text-emerald-600" />
          <Kpi icon="users" label="Ocupación del equipo" value={occ == null ? '—' : `${occ}%`} sub={`${availCount} de ${ADVISORS.length} disponibles`} tone="bg-violet-50 text-violet-600" />
          <Kpi icon="zap" label="Espera prom. hasta asignar" value={fmtAvg(rt.avgWait)} tone="bg-amber-50 text-amber-600" />
          <Kpi icon="send" label="1ª respuesta prom." value={fmtAvg(rt.avgFirst)} sub="Desde que llega el correo" tone="bg-sky-50 text-sky-600" />
          <Kpi icon="headset" label="Atención prom." value={fmtAvg(rt.avgHandling)} sub="Desde asignado hasta resuelto" tone="bg-emerald-50 text-emerald-600" />
          <Kpi icon="alert" label="Fuera de SLA ahora" value={rt.lateNow.length} sub={`Límite ${settings.slaMin} min`} tone={rt.lateNow.length ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} />
          <Kpi icon="shield" label="Asignados dentro de SLA" value={`${rt.sla}%`} tone={rt.sla >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800">Correos recibidos por hora (últimas 8 h)</h3>
            <div className="mt-4"><Bars data={hours} labels={hours.map((_, i) => i === 7 ? 'ahora' : `-${7 - i}h`)} showValues /></div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Abiertos por prioridad</h3>
            <div className="mt-4 space-y-3">
              {prio.map(({ p, n }) => (
                <div key={p}>
                  <div className="flex justify-between text-xs"><span className="capitalize text-slate-600">{p}</span><span className="font-medium text-slate-700">{n}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${PCOLOR[p]}`} style={{ width: `${(n / maxP) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {rt.lateNow.length > 0 && (
          <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-800"><Icon name="alert" size={15} />{rt.lateNow.length} correo(s) esperando más de {settings.slaMin} min</h3>
            <div className="mt-2 divide-y divide-rose-100">
              {rt.lateNow.map(e => (
                <button key={e.id} onClick={() => onOpen(e.id)} className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:text-rose-900">
                  <span className="truncate text-slate-700">{e.name} — {e.subject}</span>
                  <span className="shrink-0 text-xs font-semibold text-rose-600">{fmtMin(mins(now - e.receivedAt))}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Equipo en este momento</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRESENCE).map(([k, pr]) => (
                <Badge key={k} cls={pr.cls}>{pr.label}: {ADVISORS.filter(a => (presence[a.id]?.s || 'available') === k).length}</Badge>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr><Th cls="px-4">Asesor</Th><Th>Estatus</Th><Th>Abiertos</Th><Th>Resueltos hoy</Th><Th>Atención prom.</Th><Th>1ª respuesta prom.</Th><Th cls="px-4">Carga</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rtAdv.map(r => {
                  const a = r.a; const o = openCount(emails, a.id);
                  const ps = presence[a.id]?.s || 'available';
                  const st = ps !== 'available' ? [`${PRESENCE[ps].label} · ${fmtMin(mins(now - presence[a.id].since))}`, PRESENCE[ps].cls] : o >= settings.capacity ? ['Al límite', 'bg-amber-50 text-amber-700 ring-amber-200'] : ['Disponible', 'bg-emerald-50 text-emerald-700 ring-emerald-200'];
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar advisor={a} /><span className="font-medium text-slate-800">{a.name}</span></div></td>
                      <td className="px-3 py-2.5"><Badge cls={st[1]}>{st[0]}</Badge></td>
                      <td className="px-3 py-2.5 text-slate-700">{o} / {settings.capacity}</td>
                      <td className="px-3 py-2.5 text-slate-700">{r.resolved}</td>
                      <td className="px-3 py-2.5 text-slate-700">{fmtAvg(r.avgHandling)}</td>
                      <td className="px-3 py-2.5 text-slate-700">{fmtAvg(r.avgFirst)}</td>
                      <td className="px-4 py-2.5"><div className="h-1.5 w-28 rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${a.color}`} style={{ width: `${Math.min(100, (o / settings.capacity) * 100)}%` }} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </>)}

      {sub === 'month' && (<>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Kpi icon="mail" label="Recibidos" value={ms.received} tone="bg-slate-100 text-slate-600" />
          <Kpi icon="check" label="Resueltos" value={ms.resolved} sub={`Tasa ${ms.resolvedPct}%`} tone="bg-emerald-50 text-emerald-600" />
          <Kpi icon="zap" label="Espera prom." value={fmtAvg(ms.avgWait)} tone="bg-amber-50 text-amber-600" />
          <Kpi icon="send" label="1ª respuesta prom." value={fmtAvg(ms.avgFirst)} tone="bg-sky-50 text-sky-600" />
          <Kpi icon="headset" label="Atención prom." value={fmtAvg(ms.avgHandling)} tone="bg-emerald-50 text-emerald-600" />
          <Kpi icon="shield" label={`Dentro de SLA (${settings.slaMin} min)`} value={`${ms.sla}%`} tone={ms.sla >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold capitalize text-slate-800">Correos recibidos por día · {sel.label}</h3>
          <div className="mt-4"><Bars data={perDay} labels={perDay.map((_, i) => (i + 1) % 5 === 0 || i === 0 ? String(i + 1) : '')} height="h-36" /></div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800">Horas con más correos</h3>
            <div className="mt-4"><Bars data={hrs.map(h => perHour[h])} labels={hrs.map(h => `${h}h`)} color="bg-violet-400/80" /></div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Recibidos por prioridad</h3>
            <div className="mt-4 space-y-3">
              {monthPrio.map(({ p, n }) => (
                <div key={p}>
                  <div className="flex justify-between text-xs"><span className="capitalize text-slate-600">{p}</span><span className="font-medium text-slate-700">{n}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${PCOLOR[p]}`} style={{ width: `${(n / maxMP) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">Desempeño por asesor</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr><Th cls="px-4">Asesor</Th><Th>Casos asignados</Th><Th>Resueltos</Th><Th>Atención prom.</Th><Th>1ª respuesta prom.</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mAdv.map(r => (
                  <tr key={r.a.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar advisor={r.a} /><span className="font-medium text-slate-800">{r.a.name}</span></div></td>
                    <td className="px-3 py-2.5 text-slate-700">{r.assigned}</td>
                    <td className="px-3 py-2.5 text-slate-700">{r.resolved}</td>
                    <td className="px-3 py-2.5 text-slate-700">{fmtAvg(r.avgHandling)}</td>
                    <td className="px-3 py-2.5 text-slate-700">{fmtAvg(r.avgFirst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-[11px] text-slate-400">El Excel incluye 4 hojas: Resumen, Por asesor, Por día y Detalle de cada correo. Los meses anteriores son datos de demostración.</p>
      </>)}
    </div>
  );
}

/* ---------- Configuración (supervisor) ---------- */
function ConfigReparto({ settings, setSettings, presence, onPresence, onMode }) {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto scroll-thin pr-1">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Modo de reparto</h2>
        <p className="mt-0.5 text-xs text-slate-500">Elige cómo llegan los correos a tus asesores. El cambio aplica al instante.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(MODES).map(([k, m]) => {
            const on = settings.mode === k;
            return (
              <button key={k} onClick={() => onMode(k)}
                className={`rounded-xl border p-4 text-left transition ${on ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-500' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${on ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon name={m.icon} size={16} /></span>
                  <span className="text-sm font-semibold text-slate-900">{m.title}</span>
                  {on && <span className="ml-auto"><Badge cls="bg-sky-100 text-sky-700 ring-sky-200">Activo</Badge></span>}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{m.desc}</p>
                <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500"><Icon name={k === 'pull' ? 'inbox' : 'lock'} size={12} className="mt-0.5 shrink-0" />{m.visible}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Parámetros</h2>
          <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div><div className="text-sm font-medium text-slate-700">Casos abiertos por asesor</div><div className="text-xs text-slate-500">Máximo a la vez. Al terminar uno, entra el siguiente.</div></div>
              <Stepper value={settings.capacity} min={1} max={6} onChange={(v) => setSettings(s => ({ ...s, capacity: v }))} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div><div className="text-sm font-medium text-slate-700">Alerta de espera (SLA)</div><div className="text-xs text-slate-500">Marca en rojo los correos sin asignar tras este tiempo.</div></div>
              <Stepper value={settings.slaMin} min={5} max={60} step={5} suffix=" min" onChange={(v) => setSettings(s => ({ ...s, slaMin: v }))} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700">Orden de la cola (modo automático)</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[['priority', 'Prioridad primero', 'Alta → media → baja; a igual prioridad, el más antiguo.'], ['fifo', 'Orden de llegada', 'Primero en llegar, primero en atenderse.']].map(([k, t, d]) => (
                  <button key={k} onClick={() => setSettings(s => ({ ...s, order: k }))}
                    className={`rounded-lg border p-3 text-left ${settings.order === k ? 'border-sky-500 bg-sky-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="text-sm font-medium text-slate-800">{t}</div><div className="mt-0.5 text-[11px] text-slate-500">{d}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Estatus de asesores</h2>
          <p className="mt-0.5 text-xs text-slate-500">Solo «Disponible» recibe casos nuevos en modo automático. Comida, Baño y Calidad los pausan. Cada asesor también lo cambia desde su vista.</p>
          <div className="mt-3 divide-y divide-slate-100">
            {ADVISORS.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2">
                <Avatar advisor={a} size="h-7 w-7 text-[11px]" />
                <span className="flex-1 text-sm text-slate-700">{a.name}</span>
                {presence[a.id] && presence[a.id].s !== 'available' && <span className="text-xs text-slate-400">{fmtMin(mins(Date.now() - presence[a.id].since))}</span>}
                <select value={presence[a.id]?.s || 'available'} onChange={(ev) => onPresence(a.id, ev.target.value)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset focus:outline-none ${PRESENCE[presence[a.id]?.s || 'available'].cls}`}>
                  {Object.entries(PRESENCE).map(([k, pr]) => <option key={k} value={k}>{pr.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Respuesta automática y plantillas (supervisor) ---------- */
const inputCls = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300';
function VarChips({ vars, onInsert }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
      Insertar variable:
      {vars.map(v => <button key={v} type="button" onClick={() => onInsert(`{${v}}`)} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-600 hover:bg-slate-200">{`{${v}}`}</button>)}
    </div>
  );
}

function ConfigAuto({ autoReply, setAutoReply }) {
  const set = (patch) => setAutoReply(a => ({ ...a, ...patch }));
  const sample = { cliente: 'Ferretería El Sol', folio: 'TC-001234', asunto: 'Internet en casa sin servicio' };
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold text-slate-800">Respuesta automática (acuse de recibo)</h2>
          <p className="mt-0.5 text-xs text-slate-500">Se envía sola al cliente cuando su correo llega a la bandeja, con su folio. No se manda a correos automáticos, listas de correo ni cuentas «no-reply».</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${autoReply.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>{autoReply.enabled ? 'Activada' : 'Desactivada'}</span>
          <Toggle on={autoReply.enabled} label="Respuesta automática" onChange={(v) => set({ enabled: v })} />
        </div>
      </div>
      <div className={`mt-5 grid gap-5 lg:grid-cols-2 ${autoReply.enabled ? '' : 'opacity-60'}`}>
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500">Asunto
            <input value={autoReply.subject} onChange={(e) => set({ subject: e.target.value })} className={inputCls} />
          </label>
          <label className="block text-xs font-medium text-slate-500">Mensaje
            <textarea value={autoReply.body} onChange={(e) => set({ body: e.target.value })} rows={11} className={`${inputCls} resize-y leading-relaxed`} />
          </label>
          <VarChips vars={['cliente', 'folio', 'asunto']} onInsert={(v) => set({ body: autoReply.body + v })} />
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button onClick={() => setAutoReply(DEFAULT_AUTOREPLY)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Icon name="undo" size={13} />Restablecer texto original</button>
            <span className="text-[11px] text-slate-400">Los cambios se guardan solos.</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">Vista previa (con datos de ejemplo)</div>
          <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="border-b border-slate-200 pb-2 text-xs text-slate-500">Asunto: <span className="font-medium text-slate-700">{renderTemplate(autoReply.subject, sample)}</span></div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{renderTemplate(autoReply.body, sample)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigTemplates({ templates, setTemplates }) {
  const [delId, setDelId] = useState(null);
  const upd = (id, patch) => setTemplates(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold text-slate-800">Plantillas de respuesta rápida</h2>
          <p className="mt-0.5 text-xs text-slate-500">Aparecen en el menú «Respuesta rápida» cuando un asesor redacta. Variables: <span className="font-mono">{'{cliente} {asesor} {folio} {asunto}'}</span> se llenan solas al insertar.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTemplates(ts => [...ts, { id: 't' + Date.now(), name: 'Nueva plantilla', body: 'Buen día, {cliente}.\n\n\n\nSaludos cordiales,\n{asesor}' }])}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"><Icon name="plus" size={14} />Agregar plantilla</button>
          <button onClick={() => setTemplates(DEFAULT_TEMPLATES)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"><Icon name="undo" size={13} />Restablecer</button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {templates.length === 0 && <div className="col-span-full py-8 text-center text-sm text-slate-400">No hay plantillas. Agrega la primera.</div>}
        {templates.map(t => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2">
              <input value={t.name} onChange={(e) => upd(t.id, { name: e.target.value })} placeholder="Nombre de la plantilla" className={`${inputCls} mt-0 font-medium`} />
              {delId === t.id ? (
                <span className="flex shrink-0 items-center gap-1 text-xs">
                  <button onClick={() => { setTemplates(ts => ts.filter(x => x.id !== t.id)); setDelId(null); }} className="rounded-md bg-rose-600 px-2 py-1.5 font-semibold text-white hover:bg-rose-700">Eliminar</button>
                  <button onClick={() => setDelId(null)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-600">No</button>
                </span>
              ) : (
                <button onClick={() => setDelId(t.id)} aria-label={`Eliminar ${t.name}`} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Icon name="x" size={16} /></button>
              )}
            </div>
            <textarea value={t.body} onChange={(e) => upd(t.id, { body: e.target.value })} rows={7} className={`${inputCls} resize-y leading-relaxed`} />
            <div className="mt-2"><VarChips vars={['cliente', 'asesor', 'folio', 'asunto']} onInsert={(v) => upd(t.id, { body: t.body + v })} /></div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-slate-400">Los cambios se guardan solos y se ven al instante en las páginas de los asesores.</p>
    </section>
  );
}

function Config(props) {
  const [sub, setSub] = useState('reparto');
  const Btn = ({ k, children }) => (
    <button onClick={() => setSub(k)} className={`rounded-md px-3 py-1.5 font-medium transition ${sub === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{children}</button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex self-start rounded-lg bg-slate-200/70 p-0.5 text-sm">
        <Btn k="reparto">Reparto y equipo</Btn><Btn k="auto">Respuesta automática</Btn><Btn k="plantillas">Plantillas</Btn>
      </div>
      {sub === 'reparto' && <ConfigReparto settings={props.settings} setSettings={props.setSettings} presence={props.presence} onPresence={props.onPresence} onMode={props.onMode} />}
      {sub === 'auto' && <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pr-1"><ConfigAuto autoReply={props.autoReply} setAutoReply={props.setAutoReply} /></div>}
      {sub === 'plantillas' && <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pr-1"><ConfigTemplates templates={props.templates} setTemplates={props.setTemplates} /></div>}
    </div>
  );
}

/* ---------- App ---------- */
const STORE_KEY = 'tratocom-demo-v2';
const CONFIG_KEY = 'tratocom-config-v1';
const THEME_KEY = 'tratocom-theme';
const DEFAULT_SETTINGS = { mode: 'pull', capacity: 1, order: 'priority', slaMin: 15 };
const PAGE_VIEW = window.HELPDESK_VIEW === 'asesor' ? 'asesor' : 'supervisor';

function loadStore() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!d || !d.createdAt || Date.now() - d.createdAt > 12 * 3600000) return null;
    return d;
  } catch (_) { return null; }
}
function loadConfig() { try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null'); } catch (_) { return null; } }
function loadMe() { try { return sessionStorage.getItem('tratocom-me') || 'a3'; } catch (_) { return 'a3'; } }

function App() {
  const view = PAGE_VIEW;
  const initial = useMemo(loadStore, []);
  const cfg = useMemo(loadConfig, []);
  const [createdAt, setCreatedAt] = useState(() => (initial && initial.createdAt) || Date.now());
  const [emails, setEmails] = useState(() => (initial && initial.emails) || buildEmails());
  const [settings, setSettings] = useState(() => (initial && initial.settings) || DEFAULT_SETTINGS);
  const [presence, setPresence] = useState(() => (initial && initial.presence) || {});
  const [drafts, setDrafts] = useState(() => (initial && initial.drafts) || {});
  const [templates, setTemplates] = useState(() => (cfg && cfg.templates) || DEFAULT_TEMPLATES);
  const [autoReply, setAutoReply] = useState(() => (cfg && cfg.autoReply) || DEFAULT_AUTOREPLY);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [meId, setMeIdState] = useState(loadMe);
  const [tab, setTab] = useState('bandeja');
  const [asesorTab, setAsesorTab] = useState('mine');
  const [openId, setOpenId] = useState(null);
  const [sf, setSf] = useState('all');
  const [advF, setAdvF] = useState('all');
  const [prF, setPrF] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [poolIdx, setPoolIdx] = useState(0);
  const [now, setNow] = useState(Date.now());
  const skipPersist = useRef(false);
  const skipCfg = useRef(false);

  const me = advisorById(meId);
  const mode = settings.mode;
  const setMeId = (id) => { setMeIdState(id); try { sessionStorage.setItem('tratocom-me', id); } catch (_) {} };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const paused = useMemo(() => Object.fromEntries(ADVISORS.map(a => [a.id, (presence[a.id]?.s || 'available') !== 'available'])), [presence]);
  const myPs = presence[meId]?.s || 'available';

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(t); }, []);

  // Guardar en el navegador y sincronizar entre pestañas (supervisor y asesor ven lo mismo)
  useEffect(() => {
    if (skipPersist.current) { skipPersist.current = false; return; }
    try {
      const str = JSON.stringify({ createdAt, emails, settings, presence, drafts });
      if (localStorage.getItem(STORE_KEY) !== str) localStorage.setItem(STORE_KEY, str);
    } catch (_) {}
  }, [createdAt, emails, settings, presence, drafts]);
  useEffect(() => {
    if (skipCfg.current) { skipCfg.current = false; return; }
    try {
      const str = JSON.stringify({ templates, autoReply });
      if (localStorage.getItem(CONFIG_KEY) !== str) localStorage.setItem(CONFIG_KEY, str);
    } catch (_) {}
  }, [templates, autoReply]);
  useEffect(() => {
    const h = (ev) => {
      if (ev.key === THEME_KEY) { const on = ev.newValue === 'dark'; document.documentElement.classList.toggle('dark', on); setDark(on); return; }
      if ((ev.key !== STORE_KEY && ev.key !== CONFIG_KEY) || !ev.newValue) return;
      try {
        const d = JSON.parse(ev.newValue);
        if (ev.key === STORE_KEY) {
          skipPersist.current = true;
          setCreatedAt(d.createdAt); setEmails(d.emails); setSettings(d.settings); setPresence(d.presence || {}); setDrafts(d.drafts || {});
        } else {
          skipCfg.current = true;
          setTemplates(d.templates || DEFAULT_TEMPLATES); setAutoReply(d.autoReply || DEFAULT_AUTOREPLY);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);
  const toggleTheme = () => {
    const on = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', on); setDark(on);
    try { localStorage.setItem(THEME_KEY, on ? 'dark' : 'light'); } catch (_) {}
  };

  // Motor automático
  useEffect(() => {
    if (mode !== 'auto') return;
    const r = distribute(emails, paused, settings.capacity, settings.order);
    if (r.n) { setEmails(r.emails); flash(`Reparto automático: ${r.n} caso(s) asignado(s)`); }
  }, [emails, mode, paused, settings.capacity, settings.order]);

  const matches = (e) => (e.subject + e.name + e.from).toLowerCase().includes(query.toLowerCase());

  const assign = (id, advId) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, assignee: advId, status: 'assigned', assignedAt: e.assignedAt || Date.now(), resolvedAt: null } : e));
    flash(`Asignado a ${advisorById(advId).name}`);
  };
  const release = (id) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, assignee: null, status: 'unassigned', assignedAt: null, resolvedAt: null } : e));
    flash('Caso devuelto a la bandeja general');
  };
  const setStatus = (id, status) => setEmails(prev => prev.map(e => e.id === id ? { ...e, status, resolvedAt: status === 'resolved' ? Date.now() : null } : e));
  const setPresenceOf = (id, s) => {
    setPresence(p => ({ ...p, [id]: { s, since: Date.now() } }));
    flash(`${advisorById(id).name}: ${PRESENCE[s].label}`);
  };
  const onDraft = (id, patch) => setDrafts(d => ({ ...d, [id]: { body: '', files: [], ...(d[id] || {}), ...patch, savedAt: Date.now() } }));
  const sendReply = (id, body, files, resolve) => {
    const author = view === 'asesor' ? me.name : 'Supervisor';
    setEmails(prev => prev.map(e => e.id !== id ? e : {
      ...e, firstReplyAt: e.firstReplyAt || Date.now(), replies: [...(e.replies || []), { id: Date.now(), author, at: Date.now(), body, files }],
      status: resolve ? 'resolved' : (e.status === 'assigned' ? 'in_progress' : e.status),
      resolvedAt: resolve ? Date.now() : e.resolvedAt }));
    setDrafts(d => { const n = { ...d }; delete n[id]; return n; });
    flash(resolve ? 'Respuesta enviada y caso resuelto (simulado)' : 'Respuesta enviada (simulado)');
  };
  const setMode = (m) => { setSettings(s => ({ ...s, mode: m })); flash(`Modo de reparto: ${MODES[m].label}`); };
  const simulateIncoming = () => {
    const [name, from, subject, priority] = NEW_EMAIL_POOL[poolIdx % NEW_EMAIL_POOL.length];
    const id = Date.now();
    const mail = { id, name, from, subject, priority, attach: false, files: [], replies: [], status: 'unassigned', assignee: null,
      receivedAt: id, assignedAt: null, firstReplyAt: null, resolvedAt: null,
      body: 'Correo simulado recibido desde la cuenta compartida. En producción, este contenido lo trae la Cloud Function vía IMAP.' };
    if (autoReply.enabled) {
      const vars = { cliente: name, folio: folioOf(mail), asunto: subject };
      mail.replies = [{ id: id + 1, author: 'Respuesta automática', auto: true, at: id, subject: renderTemplate(autoReply.subject, vars), body: renderTemplate(autoReply.body, vars), files: [] }];
    }
    setEmails(prev => [mail, ...prev]);
    setPoolIdx(i => i + 1);
    flash(autoReply.enabled ? 'Nuevo correo recibido · acuse de recibo enviado' : 'Nuevo correo recibido (simula la Cloud Function)');
  };
  const resetDemo = () => {
    NOW0 = Date.now();
    setCreatedAt(Date.now()); setEmails(buildEmails()); setSettings(DEFAULT_SETTINGS); setPresence({}); setDrafts({}); setOpenId(null);
    flash('Datos de prueba reiniciados');
  };
  const openFromMetrics = (id) => { setOpenId(id); setSf('unassigned'); setTab('bandeja'); };

  /* listas */
  const supList = useMemo(() => emails.filter(e =>
    (sf === 'all' || (sf === 'unassigned' ? e.status === 'unassigned' : sf === 'active' ? isOpen(e) : e.status === 'resolved')) &&
    (advF === 'all' || e.assignee === advF) && (prF === 'all' || e.priority === prF) && matches(e)
  ).sort((a, b) => sf === 'unassigned' ? a.receivedAt - b.receivedAt : b.receivedAt - a.receivedAt), [emails, sf, advF, prF, query]);
  const myList = useMemo(() => emails.filter(e => e.assignee === meId && matches(e))
    .sort((a, b) => ((a.status === 'resolved' ? 1 : 0) - (b.status === 'resolved' ? 1 : 0)) || b.receivedAt - a.receivedAt), [emails, meId, query]);
  const poolList = useMemo(() => emails.filter(e => e.status === 'unassigned' && matches(e))
    .sort((a, b) => (PRANK[a.priority] - PRANK[b.priority]) || a.receivedAt - b.receivedAt), [emails, query]);

  const counts = {
    all: emails.length,
    unassigned: emails.filter(e => e.status === 'unassigned').length,
    active: emails.filter(isOpen).length,
    resolved: emails.filter(e => e.status === 'resolved').length,
  };
  const lateCount = emails.filter(e => e.status === 'unassigned' && mins(now - e.receivedAt) >= settings.slaMin).length;
  const waitsAll = emails.filter(e => e.assignedAt).map(e => mins(e.assignedAt - e.receivedAt));

  /* Un asesor solo puede abrir lo suyo (o la bandeja si el modo es libre) */
  const raw = emails.find(e => e.id === openId);
  const opened = raw && (view === 'supervisor' || raw.assignee === meId || (mode === 'pull' && raw.status === 'unassigned')) ? raw : null;
  const showPoolTab = mode === 'pull';
  const advisorTab = showPoolTab ? asesorTab : 'mine';
  const hasDraftOf = (id) => !!(drafts[id] && ((drafts[id].body || '').trim() || (drafts[id].files || []).length));

  const windowEl = opened && (
    <EmailWindow key={opened.id} e={opened} now={now} view={view} mode={mode} meId={meId} capacity={settings.capacity} emails={emails} presence={presence} templates={templates}
      authorName={view === 'asesor' ? me.name : 'Supervisor'} draft={drafts[opened.id]} onDraft={onDraft} onSend={sendReply} onFlash={flash}
      onAssign={assign} onRelease={release} onStatus={setStatus} onClose={() => setOpenId(null)} />
  );

  const SearchBox = (
    <div className="relative">
      <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar remitente o asunto…"
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" />
    </div>
  );
  const TabBtn = ({ active, onClick, icon, children }) => (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${active ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
      <Icon name={icon} size={15} />{children}
    </button>
  );
  const ThemeBtn = (
    <button onClick={toggleTheme} aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'} title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
      <Icon name={dark ? 'sun' : 'moon'} size={16} />
    </button>
  );
  const Logo = (
    <a href="index.html" className="flex items-center gap-2.5" title="Volver al inicio">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white"><Icon name="headset" size={18} /></div>
      <div>
        <div className="text-sm font-semibold leading-tight text-slate-900">Helpdesk · Telcel Trato Compartido / Pyme</div>
        <div className="text-[11px] leading-tight text-slate-500">telceltratocompartido@mail.telcel.com</div>
      </div>
    </a>
  );

  /* ====== PÁGINA DEL SUPERVISOR ====== */
  if (view === 'supervisor') {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-2.5">
          {Logo}
          <Badge cls="bg-slate-900 text-white ring-slate-900"><Icon name="shield" size={12} />Supervisor</Badge>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {ThemeBtn}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Reparto:</span>
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                {Object.entries(MODES).map(([k, mo]) => (
                  <button key={k} onClick={() => setMode(k)}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold transition ${mode === k ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Icon name={mo.icon} size={12} />{mo.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={simulateIncoming} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Icon name="zap" size={14} className="text-amber-500" />Simular correo
            </button>
            <button onClick={resetDemo} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Icon name="undo" size={14} />Reiniciar demo
            </button>
            <a href="asesor.html" target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Icon name="user" size={14} />Abrir página de asesores
            </a>
          </div>
        </header>

        <nav className="flex gap-1 border-b border-slate-200 bg-white px-5">
          <TabBtn active={tab === 'bandeja'} onClick={() => setTab('bandeja')} icon="inbox">Bandeja</TabBtn>
          <TabBtn active={tab === 'metricas'} onClick={() => setTab('metricas')} icon="bar">Métricas</TabBtn>
          <TabBtn active={tab === 'config'} onClick={() => setTab('config')} icon="sliders">Configuración</TabBtn>
        </nav>

        <main className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi icon="inbox" label="Sin asignar" value={counts.unassigned} tone="bg-slate-100 text-slate-600" onClick={() => { setTab('bandeja'); setSf('unassigned'); }} />
            <Kpi icon="clock" label="En atención" value={counts.active} tone="bg-sky-50 text-sky-600" onClick={() => { setTab('bandeja'); setSf('active'); }} />
            <Kpi icon="check" label="Resueltos" value={counts.resolved} tone="bg-emerald-50 text-emerald-600" onClick={() => { setTab('bandeja'); setSf('resolved'); }} />
            <Kpi icon="zap" label="Espera prom. a asignar" value={fmtMin(avg(waitsAll))} tone="bg-amber-50 text-amber-600" onClick={() => setTab('metricas')} />
            <Kpi icon="alert" label={`Fuera de SLA (${settings.slaMin} min)`} value={lateCount} tone={lateCount ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} onClick={() => { setTab('bandeja'); setSf('unassigned'); }} />
          </div>

          {tab === 'bandeja' && (
            <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-2.5 border-b border-slate-100 p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[['all', 'Todos'], ['unassigned', 'Sin asignar'], ['active', 'En atención'], ['resolved', 'Resueltos']].map(([k, l]) => (
                    <button key={k} onClick={() => setSf(k)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${sf === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {l} <span className={sf === k ? 'text-slate-300' : 'text-slate-400'}>{counts[k]}</span>
                    </button>
                  ))}
                  <select value={advF} onChange={(e) => setAdvF(e.target.value)} className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700">
                    <option value="all">Todos los asesores</option>
                    {ADVISORS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select value={prF} onChange={(e) => setPrF(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700">
                    <option value="all">Toda prioridad</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
                  </select>
                </div>
                {SearchBox}
              </div>
              <div className="scroll-thin min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
                {supList.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No hay correos con estos filtros.</div>}
                {supList.map(e => <Row key={e.id} e={e} now={now} slaMin={settings.slaMin} hasDraft={hasDraftOf(e.id)} onClick={() => setOpenId(e.id)} />)}
              </div>
            </section>
          )}
          {tab === 'metricas' && <Metrics emails={emails} now={now} settings={settings} presence={presence} onOpen={openFromMetrics} flash={flash} />}
          {tab === 'config' && <Config settings={settings} setSettings={setSettings} presence={presence} onPresence={setPresenceOf} onMode={setMode} templates={templates} setTemplates={setTemplates} autoReply={autoReply} setAutoReply={setAutoReply} />}
        </main>

        {windowEl}
        {toast && <div className="pop fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">{toast}</div>}
      </div>
    );
  }

  /* ====== PÁGINA DEL ASESOR ====== */
  const list = advisorTab === 'mine' ? myList : poolList;
  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-2.5">
        {Logo}
        <Badge cls="bg-sky-600 text-white ring-sky-600"><Icon name="user" size={12} />Asesor</Badge>
        <div className="ml-auto flex items-center gap-3">
        {ThemeBtn}
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Entrar como
          <Avatar advisor={me} size="h-7 w-7 text-[11px]" />
          <select value={meId} onChange={(e) => { setMeId(e.target.value); setOpenId(null); }}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300">
            {ADVISORS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon="user" label="Mis casos abiertos" value={`${openCount(emails, meId)} / ${settings.capacity}`} tone="bg-violet-50 text-violet-600" />
          <Kpi icon="check" label="Resueltos por mí" value={emails.filter(e => e.assignee === meId && e.status === 'resolved').length} tone="bg-emerald-50 text-emerald-600" />
          {mode === 'pull'
            ? <Kpi icon="inbox" label="Disponibles en bandeja" value={counts.unassigned} tone="bg-slate-100 text-slate-600" />
            : <Kpi icon={MODES[mode].icon} label="Reparto" value={MODES[mode].label} sub={mode === 'auto' ? 'Tu siguiente caso llega solo' : 'Tu supervisor te asigna'} tone="bg-sky-50 text-sky-600" />}
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium">Mi estatus</span>
              {myPs !== 'available' && <span>{fmtMin(mins(now - presence[meId].since))}</span>}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {Object.entries(PRESENCE).map(([k, pr]) => (
                <button key={k} onClick={() => setPresenceOf(meId, k)}
                  className={`rounded-md px-1 py-1.5 text-[11px] font-semibold ring-1 ring-inset transition ${myPs === k ? pr.on : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'}`}>{pr.label}</button>
              ))}
            </div>
            {myPs !== 'available' && mode === 'auto' && <div className="mt-1 text-[11px] text-amber-700">No recibes casos nuevos</div>}
          </div>
        </div>

        {mode !== 'pull' && (
          <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-800">
            <Icon name="lock" size={15} />
            {mode === 'auto'
              ? 'Reparto automático activo: los casos se te asignan solos y al cerrar uno entra el siguiente.'
              : 'Reparto manual activo: tu supervisor te asignará los casos.'}
          </div>
        )}

        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-2.5 border-b border-slate-100 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {showPoolTab ? [['mine', `Mis casos (${emails.filter(e => e.assignee === meId).length})`], ['pool', `Bandeja general (${counts.unassigned})`]].map(([k, l]) => (
                <button key={k} onClick={() => setAsesorTab(k)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${advisorTab === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
              )) : <span className="text-sm font-semibold text-slate-800">Mis casos</span>}
            </div>
            {SearchBox}
          </div>
          <div className="scroll-thin min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
            {list.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                {advisorTab === 'mine' ? (mode === 'pull' ? 'Aún no tienes casos. Toma uno de la bandeja general.' : 'Sin casos por ahora. Te llegará el siguiente automáticamente.') : 'No hay correos libres.'}
              </div>
            )}
            {list.map(e => <Row key={e.id} e={e} now={now} slaMin={9999} hasDraft={hasDraftOf(e.id)} onClick={() => setOpenId(e.id)} />)}
          </div>
        </section>
      </main>

      {windowEl}
      {toast && <div className="pop fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

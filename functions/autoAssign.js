/**
 * Reparto automático de correos.
 *
 * Lee la configuración de  settings/distribution  (la que cambia el supervisor):
 *   { mode: 'pull' | 'auto' | 'manual', capacity: 2, order: 'priority' | 'fifo' }
 * y los asesores de la colección  advisors  (docs con { name, available: true/false }).
 *
 * Se ejecuta cuando:
 *   1) llega un correo nuevo,
 *   2) un caso se cierra o se devuelve a la bandeja,
 *   3) el supervisor cambia el modo / capacidad,
 *   4) un asesor se pone en pausa o vuelve.
 * Solo actúa si mode === 'auto'.
 */
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const PRANK = { alta: 0, media: 1, baja: 2 };
const OPEN = ['assigned', 'in_progress'];

async function runAutoAssign() {
  // Transacción: si dos disparadores corren a la vez, no se asigna doble.
  const assigned = await db.runTransaction(async (tx) => {
    const settings = (await tx.get(db.doc('settings/distribution'))).data() || {};
    if (settings.mode !== 'auto') return 0;
    const capacity = settings.capacity || 1;
    const order = settings.order || 'priority';

    const [queueSnap, openSnap, advSnap] = await Promise.all([
      tx.get(db.collection('incoming_emails').where('status', '==', 'unassigned').limit(200)),
      tx.get(db.collection('incoming_emails').where('status', 'in', OPEN)),
      tx.get(db.collection('advisors').where('available', '==', true)),
    ]);
    if (queueSnap.empty || advSnap.empty) return 0;

    // Carga actual por asesor + quién recibió caso hace más tiempo (desempate)
    const load = {}, lastAt = {};
    advSnap.docs.forEach(d => { load[d.id] = 0; lastAt[d.id] = 0; });
    openSnap.docs.forEach(d => {
      const { assignedTo, assignedAt } = d.data();
      if (assignedTo in load) {
        load[assignedTo]++;
        lastAt[assignedTo] = Math.max(lastAt[assignedTo], assignedAt?.toMillis?.() || 0);
      }
    });

    // Cola ordenada
    const queue = queueSnap.docs.sort((a, b) => {
      const x = a.data(), y = b.data();
      const ta = x.date?.toMillis?.() || 0, tb = y.date?.toMillis?.() || 0;
      if (order === 'priority') {
        const p = (PRANK[x.priority || 'media'] ?? 1) - (PRANK[y.priority || 'media'] ?? 1);
        if (p) return p;
      }
      return ta - tb;
    });

    let count = 0, tick = Date.now();
    for (const doc of queue) {
      const candidates = Object.keys(load)
        .filter(id => load[id] < capacity)
        .sort((a, b) => (load[a] - load[b]) || (lastAt[a] - lastAt[b]));
      if (!candidates.length) break; // todos al límite: el resto espera en la cola
      const advisorId = candidates[0];
      load[advisorId]++; lastAt[advisorId] = ++tick;
      tx.update(doc.ref, {
        status: 'assigned',
        assignedTo: advisorId,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedBy: 'auto',
      });
      count++;
    }
    return count;
  });
  if (assigned) logger.info(`Reparto automático: ${assigned} caso(s) asignado(s)`);
}

// 1) Correo nuevo
exports.onEmailCreated = onDocumentCreated('incoming_emails/{id}', () => runAutoAssign());

// 2) Un caso se cierra o vuelve a la bandeja
exports.onEmailUpdated = onDocumentUpdated('incoming_emails/{id}', (event) => {
  const before = event.data.before.data(), after = event.data.after.data();
  if (before.status !== after.status && (after.status === 'resolved' || after.status === 'unassigned')) {
    return runAutoAssign();
  }
});

// 3) El supervisor cambia modo / capacidad / orden
exports.onSettingsChanged = onDocumentWritten('settings/distribution', () => runAutoAssign());

// 4) Un asesor se pausa o vuelve
exports.onAdvisorChanged = onDocumentWritten('advisors/{id}', (event) => {
  const before = event.data.before?.data(), after = event.data.after?.data();
  if (before?.available !== after?.available) return runAutoAssign();
});

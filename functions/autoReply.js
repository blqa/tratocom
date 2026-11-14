/**
 * Respuesta automática (acuse de recibo).
 * Lee su texto de Firestore:  settings/autoReply  → { enabled, subject, body }
 * (lo edita el supervisor en Configuración → Respuesta automática).
 * Variables disponibles: {cliente} {folio} {asunto}
 *
 * Reglas de seguridad para NO crear ciclos de correos automáticos:
 *  - no responde a correos automáticos (Auto-Submitted, Precedence, listas de correo),
 *  - no responde a cuentas "no-reply", "mailer-daemon", "postmaster", etc.,
 *  - no responde a la propia cuenta compartida,
 *  - máximo 1 acuse por remitente cada hora.
 */
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const BLOCKED_SENDERS = /(^|[^a-z])(no-?reply|noreply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?)([^a-z]|$)/i;
const MIN_MS_BETWEEN = 60 * 60 * 1000; // 1 hora

const renderTemplate = (text, vars) =>
  String(text || '').replace(/\{(\w+)\}/g, (all, k) => (vars[k] !== undefined ? vars[k] : all));

function createTransporter(user, pass) {
  return nodemailer.createTransport({
    host: 'smtp.office365.com', port: 587, secure: false, requireTLS: true, auth: { user, pass },
  });
}

function shouldAutoReply(parsed, senderAddress, ownAddress) {
  const h = parsed.headers;
  const autoSubmitted = h.get('auto-submitted');
  if (autoSubmitted && String(autoSubmitted).toLowerCase() !== 'no') return false;
  if (h.has('list-id') || h.has('list-unsubscribe') || h.has('x-auto-response-suppress')) return false;
  const precedence = String(h.get('precedence') || '').toLowerCase();
  if (['bulk', 'list', 'junk', 'auto_reply'].includes(precedence)) return false;
  if (!senderAddress || BLOCKED_SENDERS.test(senderAddress)) return false;
  if (senderAddress.toLowerCase() === String(ownAddress).toLowerCase()) return false;
  return true;
}

async function sendAutoReply({ db, transporter, ownAddress, settings, mailRef, mail }) {
  // Límite: 1 acuse por remitente por hora
  const key = crypto.createHash('sha1').update(String(mail.from).toLowerCase()).digest('hex');
  const logRef = db.doc(`autoReplyLog/${key}`);
  const last = (await logRef.get()).data()?.lastSentAt?.toMillis?.() || 0;
  if (Date.now() - last < MIN_MS_BETWEEN) return false;

  const vars = { cliente: mail.fromName, folio: mail.folio, asunto: mail.subject };
  const subject = renderTemplate(settings.subject, vars);
  const body = renderTemplate(settings.body, vars);

  await transporter.sendMail({
    from: ownAddress,
    to: mail.replyTo || mail.from,
    subject,
    text: body,
    inReplyTo: mail.messageId,
    references: [...(mail.references || []), mail.messageId].filter(Boolean),
    headers: { 'Auto-Submitted': 'auto-replied', 'X-Auto-Response-Suppress': 'All', Precedence: 'auto_reply' },
  });

  const now = admin.firestore.FieldValue.serverTimestamp();
  await mailRef.collection('replies').add({ auto: true, authorName: 'Respuesta automática', subject, body, files: [], sentAt: now });
  await logRef.set({ lastSentAt: now });
  return true;
}

module.exports = { createTransporter, shouldAutoReply, sendAutoReply, renderTemplate };

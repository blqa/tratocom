/**
 * Responder un correo desde el Helpdesk (con adjuntos).
 *
 * Flujo:
 *  1) La web sube los adjuntos a Cloud Storage en  reply_attachments/{emailId}/...
 *  2) La web llama a esta función (callable) con el texto y las rutas de los adjuntos.
 *  3) La función verifica permisos, envía el correo por SMTP de Office 365 desde la
 *     cuenta compartida (en el mismo hilo) y guarda la respuesta en Firestore.
 *
 * Llamada desde Next.js:
 *   import { getFunctions, httpsCallable } from 'firebase/functions';
 *   const sendReply = httpsCallable(getFunctions(), 'sendReply');
 *   await sendReply({ emailId, body, attachmentPaths: [...], resolve: false });
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const IMAP_USER = defineSecret('IMAP_USER');
const IMAP_PASS = defineSecret('IMAP_PASS');

const BLOCKED_EXT = ['exe', 'bat', 'cmd', 'msi', 'js', 'vbs', 'scr', 'com', 'jar'];
const MAX_FILE = 10 * 1024 * 1024;
const MAX_TOTAL = 20 * 1024 * 1024;

exports.sendReply = onCall(
  { region: 'us-central1', secrets: [IMAP_USER, IMAP_PASS], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    // --- 1. Quién llama ---
    const role = request.auth?.token?.role;
    if (role !== 'supervisor' && role !== 'advisor') {
      throw new HttpsError('permission-denied', 'No tienes permiso para responder correos.');
    }

    // --- 2. Validar datos ---
    const { emailId, body, attachmentPaths = [], resolve = false } = request.data || {};
    if (typeof emailId !== 'string' || !emailId) throw new HttpsError('invalid-argument', 'Falta emailId.');
    if (typeof body !== 'string' || !body.trim() || body.length > 20000) {
      throw new HttpsError('invalid-argument', 'El mensaje está vacío o es demasiado largo.');
    }
    if (!Array.isArray(attachmentPaths) || attachmentPaths.length > 10) {
      throw new HttpsError('invalid-argument', 'Máximo 10 adjuntos.');
    }
    // Solo se aceptan archivos subidos a la carpeta de ESTE correo
    const prefix = `reply_attachments/${emailId}/`;
    if (!attachmentPaths.every(p => typeof p === 'string' && p.startsWith(prefix) && !p.includes('..'))) {
      throw new HttpsError('invalid-argument', 'Ruta de adjunto no válida.');
    }

    // --- 3. El correo y sus permisos ---
    const ref = db.collection('incoming_emails').doc(emailId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', 'El correo no existe.');
    const mail = snap.data();
    if (mail.status === 'unassigned') {
      throw new HttpsError('failed-precondition', 'Asigna el caso antes de responder.');
    }
    if (role === 'advisor' && mail.assignedTo !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Este caso no está asignado a ti.');
    }

    // --- 4. Descargar adjuntos y revisar tipo/tamaño ---
    const bucket = admin.storage().bucket();
    const attachments = [];
    const savedFiles = [];
    let total = 0;
    for (const path of attachmentPaths) {
      const name = path.split('/').pop().replace(/^[0-9a-f-]{8,}-/, '');
      const ext = name.split('.').pop().toLowerCase();
      if (BLOCKED_EXT.includes(ext)) throw new HttpsError('invalid-argument', `Tipo de archivo no permitido: ${name}`);
      const [buf] = await bucket.file(path).download();
      if (buf.length > MAX_FILE) throw new HttpsError('invalid-argument', `${name} pasa de 10 MB.`);
      total += buf.length;
      if (total > MAX_TOTAL) throw new HttpsError('invalid-argument', 'Los adjuntos pasan de 20 MB en total.');
      attachments.push({ filename: name, content: buf });
      savedFiles.push({ name, size: buf.length, path });
    }

    // --- 5. Enviar por SMTP de Office 365 (misma cuenta compartida, mismo hilo) ---
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: IMAP_USER.value(), pass: IMAP_PASS.value() },
    });
    const subject = /^re:/i.test(mail.subject) ? mail.subject : `Re: ${mail.subject}`;
    let info;
    try {
      info = await transporter.sendMail({
        from: IMAP_USER.value(),
        to: mail.replyTo || mail.from,
        subject,
        text: body,
        inReplyTo: mail.messageId,
        references: [...(mail.references || []), mail.messageId].filter(Boolean),
        attachments,
      });
    } catch (err) {
      logger.error('Error enviando correo', err);
      throw new HttpsError('unavailable', 'No se pudo enviar el correo. Intenta de nuevo.');
    }

    // --- 6. Guardar la respuesta y actualizar el caso ---
    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.set(ref.collection('replies').doc(), {
      authorUid: request.auth.uid,
      authorName: request.auth.token.name || '',
      body: body.trim(),
      files: savedFiles,
      smtpMessageId: info.messageId,
      sentAt: now,
    });
    batch.update(ref, {
      status: resolve ? 'resolved' : 'in_progress',
      firstReplyAt: mail.firstReplyAt || now,
      lastReplyAt: now,
      ...(resolve ? { resolvedAt: now } : {}),
    });
    await batch.commit();

    return { ok: true };
  }
);

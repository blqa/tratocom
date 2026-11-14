/**
 * Cloud Function: jala correos NO LEÍDOS de Outlook (Office 365) por IMAP
 * y los guarda en Firestore (colección `incoming_emails`, status 'unassigned').
 *
 * Corre cada 2 minutos (Cloud Scheduler). Requiere plan Blaze en Firebase.
 */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

admin.initializeApp();
const db = admin.firestore();
const bucket = () => admin.storage().bucket();

// Secretos (se guardan con: firebase functions:secrets:set IMAP_USER, etc.)
const IMAP_USER = defineSecret('IMAP_USER');
const IMAP_PASS = defineSecret('IMAP_PASS');

// Máximo de correos por ejecución, para no pasarnos del tiempo límite
const MAX_PER_RUN = 50;
// Adjuntos más grandes que esto no se guardan
const MAX_ATTACHMENT = 15 * 1024 * 1024;

exports.fetchEmails = onSchedule(
  {
    schedule: 'every 2 minutes',
    timeZone: 'America/Mexico_City',
    region: 'us-central1',
    timeoutSeconds: 300,
    memory: '512MiB',
    secrets: [IMAP_USER, IMAP_PASS],
  },
  async () => {
    const client = new ImapFlow({
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
      auth: { user: IMAP_USER.value(), pass: IMAP_PASS.value() },
      logger: false,
    });

    let saved = 0;

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        // 1) Buscar UIDs de correos no leídos
        const uids = await client.search({ seen: false }, { uid: true });
        logger.info(`Correos UNSEEN encontrados: ${uids.length}`);

        for (const uid of uids.slice(0, MAX_PER_RUN)) {
          // 2) Descargar el mensaje completo (source = correo crudo)
          const msg = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
          const parsed = await simpleParser(msg.source);

          const fromObj = parsed.from?.value?.[0] || {};
          const messageId = parsed.messageId || `uid-${uid}-${Date.now()}`;

          // 3) ID determinista = evita duplicados si la función se reintenta
          const docId = Buffer.from(messageId).toString('base64url').slice(0, 150);

          // 3b) Guardar adjuntos en Cloud Storage (sin las imágenes incrustadas de la firma)
          const files = [];
          for (const att of parsed.attachments || []) {
            if (att.related || att.size > MAX_ATTACHMENT) continue;
            const safeName = (att.filename || 'adjunto').replace(/[^\w.\-() ]/g, '_');
            const filePath = `incoming/${docId}/${safeName}`;
            await bucket().file(filePath).save(att.content, { contentType: att.contentType, resumable: false });
            files.push({ name: safeName, size: att.size, contentType: att.contentType, path: filePath });
          }

          await db.collection('incoming_emails').doc(docId).set(
            {
              messageId,
              imapUid: uid,
              from: fromObj.address || '',
              fromName: fromObj.name || fromObj.address || 'Desconocido',
              subject: parsed.subject || '(sin asunto)',
              date: parsed.date
                ? admin.firestore.Timestamp.fromDate(parsed.date)
                : admin.firestore.FieldValue.serverTimestamp(),
              bodyText: (parsed.text || '').trim(),
              hasAttachments: files.length > 0,
              files,
              priority: 'media',
              // Datos para poder responder dentro del mismo hilo
              replyTo: parsed.replyTo?.value?.[0]?.address || fromObj.address || '',
              inReplyTo: parsed.inReplyTo || null,
              references: [].concat(parsed.references || []),
              status: 'unassigned',
              assignedTo: null,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: false }
          );

          // 4) Solo si se guardó bien, marcarlo como LEÍDO en Outlook
          await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
          saved++;
        }
      } finally {
        lock.release();
      }

      await client.logout();
      logger.info(`Correos guardados en Firestore: ${saved}`);
    } catch (err) {
      logger.error('Error leyendo IMAP', err);
      try { await client.logout(); } catch (_) {}
      throw err; // para que quede el error en los logs
    }
  }
);

// Otras funciones: reparto automático y envío de respuestas
Object.assign(exports, require('./autoAssign'), require('./sendReply'));

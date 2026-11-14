# Tratocom · Helpdesk de correos

Sistema interno para la campaña **Telcel Trato Compartido / Pyme** (9 asesores).
Jala los correos de la cuenta compartida de Outlook, los guarda en Firestore y los reparte entre los asesores.

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `index.html` | Demo visual (React + Tailwind por CDN) con datos de prueba. Se publica con GitHub Pages. |
| `functions/index.js` | Cloud Function que lee correos NO LEÍDOS por IMAP, guarda adjuntos y los manda a Firestore. |
| `functions/autoAssign.js` | Reparto automático según el modo elegido por el supervisor. |
| `functions/sendReply.js` | Responder correos (con adjuntos) por SMTP de Office 365. |
| `firestore.rules`, `storage.rules` | Reglas de seguridad: el asesor solo ve lo que le toca. |

## Modos de reparto
- **Libre:** los asesores ven la bandeja y toman casos.
- **Automático:** el sistema asigna al asesor disponible con menos carga; al cerrar un caso entra el siguiente.
- **Manual:** el supervisor asigna.

## Desplegar el backend
```bash
cd functions && npm install && cd ..
firebase functions:secrets:set IMAP_USER   # cuenta compartida
firebase functions:secrets:set IMAP_PASS
firebase deploy --only functions,firestore:rules,storage
```
Cada usuario necesita el *custom claim* `role` = `supervisor` o `advisor`.
No subir contraseñas al repo: viven como secretos de Firebase.

## Demo en GitHub Pages
Settings → Pages → rama `main`, carpeta `/ (root)`. El archivo `CNAME` ya apunta a `tratocom.godsplan.site`
(en el DNS: registro CNAME `tratocom` → `blqa.github.io`).

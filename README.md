# Tratocom · Helpdesk de correos

Sistema interno para la campaña **Telcel Trato Compartido / Pyme** (9 asesores).
Jala los correos de la cuenta compartida de Outlook, los guarda en Firestore y los reparte entre los asesores.

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `index.html` | Inicio de la demo: elegir página de supervisor o de asesores. |
| `supervisor.html` | Página del supervisor: bandeja, métricas, reporte mensual (Excel/CSV) y configuración. |
| `asesor.html` | Página de los asesores: mis casos, bandeja (solo en modo libre), responder y estatus. |
| `app.js` | Código de la demo ya compilado (lo usan las dos páginas). Se genera de `src/app.jsx` con `sh build.sh`. |
| `src/app.jsx` | Código fuente de la demo (React + Tailwind) con datos de prueba. |
| `functions/index.js` | Cloud Function que lee correos NO LEÍDOS por IMAP, guarda adjuntos y los manda a Firestore. |
| `functions/autoAssign.js` | Reparto automático según el modo elegido por el supervisor. |
| `functions/sendReply.js` | Responder correos (con adjuntos) por SMTP de Office 365. |
| `firestore.rules`, `storage.rules` | Reglas de seguridad: el asesor solo ve lo que le toca. |

La demo guarda sus datos de prueba en el navegador: abre `supervisor.html` y `asesor.html` en pestañas distintas y verás los cambios de una en la otra.

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
Settings → Pages → rama `main`, carpeta `/ (root)`. `index.html` es la página de inicio. El archivo `CNAME` ya apunta a `tratocom.godsplan.dev`
(en el DNS: registro CNAME `tratocom` → `blqa.github.io`).

## Plantillas y respuesta automática
El supervisor las edita en **Configuración → Plantillas / Respuesta automática**. Con Firestore conectado se guardan en `settings/templates` y `settings/autoReply` (`{enabled, subject, body}`); la Cloud Function `fetchEmails` envía el acuse de recibo con `functions/autoReply.js` (sin responder a no-reply, listas ni correos automáticos; máx. 1 por remitente/hora) y asigna folios `TC-000001…`.

## Modo oscuro
Botón sol/luna en cada página. Tras cambiar clases en `src/app.jsx` ejecuta `./build.sh` (compila y regenera `dark.css`).

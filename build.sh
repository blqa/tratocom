#!/bin/sh
# Genera app.js a partir de src/app.jsx (el navegador no entiende JSX directamente).
# Uso:  sh build.sh
npx -p typescript tsc --jsx react --target es2019 --allowJs --skipLibCheck --outDir . src/app.jsx

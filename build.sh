#!/bin/sh
# Genera app.js (a partir de src/app.jsx) y dark.css (modo oscuro).
# Uso:  sh build.sh
npx -p typescript tsc --jsx react --target es2019 --allowJs --skipLibCheck --outDir . src/app.jsx
python3 tools/gen-dark.py

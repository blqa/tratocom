#!/usr/bin/env python3
"""Genera dark.css (modo oscuro) a partir de las clases de Tailwind que usa la demo.
Uso:  python3 tools/gen-dark.py   (se ejecuta solo desde build.sh)"""
import re, glob, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = ''.join(open(f, encoding='utf-8').read() for f in [os.path.join(root, 'src/app.jsx')] + glob.glob(os.path.join(root, '*.html')))

PAL = {  # tonos 300/400/500 de Tailwind
 'sky': {300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9'}, 'emerald': {300:'#6ee7b7',400:'#34d399',500:'#10b981'},
 'amber': {300:'#fcd34d',400:'#fbbf24',500:'#f59e0b'}, 'rose': {300:'#fda4af',400:'#fb7185',500:'#f43f5e'},
 'violet': {300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6'}}
CARD = '#131c2e'
BG = {50:'#172033',100:'#1e293b',200:'#283548',300:'#334155',800:'#475569',900:'#334155'}
TX = {900:'#f1f5f9',800:'#e2e8f0',700:'#cbd5e1',600:'#a9b6ca',500:'#94a3b8',400:'#7889a0',300:'#4b5a73'}
BD = {100:'#1e293b',200:'#2a374d',300:'#3a4963',900:'#334155'}
RG = {200:'#334155',300:'#475569',900:'#334155'}
def rgb(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))
def col(h, a=None):
    r,g,b = rgb(h)
    return f'rgb({r} {g} {b})' if a is None else f'rgb({r} {g} {b} / {round(a,3)})'
def esc(t): return re.sub(r'([:/.\[\]%])', r'\\\1', t)

rx = re.compile(r'(?<![\w-])((?:hover|focus|disabled|placeholder):)?(bg|text|border|ring|divide)-(white|slate|sky|emerald|amber|rose|violet)(?:-(\d{2,3}))?(?:/(\d{1,3}))?(?![\w-])')
seen = {}
for m in rx.finditer(src):
    token = m.group(0)
    if token in seen: continue
    var, prop, color, shade, alpha = m.groups()
    shade = int(shade) if shade else None; a = int(alpha)/100 if alpha else None
    decl = None
    if color == 'white':
        if prop == 'bg' and shade is None: decl = ('background-color', col(CARD, a))
    elif color == 'slate':
        table = {'bg':BG,'text':TX,'border':BD,'divide':BD,'ring':RG}[prop]
        if shade in table:
            if prop == 'bg': decl = ('background-color', col(table[shade], a))
            elif prop == 'text': decl = ('color', col(table[shade], a))
            elif prop in ('border','divide'): decl = ('border-color', col(table[shade], a))
            else: decl = ('--tw-ring-color', col(table[shade], a))
    else:
        c = PAL[color]
        if prop == 'bg' and shade in (50,100,200): decl = ('background-color', col(c[500], {50:.12,100:.2,200:.3}[shade]*(a or 1)))
        elif prop == 'text' and shade in (600,700,800,900): decl = ('color', col(c[300] if shade >= 700 else c[400]))
        elif prop in ('border','divide') and shade in (100,200,300): decl = ('border-color', col(c[500], {100:.25,200:.3,300:.45}[shade]))
        elif prop == 'ring' and shade in (200,300): decl = ('--tw-ring-color', col(c[500], {200:.35,300:.45}[shade]))
    if not decl: continue
    sel = '.dark .' + esc(token)
    if var == 'hover:': sel += ':hover'
    elif var == 'focus:': sel += ':focus'
    elif var == 'disabled:': sel += ':disabled'
    elif var == 'placeholder:': sel += '::placeholder'
    if prop == 'divide': sel = '.dark .' + esc(token) + '>:not([hidden])~:not([hidden])'
    seen[token] = f'{sel}{{{decl[0]}:{decl[1]}}}'

head = '''/* Modo oscuro (generado por tools/gen-dark.py — no editar a mano) */
html.dark{color-scheme:dark}
html.dark body.bg-slate-100{background-color:#0b1220}
html.dark .scroll-thin::-webkit-scrollbar-thumb{background:#334155}
.dark .bg-slate-900\\/50{background-color:rgb(0 0 0 / .62)}
'''
open(os.path.join(root, 'dark.css'), 'w', encoding='utf-8').write(head + '\n'.join(sorted(seen.values())) + '\n')
print(len(seen), 'reglas oscuras')

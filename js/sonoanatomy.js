// sonoanatomy.js - redrawn teaching diagrams of the ultrasound view for each block.
// Each block is a cross-section in a 600 x 400 box (the probe footprint along the top edge), drawn
// twice from the same shapes: once as coloured anatomy and once as a simplified ultrasound image.
// The slider shows anatomy to the left of the line and ultrasound to the right.
// Shapes are simplified teaching drawings checked against the published scans credited in
// learnmedia.js. They are not to scale and are not a substitute for a real scan.

// Drawing kinds. anatomy = [fill, stroke], us = [fill, stroke]. 'line' kinds are strokes only.
const KINDS = {
    skin: { anatomy: ['#e9b99a', 'none'], us: ['url(#usSkin)', 'none'] },
    fat: { anatomy: ['#f4dfa8', 'none'], us: ['#1d1d1d', 'none'] },
    muscle: { anatomy: ['#c86a5c', '#a85346'], us: ['url(#usMuscle)', '#9a9a9a'] },
    muscle2: { anatomy: ['#b85c50', '#97463b'], us: ['url(#usMuscle2)', '#9a9a9a'] },
    tendon: { anatomy: ['#efe8d6', '#c9bea2'], us: ['url(#usTendon)', '#d8d8d8'] },
    bone: { anatomy: ['#f3ecd8', '#b9ab86'], us: ['none', 'none'] },
    shadow: { anatomy: ['none', 'none'], us: ['url(#usShadow)', 'none'] },
    lung: { anatomy: ['#f2cfd2', 'none'], us: ['url(#usLung)', 'none'] },
    artery: { anatomy: ['#d93c3c', '#9e2020'], us: ['#040404', '#8a8a8a'] },
    vein: { anatomy: ['#4f72c9', '#2f4f97'], us: ['#060606', '#6f6f6f'] },
    nerve: { anatomy: ['#f4cd4a', '#b88a00'], us: ['url(#usNerve)', '#e6e6e6'] },
    fascia: { line: true, anatomy: ['#ffffff', 2.5], us: ['#f2f2f2', 3] },
    cortex: { line: true, anatomy: ['#b9ab86', 2], us: ['#ffffff', 4] },
    pleura: { line: true, anatomy: ['#9d6aa8', 2.5], us: ['#f5f5f5', 3.5] }
};

// Shared layers for the two groin blocks (fascia iliaca and femoral). Medial left, lateral right.
const groinBase = () => [
    { k: 'fascia', d: 'M 0 62 C 200 58 400 60 600 56' },
    { k: 'muscle', d: 'M 370 62 C 450 58 540 56 600 56 L 600 128 C 530 124 450 112 370 62 Z' },
    { k: 'muscle2', d: 'M 112 190 C 150 174 190 164 230 162 C 330 156 450 145 600 142 L 600 400 L 96 400 C 92 320 96 240 112 190 Z' },
    { k: 'fascia', d: 'M 110 188 C 150 172 190 162 230 160 C 330 154 450 143 600 140' },
    { k: 'vein', d: 'M 2 160 m -30 0 a 30 23 0 1 0 60 0 a 30 23 0 1 0 -60 0' },
    { k: 'artery', d: 'M 92 148 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0' },
    { k: 'nerve', top: true, d: 'M 180 172 C 192 160 222 160 236 168 C 226 182 196 184 180 172 Z' }
];
const groinLabels = [
    ['Femoral vein', 8, 236, 'start'], ['Femoral artery', 92, 118, 'middle'],
    ['Femoral nerve', 208, 205, 'middle'], ['Fascia lata', 300, 50, 'middle'],
    ['Sartorius', 520, 96, 'middle'], ['Fascia iliaca', 330, 140, 'middle'], ['Iliopsoas', 380, 290, 'middle']
];

export const SONO = {
    fib: {
        orient: ['Medial', 'Lateral'], depthCm: 4,
        layers: groinBase(),
        labels: groinLabels,
        needle: [[600, 70], [430, 150]],
        spread: 'M 290 160 C 360 150 480 142 548 144 C 500 166 380 176 290 160 Z',
        spreadLabel: ['Spread under the fascia iliaca', 420, 196, 'middle'],
        note: 'The needle goes through sartorius and the fascia iliaca from lateral to medial. Local anaesthetic opens the plane under the fascia and runs medially towards the femoral nerve.'
    },
    femoral: {
        orient: ['Medial', 'Lateral'], depthCm: 4,
        layers: groinBase(),
        labels: groinLabels,
        needle: [[600, 62], [242, 170]],
        spread: 'M 166 170 C 172 146 240 140 258 164 C 254 194 180 198 166 170 Z',
        spreadLabel: ['Spread around the nerve', 300, 230, 'middle'],
        note: 'The femoral nerve lies lateral to the artery and deep to the fascia iliaca. The needle tip is placed next to the nerve, never into it, and local anaesthetic bathes the nerve.'
    },
    axillary: {
        orient: ['Lateral (humerus)', 'Medial'], depthCm: 3,
        layers: [
            { k: 'muscle', d: 'M 0 42 C 100 38 200 44 262 60 C 252 110 200 138 0 140 Z' },
            { k: 'muscle2', d: 'M 0 146 C 120 146 212 140 258 116 C 280 160 262 220 200 250 C 120 260 50 258 0 255 Z' },
            { k: 'muscle2', d: 'M 232 262 C 330 244 470 238 600 242 L 600 400 L 206 400 C 204 330 212 290 232 262 Z' },
            { k: 'bone', d: 'M 0 300 C 60 290 120 295 172 316 C 150 350 60 352 0 345 Z' },
            { k: 'shadow', d: 'M 0 302 C 60 292 120 297 172 318 L 172 400 L 0 400 Z' },
            { k: 'cortex', d: 'M 0 300 C 60 290 120 295 172 316' },
            { k: 'vein', d: 'M 432 126 m -27 0 a 27 14 0 1 0 54 0 a 27 14 0 1 0 -54 0' },
            { k: 'vein', d: 'M 414 208 m -23 0 a 23 12 0 1 0 46 0 a 23 12 0 1 0 -46 0' },
            { k: 'artery', top: true, d: 'M 340 152 m -22 0 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0' },
            { k: 'nerve', top: true, d: 'M 298 112 m -13 0 a 13 12 0 1 0 26 0 a 13 12 0 1 0 -26 0' },
            { k: 'nerve', top: true, d: 'M 384 112 m -11 0 a 11 10 0 1 0 22 0 a 11 10 0 1 0 -22 0' },
            { k: 'nerve', top: true, d: 'M 336 198 m -11 0 a 11 10 0 1 0 22 0 a 11 10 0 1 0 -22 0' },
            { k: 'nerve', top: true, d: 'M 200 188 C 206 178 232 178 238 186 C 232 196 206 197 200 188 Z' }
        ],
        labels: [
            ['Biceps', 90, 95, 'middle'], ['Coracobrachialis', 100, 215, 'middle'], ['Humerus', 80, 334, 'middle'],
            ['Triceps', 470, 330, 'middle'], ['Axillary artery', 340, 157, 'middle', true],
            ['Median', 290, 86, 'middle'], ['Ulnar', 396, 86, 'middle'], ['Radial', 336, 232, 'middle'],
            ['Musculocutaneous', 220, 168, 'middle'], ['Veins', 500, 168, 'middle']
        ],
        needle: [[0, 30], [316, 190]],
        spread: 'M 340 152 m -46 0 a 46 44 0 1 0 92 0 a 46 44 0 1 0 -92 0',
        spreadLabel: ['Spread around the artery and nerves', 300, 290, 'middle'],
        note: 'Median (superficial), ulnar (medial) and radial (deep) nerves sit around the axillary artery. The musculocutaneous nerve is separate, inside coracobrachialis. The veins are easily squashed by probe pressure.'
    },
    sap: {
        orient: ['Anterior', 'Posterior'], depthCm: 4,
        layers: [
            { k: 'muscle', d: 'M 120 50 C 250 46 420 44 600 42 L 600 120 C 450 112 300 100 120 50 Z' },
            { k: 'muscle2', d: 'M 0 92 C 100 94 200 100 300 104 C 420 110 520 118 600 124 L 600 182 C 400 182 200 170 0 162 Z' },
            { k: 'muscle', d: 'M 0 168 C 100 172 170 178 200 208 L 200 236 C 130 236 60 234 0 232 Z' },
            { k: 'muscle', d: 'M 400 208 C 430 186 510 186 600 186 L 600 234 C 520 236 450 238 400 238 Z' },
            { k: 'lung', d: 'M 0 240 L 204 240 L 200 400 L 0 400 Z' },
            { k: 'lung', d: 'M 396 240 L 600 240 L 600 400 L 400 400 Z' },
            { k: 'bone', d: 'M 200 214 C 240 194 360 194 400 214 C 382 248 218 248 200 214 Z' },
            { k: 'shadow', d: 'M 200 216 C 240 196 360 196 400 216 L 408 400 L 192 400 Z' },
            { k: 'cortex', d: 'M 200 214 C 240 194 360 194 400 214' },
            { k: 'pleura', d: 'M 0 238 C 70 240 150 240 203 237' },
            { k: 'pleura', d: 'M 397 237 C 460 240 540 240 600 238' },
            { k: 'artery', top: true, d: 'M 330 106 m -8 0 a 8 7 0 1 0 16 0 a 8 7 0 1 0 -16 0' }
        ],
        labels: [
            ['Latissimus dorsi', 470, 85, 'middle'], ['Serratus anterior', 120, 140, 'middle'],
            ['Rib', 300, 228, 'middle'], ['Intercostal muscle', 500, 216, 'middle'], ['Pleura', 90, 262, 'middle'],
            ['Lung', 520, 320, 'middle'], ['Thoracodorsal artery', 400, 152, 'start']
        ],
        needle: [[0, 22], [258, 98]],
        spread: 'M 150 92 C 220 86 340 100 450 113 C 360 126 230 114 150 92 Z',
        spreadLabel: ['Spread between latissimus dorsi and serratus', 300, 30, 'middle'],
        note: 'This shows the superficial approach from the technique steps: local anaesthetic is laid in the plane on top of serratus anterior. Keep the tip over a rib, well away from the pleura between the ribs.'
    },
    esp: {
        orient: ['Cranial', 'Caudal'], depthCm: 5,
        layers: [
            { k: 'muscle', d: 'M 0 42 C 200 40 400 42 600 44 L 600 84 C 400 84 200 82 0 82 Z' },
            { k: 'muscle2', d: 'M 0 86 C 200 86 400 88 600 88 L 600 134 C 400 132 200 132 0 130 Z' },
            { k: 'muscle', d: 'M 0 134 C 200 136 400 138 600 138 L 600 250 C 560 250 545 228 490 228 C 435 228 420 255 395 260 C 370 255 355 228 300 228 C 245 228 230 255 205 260 C 180 255 165 228 110 228 C 55 228 40 250 0 250 Z' },
            { k: 'muscle2', d: 'M 0 254 L 600 254 L 600 400 L 0 400 Z' },
            { k: 'pleura', d: 'M 0 332 C 20 332 40 333 56 333' },
            { k: 'pleura', d: 'M 164 333 C 190 334 220 334 246 333' },
            { k: 'pleura', d: 'M 354 333 C 380 334 410 334 436 333' },
            { k: 'pleura', d: 'M 544 333 C 560 333 580 332 600 332' },
            ...[110, 300, 490].flatMap((x) => [
                { k: 'bone', d: `M ${x - 55} 236 C ${x - 40} 224 ${x + 40} 224 ${x + 55} 236 L ${x + 50} 292 L ${x - 50} 292 Z` },
                { k: 'shadow', d: `M ${x - 55} 236 C ${x - 40} 224 ${x + 40} 224 ${x + 55} 236 L ${x + 55} 400 L ${x - 55} 400 Z` },
                { k: 'cortex', d: `M ${x - 55} 236 C ${x - 40} 224 ${x + 40} 224 ${x + 55} 236` }
            ])
        ],
        labels: [
            ['Trapezius', 470, 68, 'middle'], ['Rhomboid major', 470, 116, 'middle'], ['Erector spinae', 470, 190, 'middle'],
            ['Transverse process', 110, 280, 'middle'], ['Transverse process', 490, 280, 'middle'], ['Pleura', 205, 356, 'middle']
        ],
        needle: [[40, 0], [290, 222]],
        spread: 'M 120 228 C 200 208 400 208 480 228 C 400 236 200 236 120 228 Z',
        spreadLabel: ['Spread lifting erector spinae off the bone', 300, 205, 'middle'],
        note: 'In the sagittal view the transverse processes look like flat-topped bright lines with black shadows below. The needle runs cranial to caudal onto the transverse process and the injection lifts erector spinae off the bone.'
    },
    popliteal: {
        orient: ['Lateral', 'Medial'], depthCm: 4,
        layers: [
            { k: 'muscle', d: 'M 0 48 C 80 46 170 52 215 70 C 230 130 215 200 180 240 C 120 250 50 252 0 250 Z' },
            { k: 'muscle2', d: 'M 382 92 C 420 72 520 66 600 66 L 600 262 C 520 264 440 256 400 242 C 370 200 366 130 382 92 Z' },
            { k: 'tendon', d: 'M 410 50 C 470 44 560 44 600 46 L 600 64 C 540 66 450 70 396 84 C 396 70 400 58 410 50 Z' },
            { k: 'bone', d: 'M 160 330 C 240 305 380 305 460 330 C 430 370 190 370 160 330 Z' },
            { k: 'shadow', d: 'M 160 332 C 240 307 380 307 460 332 L 470 400 L 150 400 Z' },
            { k: 'cortex', d: 'M 160 330 C 240 305 380 305 460 330' },
            { k: 'vein', d: 'M 312 206 m -22 0 a 22 15 0 1 0 44 0 a 22 15 0 1 0 -44 0' },
            { k: 'artery', d: 'M 306 252 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0' },
            { k: 'nerve', top: true, d: 'M 296 120 m -32 0 a 32 22 0 1 0 64 0 a 32 22 0 1 0 -64 0' }
        ],
        labels: [
            ['Biceps femoris', 95, 150, 'middle'], ['Semimembranosus', 500, 170, 'middle'], ['Semitendinosus', 520, 60, 'middle'],
            ['Sciatic nerve', 296, 82, 'middle'], ['Popliteal vein', 380, 212, 'start'], ['Popliteal artery', 380, 262, 'start'], ['Femur', 310, 372, 'middle']
        ],
        needle: [[0, 70], [256, 118]],
        spread: 'M 296 120 m -48 0 a 48 36 0 1 0 96 0 a 48 36 0 1 0 -96 0',
        spreadLabel: ['Spread inside the sheath (doughnut sign)', 300, 300, 'middle'],
        note: 'The sciatic nerve sits superficial and lateral to the popliteal vessels, between biceps femoris and semimembranosus. Local anaesthetic inside the paraneural sheath rings the nerve.'
    }
};

const DEFS = `
<defs>
  <pattern id="usMuscle" width="46" height="9" patternUnits="userSpaceOnUse">
    <rect width="46" height="9" fill="#4b4b4b"/><path d="M2 3 H20 M26 7 H42" stroke="#9c9c9c" stroke-width="1.6"/>
  </pattern>
  <pattern id="usMuscle2" width="38" height="8" patternUnits="userSpaceOnUse">
    <rect width="38" height="8" fill="#3e3e3e"/><path d="M4 2 H18 M22 6 H35" stroke="#868686" stroke-width="1.5"/>
  </pattern>
  <pattern id="usTendon" width="30" height="5" patternUnits="userSpaceOnUse">
    <rect width="30" height="5" fill="#8f8f8f"/><path d="M0 2 H30" stroke="#d6d6d6" stroke-width="1.4"/>
  </pattern>
  <pattern id="usNerve" width="9" height="9" patternUnits="userSpaceOnUse">
    <rect width="9" height="9" fill="#cfcfcf"/><circle cx="4.5" cy="4.5" r="2" fill="#3a3a3a"/>
  </pattern>
  <pattern id="usSkin" width="12" height="4" patternUnits="userSpaceOnUse">
    <rect width="12" height="4" fill="#a8a8a8"/><path d="M0 2 H12" stroke="#dcdcdc" stroke-width="1"/>
  </pattern>
  <pattern id="usLung" width="600" height="60" patternUnits="userSpaceOnUse">
    <rect width="600" height="60" fill="#3d3d3d"/><path d="M0 50 H600" stroke="#7a7a7a" stroke-width="2.5"/>
  </pattern>
  <linearGradient id="usShadow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0.92"/>
  </linearGradient>
  <pattern id="usSpeck" width="23" height="17" patternUnits="userSpaceOnUse">
    <circle cx="3" cy="4" r="0.9" fill="#fff"/><circle cx="14" cy="2" r="0.7" fill="#fff"/><circle cx="9" cy="11" r="1" fill="#fff"/>
    <circle cx="19" cy="9" r="0.8" fill="#fff"/><circle cx="5" cy="15" r="0.7" fill="#fff"/><circle cx="17" cy="15" r="0.9" fill="#fff"/>
  </pattern>
  <radialGradient id="usFade" cx="0.5" cy="0" r="1.1">
    <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
  </radialGradient>
  <marker id="tipA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#5b6470"/></marker>
</defs>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function shape(layer, mode) {
    const k = KINDS[layer.k];
    if (k.line) {
        const [c, w] = k[mode];
        return `<path d="${layer.d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    const [f, s] = k[mode];
    if (f === 'none' && s === 'none') return '';
    return `<path d="${layer.d}" fill="${f}" stroke="${s}" stroke-width="${s === 'none' ? 0 : 1.5}"/>`;
}

function scene(def, mode) {
    const bg = mode === 'us'
        ? '<rect width="600" height="400" fill="#1d1d1d"/><rect width="600" height="13" fill="url(#usSkin)"/>'
        : '<rect width="600" height="400" fill="#f4dfa8"/><rect width="600" height="13" fill="#e9b99a"/>';
    const under = def.layers.filter((l) => !l.top).map((l) => shape(l, mode)).join('');
    const over = def.layers.filter((l) => l.top).map((l) => shape(l, mode)).join('');
    const spread = mode === 'us'
        ? `<path class="sono-spread" d="${def.spread}" fill="#020202" stroke="#bdbdbd" stroke-width="1"/>`
        : `<path class="sono-spread" d="${def.spread}" fill="#5fb7e8" fill-opacity="0.75" stroke="#2c84b8" stroke-width="1.5"/>`;
    const [[x1, y1], [x2, y2]] = def.needle;
    const needle = mode === 'us'
        ? `<line class="sono-needle" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`
        : `<line class="sono-needle" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5b6470" stroke-width="3.5" stroke-linecap="round" marker-end="url(#tipA)"/>`;
    const body = `${bg}${under}${spread}${over}`;
    return mode === 'us'
        ? `${body}<rect width="600" height="400" fill="url(#usSpeck)" opacity="0.22"/><rect width="600" height="400" fill="url(#usFade)"/>${needle}`
        : `${body}${needle}`;
}

function labelText([text, x, y, anchor], cls = '') {
    return `<text class="sono-label ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(text)}</text>`;
}

// Returns the SVG for a block. val = slider position 0-100 (anatomy shown left of the line).
export function sonoSVG(blockId, val = 50) {
    const def = SONO[blockId];
    if (!def) return '';
    const w = (val / 100) * 600;
    const ticks = Array.from({ length: def.depthCm - 1 }, (_, i) => {
        const y = ((i + 1) * 400) / def.depthCm;
        return `<line x1="588" y1="${y}" x2="600" y2="${y}" stroke="#fff" stroke-width="2"/><text class="sono-tick" x="584" y="${y + 5}" text-anchor="end">${i + 1}${i === 0 ? ' cm' : ''}</text>`;
    }).join('');
    return `<svg viewBox="0 0 600 400" class="us-svg sono" role="img" aria-label="Teaching diagram of the ultrasound view for this block, with labelled anatomy, needle path and local anaesthetic spread">
${DEFS}
<clipPath id="sliderClip"><rect id="sliderRect" x="0" y="0" width="${w}" height="400"/></clipPath>
<g class="sono-us">${scene(def, 'us')}</g>
<g class="sono-anat" clip-path="url(#sliderClip)">${scene(def, 'anatomy')}</g>
<g class="sono-labels">${def.labels.map((l) => labelText(l)).join('')}${labelText(def.spreadLabel, 'sono-spread-label')}</g>
<line id="sliderLine" x1="${w}" y1="0" x2="${w}" y2="400" stroke="#fff" stroke-width="2"/>
<text class="sono-orient" x="10" y="26" text-anchor="start">${esc(def.orient[0])}</text>
<text class="sono-orient" x="590" y="26" text-anchor="end">${esc(def.orient[1])}</text>
${ticks}
</svg>`;
}

export const sonoNote = (blockId) => (SONO[blockId] ? SONO[blockId].note : '');

// bodymap.js - front and back body figure for the home page with a tappable marker at the
// injection site of each block. The outline is drawn as one half and mirrored, so it stays
// symmetrical. The figure faces the viewer on the front view, so the patient's right side is on
// the viewer's left.

// Right half of the outline, [x offset from the midline, y], from the top of the head round to
// the crotch. Arms are slightly away from the body so the armpit is visible.
const HALF = [
    [0, 6], [10, 7], [17, 14], [19, 26], [17, 40], [12, 51], [9, 58], [10, 64], [22, 70], [35, 74], [42, 82],
    [45, 98], [48, 120], [52, 142], [57, 164], [62, 186], [67, 198], [69, 210], [66, 222], [60, 220], [57, 206],
    [53, 192], [46, 168], [40, 146], [34, 122], [31, 104], [29, 96], [28, 112], [27, 136], [26, 152],
    [29, 172], [32, 192], [31, 222], [28, 252], [25, 278], [24, 292], [26, 318], [24, 346], [19, 372],
    [21, 386], [24, 396], [12, 399], [9, 390], [10, 372], [11, 346], [10, 318], [9, 292], [8, 262],
    [6, 230], [3, 210], [0, 206]
];
const CX = 100;

// Catmull-Rom through the points, as cubic Bezier segments.
function smooth(pts) {
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
}

const outline = () => {
    const right = HALF.map(([x, y]) => [CX + x, y]);
    const left = HALF.slice(0, -1).reverse().map(([x, y]) => [CX - x, y]);
    return smooth([...right, ...left]) + ' Z';
};

// Surface landmarks drawn faintly inside the figure.
const FRONT_DETAIL = [
    'M 86 70 C 92 73 97 74 100 74 C 103 74 108 73 114 70', // clavicles
    'M 76 140 C 80 146 86 148 90 146 M 124 140 C 120 146 114 148 110 146', // costal margins
    'M 72 186 C 80 196 90 204 97 208 M 128 186 C 120 196 110 204 103 208', // inguinal ligaments
    'M 80 290 C 84 294 88 294 92 290 M 120 290 C 116 294 112 294 108 290' // knees
];
const BACK_DETAIL = [
    'M 100 60 L 100 200', // spine
    'M 78 84 C 86 96 88 112 84 124 M 122 84 C 114 96 112 112 116 124', // scapulae
    'M 76 222 C 86 228 94 226 98 220 M 124 222 C 114 228 106 226 102 220', // gluteal folds
    'M 78 288 C 84 291 90 291 94 288 M 122 288 C 116 291 110 291 106 288' // popliteal creases
];

// Marker sites: [block id, x, y, label, label side]. Front view: patient's right on the viewer's left.
const SITES = {
    front: [
        ['axillary', 70, 100, 'Axillary', 'left'],
        ['sap', 128, 128, 'Serratus', 'right'],
        ['fib', 76, 196, 'Fascia iliaca', 'left'],
        ['femoral', 120, 204, 'Femoral', 'right']
    ],
    back: [
        ['esp', 108, 116, 'Erector spinae', 'right'],
        ['popliteal', 84, 280, 'Popliteal', 'left']
    ]
};

function marker([id, x, y, label, side], name) {
    const lx = side === 'left' ? 4 : 196;
    const anchor = side === 'left' ? 'start' : 'end';
    const tx = side === 'left' ? lx : lx;
    const ly = y - 14;
    const lineEnd = side === 'left' ? Math.min(lx + label.length * 7.2 + 4, x - 8) : Math.max(lx - label.length * 7.2 - 4, x + 8);
    return `<g class="zone" data-block="${id}" aria-label="${name}">
  <title>${name}</title>
  <path class="zone-lead" d="M ${x} ${y} L ${lineEnd} ${ly + 4}" />
  <rect class="zone-hit" x="${side === 'left' ? 0 : lx - label.length * 7.2 - 8}" y="${ly - 14}" width="${label.length * 7.2 + 10}" height="26" rx="7"/>
  <text class="zone-label" x="${tx}" y="${ly + 3}" text-anchor="${anchor}">${label}</text>
  <circle class="zone-ring" cx="${x}" cy="${y}" r="11"/>
  <circle class="zone-dot" cx="${x}" cy="${y}" r="5.5"/>
</g>`;
}

export function bodyMapSVG(view, nameOf) {
    const detail = (view === 'front' ? FRONT_DETAIL : BACK_DETAIL).map((d) => `<path d="${d}"/>`).join('');
    const sites = SITES[view].map((s) => marker(s, nameOf(s[0]))).join('');
    const title = view === 'front' ? 'Front' : 'Back';
    return `<figure class="bodyfig"><svg viewBox="0 0 200 404" class="bodymap" role="group" aria-label="${title} of body: tap a marker to open that block">
  <path class="body-shape" d="${outline()}"/>
  <g class="body-detail">${detail}</g>
  ${sites}
</svg><figcaption>${title}</figcaption></figure>`;
}

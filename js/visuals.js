// visuals.js - teaching diagrams (probe placement and a simulated ultrasound view with an
// anatomy overlay). Carried over from the previous version; illustrative only, not to scale.

export function probeSVG(blockId) {
  const baseSvg = '<svg viewBox="0 0 400 300" class="macro-svg">';
  
  const renderProbe = (x, y, rot, text, textX, textY, textRot = 0) => `
    <g transform="translate(${x}, ${y}) rotate(${rot})">
      <path d="M -15,-30 L 15,-30 L 20,0 L -20,0 Z" fill="#1e3a8a" />
      <rect x="-20" y="0" width="40" height="6" rx="2" fill="#3b82f6" />
      <path d="M 0,-30 C 0,-50 -20,-60 -20,-80" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="-15" cy="-10" r="4" fill="#10b981" />
      <text x="${textX}" y="${textY}" transform="rotate(${textRot})" fill="#2563eb" font-size="14" font-weight="bold">${text}</text>
    </g>
  `;

  switch(blockId) {
    case 'sap': return baseSvg + `
      <!-- Lateral Torso, arm raised -->
      <path d="M 160 50 C 180 50, 190 70, 190 100 C 190 150, 200 200, 200 250 L 100 250 C 100 200, 90 150, 90 100 C 90 70, 100 50, 160 50" fill="#e2e8f0" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
      <!-- Arm -->
      <path d="M 140 80 L 250 20 L 270 40 L 170 110" fill="#cbd5e1" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
      <!-- Rib Lines -->
      <path d="M 120 130 Q 145 140 180 130 M 120 150 Q 145 160 180 150 M 120 170 Q 145 180 180 170 M 120 190 Q 145 200 180 190" fill="none" stroke="currentColor" stroke-width="2" opacity="0.6"/>
      <!-- Mid Axillary Line -->
      <line x1="145" y1="100" x2="145" y2="230" stroke="currentColor" stroke-width="2" stroke-dasharray="6" opacity="0.5"/>
      ${renderProbe(145, 170, -15, "Marker Anterior", 30, 0)}
    </svg>`;
    
    case 'esp': return baseSvg + `
      <!-- Prone/Sitting Back -->
      <path d="M 150 40 C 200 20, 250 40, 250 40 C 280 100, 270 180, 280 250 L 120 250 C 130 180, 120 100, 150 40 Z" fill="#e2e8f0" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
      <!-- Spine Line -->
      <line x1="200" y1="50" x2="200" y2="240" stroke="currentColor" stroke-width="3" stroke-dasharray="6"/>
      <!-- Scapulae outlines -->
      <path d="M 140 80 C 160 80, 170 120, 150 150 Z" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
      <path d="M 260 80 C 240 80, 230 120, 250 150 Z" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
      ${renderProbe(165, 150, 90, "Marker Cephalad", -60, -25, -90)}
    </svg>`;
    
    case 'axillary': return baseSvg + `
      <!-- Torso edge -->
      <path d="M 80 50 C 80 100, 70 200, 80 280" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
      <!-- Arm Abducted -->
      <path d="M 80 100 C 120 100, 200 90, 350 110 L 350 140 C 200 130, 120 150, 80 160" fill="#e2e8f0" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <!-- Pectoral/Axillary lines -->
      <path d="M 80 160 C 110 140, 130 120, 150 110" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M 140 110 C 200 100, 250 115, 250 115" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
      ${renderProbe(150, 125, 90, "Marker Cephalad", -60, -25, -90)}
    </svg>`;
    
    case 'fib':
    case 'femoral': return baseSvg + `
      <!-- Supine Groin -->
      <path d="M 100 50 L 300 50 C 310 100, 320 150, 250 300 L 150 300 C 80 150, 90 100, 100 50 Z" fill="#e2e8f0" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
      <!-- Navel -->
      <circle cx="200" cy="80" r="4" fill="currentColor" opacity="0.5"/>
      <!-- Groin Crease -->
      <path d="M 200 130 C 200 150, 200 170, 200 190" fill="none" stroke="currentColor" stroke-width="3" opacity="0.4"/>
      <!-- Inguinal Ligament -->
      <line x1="200" y1="140" x2="300" y2="100" stroke="currentColor" stroke-width="2" stroke-dasharray="4"/>
      <!-- Femoral Crease Line -->
      <path d="M 200 160 C 240 150, 280 160, 300 165" fill="none" stroke="currentColor" stroke-width="2"/>
      ${renderProbe(blockId === 'femoral' ? 240 : 275, 160, -15, "Marker Right", -60, -25)}
    </svg>`;
    
    case 'popliteal': return baseSvg + `
      <!-- Prone Lower Thigh / Knee -->
      <path d="M 150 20 C 150 100, 160 200, 150 280 L 250 280 C 240 200, 250 100, 250 20 Z" fill="#e2e8f0" stroke="currentColor" stroke-width="4"/>
      <!-- Popliteal Crease -->
      <path d="M 160 150 C 200 165, 240 150, 240 150" fill="none" stroke="currentColor" stroke-width="3"/>
      <!-- Muscle outlines -->
      <path d="M 150 180 C 180 220, 150 280, 150 280" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
      <path d="M 250 180 C 220 220, 250 280, 250 280" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
      ${renderProbe(200, 90, 0, "Marker Lateral", 30, 0)}
    </svg>`;
    
    default: return '';
  }
}

export function ultrasoundSVG(blockId, val, realUS) {
  const clipWidth = (val / 100) * 600;
  
  const render = (mode) => {
    const isUS = mode === 'us';
    const isRealUS = mode === 'real';

    const c = isUS || isRealUS ? 'us-mode' : '';
    const lo = isUS || isRealUS ? '0' : '1';
    
    const scanClass = 'animate-scan';
    const fluidClass = 'animate-fluid';
    const needleClass = 'animate-needle';
    const needleLeftClass = 'animate-needle-left';
    const liftClass = 'animate-fascia';

    const usOverlay = isUS ? '<rect width="600" height="400" fill="url(#usNoise)" opacity="0.3" class="blend-overlay" />' : '';
    const realOverlay = isRealUS ? '<rect width="600" height="400" fill="url(#realNoise)" opacity="0.8" class="blend-screen" />' : '';

    // Needle drawing function to include a bevel tip
    const needleDraw = (x1, y1, x2, y2) => `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="4" stroke-linecap="round" class="${isUS||isRealUS?'glow':''}" />
      <polygon points="${x2},${y2} ${x2+(x1>x2?10:-10)},${y2-5} ${x2+(x1>x2?5:-5)},${y2+5}" fill="#fff" class="${isUS||isRealUS?'glow':''}" />
    `;

    switch(blockId) {
      case 'sap': return `
        <g class="${c}">
          <g class="${scanClass}">
            <path d="M 0 20 Q 300 40 600 20 L 600 140 Q 300 160 0 140 Z" fill="${isUS||isRealUS?'#444':'#b91c1c'}" opacity="0.8" />
            <text x="30" y="80" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}" >Latissimus Dorsi</text>
            <path d="M 0 140 Q 300 160 600 140 L 600 250 L 0 250 Z" fill="${isUS||isRealUS?'#333':'#991b1b'}" opacity="0.9" />
            <text x="30" y="200" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}" >Serratus Anterior</text>
            <circle cx="150" cy="300" r="45" fill="${isUS||isRealUS?'#ddd':'#e2e8f0'}" />
            <circle cx="450" cy="300" r="45" fill="${isUS||isRealUS?'#ddd':'#e2e8f0'}" />
            <path d="M 185 280 Q 300 285 415 280 L 415 310 Q 300 315 185 310 Z" fill="${isUS||isRealUS?'#222':'#7f1d1d'}" />
            <line x1="0" y1="340" x2="600" y2="340" stroke="#fff" stroke-width="${isUS||isRealUS?6:4}" class="${isUS||isRealUS?'glow':''}" />
            <text x="30" y="365" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Pleura</text>
            <line x1="0" y1="140" x2="600" y2="140" stroke="#fff" stroke-width="2" stroke-dasharray="8" opacity="${isUS||isRealUS?0.3:1}" />
            <ellipse cx="300" cy="140" rx="140" ry="25" fill="${isUS||isRealUS?'#111':'url(#fluidGradient)'}" class="${fluidClass}" />
          </g>
          ${usOverlay} ${realOverlay}
          <g class="${needleClass}">
            ${needleDraw(550, 20, 310, 135)}
          </g>
        </g>`;
      
      case 'esp': return `
        <g class="${c}">
          <g class="${scanClass}">
            <path d="M 0 0 L 600 0 L 600 80 L 0 80 Z" fill="${isUS||isRealUS?'#444':'#b91c1c'}" opacity="0.6" />
            <text x="30" y="50" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Trapezius / Rhomboid</text>
            <path d="M 0 80 L 600 80 L 600 280 L 0 280 Z" fill="${isUS||isRealUS?'#333':'#991b1b'}" class="${liftClass}" />
            <text x="30" y="160" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Erector Spinae</text>
            <path d="M 180 280 Q 280 230 380 280 L 380 400 L 180 400 Z" fill="${isUS||isRealUS?'#ddd':'#e2e8f0'}" />
            <text x="210" y="320" fill="${isUS||isRealUS?'#333':'#1e293b'}" font-size="16" font-weight="bold" opacity="${lo}">Transverse Process</text>
            <ellipse cx="280" cy="265" rx="100" ry="30" fill="${isUS||isRealUS?'#111':'url(#fluidGradient)'}" class="${fluidClass}" />
          </g>
          ${usOverlay} ${realOverlay}
          <g class="${needleClass}">
            ${needleDraw(80, 20, 270, 250)}
          </g>
        </g>`;

      case 'axillary': return `
        <g class="${c}">
          <g class="${scanClass}">
            <path d="M 0 0 L 600 0 L 600 400 L 0 400 Z" fill="${isUS||isRealUS?'#222':'#fca5a5'}" opacity="0.4" />
            <path d="M 20 150 C 60 100, 160 100, 180 150 C 160 220, 60 220, 20 150 Z" fill="${isUS||isRealUS?'#333':'#b91c1c'}" opacity="0.6" />
            <circle cx="100" cy="160" r="14" fill="${isUS||isRealUS?'#ccc':'#fde047'}" class="${isUS||isRealUS?'glow-soft':''}" />
            <text x="60" y="200" fill="#fff" font-size="14" font-weight="bold" opacity="${lo}">Musculocutaneous</text>
            <circle cx="320" cy="200" r="40" fill="${isUS||isRealUS?'#000':'#ef4444'}" class="animate-pulse-artery" />
            <text x="305" y="205" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">AA</text>
            <path d="M 400 150 Q 430 130 460 150 Q 430 180 400 150 Z" fill="${isUS||isRealUS?'#111':'#3b82f6'}" opacity="0.8" />
            <path d="M 380 260 Q 420 240 450 260 Q 420 290 380 260 Z" fill="${isUS||isRealUS?'#111':'#3b82f6'}" opacity="0.8" />
            <circle cx="260" cy="140" r="12" fill="${isUS||isRealUS?'#bbb':'#fde047'}" class="${isUS||isRealUS?'glow-soft':''}" />
            <text x="200" y="130" fill="#fff" font-size="14" font-weight="bold" opacity="${lo}">Median</text>
            <circle cx="240" cy="260" r="12" fill="${isUS||isRealUS?'#bbb':'#fde047'}" class="${isUS||isRealUS?'glow-soft':''}" />
            <text x="190" y="280" fill="#fff" font-size="14" font-weight="bold" opacity="${lo}">Ulnar</text>
            <circle cx="400" cy="210" r="12" fill="${isUS||isRealUS?'#bbb':'#fde047'}" class="${isUS||isRealUS?'glow-soft':''}" />
            <text x="420" y="215" fill="#fff" font-size="14" font-weight="bold" opacity="${lo}">Radial</text>
            <path d="M 220 120 Q 320 80 360 210 Q 300 300 220 240 Z" fill="${isUS||isRealUS?'#111':'url(#fluidGradient)'}" class="${fluidClass}" opacity="0.7" />
          </g>
          ${usOverlay} ${realOverlay}
          <g class="${needleLeftClass}">
            ${needleDraw(20, 20, 230, 135)}
          </g>
        </g>`;

      case 'fib': return `
        <g class="${c}">
          <g class="${scanClass}">
            <path d="M 0 180 Q 300 280 600 180 L 600 400 L 0 400 Z" fill="${isUS||isRealUS?'#333':'#991b1b'}" />
            <text x="40" y="320" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Iliopsoas Muscle</text>
            <path d="M 0 180 Q 300 280 600 180" fill="none" stroke="#fff" stroke-width="${isUS||isRealUS?6:3}" class="${isUS||isRealUS?'glow':''}" />
            <text x="40" y="160" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Fascia Iliaca</text>
            <ellipse cx="430" cy="235" rx="25" ry="12" fill="${isUS||isRealUS?'#888':'#fde047'}" class="${isUS||isRealUS?'glow-soft':''}" />
            <text x="385" y="275" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Femoral N.</text>
            <circle cx="540" cy="200" r="30" fill="${isUS||isRealUS?'#000':'#ef4444'}" class="animate-pulse-artery" />
            <path d="M 140 210 Q 300 300 450 230 L 430 195 Q 300 240 140 180 Z" fill="${isUS||isRealUS?'#111':'url(#fluidGradient)'}" class="${fluidClass}" />
          </g>
          ${usOverlay} ${realOverlay}
          <g class="${needleLeftClass}">
            ${needleDraw(30, 30, 220, 225)}
          </g>
        </g>`;
        
      case 'femoral': return `
        <g class="${c}">
          <g class="${scanClass}">
            <path d="M 0 160 Q 300 220 600 160 L 600 400 L 0 400 Z" fill="${isUS||isRealUS?'#333':'#991b1b'}" opacity="0.8" />
            <path d="M 0 160 Q 300 220 600 160" fill="none" stroke="#fff" stroke-width="${isUS||isRealUS?6:3}" class="${isUS||isRealUS?'glow':''}" />
            <text x="30" y="140" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Fascia Iliaca</text>
            <polygon points="250,195 310,195 280,225" fill="${isUS||isRealUS?'#888':'#fde047'}" class="${isUS||isRealUS?'glow-soft':''}" />
            <text x="220" y="250" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Femoral Nerve</text>
            <circle cx="410" cy="180" r="35" fill="${isUS||isRealUS?'#000':'#ef4444'}" class="animate-pulse-artery" />
            <text x="395" y="185" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">FA</text>
            <path d="M 480 150 Q 530 140 540 190 Q 490 200 480 150 Z" fill="${isUS||isRealUS?'#111':'#3b82f6'}" opacity="0.8" />
            <text x="500" y="175" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">FV</text>
            <ellipse cx="280" cy="210" rx="60" ry="35" fill="${isUS||isRealUS?'#111':'url(#fluidGradient)'}" class="${fluidClass}" opacity="0.8" />
          </g>
          ${usOverlay} ${realOverlay}
          <g class="${needleLeftClass}">
            ${needleDraw(30, 40, 235, 195)}
          </g>
        </g>`;
        
      case 'popliteal': return `
        <g class="${c}">
          <g class="${scanClass}">
            <path d="M 0 0 L 600 0 L 600 400 L 0 400 Z" fill="${isUS||isRealUS?'#222':'#fca5a5'}" opacity="0.3" />
            <text x="30" y="40" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Biceps Femoris</text>
            <text x="420" y="40" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Semimembranosus</text>
            <circle cx="180" cy="280" r="35" fill="${isUS||isRealUS?'#000':'#ef4444'}" class="animate-pulse-artery" />
            <circle cx="180" cy="190" r="30" fill="${isUS||isRealUS?'#111':'#3b82f6'}" opacity="0.8" />
            <circle cx="360" cy="140" r="20" fill="${isUS||isRealUS?'#bbb':'#fde047'}" />
            <circle cx="410" cy="160" r="14" fill="${isUS||isRealUS?'#bbb':'#fde047'}" />
            <ellipse cx="385" cy="150" rx="60" ry="40" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6" />
            <text x="300" y="90" fill="#fff" font-size="16" font-weight="bold" opacity="${lo}">Sciatic Nerve Complex</text>
            <path d="M 325 150 A 60 40 0 1 0 445 150 A 60 40 0 1 0 325 150 M 340 150 A 25 15 0 1 1 400 150 A 25 15 0 1 1 340 150" fill="${isUS||isRealUS?'#111':'url(#fluidGradient)'}" class="${fluidClass}" fill-rule="evenodd" opacity="0.8" />
          </g>
          ${usOverlay} ${realOverlay}
          <g class="${needleClass}">
            ${needleDraw(580, 30, 445, 135)}
          </g>
        </g>`;
    }
  };

  const baseView = realUS ? 'real' : 'us';

  return `
    <svg viewBox="0 0 600 400" class="us-svg">
      <defs>
        <filter id="usNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 1 0 0 0 0, 1 0 0 0 0, 0 0 0 1 0" />
        </filter>
        <filter id="realNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0.3 0 0 0 0, 0.3 0 0 0 0, 0.3 0 0 0 0, 0 0 0 1 0" />
        </filter>
        <radialGradient id="fluidGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0891b2" stop-opacity="0.95" />
          <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.2" />
        </radialGradient>
        <clipPath id="sliderClip">
          <rect id="sliderRect" x="0" y="0" width="${clipWidth}" height="400" />
        </clipPath>
        <clipPath id="usFan">
          <path d="M 100 20 L 500 20 L 580 380 L 20 380 Z" />
        </clipPath>
      </defs>

      <g class="us-midline">
        <line x1="300" y1="0" x2="300" y2="400" stroke="#fff" stroke-width="1" stroke-dasharray="4" />
      </g>

      <g clip-path="url(#usFan)">
        <rect x="0" y="0" width="600" height="400" fill="#111" />
        ${render(baseView)}
      </g>

      <g clip-path="url(#sliderClip)">
         <rect x="0" y="0" width="600" height="400" fill="#1e293b" />
         ${render('anatomy')}
      </g>

      <line id="sliderLine" x1="${clipWidth}" y1="0" x2="${clipWidth}" y2="400" stroke="#3b82f6" stroke-width="4"  />
    </svg>
    
  `;
}


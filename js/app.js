// app.js - Regional Anaesthesia Guide. Static app, no build step, no patient data stored or sent.
import { BLOCKS, REGIONS, blockById } from './blocks.js';
import { TRUSTS, locssipFor, genericChecklist, trustById, isPastReview } from './checklists.js';
import { DRUGS, BLOCK_DRUGS, SKIN_DRUGS, maxDose, doseCheck, trustBand, idealBodyWeight, lipidDoses } from './dose.js';
import { renderNote, freeText, anyContraindication, addMinutes, PROCEDURE_OPTIONS, COLD_OPTIONS, COMPLICATIONS, AFTER_INSTRUCTIONS } from './note.js';
import { findIdentifiers } from './identifiers.js';
import { probeSVG, ultrasoundSVG } from './visuals.js';
import { icon } from './icons.js';

export const VERSION = '2.0.0';

const main = document.getElementById('main');
document.getElementById('version').textContent = VERSION;

// Preferences only (never patient details): theme, Trust, and the user's own name if they ask.
const prefs = {
    get(k) { try { return localStorage.getItem('ra-' + k) || ''; } catch (e) { return ''; } },
    set(k, v) { try { if (v) localStorage.setItem('ra-' + k, v); else localStorage.removeItem('ra-' + k); } catch (e) { /* ignore */ } }
};

// One in-memory record per block, so moving between tabs keeps what was entered.
// It is lost when the page is closed or reloaded, which is intended.
const sessions = {};
let redrawObs = null; // re-labels observation due times when the block time changes

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
        if (c === null || c === undefined || c === false) continue;
        node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return node;
}

function nowLocal() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

const trustId = () => (trustById(prefs.get('trust')) ? prefs.get('trust') : '');
const protocolFor = (block) => locssipFor(trustId(), block.id) || genericChecklist(block);

function newSession(block) {
    const s = {
        when: nowLocal(), retrospective: false, indication: '', indicationOther: '',
        answers: {}, lists: {}, dose: {}, procedure: {}, after: { obs: {} }
    };
    const me = prefs.get('operator');
    if (me) s.answers['pre.operator'] = me;
    const proto = protocolFor(block);
    if (proto.doseTable) { s.dose.drug = proto.doseTable.drugKey; s.dose.skinDrug = proto.doseTable.skinDrug.key; }
    else { s.dose.drug = 'levo025'; s.dose.skinDrug = 'lido1'; }
    return s;
}

function sessionFor(block) {
    const proto = protocolFor(block);
    const key = block.id + ':' + proto.id;
    if (!sessions[key]) sessions[key] = newSession(block);
    return sessions[key];
}

function callout(tone, iconName, ...content) {
    return el('div', { class: 'callout ' + tone, role: tone === 'red' ? 'alert' : null }, icon(iconName, 18), el('div', {}, ...content));
}

function teach(title, ...content) {
    return el('details', { class: 'teach' },
        el('summary', {}, icon('graduation-cap', 18), el('span', { text: title || 'Teach me' })),
        el('div', { class: 'teach-body' }, ...content));
}

function bullets(items) {
    return el('ul', { class: 'bullets' }, items.map((i) => el('li', { text: i })));
}

// ---------------------------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------------------------
function bodyMapSVG(view) {
    const base = `
      <circle cx="80" cy="20" r="15"/><rect x="72" y="32" width="16" height="15"/>
      <path d="M 40 50 Q 80 45 120 50 L 110 170 Q 80 180 50 170 Z"/>
      <path d="M 40 50 L 20 130 L 30 135 L 45 70 Z"/><path d="M 120 50 L 140 130 L 130 135 L 115 70 Z"/>
      <path d="M 20 130 L 10 210 L 25 210 L 30 135 Z"/><path d="M 140 130 L 150 210 L 135 210 L 130 135 Z"/>
      <circle cx="17" cy="220" r="8"/><circle cx="143" cy="220" r="8"/>
      <path d="M 50 170 Q 80 180 110 170 L 115 200 Q 80 220 45 200 Z"/>
      <path d="M 45 200 L 40 290 L 70 290 L 80 210 Z"/><path d="M 115 200 L 120 290 L 90 290 L 80 210 Z"/>
      <path d="M 40 290 L 45 370 L 65 370 L 70 290 Z"/><path d="M 120 290 L 115 370 L 95 370 L 90 290 Z"/>
      <ellipse cx="55" cy="375" rx="12" ry="6"/><ellipse cx="105" cy="375" rx="12" ry="6"/>`;
    const zones = view === 'front' ? [
        ['sap', 'M 40 70 L 50 70 L 48 130 L 42 130 Z'], ['sap', 'M 120 70 L 110 70 L 112 130 L 118 130 Z'],
        ['axillary', 'M 45 70 L 35 110 L 40 115 L 50 75 Z'], ['axillary', 'M 115 70 L 125 110 L 120 115 L 110 75 Z'],
        ['fib', 'M 45 200 L 40 250 L 55 250 L 60 205 Z'], ['fib', 'M 115 200 L 120 250 L 105 250 L 100 205 Z'],
        ['femoral', 'M 60 205 L 55 250 L 70 250 L 80 210 Z'], ['femoral', 'M 100 205 L 105 250 L 90 250 L 80 210 Z']
    ] : [
        ['esp', 'M 65 70 L 95 70 L 95 160 L 65 160 Z'],
        ['popliteal', 'M 40 270 L 65 270 L 65 310 L 40 310 Z'], ['popliteal', 'M 95 270 L 120 270 L 120 310 L 95 310 Z']
    ];
    const z = zones.map(([id, d]) => `<path d="${d}" class="zone" data-block="${id}"><title>${blockById(id).name}</title></path>`).join('');
    return `<svg viewBox="0 0 160 385" class="bodymap" role="img" aria-label="${view === 'front' ? 'Front' : 'Back'} of body"><g class="body-base">${base}</g><g>${z}</g></svg>`;
}

function blockCard(b) {
    const loc = locssipFor(trustId(), b.id);
    const t = trustById(trustId());
    return el('li', {},
        el('a', { class: 'block-card', href: `#/b/${b.id}`, 'data-id': b.id },
            el('span', { class: 'block-icon' }, icon(b.region === 'Chest wall' ? 'activity' : b.region === 'Upper limb' ? 'scan-line' : 'syringe', 22)),
            el('span', { class: 'block-text' },
                el('strong', { text: b.name }),
                el('span', { text: b.summary }),
                loc ? el('span', { class: 'chip green' }, icon('shield-check', 14), `${t.short} LocSSIP`) : el('span', { class: 'chip' }, 'Generic checklist')),
            el('span', { class: 'chev' }, icon('chevron-right', 18))));
}

function renderHome() {
    document.title = 'Regional Anaesthesia Guide';
    main.replaceChildren();
    const trustSelect = el('select', { id: 'trustSelect', 'aria-describedby': 'trustHint' },
        el('option', { value: '', text: 'No Trust selected: generic checklist' }),
        TRUSTS.map((t) => el('option', { value: t.id, text: t.name, selected: t.id === trustId() })));
    trustSelect.addEventListener('change', () => { prefs.set('trust', trustSelect.value); renderHome(); });
    const t = trustById(trustId());
    const available = t ? BLOCKS.filter((b) => locssipFor(t.id, b.id)) : [];

    main.append(
        el('section', { class: 'hero' },
            el('div', {},
                el('p', { class: 'eyebrow', text: 'Emergency department nerve blocks' }),
                el('h1', { text: 'Learn it, check it, document it' }),
                el('p', { class: 'lead', text: 'Pick a block to work through your Trust’s safety checklist (LocSSIP) step by step and build a note to copy into the record. Teaching notes are there when you want them.' })),
            el('div', { class: 'trust-card' },
                el('label', { class: 'label', for: 'trustSelect' }, icon('building-2', 18), ' Your Trust'),
                trustSelect,
                el('p', { class: 'hint', id: 'trustHint', text: t
                    ? (available.length ? `LocSSIP loaded for: ${available.map((b) => b.name).join(', ')}. Other blocks use the generic checklist.` : 'No LocSSIPs loaded yet for this Trust.')
                    : 'Choose your Trust to use its LocSSIPs where they have been loaded. Saved on this device only.' }))),
        el('div', { class: 'home-grid' },
            el('section', { class: 'card map-card', 'aria-label': 'Body map' },
                el('h2', { text: 'Tap a region' }),
                el('div', { class: 'maps', id: 'maps' })),
            el('section', { class: 'block-groups' },
                REGIONS.map((r) => el('div', { class: 'group' },
                    el('h2', { text: r }),
                    el('ul', { class: 'block-grid' }, BLOCKS.filter((b) => b.region === r).map(blockCard)))))),
        quickRef(),
        el('p', { class: 'dose-strip' }, icon('shield-alert', 16),
            el('span', {}, el('strong', { text: 'Maximum doses: ' }), 'bupivacaine and levobupivacaine 2 mg/kg (150 mg cap); lidocaine 3 mg/kg plain (200 mg cap), 7 mg/kg with adrenaline (500 mg cap). Doses of different local anaesthetics add together.')));

    const maps = document.getElementById('maps');
    maps.innerHTML = bodyMapSVG('front') + bodyMapSVG('back');
    maps.querySelectorAll('.zone').forEach((z) => {
        z.setAttribute('tabindex', '0');
        z.setAttribute('role', 'link');
        const go = () => { location.hash = `#/b/${z.dataset.block}`; };
        z.addEventListener('click', go);
        z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        z.addEventListener('mouseenter', () => highlight(z.dataset.block, true));
        z.addEventListener('mouseleave', () => highlight(z.dataset.block, false));
    });
}

function highlight(id, on) {
    document.querySelectorAll(`.zone[data-block="${id}"]`).forEach((z) => z.classList.toggle('active', on));
    const card = document.querySelector(`.block-card[data-id="${id}"]`);
    if (card) card.classList.toggle('hover', on);
}

function quickRef() {
    return el('details', { class: 'card quickref' },
        el('summary', {}, icon('list-checks', 18), el('span', { text: 'Quick reference: targets, equipment and typical volumes' })),
        el('div', { class: 'table-wrap' },
            el('table', {},
                el('thead', {}, el('tr', {}, ['Block', 'Target', 'Equipment', 'Typical volume'].map((h) => el('th', { text: h })))),
                el('tbody', {}, BLOCKS.map((b) => el('tr', {},
                    el('td', {}, el('a', { href: `#/b/${b.id}`, text: b.name })), el('td', { text: b.target }), el('td', { text: b.equipment }), el('td', { text: b.typicalVolume })))))),
        el('p', { class: 'hint', text: 'Typical volumes are teaching figures. Always check the maximum dose for the patient’s weight and follow your Trust’s LocSSIP.' }));
}

// ---------------------------------------------------------------------------------------------
// Block page
// ---------------------------------------------------------------------------------------------
function renderBlock(block, tab) {
    redrawObs = null;
    document.title = `${block.name} · Regional Anaesthesia Guide`;
    main.replaceChildren();
    const proto = protocolFor(block);
    const t = trustById(trustId());

    main.append(
        el('a', { class: 'back', href: '#/' }, icon('arrow-left', 18), 'All blocks'),
        el('div', { class: 'page-head' },
            el('div', {},
                el('p', { class: 'eyebrow', text: block.region }),
                el('h1', { text: block.name }),
                el('p', { class: 'lead', text: `Target: ${block.target}` }))),
        checklistStatus(proto, t),
        el('nav', { class: 'tabs', 'aria-label': 'Sections' },
            [['do', 'Do the block', 'clipboard-check'], ['learn', 'Learn', 'book-open'], ['safety', 'Safety', 'shield-alert']].map(([id, label, ic]) =>
                el('a', { href: `#/b/${block.id}${id === 'do' ? '' : '/' + id}`, class: 'tab', 'aria-current': tab === id ? 'page' : null }, icon(ic, 18), label))));

    if (tab === 'learn') main.append(renderLearn(block));
    else if (tab === 'safety') main.append(renderSafety(block));
    else renderDo(block, proto, t);
}

function checklistStatus(proto, t) {
    if (proto.generic) {
        return callout('amber', 'triangle-alert',
            el('strong', { text: 'No Trust LocSSIP loaded for this block. ' }),
            t ? `${t.name} has not had a LocSSIP for this block added yet. ` : 'Choose your Trust on the home page to use its LocSSIPs. ',
            'This generic checklist is not a Trust document: follow your Trust’s LocSSIP.');
    }
    const past = isPastReview(proto);
    return callout(past ? 'red' : 'green', past ? 'triangle-alert' : 'shield-check',
        el('strong', { text: `${t.name}: ${proto.title} (${proto.reference}). ` }),
        `Last updated ${proto.lastUpdated}. Review date ${proto.reviewLabel}. `,
        past ? el('strong', { text: 'The review date has passed: check the current version on your Trust intranet before relying on this. ' })
            : 'Check this is still the current version on your Trust intranet. ',
        'The paper checklist remains the official record. ',
        el('span', { class: 'muted', text: proto.scopeNote + '.' }));
}

// ---------- Do the block ----------
function renderDo(block, proto, trust) {
    const s = sessionFor(block);
    const steps = proto.sections;
    const nav = el('nav', { class: 'section-nav', 'aria-label': 'Checklist steps' },
        el('a', { href: '#sec-0', 'data-sec': 'details' }, el('span', { class: 'num', text: '0' }), 'Details'),
        steps.map((sec, i) => el('a', { href: `#sec-${i + 1}`, 'data-sec': sec.id }, el('span', { class: 'num', text: String(i + 1) }), sec.title)));
    nav.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); target.focus({ preventScroll: true }); }
    });

    const form = el('form', { class: 'note-form', autocomplete: 'off', novalidate: true });
    form.addEventListener('submit', (e) => e.preventDefault());
    form.append(detailsCard(block, s));
    steps.forEach((sec, i) => form.append(sectionCard(block, proto, sec, i + 1, s)));

    const preview = el('aside', { class: 'preview', 'aria-label': 'Note preview' },
        el('div', { class: 'preview-head' },
            el('h2', {}, icon('file-text', 18), 'Note for the record'),
            el('span', { class: 'chip', id: 'missingChip' })),
        el('div', { class: 'callout red', id: 'idWarning', role: 'alert', hidden: true }),
        el('pre', { class: 'note-text', id: 'noteText', tabindex: '0', 'aria-live': 'polite' }),
        el('div', { class: 'preview-foot' },
            el('span', { class: 'muted', text: 'Check the note before you file it.' }),
            el('div', { class: 'preview-actions' },
                el('button', { type: 'button', class: 'btn ghost small', id: 'printAdvice', onclick: printAdvice }, icon('printer', 16), el('span', { text: 'Patient advice' })),
                el('button', { type: 'button', class: 'btn secondary small', onclick: () => clearSession(block) }, icon('trash-2', 16), el('span', { text: 'Clear' })),
                el('button', { type: 'button', class: 'btn primary small', id: 'copyBtn', onclick: () => copyNote(block) }, icon('copy', 16), el('span', { text: 'Copy note' })))),
        el('p', { class: 'status', id: 'copyStatus', role: 'status' }));

    const copyBar = el('div', { class: 'copy-bar' },
        el('a', { class: 'btn secondary wide', href: '#noteText', onclick: (e) => { e.preventDefault(); document.getElementById('noteText').scrollIntoView({ behavior: 'smooth' }); } }, icon('file-text', 16), 'View note'),
        el('button', { type: 'button', class: 'btn primary wide', onclick: () => copyNote(block) }, icon('copy', 16), el('span', { text: 'Copy note' })));

    main.append(nav, el('div', { class: 'layout' }, el('div', {}, form, copyBar), preview));
    form.addEventListener('input', () => update(block));
    form.addEventListener('change', () => update(block));
    update(block);
}

function card(num, title, id, ...children) {
    return el('fieldset', { class: 'card', id, tabindex: '-1' },
        el('legend', {}, el('span', { class: 'num', text: String(num) }), el('span', { text: title }), el('span', { class: 'count', 'data-count': id, hidden: true })),
        ...children);
}

function detailsCard(block, s) {
    const when = el('input', { type: 'datetime-local', id: 'f-when', value: s.when });
    when.addEventListener('input', () => { s.when = when.value; });
    const retro = el('input', { type: 'checkbox', id: 'f-retro', checked: s.retrospective });
    retro.addEventListener('change', () => { s.retrospective = retro.checked; });
    const ind = el('select', { id: 'f-indication' },
        el('option', { value: '', text: 'Choose an indication' }),
        block.indications.map((i) => el('option', { value: i, text: i, selected: s.indication === i })),
        el('option', { value: 'Other', text: 'Other', selected: s.indication === 'Other' }));
    const other = el('input', { type: 'text', id: 'f-indicationOther', value: s.indicationOther, placeholder: 'Describe the indication (no patient details)' });
    const otherWrap = el('div', { class: 'field-wrap', hidden: s.indication !== 'Other' }, el('label', { class: 'label', for: 'f-indicationOther', text: 'Other indication' }), other);
    ind.addEventListener('change', () => { s.indication = ind.value; otherWrap.hidden = ind.value !== 'Other'; });
    other.addEventListener('input', () => { s.indicationOther = other.value; });
    return card(0, 'Details', 'sec-0',
        el('div', { class: 'row wrap' },
            el('div', { class: 'grow field' }, el('label', { class: 'label', for: 'f-when', text: 'Date and time of block' }), when),
            el('div', { class: 'grow field' }, el('label', { class: 'label', for: 'f-indication', text: 'Indication' }), ind)),
        otherWrap,
        el('label', { class: 'flag' }, retro, el('span', { text: 'I am writing this note after the event' })));
}

function sourceLine(proto, sec) {
    if (proto.generic) return el('p', { class: 'source app' }, icon('info', 14), 'Generic checklist (not a Trust document)');
    if (!sec.sourceHeading) return el('p', { class: 'source app' }, icon('info', 14), 'App prompts: not part of the LocSSIP');
    return el('p', { class: 'source' }, icon('shield-check', 14), `From ${proto.reference}: ${sec.sourceHeading}`);
}

function sectionCard(block, proto, sec, num, s) {
    const id = `sec-${num}`;
    if (sec.step === 'dose') return card(num, sec.title, id, sourceLine(proto, proto.doseTable ? { sourceHeading: proto.doseTable.heading } : {}), doseStep(block, proto, s));
    if (sec.step === 'procedure') return card(num, sec.title, id, sourceLine(proto, {}), procedureStep(block, s));
    if (sec.step === 'after') return card(num, sec.title, id, sourceLine(proto, proto.observations && proto.observations.heading ? { sourceHeading: proto.observations.heading } : {}), afterStep(block, proto, s));

    const body = [sourceLine(proto, sec)];
    if (sec.list) body.push(listField(sec, s));
    for (const item of sec.items) body.push(itemField(sec, item, s));
    body.push(teachFor(block, sec));
    return card(num, sec.title, id, ...body);
}

function teachFor(block, sec) {
    switch (sec.id) {
        case 'pre': return teach('Teach me: before you start',
            el('p', { text: 'A LocSSIP (local safety standard for invasive procedures) puts the national NatSSIPs standards into a checklist for one procedure. The team stops, introduces itself, confirms the patient, the consent and the side, and checks allergies before anything is drawn up.' }),
            el('p', { text: 'Wrong-side blocks are a recognised never event. Confirm the side against imaging, and again immediately before the needle goes in (Stop Before You Block).' }));
        case 'contra': return teach('Teach me: contraindications for this block',
            el('p', {}, el('strong', { text: 'Absolute: ' }), block.contraindications.absolute.join(', ') + '.'),
            el('p', {}, el('strong', { text: 'Relative: ' }), block.contraindications.relative.join(', ') + '.'),
            el('p', { class: 'muted', text: 'From the app’s teaching notes. Your Trust’s list, where loaded, is the one to follow.' }));
        case 'consentRisks': return teach('Teach me: explaining the block',
            el('p', { text: `Explain what the block does (${block.effects.join('; ').toLowerCase()}), how long the numbness may last, and that the limb must be protected while numb. Give the patient the advice sheet afterwards.` }));
        case 'equipment': return teach('Teach me: equipment and set-up',
            el('p', { text: block.equipment }),
            bullets(['Put the screen directly in your line of sight so you do not twist your neck.', 'Anchor your scanning hand on the patient so the probe does not slide.', `Patient position: ${block.position}.`]));
        case 'sbyb': return teach('Teach me: Stop Before You Block',
            el('p', { text: 'Stop Before You Block is a pause immediately before needle insertion. The operator and assistant confirm the side and site again, even if it was checked at sign in. Repeat it before every further block.' }));
        case 'signout': return teach('Teach me: sign out',
            el('p', { text: 'Sign out closes the loop: count the sharps, record the dose, hand over concerns for recovery and make sure the note and prescription are complete.' }));
        default: return null;
    }
}

function choiceButtons(name, options, current, onPick) {
    const wrap = el('div', { class: 'options', role: 'radiogroup', 'data-field': name });
    options.forEach((o) => {
        const b = el('button', { type: 'button', class: 'option choice', role: 'radio', 'aria-checked': String(current === o), text: o });
        b.addEventListener('click', () => {
            const next = current === o ? '' : o;
            current = next;
            wrap.querySelectorAll('.option').forEach((x) => x.setAttribute('aria-checked', String(x.textContent === next)));
            onPick(next);
            wrap.dispatchEvent(new Event('change', { bubbles: true }));
        });
        wrap.append(b);
    });
    return wrap;
}

function checkTile(id, label, checked, onChange, extraClass = '') {
    const input = el('input', { type: 'checkbox', id, checked });
    input.addEventListener('change', () => onChange(input.checked));
    return el('label', { class: 'option check ' + extraClass, for: id }, input, el('span', { class: 'tick' }, icon('check', 14)), el('span', { text: label }));
}

function appNote(text) {
    return text ? el('p', { class: 'app-note' }, el('strong', { text: 'App note: ' }), text) : null;
}

function itemField(sec, item, s) {
    const key = `${sec.id}.${item.id}`;
    const domId = 'f-' + key.replace('.', '-');
    const wrap = el('div', { class: 'field-wrap', 'data-key': key });
    if (item.showIf) wrap.dataset.showIf = item.showIf;

    if (item.kind === 'check') {
        wrap.append(el('div', { class: 'options' }, checkTile(domId, item.label, !!s.answers[key], (v) => { s.answers[key] = v; })));
        if (item.hint) wrap.append(el('span', { class: 'hint after', text: item.hint }));
    } else if (item.kind === 'paper') {
        wrap.append(el('div', { class: 'options' }, checkTile(domId, item.label, !!s.answers[key], (v) => { s.answers[key] = v; }, 'paper')));
    } else if (item.kind === 'text') {
        const input = el('input', { type: 'text', id: domId, value: s.answers[key] || '', placeholder: 'Staff name and designation' });
        input.addEventListener('input', () => {
            s.answers[key] = input.value;
            if (item.staff === 'operator' && prefs.get('remember')) prefs.set('operator', input.value.trim());
        });
        wrap.append(el('label', { class: 'label', for: domId }, item.label, item.optional ? el('span', { class: 'muted', text: ' (if applicable)' }) : null), input);
        if (item.staff === 'operator') {
            const rem = el('input', { type: 'checkbox', id: 'f-remember', checked: !!prefs.get('remember') });
            rem.addEventListener('change', () => {
                prefs.set('remember', rem.checked ? '1' : '');
                prefs.set('operator', rem.checked ? (s.answers[key] || '').trim() : '');
            });
            wrap.append(el('label', { class: 'flag small' }, rem, el('span', { text: 'Remember my name and designation on this device' })));
        }
    } else if (item.kind === 'choice') {
        const detKey = key + '.details';
        const det = el('input', { type: 'text', id: domId + '-details', value: s.answers[detKey] || '', placeholder: 'Details (no patient identifiers)' });
        det.addEventListener('input', () => { s.answers[detKey] = det.value; });
        const detWrap = el('div', { class: 'details-wrap', hidden: !(item.details && item.details.includes(s.answers[key])) },
            el('label', { class: 'label small', for: domId + '-details', text: item.detailsLabel || 'Details' }), det);
        wrap.append(el('span', { class: 'label', text: item.label }),
            choiceButtons(key, item.options, s.answers[key] || '', (v) => {
                s.answers[key] = v;
                detWrap.hidden = !(item.details && item.details.includes(v));
            }), detWrap);
    }
    const n = appNote(item.appNote);
    if (n) wrap.append(n);
    return wrap;
}

function listField(sec, s) {
    const { kind, items, footnote, spellingNote } = sec.list;
    s.lists[sec.id] = s.lists[sec.id] || {};
    const marks = s.lists[sec.id];
    const wrap = el('div', { class: 'field-wrap' });
    if (kind === 'present') {
        wrap.append(el('p', { class: 'hint', text: 'Mark each one as absent or present.' }));
        const rows = el('div', { class: 'contra-rows' });
        items.forEach((label, i) => {
            rows.append(el('div', { class: 'contra-row' },
                el('span', { class: 'contra-label', text: label }),
                choiceButtons(`${sec.id}-${i}`, ['Absent', 'Present'], marks[i] === 'absent' ? 'Absent' : marks[i] === 'present' ? 'Present' : '', (v) => {
                    marks[i] = v ? v.toLowerCase() : '';
                })));
        });
        wrap.append(rows);
        const allAbsent = el('button', { type: 'button', class: 'link-btn', text: 'Mark all absent' });
        allAbsent.addEventListener('click', () => {
            items.forEach((_, i) => { marks[i] = 'absent'; });
            rows.querySelectorAll('.contra-row').forEach((r) => r.querySelectorAll('.option').forEach((o) => o.setAttribute('aria-checked', String(o.textContent === 'Absent'))));
            wrap.dispatchEvent(new Event('change', { bubbles: true }));
        });
        wrap.append(allAbsent);
    } else {
        const opts = el('div', { class: 'options stack' });
        items.forEach((label, i) => opts.append(checkTile(`f-${sec.id}-${i}`, label, !!marks[i], (v) => { marks[i] = v; })));
        const all = el('button', { type: 'button', class: 'link-btn', text: kind === 'discussed' ? 'Tick all discussed' : 'Tick all prepared' });
        all.addEventListener('click', () => {
            items.forEach((_, i) => { marks[i] = true; });
            opts.querySelectorAll('input').forEach((x) => { x.checked = true; });
            wrap.dispatchEvent(new Event('change', { bubbles: true }));
        });
        wrap.append(el('div', { class: 'label-row' }, el('span', { class: 'label', text: kind === 'discussed' ? 'Discussed with the patient' : 'Ready' }), all), opts);
    }
    if (footnote) wrap.append(el('p', { class: 'hint after', text: footnote }));
    if (spellingNote) wrap.append(appNote(spellingNote));
    return wrap;
}

// ---------- Dose step ----------
function numberInput(id, value, attrs = {}) {
    return el('input', { type: 'text', inputmode: 'decimal', id, value: value || '', class: 'num-input', ...attrs });
}

function drugSelect(id, keys, current) {
    return el('select', { id }, keys.map((k) => el('option', { value: k, text: DRUGS[k].label, selected: current === k })));
}

function doseStep(block, proto, s) {
    const d = s.dose;
    const wrap = el('div', {});
    const weight = numberInput('f-weight', d.weight);
    const est = el('input', { type: 'checkbox', id: 'f-weightEst', checked: !!d.weightEstimated });
    const drug = drugSelect('f-drug', BLOCK_DRUGS, d.drug);
    const ml = numberInput('f-ml', d.ml);
    const skin = drugSelect('f-skinDrug', SKIN_DRUGS, d.skinDrug);
    const skinMl = numberInput('f-skinMl', d.skinMl);
    const result = el('div', { id: 'doseResult', 'aria-live': 'polite' });

    const clean = (v) => v.replace(',', '.').replace(/[^\d.]/g, '');
    weight.addEventListener('input', () => { d.weight = clean(weight.value); refreshDose(block, proto, s); });
    est.addEventListener('change', () => { d.weightEstimated = est.checked; });
    drug.addEventListener('change', () => { d.drug = drug.value; refreshDose(block, proto, s); });
    ml.addEventListener('input', () => { d.ml = clean(ml.value); refreshDose(block, proto, s); });
    skin.addEventListener('change', () => { d.skinDrug = skin.value; refreshDose(block, proto, s); });
    skinMl.addEventListener('input', () => { d.skinMl = clean(skinMl.value); refreshDose(block, proto, s); });

    wrap.append(
        el('div', { class: 'row wrap' },
            el('div', { class: 'field' }, el('label', { class: 'label', for: 'f-weight', text: 'Weight' }), el('div', { class: 'input-unit number' }, weight, el('span', { class: 'unit', text: 'kg' }))),
            el('label', { class: 'flag inline' }, est, el('span', { text: 'Estimated weight' }))),
        el('div', { id: 'trustDose' }),
        el('div', { class: 'row wrap' },
            el('div', { class: 'grow field' }, el('label', { class: 'label', for: 'f-drug', text: 'Block local anaesthetic' }), drug),
            el('div', { class: 'field' }, el('label', { class: 'label', for: 'f-ml', text: 'Volume given' }), el('div', { class: 'input-unit number' }, ml, el('span', { class: 'unit', text: 'ml' })))),
        el('div', { class: 'row wrap' },
            el('div', { class: 'grow field' }, el('label', { class: 'label', for: 'f-skinDrug', text: 'Skin local anaesthetic' }), skin),
            el('div', { class: 'field' }, el('label', { class: 'label', for: 'f-skinMl', text: 'Volume given' }), el('div', { class: 'input-unit number' }, skinMl, el('span', { class: 'unit', text: 'ml' })))),
        el('p', { class: 'hint', text: 'Enter the volumes actually given. Leave a volume empty if that drug was not used.' }),
        result,
        teach('Teach me: why doses add up',
            el('p', { text: 'Local anaesthetics have additive toxicity. If you give lidocaine for the skin and bupivacaine for the block, each uses up part of the patient’s safe total. The app shows each drug as a share of its own maximum and adds them together.' }),
            el('p', { text: 'Frail, older and low-weight patients reach toxic levels sooner. Hip fracture patients are often all three.' })));
    queueMicrotask(() => refreshDose(block, proto, s));
    return wrap;
}

function refreshDose(block, proto, s) {
    const d = s.dose;
    const w = Number(d.weight);
    const trustBox = document.getElementById('trustDose');
    const result = document.getElementById('doseResult');
    if (!trustBox || !result) return;
    trustBox.replaceChildren();
    if (proto.doseTable) {
        const tbl = proto.doseTable;
        const table = el('table', { class: 'mini' },
            el('thead', {}, el('tr', {}, el('th', { text: 'Weight' }), el('th', { text: tbl.drug }))),
            el('tbody', {}, tbl.bands.map((b) => el('tr', { class: w > 0 && b.test(w) ? 'hit' : '' }, el('td', { text: b.label }), el('td', { text: b.text })))));
        const band = trustBand(tbl, w);
        const parts = [el('p', { class: 'source' }, icon('shield-check', 14), `${proto.reference} dose table`), table];
        if (band && band.gap) parts.push(callout('amber', 'triangle-alert', tbl.gapNote));
        if (band && band.band) {
            const use = el('button', { type: 'button', class: 'btn secondary small', text: `Use ${band.band.volume} ml` });
            use.addEventListener('click', () => {
                d.ml = String(band.band.volume);
                document.getElementById('f-ml').value = d.ml;
                const drug = document.getElementById('f-drug');
                drug.value = tbl.drugKey; d.drug = tbl.drugKey;
                refreshDose(block, proto, s); update(block);
            });
            parts.push(el('div', { class: 'row wrap' }, el('span', { text: `Trust table for ${w} kg: ${band.band.text}` }), use));
        }
        const skinBtn = el('button', { type: 'button', class: 'link-btn', text: `Equipment list includes ${tbl.skinDrug.volume} ml ${tbl.skinDrug.label}: use it` });
        skinBtn.addEventListener('click', () => {
            d.skinDrug = tbl.skinDrug.key; d.skinMl = String(tbl.skinDrug.volume);
            document.getElementById('f-skinDrug').value = d.skinDrug; document.getElementById('f-skinMl').value = d.skinMl;
            refreshDose(block, proto, s); update(block);
        });
        parts.push(skinBtn);
        trustBox.append(el('div', { class: 'trust-dose' }, ...parts));
    }

    result.replaceChildren();
    if (!(w > 0)) { result.append(el('p', { class: 'hint', text: 'Enter the weight to see the maximum doses.' })); return; }
    const mx = maxDose(d.drug, w);
    const entries = [{ drug: d.drug, ml: d.ml }, { drug: d.skinDrug, ml: d.skinMl }];
    const chk = doseCheck(w, entries);
    const rows = chk.lines.map((l) => el('li', { text: `${l.label}: ${l.ml} ml = ${l.mg} mg (${l.mgPerKg} mg/kg), ${l.percent}% of its maximum ${l.maxMg} mg` }));
    result.append(el('div', { class: 'computed-value', 'data-tone': chk.tone },
        el('p', { class: 'calc-title' }, icon('scale', 16), 'App dose check (not part of the LocSSIP)'),
        el('p', { text: `Maximum ${DRUGS[d.drug].label} for ${w} kg: ${mx.mg} mg = ${mx.ml} ml${mx.capped ? ' (150 mg cap applies)' : ''}, if nothing else is given.` }),
        rows.length ? el('ul', { class: 'bullets' }, rows) : null,
        chk.totalPercent !== null && rows.length ? el('p', {}, el('strong', { text: `Total: ${chk.totalPercent}% of the calculated maximum.` }),
            chk.tone === 'red' ? ' This is over the maximum. Stop and recheck before giving any more.' : chk.tone === 'amber' ? ' Close to the maximum.' : '') : null,
        el('p', { class: 'muted small', text: 'Based on actual body weight, plain solutions: bupivacaine and levobupivacaine 2 mg/kg (150 mg cap), lidocaine 3 mg/kg (200 mg cap). Follow your Trust’s guidance where it differs.' })));
}

// ---------- Procedure step ----------
function procedureStep(block, s) {
    const p = s.procedure;
    const machine = el('select', { id: 'f-machine' }, el('option', { value: '', text: 'Choose' }), PROCEDURE_OPTIONS.machine.map((m) => el('option', { value: m, text: m, selected: p.machine === m })));
    const machineOther = el('input', { type: 'text', id: 'f-machineOther', value: p.machineOther || '', placeholder: 'Machine' });
    const mOtherWrap = el('div', { class: 'details-wrap', hidden: p.machine !== 'Other' }, machineOther);
    machine.addEventListener('change', () => { p.machine = machine.value; mOtherWrap.hidden = p.machine !== 'Other'; });
    machineOther.addEventListener('input', () => { p.machineOther = machineOther.value; });
    const needleOther = el('input', { type: 'text', id: 'f-needleOther', value: p.needleOther || '', placeholder: 'Needle' });
    const nOtherWrap = el('div', { class: 'details-wrap', hidden: p.needle !== 'Other' }, needleOther);
    needleOther.addEventListener('input', () => { p.needleOther = needleOther.value; });
    const notes = el('textarea', { id: 'f-procNotes', rows: '3', placeholder: 'Anything else about the procedure (no patient details)' }, p.notes || '');
    notes.addEventListener('input', () => { p.notes = notes.value; });

    return el('div', {},
        el('div', { class: 'field-wrap' }, el('label', { class: 'label', for: 'f-machine', text: 'Ultrasound machine' }), machine, mOtherWrap),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Probe' }), choiceButtons('probe', PROCEDURE_OPTIONS.probe, p.probe || '', (v) => { p.probe = v; })),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Needle' }), choiceButtons('needle', PROCEDURE_OPTIONS.needle, p.needle || '', (v) => { p.needle = v; nOtherWrap.hidden = v !== 'Other'; }), nOtherWrap),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Approach' }), choiceButtons('approach', PROCEDURE_OPTIONS.approach, p.approach || '', (v) => { p.approach = v; })),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Tick what you did and saw' }),
            el('div', { class: 'options stack' }, PROCEDURE_OPTIONS.checks.map(([k, label]) => checkTile('f-p-' + k, label, !!p[k], (v) => { p[k] = v; })))),
        el('div', { class: 'field-wrap' }, el('label', { class: 'label', for: 'f-procNotes', text: 'Procedure notes' }), notes),
        teach('Teach me: technique',
            callout('amber', 'star', el('strong', { text: 'Golden rule: ' }), block.goldenRule),
            el('ol', { class: 'steps' }, block.technique.map(([label, text]) => el('li', {}, el('strong', { text: label + ': ' }), text))),
            el('p', {}, el('strong', { text: 'Probe: ' }), block.probePosition, ' ', el('strong', { text: 'Needle: ' }), `in-plane, ${block.needleAngle.toLowerCase()}.`),
            el('p', {}, el('strong', { text: 'High-risk structures: ' }), block.highRiskStructures.join(', ') + '.'),
            el('p', {}, el('a', { href: `#/b/${block.id}/learn` }, 'Open the ultrasound guide'))));
}

// ---------- After step ----------
function afterStep(block, proto, s) {
    const a = s.after;
    a.obs = a.obs || {};
    const pain = (k, label) => {
        const inp = numberInput('f-' + k, a[k], { maxlength: '2' });
        inp.addEventListener('input', () => { const v = inp.value.replace(/\D/g, ''); a[k] = v !== '' && Number(v) <= 10 ? v : ''; });
        return el('div', { class: 'field' }, el('label', { class: 'label', for: 'f-' + k, text: label }), el('div', { class: 'input-unit number' }, inp, el('span', { class: 'unit', text: '/ 10' })));
    };
    const compDetails = el('input', { type: 'text', id: 'f-compDetails', value: a.complicationDetails || '', placeholder: 'What happened and what was done (no patient details)' });
    compDetails.addEventListener('input', () => { a.complicationDetails = compDetails.value; });
    const compList = el('div', { class: 'options stack' }, COMPLICATIONS.map((c, i) => checkTile('f-comp-' + i, c, (a.complicationList || []).includes(c), (v) => {
        const set = new Set(a.complicationList || []);
        if (v) set.add(c); else set.delete(c);
        a.complicationList = COMPLICATIONS.filter((x) => set.has(x));
    })));
    const compWrap = el('div', { class: 'details-wrap', hidden: a.complications !== 'yes' }, compList, el('label', { class: 'label small', for: 'f-compDetails', text: 'Details' }), compDetails);

    const obs = proto.observations;
    const obsList = el('div', { class: 'options stack', id: 'obsList' });
    let drawnFor = null;
    const drawObs = () => {
        if (drawnFor === s.when) return;
        drawnFor = s.when;
        obsList.replaceChildren(...obs.times.map((t) => checkTile('f-obs-' + t.id, `${t.label}${t.minutes !== null && s.when ? ` · due ${addMinutes(s.when, t.minutes)}` : ''}`, !!a.obs[t.id], (v) => { a.obs[t.id] = v; })));
    };
    drawObs();
    redrawObs = drawObs;

    const instr = checkTile('f-instructions', 'Post-procedure instructions given to the nursing team', !!a.instructions, (v) => { a.instructions = v; });

    return el('div', {},
        el('div', { class: 'row wrap' }, pain('painBefore', 'Pain score before'), pain('painAfter', 'Pain score after')),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Cold sensation at 15 minutes' }), choiceButtons('cold15', COLD_OPTIONS, a.cold15 || '', (v) => { a.cold15 = v; })),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Cold sensation at 30 minutes' }), choiceButtons('cold30', COLD_OPTIONS, a.cold30 || '', (v) => { a.cold30 = v; })),
        el('div', { class: 'field-wrap' }, el('span', { class: 'label', text: 'Complications' }),
            choiceButtons('complications', ['None observed', 'Yes'], a.complications === 'none' ? 'None observed' : a.complications === 'yes' ? 'Yes' : '', (v) => {
                a.complications = v === 'None observed' ? 'none' : v === 'Yes' ? 'yes' : '';
                compWrap.hidden = a.complications !== 'yes';
            }), compWrap,
            el('p', { class: 'hint after', text: 'Nothing is written about complications until you choose.' })),
        el('div', { class: 'field-wrap' },
            el('span', { class: 'label', text: obs.label }),
            obs.heading ? el('p', { class: 'source' }, icon('shield-check', 14), `From ${proto.reference}: ${obs.heading}. The form asks for each set to be completed and signed.`) : null,
            el('p', { class: 'hint', text: 'Due times are worked out from the time of the block. Unticked ones appear in the note as still due.' }),
            obsList),
        el('div', { class: 'field-wrap' }, el('div', { class: 'options' }, instr), bullets(AFTER_INSTRUCTIONS),
            appNote('These instructions are from the app, not the LocSSIP. The LocSSIP asks for post-procedure instructions to be in the note.')),
        teach('Teach me: if the block is not working',
            el('p', {}, el('strong', { text: 'Expected effect: ' }), block.effects.join('; ') + '.'),
            bullets(block.troubleshooting)));
}

// ---------- Note ----------
function update(block) {
    const proto = protocolFor(block);
    const s = sessionFor(block);
    const t = trustById(trustId());
    // Conditional items
    const anyC = anyContraindication(s);
    document.querySelectorAll('[data-show-if="anyContraindication"]').forEach((w) => { w.hidden = !anyC; });
    if (redrawObs) redrawObs();

    const { text, missing, empty } = renderNote(block, proto, s, { trustName: t ? t.name : '' });
    const pre = document.getElementById('noteText');
    if (!pre) return;
    pre.textContent = text;
    pre.dataset.empty = String(empty);
    const chip = document.getElementById('missingChip');
    chip.textContent = missing.length ? `${missing.length} not recorded` : 'All recorded';
    chip.className = 'chip ' + (missing.length ? 'amber' : 'green');

    const ids = findIdentifiers(freeText(s));
    const warn = document.getElementById('idWarning');
    warn.hidden = ids.length === 0;
    warn.textContent = ids.length ? `This looks like it may contain ${ids.join(', ')}. Please remove patient details before copying.` : '';

    // Step nav progress
    proto.sections.forEach((sec, i) => {
        const a = document.querySelector(`.section-nav a[data-sec="${sec.id}"]`);
        if (a) a.classList.toggle('done', !missing.some((m) => m.startsWith(sec.title + ':')) && sectionTouched(sec, s));
    });
}

function sectionTouched(sec, s) {
    if (sec.step === 'dose') return !!(s.dose.ml || s.dose.skinMl);
    if (sec.step === 'procedure') return Object.values(s.procedure).some(Boolean);
    if (sec.step === 'after') return !!s.after.complications;
    if (sec.list) return Object.keys(s.lists[sec.id] || {}).length > 0;
    return (sec.items || []).some((it) => s.answers[`${sec.id}.${it.id}`]);
}

async function copyNote(block) {
    const proto = protocolFor(block);
    const s = sessionFor(block);
    const t = trustById(trustId());
    const { text, empty } = renderNote(block, proto, s, { trustName: t ? t.name : '' });
    const status = document.getElementById('copyStatus');
    if (empty) { status.textContent = 'Nothing to copy yet: work through the checklist first.'; return; }
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('noteText'));
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    }
    status.textContent = ok ? 'Copied. Paste it into the record and check it there.' : 'Copy was blocked: the note is selected, so copy it by hand.';
}

function clearSession(block) {
    const proto = protocolFor(block);
    delete sessions[block.id + ':' + proto.id];
    renderBlock(block, 'do');
    const st = document.getElementById('copyStatus');
    if (st) st.textContent = 'Cleared.';
}

function printAdvice() {
    document.getElementById('printDate').textContent = new Date().toLocaleDateString('en-GB');
    document.body.classList.add('printing-advice');
    window.print();
    setTimeout(() => document.body.classList.remove('printing-advice'), 500);
}

// ---------------------------------------------------------------------------------------------
// Learn tab
// ---------------------------------------------------------------------------------------------
function renderLearn(block) {
    let realUS = false;
    let val = 50;
    const stage = el('div', { class: 'us-stage' });
    const range = el('input', { type: 'range', min: '0', max: '100', value: String(val), class: 'us-range', 'aria-label': 'Slide between anatomy and ultrasound' });
    const handle = el('div', { class: 'us-handle', 'aria-hidden': 'true' }, icon('sliders-horizontal', 16));
    const labels = el('div', { class: 'us-labels', 'aria-hidden': 'true' }, el('span', { text: 'Anatomy' }), el('span', { id: 'usModeLabel', text: 'Simulated ultrasound' }));
    const draw = () => {
        stage.innerHTML = ultrasoundSVG(block.id, val, realUS);
        handle.style.left = `calc(${val}% - 16px)`;
        document.getElementById('usModeLabel') && (document.getElementById('usModeLabel').textContent = realUS ? 'Ultrasound reference' : 'Simulated ultrasound');
    };
    range.addEventListener('input', () => {
        val = Number(range.value);
        const w = (val / 100) * 600;
        const rect = stage.querySelector('#sliderRect'); const line = stage.querySelector('#sliderLine');
        if (rect) rect.setAttribute('width', w);
        if (line) { line.setAttribute('x1', w); line.setAttribute('x2', w); }
        handle.style.left = `calc(${val}% - 16px)`;
    });
    const realBox = el('input', { type: 'checkbox', id: 'f-realUS' });
    realBox.addEventListener('change', () => { realUS = realBox.checked; draw(); });
    const replay = el('button', { type: 'button', class: 'btn ghost small', onclick: draw }, icon('rotate-ccw', 16), 'Replay');

    const view = el('div', { class: 'learn' },
        el('div', { class: 'learn-grid' },
            el('section', { class: 'card' },
                el('div', { class: 'label-row' }, el('h2', { text: 'Ultrasound guide' }), el('label', { class: 'flag inline small' }, realBox, el('span', { text: 'Darker reference view' })), replay),
                el('div', { class: 'us-wrap' }, stage, range, handle, labels),
                el('p', { class: 'hint after', text: 'Drag across to compare the labelled anatomy with the ultrasound view. A teaching drawing, not a real scan.' })),
            el('section', { class: 'card' },
                el('h2', {}, icon('ruler', 18), ' Probe placement'),
                el('div', { class: 'probe-wrap', id: 'probeWrap' }),
                el('dl', { class: 'facts' },
                    el('dt', { text: 'Patient position' }), el('dd', { text: block.position }),
                    el('dt', { text: 'Probe position' }), el('dd', { text: block.probePosition }),
                    el('dt', { text: 'Needle' }), el('dd', { text: `In-plane, ${block.needleAngle.toLowerCase()}` }),
                    el('dt', { text: 'Equipment' }), el('dd', { text: block.equipment }),
                    el('dt', { text: 'Typical volume' }), el('dd', { text: block.typicalVolume })))),
        callout('amber', 'star', el('strong', { text: 'Golden rule: ' }), block.goldenRule),
        el('div', { class: 'learn-grid' },
            el('section', { class: 'card' },
                el('h2', { text: 'Step-by-step technique' }),
                el('ol', { class: 'steps' }, block.technique.map(([label, text]) => el('li', {}, el('strong', { text: label + ': ' }), text))),
                el('h2', { text: 'Tips' }), bullets(block.tips)),
            el('section', { class: 'card' },
                el('h2', { text: 'Indications' }), bullets(block.indications),
                el('h2', { text: 'Contraindications' }),
                el('p', {}, el('strong', { text: 'Absolute: ' }), block.contraindications.absolute.join(', ') + '.'),
                el('p', {}, el('strong', { text: 'Relative: ' }), block.contraindications.relative.join(', ') + '.'),
                el('h2', { text: 'Effect' }), bullets(block.effects),
                el('h2', {}, 'High-risk structures'), bullets(block.highRiskStructures),
                el('h2', { text: 'Troubleshooting and variations' }), bullets([...block.troubleshooting, ...block.variations]))),
        el('section', { class: 'card' },
            el('h2', { text: 'Needle visibility' }),
            bullets(['Alignment: keep the needle directly under the long axis of the probe footprint.', 'Tilt: use the heel-toe manoeuvre to keep the beam perpendicular to the needle shaft.', 'Hydrolocate: inject 1 ml of saline to find the tip if you lose it.']),
            el('p', {}, el('a', { href: block.link, target: '_blank', rel: 'noopener noreferrer' }, 'NYSORA technique page', icon('external-link', 14)))));
    queueMicrotask(() => {
        draw();
        const pw = document.getElementById('probeWrap');
        if (pw) pw.innerHTML = probeSVG(block.id);
    });
    return view;
}

// ---------------------------------------------------------------------------------------------
// Safety tab
// ---------------------------------------------------------------------------------------------
function renderSafety() {
    const weight = numberInput('c-weight', '');
    const height = numberInput('c-height', '');
    const sex = el('select', { id: 'c-sex' }, el('option', { value: 'M', text: 'Male' }), el('option', { value: 'F', text: 'Female' }));
    const out = el('div', { id: 'calcOut', 'aria-live': 'polite' });
    const calc = () => {
        const w = Number(weight.value.replace(',', '.'));
        const h = Number(height.value.replace(',', '.'));
        out.replaceChildren();
        if (!(w > 0)) { out.append(el('p', { class: 'hint', text: 'Enter a weight.' })); return; }
        const ibw = idealBodyWeight(sex.value, h);
        const dw = ibw ? Math.min(w, ibw) : w;
        const rows = ['levo025', 'levo05', 'bupi025', 'bupi05', 'lido1', 'lido2'].map((k) => {
            const m = maxDose(k, dw);
            return el('tr', {}, el('td', { text: DRUGS[k].label }), el('td', { text: `${m.mg} mg` }), el('td', { text: `${m.ml} ml` }));
        });
        const lip = lipidDoses(w);
        out.append(
            el('p', { text: ibw ? `Ideal body weight ${ibw} kg. Dosing weight used: ${dw} kg (the lower of actual and ideal).` : `Dosing weight used: ${dw} kg (actual weight; add a height to compare with ideal body weight).` }),
            el('div', { class: 'table-wrap' }, el('table', {}, el('thead', {}, el('tr', {}, el('th', { text: 'Drug (plain)' }), el('th', { text: 'Maximum' }), el('th', { text: 'Volume' }))), el('tbody', {}, rows))),
            el('p', { class: 'hint', text: 'Each maximum assumes no other local anaesthetic is given. Doses of different drugs add together.' }),
            el('div', { class: 'computed-value', 'data-tone': 'red' },
                el('p', { class: 'calc-title' }, icon('circle-alert', 16), `Lipid emulsion 20% for ${w} kg (actual weight)`),
                bullets([`Bolus ${lip.bolusMl} ml (1.5 ml/kg) over 2 to 3 minutes`, `Then infusion ${lip.infusionMlPerHour} ml/h (15 ml/kg/h)`,
                    `At 5 and 10 minutes, if not stable: repeat the bolus (up to two more), and the rate can be doubled to ${lip.doubledMlPerHour} ml/h (30 ml/kg/h) at any time after 5 minutes`,
                    `Do not exceed ${lip.maxCumulativeMl} ml in total (12 ml/kg)`])));
    };
    [weight, height].forEach((i) => i.addEventListener('input', calc));
    sex.addEventListener('change', calc);
    queueMicrotask(calc);

    return el('div', { class: 'learn' },
        el('section', { class: 'card' },
            el('h2', {}, icon('scale', 18), ' Maximum dose calculator'),
            el('div', { class: 'row wrap' },
                el('div', { class: 'field' }, el('label', { class: 'label', for: 'c-weight', text: 'Actual weight' }), el('div', { class: 'input-unit number' }, weight, el('span', { class: 'unit', text: 'kg' }))),
                el('div', { class: 'field' }, el('label', { class: 'label', for: 'c-height', text: 'Height (optional)' }), el('div', { class: 'input-unit number' }, height, el('span', { class: 'unit', text: 'cm' }))),
                el('div', { class: 'field' }, el('label', { class: 'label', for: 'c-sex', text: 'Sex (for ideal body weight)' }), sex)),
            out),
        el('section', { class: 'card last' },
            el('h2', {}, icon('shield-alert', 18), ' Local anaesthetic systemic toxicity (LAST)'),
            el('div', { class: 'learn-grid' },
                el('div', {}, el('h3', { text: 'Signs' }), bullets(['Peri-oral tingling, metallic taste, tinnitus', 'Agitation, confusion, slurred speech, loss of consciousness', 'Muscle twitching and seizures', 'Early tachycardia and hypertension; later bradycardia, arrhythmia, hypotension and cardiac arrest'])),
                el('div', {}, el('h3', { text: 'Immediate management' }), bullets(['Stop injecting. Call for help, the arrest trolley and the lipid rescue pack.', 'Airway: 100% oxygen, ventilate, avoid hypercarbia. Confirm IV access.', 'Seizures: small incremental doses of a benzodiazepine.', 'Cardiac arrest: start CPR, give lipid emulsion, use adrenaline 1 microgram/kg or less, avoid vasopressin. Recovery can take over an hour.', 'Lipid emulsion 20%: 1.5 ml/kg over 2 to 3 minutes, then 15 ml/kg/h (see the calculator above).', 'Afterwards: monitor for pancreatitis and report the incident.']))),
            el('p', { class: 'hint', text: 'Summarised from the Association of Anaesthetists Quick Reference Handbook 3-10 (local anaesthetic toxicity, version 2, June 2023). Use your department’s copy in an emergency.' })),
        el('section', { class: 'card' },
            el('h2', { text: 'Sources for the dose figures' }),
            bullets(['Bupivacaine: summary of product characteristics (medicines.org.uk): 2 mg/kg in any 4 hours, single doses up to 150 mg.', 'Lidocaine: BNF: 3 mg/kg plain up to 200 mg; with adrenaline 7 mg/kg up to 500 mg.', 'Lipid emulsion: Association of Anaesthetists QRH 3-10, v2, June 2023.'])));
}

// ---------------------------------------------------------------------------------------------
// Routing and theme
// ---------------------------------------------------------------------------------------------
function route() {
    const m = location.hash.match(/^#\/b\/([a-z]+)(?:\/(learn|safety))?$/);
    const block = m && blockById(m[1]);
    if (block) renderBlock(block, m[2] || 'do');
    else renderHome();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
}

function themeIcon() {
    const btn = document.getElementById('themeBtn');
    const dark = document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    btn.replaceChildren(icon(dark ? 'sun' : 'moon', 20));
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    return dark;
}

document.getElementById('themeBtn').addEventListener('click', () => {
    const dark = themeIcon();
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    prefs.set('theme', next);
    themeIcon();
});

// Only handle in-app routes; plain "#sec-n" anchors are scroll targets.
window.addEventListener('hashchange', () => { if (location.hash === '' || location.hash.startsWith('#/')) route(); });
themeIcon();
route();

// note.js - turns the guided checklist into a plain-text note for the record. Pure, unit tested.
// Nothing is written into the note unless the user recorded it. Unrecorded checklist items are
// listed at the end under "Not recorded" so gaps are visible rather than hidden.

import { DRUGS, doseCheck } from './dose.js';

export const PROCEDURE_OPTIONS = {
    machine: ['Sonosite PX', 'Sonosite X-Porte', 'GE Venue', 'Mindray TE7', 'Butterfly iQ', 'Other'],
    probe: ['Linear', 'Curvilinear'],
    needle: ['50 mm echogenic', '80 mm echogenic', '100 mm echogenic', 'Other'],
    approach: ['In-plane', 'Out-of-plane'],
    checks: [
        ['asepsis', 'Aseptic technique, chlorhexidine skin preparation'],
        ['target', 'Target structures identified on ultrasound'],
        ['aspiration', 'Negative aspiration before and during injection'],
        ['pressure', 'Low injection pressure, no pain or paraesthesia on injection'],
        ['spread', 'Local anaesthetic spread seen in the intended plane']
    ]
};

export const COLD_OPTIONS = ['Normal sensation', 'Reduced sensation', 'Loss of cold sensation'];
export const COMPLICATIONS = [
    'Vascular puncture', 'Paraesthesia or pain on injection', 'Signs of local anaesthetic toxicity', 'Haematoma', 'Block abandoned', 'Other'
];

export const AFTER_INSTRUCTIONS = [
    'Protect the numb limb from heat, pressure and injury. No weight-bearing on a blocked leg.',
    'Escalate to the ED medical team at once for peri-oral tingling, agitation, twitching, seizures, arrhythmia or an expanding haematoma.',
    'Give regular analgesia before the block wears off.'
];

const fmtDate = (iso) => {
    if (!iso) return '';
    const [d, t] = iso.split('T');
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}${t ? ' ' + t.slice(0, 5) : ''}`;
};

export function addMinutes(iso, minutes) {
    if (!iso || minutes === null || minutes === undefined) return '';
    const [d, t] = iso.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const [hh, mm] = (t || '00:00').split(':').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, day, hh, mm + minutes));
    return dt.toISOString().slice(11, 16);
}

const answered = (v) => v !== undefined && v !== null && v !== '' && v !== false;

export function anyContraindication(state) {
    const l = state.lists && state.lists.contra;
    return !!l && Object.values(l).some((v) => v === 'present');
}

export function visibleItems(section, state) {
    return (section.items || []).filter((it) => !it.showIf || (it.showIf === 'anyContraindication' && anyContraindication(state)));
}

function itemLine(item, state, key) {
    const v = state.answers[key];
    const label = item.noteLabel || item.label.replace(/[:?]\s*$/, '');
    if (item.kind === 'check' || item.kind === 'paper') return v ? `- ${label}: yes` : null;
    if (item.kind === 'text') return answered(v) ? `- ${label}: ${String(v).trim()}` : null;
    if (item.kind === 'choice') {
        if (!answered(v)) return null;
        const det = state.answers[key + '.details'];
        return `- ${label}: ${v}${item.details && item.details.includes(v) && answered(det) ? ` (${String(det).trim()})` : ''}`;
    }
    return null;
}

function listLines(section, state, missing) {
    const out = [];
    const marks = (state.lists && state.lists[section.id]) || {};
    const { kind, items } = section.list;
    if (kind === 'present') {
        const present = items.filter((_, i) => marks[i] === 'present');
        const absent = items.filter((_, i) => marks[i] === 'absent');
        const unchecked = items.filter((_, i) => !marks[i]);
        if (present.length) out.push(`- Present: ${present.join('; ')}`);
        if (absent.length) out.push(`- Checked and absent: ${absent.join('; ')}`);
        unchecked.forEach((c) => missing.push(`${section.title}: ${c}`));
    } else {
        const done = items.filter((_, i) => marks[i]);
        const notDone = items.filter((_, i) => !marks[i]);
        const word = kind === 'discussed' ? 'Discussed' : 'Prepared';
        if (done.length) out.push(`- ${word}: ${done.join('; ')}`);
        notDone.forEach((c) => missing.push(`${section.title}: ${c}`));
    }
    return out;
}

function doseLines(protocol, state) {
    const d = state.dose || {};
    const w = Number(d.weight);
    const entries = [];
    if (d.drug && d.ml) entries.push({ drug: d.drug, ml: d.ml });
    if (d.skinDrug && d.skinMl) entries.push({ drug: d.skinDrug, ml: d.skinMl });
    const out = [];
    if (w > 0) out.push(`- Weight: ${w} kg${d.weightEstimated ? ' (estimated)' : ''}`);
    const check = doseCheck(w, entries);
    for (const l of check.lines) {
        out.push(`- ${l.label}: ${l.ml} ml (${l.mg} mg${l.mgPerKg !== null ? `, ${l.mgPerKg} mg/kg` : ''})`);
    }
    if (check.totalPercent !== null && check.lines.length) out.push(`- Total local anaesthetic: ${check.totalPercent}% of the calculated maximum for this weight`);
    if (protocol.doseTable && w > 0) {
        const band = protocol.doseTable.bands.find((b) => b.test(w));
        out.push(`- Trust dose table (${protocol.reference}): ${band ? `${band.label}: ${band.text}` : 'weight not covered by the table'}`);
    }
    return { out, empty: !check.lines.length };
}

function procedureLines(state) {
    const p = state.procedure || {};
    const out = [];
    if (answered(p.machine)) out.push(`- Ultrasound machine: ${p.machine === 'Other' && p.machineOther ? p.machineOther : p.machine}`);
    if (answered(p.probe)) out.push(`- Probe: ${p.probe}`);
    if (answered(p.needle)) out.push(`- Needle: ${p.needle === 'Other' && p.needleOther ? p.needleOther : p.needle}`);
    if (answered(p.approach)) out.push(`- Approach: ${p.approach}`);
    for (const [k, label] of PROCEDURE_OPTIONS.checks) if (p[k]) out.push(`- ${label}`);
    if (answered(p.notes)) out.push(`- Notes: ${String(p.notes).trim()}`);
    return out;
}

function afterLines(protocol, state) {
    const a = state.after || {};
    const out = [];
    if (answered(a.painBefore)) out.push(`- Pain score before block: ${a.painBefore}/10`);
    if (answered(a.painAfter)) out.push(`- Pain score after block: ${a.painAfter}/10`);
    if (answered(a.cold15)) out.push(`- 15 minute cold sensation check: ${a.cold15}`);
    if (answered(a.cold30)) out.push(`- 30 minute cold sensation check: ${a.cold30}`);
    if (a.complications === 'none') out.push('- Complications: none observed at the time of this note');
    if (a.complications === 'yes') {
        const list = (a.complicationList || []).join('; ');
        out.push(`- Complications: ${list || 'yes'}${answered(a.complicationDetails) ? ` (${String(a.complicationDetails).trim()})` : ''}`);
    }
    const obs = protocol.observations;
    if (obs) {
        const done = obs.times.filter((t) => a.obs && a.obs[t.id]).map((t) => t.label.toLowerCase());
        const due = obs.times.filter((t) => !(a.obs && a.obs[t.id]) && t.minutes !== null);
        if (done.length) out.push(`- ${obs.label} completed: ${done.join(', ')}`);
        if (due.length && state.when) out.push(`- ${obs.label} still due: ${due.map((t) => `${t.label.toLowerCase()} (${addMinutes(state.when, t.minutes)})`).join(', ')}`);
    }
    if (a.instructions) {
        out.push('- Post-procedure instructions given to the nursing team:');
        AFTER_INSTRUCTIONS.forEach((i) => out.push(`    - ${i}`));
    }
    return out;
}

// Returns { text, missing, empty }.
export function renderNote(block, protocol, state, opts = {}) {
    const missing = [];
    const lines = [];
    const title = block.name.toUpperCase();
    lines.push(`${title}: PROCEDURE NOTE`);
    if (state.when) lines.push(`Date and time: ${fmtDate(state.when)}${state.retrospective ? ' (written retrospectively)' : ''}`);
    if (protocol.generic) lines.push('Checklist: generic checklist (no Trust LocSSIP loaded for this block)');
    else lines.push(`Checklist: ${opts.trustName ? opts.trustName + ' ' : ''}${protocol.reference} ${protocol.title} (last updated ${protocol.lastUpdated})`);
    const side = state.answers['pre.side'];
    if (answered(side)) lines.push(`Side: ${side.charAt(0) + side.slice(1).toLowerCase()}`);
    if (answered(state.indication)) lines.push(`Indication: ${state.indication === 'Other' && state.indicationOther ? state.indicationOther.trim() : state.indication}`);

    let recorded = 0;
    for (const section of protocol.sections) {
        let body = [];
        if (section.step === 'dose') {
            const d = doseLines(protocol, state);
            body = d.out;
            if (d.empty) missing.push('Dose: drug and volume given');
        } else if (section.step === 'procedure') {
            body = procedureLines(state);
        } else if (section.step === 'after') {
            body = afterLines(protocol, state);
            if (!state.after || !state.after.complications) missing.push('After the block: complications');
        } else {
            if (section.list) body.push(...listLines(section, state, missing));
            for (const item of visibleItems(section, state)) {
                if (section.id === 'pre' && item.id === 'side') continue;
                const key = `${section.id}.${item.id}`;
                const line = itemLine(item, state, key);
                if (line) body.push(line);
                else if (!item.optional) missing.push(`${section.title}: ${item.noteLabel || item.label.replace(/[:?]\s*$/, '')}`);
            }
        }
        if (section.id === 'pre' && !answered(side)) missing.push(`${section.title}: side`);
        if (body.length) {
            recorded += body.length;
            lines.push('', section.title.toUpperCase(), ...body);
        }
    }
    if (missing.length) {
        lines.push('', 'NOT RECORDED IN THIS NOTE', ...missing.map((m) => `- ${m}`));
    }
    return { text: lines.join('\n'), missing, empty: recorded === 0 };
}

// Free text the user typed, for the identifier check. Staff name fields are left out: staff names
// belong in the note, and titles such as "Mr" would otherwise trigger the warning.
const STAFF_KEYS = /\.(operator|supervisor|consultant|discussedWith)$/;
export function freeText(state) {
    const parts = [state.indicationOther];
    for (const [k, v] of Object.entries(state.answers || {})) if (typeof v === 'string' && !STAFF_KEYS.test(k)) parts.push(v);
    const p = state.procedure || {};
    parts.push(p.notes, p.machineOther, p.needleOther);
    parts.push((state.after || {}).complicationDetails);
    return parts.filter(Boolean).join('\n');
}

export { DRUGS };

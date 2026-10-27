import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCSSIPS, TRUSTS, genericChecklist, isPastReview, locssipFor } from '../js/checklists.js';
import { BLOCKS } from '../js/blocks.js';
import { renderNote } from '../js/note.js';

const fib = BLOCKS.find((b) => b.id === 'fib');
const uhb = locssipFor('uhb', 'fib');

test('every LocSSIP points at a real Trust and block, with a reference and review date', () => {
    for (const l of LOCSSIPS) {
        assert.ok(TRUSTS.some((t) => t.id === l.trust), l.id);
        assert.ok(BLOCKS.some((b) => b.id === l.block), l.id);
        assert.ok(l.reference && l.lastUpdated && /^\d{4}-\d{2}-\d{2}$/.test(l.reviewBy), l.id);
    }
});

test('review date warning', () => {
    assert.equal(isPastReview(uhb, new Date('2026-10-27')), false);
    assert.equal(isPastReview(uhb, new Date('2029-01-01')), true);
});

test('the UHB fascia iliaca items match the text of the uploaded document', () => {
    // Phrases copied from UHB465_V2. If the Trust issues a new version, update both.
    const phrases = [
        'Team members introductions by name and role', 'Name and designation of operator:',
        'If trainee, supervising practitioner:', 'Patient without capacity details confirmed and correct',
        'Is there valid consent?', 'Confirm Neck of Femur Fracture SIDE on imaging:', 'Known allergies?',
        'Previous femoral bypass surgery', 'Signs of inflammation/ infection over injection site',
        'Known sensitivity/allergy to local anaesthetic', 'High BMI (>40)', 'Known clotting disorder, INR >1.5, Platelets <80',
        'Block failure (20%)', 'Temporary or permanent nerve damage', 'Local anaesthetic toxicity',
        'Patient moved to majors cubicle', 'Continuous monitoring in place (oxygen sats, BP cuff, 3 lead ECG)',
        'Intravenous cannula and fluids running', 'All medication drawn up in closed system?',
        'Block side and site confirmed by person performing block and assistant',
        'Swabs, sharps and instruments intact and accounted for?', 'Equipment problems identified?',
        'Anaesthetic dose (dose as per overleaf) documented', 'Key concerns for recovery and management discussed?',
        'Ultrasound machine cleaned', 'Medication prescribed, administered/signed', '30mls of 0.25%', '40 mls of 0.25%'
    ];
    const src = readFileSync(new URL('../js/checklists.js', import.meta.url), 'utf8');
    for (const p of phrases) assert.ok(src.includes(p), p);
});

test('a blank checklist writes no claims, only "not recorded"', () => {
    const s = { when: '2026-10-27T14:00', answers: {}, lists: {}, dose: { drug: 'bupi025' }, procedure: {}, after: { obs: {} } };
    const { text, missing, empty } = renderNote(fib, uhb, s, { trustName: 'University Hospitals Birmingham' });
    assert.equal(empty, false); // the still-due observations are listed
    assert.ok(!/consent obtained|valid consent: yes/i.test(text));
    assert.ok(!/complications: none/i.test(text));
    assert.ok(missing.includes('After the block: complications'));
    assert.ok(missing.includes('Pre-procedure: Valid consent'));
    assert.ok(text.includes('NOT RECORDED IN THIS NOTE'));
});

test('a completed UHB checklist produces the expected note', () => {
    const s = {
        when: '2026-10-27T14:00', indication: 'Neck of femur fractures',
        answers: {
            'pre.intros': true, 'pre.operator': 'Dr A Clinician, ST5', 'pre.consultant': 'Dr B Consultant', 'pre.patientDetails': true,
            'pre.capacity': 'Not applicable', 'pre.consent': true, 'pre.side': 'LEFT', 'pre.allergies': 'No',
            'sbyb.guidance': 'Ultrasound guided', 'sbyb.sideSite': true, 'signout.swabs': 'Yes', 'signout.equipProblems': 'No'
        },
        lists: { contra: { 0: 'absent', 1: 'absent', 2: 'absent', 3: 'present', 4: 'absent' }, consentRisks: { 0: true, 1: true, 2: true, 3: true, 4: true } },
        dose: { weight: '62', drug: 'bupi025', ml: '40', skinDrug: 'lido1', skinMl: '5' },
        procedure: { machine: 'Sonosite PX', probe: 'Linear', approach: 'In-plane', aspiration: true },
        after: { complications: 'none', cold15: 'Reduced sensation', obs: { pre: true, m5: true } }
    };
    s.answers['contra.discussedWith'] = 'Dr B Consultant';
    const { text, missing } = renderNote(fib, uhb, s, { trustName: 'University Hospitals Birmingham' });
    assert.match(text, /Side: Left/);
    assert.match(text, /Indication: Neck of femur fractures/);
    assert.match(text, /Present: High BMI \(>40\)/);
    assert.match(text, /Decision to continue discussed with: Name and designation: Dr B Consultant|discussed with: Name and designation: Dr B Consultant/);
    assert.match(text, /Bupivacaine 0\.25%: 40 ml \(100 mg, 1\.61 mg\/kg\)/);
    assert.match(text, /Lidocaine 1% \(plain\): 5 ml \(50 mg, 0\.81 mg\/kg\)/);
    assert.match(text, /Trust dose table \(UHB465_V2\): >50kg: 40 mls of 0\.25%/);
    assert.match(text, /Ultrasound machine: Sonosite PX/);
    assert.match(text, /Complications: none observed at the time of this note/);
    assert.match(text, /still due: 10 mins \(14:10\)/);
    assert.ok(!missing.some((m) => m.startsWith('Contraindications')));
});

test('generic checklist exists for every block and says it is generic', () => {
    for (const b of BLOCKS) {
        const g = genericChecklist(b);
        const { text } = renderNote(b, g, { when: '2026-10-27T09:00', answers: {}, lists: {}, dose: {}, procedure: {}, after: {} });
        assert.match(text, /generic checklist \(no Trust LocSSIP loaded/);
    }
});

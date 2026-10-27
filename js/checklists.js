// checklists.js - Trust LocSSIPs and the generic checklist.
//
// Rules for Trust LocSSIPs:
// - Text in `label` is copied from the Trust's document. Do not reword it or add items.
// - Anything the app adds for usability goes in `appNote` (shown as an app note, never as Trust text).
// - The app never asks for patient identifiers. Items that need them are kind 'paper': the user
//   does them in person and on the paper form, and only ticks that they were done.
//
// Item kinds:
//   check  - a single tick
//   choice - pick one of `options`; `details` names options that need a free-text detail
//   text   - free text (staff names and designations only, never patient details)
//   paper  - done in person / on the paper form; the app records only that it was done

export const TRUSTS = [
    { id: 'uhb', name: 'University Hospitals Birmingham', short: 'UHB' }
];

export const LOCSSIPS = [
    {
        id: 'uhb-fib',
        trust: 'uhb',
        block: 'fib',
        title: 'Fascia Iliaca Block LocSSIP Checklist',
        reference: 'UHB465_V2',
        lastUpdated: 'December 2025',
        reviewLabel: 'December 2028',
        reviewBy: '2028-12-31',
        scopeNote: 'This modified checklist must not be used for other procedures',
        copyright: '© World Health Organisation 2008, all rights reserved',
        // The Trust's dose table. Bands are copied as printed (see `gapNote`).
        doseTable: {
            heading: 'CALCULATE DOSE',
            drug: 'Bupivacaine 0.25%',
            drugKey: 'bupi025',
            bands: [
                { label: '<50kg', test: (w) => w < 50, volume: 30, text: '30mls of 0.25%' },
                { label: '>50kg', test: (w) => w > 50, volume: 40, text: '40 mls of 0.25%' }
            ],
            gapNote: 'The table gives "<50kg" and ">50kg". A weight of exactly 50 kg is not covered: decide with a senior.',
            skinDrug: { key: 'lido1', label: '1% Lidocaine solution', volume: 5 }
        },
        observations: {
            heading: 'PROCEDURE OBSERVATIONS',
            label: 'Full Observations on NEWS2',
            times: [
                { id: 'pre', label: 'PRE PROCEDURE', minutes: null },
                { id: 'm5', label: '5 MINS', minutes: 5 },
                { id: 'm10', label: '10 MINS', minutes: 10 },
                { id: 'm15', label: '15 MINS', minutes: 15 },
                { id: 'm30', label: '30 MINS', minutes: 30 },
                { id: 'h1', label: '1 HOUR', minutes: 60 },
                { id: 'h4', label: '4 HOURS', minutes: 240 }
            ]
        },
        sections: [
            {
                id: 'pre',
                title: 'Pre-procedure',
                sourceHeading: 'PRE-PROCEDURE · Immediately before start of procedure · STOP – is everyone listening?',
                items: [
                    { id: 'intros', kind: 'check', label: 'Team members introductions by name and role' },
                    { id: 'operator', kind: 'text', label: 'Name and designation of operator:', staff: 'operator' },
                    { id: 'supervisor', kind: 'text', label: 'If trainee, supervising practitioner:', optional: true, staff: 'supervisor' },
                    { id: 'consultant', kind: 'text', label: 'Responsible consultant:', staff: 'consultant' },
                    {
                        id: 'patientDetails', kind: 'paper',
                        label: 'Patient states details to team: Inpatients: Name, Date of Birth, PID/Hospital Number. Outpatients: Name, Date of Birth, Address. Team must confirm these and hospital number match wristband and consent form',
                        appNote: 'Do this in person and on the paper form. Do not type patient details into this app.',
                        noteLabel: 'Patient identity confirmed against wristband and consent form'
                    },
                    {
                        id: 'capacity', kind: 'choice', label: 'Patient without capacity details confirmed and correct',
                        options: ['Confirmed', 'Not applicable'],
                        appNote: '"Not applicable" is an app option for a patient who has capacity. It is not on the Trust form.'
                    },
                    { id: 'consent', kind: 'check', label: 'Is there valid consent?', noteLabel: 'Valid consent' },
                    { id: 'side', kind: 'choice', label: 'Confirm Neck of Femur Fracture SIDE on imaging:', options: ['LEFT', 'RIGHT'], sets: 'side' },
                    { id: 'allergies', kind: 'choice', label: 'Known allergies?', options: ['Yes', 'No'], details: ['Yes'], detailsLabel: 'Yes, details' }
                ]
            },
            {
                id: 'contra',
                title: 'Contraindications',
                sourceHeading: 'CHECK CONTRAINDICATIONS',
                list: {
                    kind: 'present',
                    items: [
                        'Previous femoral bypass surgery',
                        'Signs of inflammation/ infection over injection site',
                        'Known sensitivity/allergy to local anaesthetic',
                        'High BMI (>40)',
                        'Known clotting disorder, INR >1.5, Platelets <80'
                    ],
                    footnote: '(Note not absolute contraindication, seek senior input where necessary).'
                },
                items: [
                    {
                        id: 'discussedWith', kind: 'text', showIf: 'anyContraindication',
                        label: 'If Yes, decision to continue discussed with: Name and designation:',
                        appNote: 'Shown because you marked a contraindication as present.'
                    }
                ]
            },
            {
                id: 'consentRisks',
                title: 'Verbal consent',
                sourceHeading: 'OBTAIN VERBAL CONSENT · Discuss complications:',
                list: {
                    kind: 'discussed',
                    items: [
                        'Block failure (20%)',
                        'Bleeding',
                        'Infection',
                        'Temporary or permanent nerve damage',
                        'Local anaesthetic toxicity'
                    ]
                },
                items: []
            },
            {
                id: 'equipment',
                title: 'Equipment',
                sourceHeading: 'PREPARE EQUIPMENT',
                list: {
                    kind: 'ready',
                    items: [
                        'Bupivacaine 0.25% 3 or 4 x 10ml',
                        '5 mls 1% Lidocaine solution',
                        '2 x 20 ml syringe',
                        '1 x 5 ml syringe',
                        '1 x blue needle',
                        '4 x red blunt fill needle',
                        'Chlorhexidine cleaning stick (check allergies)',
                        'Drape',
                        'Dressing',
                        'Block sticker'
                    ],
                    spellingNote: 'The Trust document spells it "Bupivicaine". The app shows "Bupivacaine".'
                },
                items: []
            },
            { id: 'dose', title: 'Dose', step: 'dose' },
            {
                id: 'sbyb',
                title: 'Stop Before You Block',
                sourceHeading: 'STOP BEFORE YOU BLOCK',
                items: [
                    { id: 'majors', kind: 'check', label: 'Patient moved to majors cubicle' },
                    { id: 'monitoring', kind: 'check', label: 'Continuous monitoring in place (oxygen sats, BP cuff, 3 lead ECG)' },
                    { id: 'ivFluids', kind: 'check', label: 'Intravenous cannula and fluids running' },
                    { id: 'closedSystem', kind: 'check', label: 'All medication drawn up in closed system?' },
                    { id: 'guidance', kind: 'choice', label: 'Guidance', options: ['Ultrasound guided', 'Landmark guided'], sets: 'guidance', appNote: 'The form has "Ultrasound guided Yes No" and "Landmark guided Yes No".' },
                    {
                        id: 'sideSite', kind: 'check',
                        label: 'Block side and site confirmed by person performing block and assistant',
                        hint: 'Verbal check needs to be repeated for further blocks'
                    },
                    { id: 'sbybSigned', kind: 'paper', label: 'Signature · Name and designation', noteLabel: 'Stop Before You Block signed on the paper form', appNote: 'Sign the paper form.' }
                ]
            },
            { id: 'procedure', title: 'Procedure', step: 'procedure' },
            {
                id: 'signout',
                title: 'Sign out',
                sourceHeading: 'SIGN OUT · Once procedure is complete · STOP – is everyone listening?',
                items: [
                    { id: 'swabs', kind: 'choice', label: 'Swabs, sharps and instruments intact and accounted for?', options: ['Yes', 'No'], details: ['No'], detailsLabel: 'No, details' },
                    { id: 'equipProblems', kind: 'choice', label: 'Equipment problems identified?', options: ['Yes', 'No'], details: ['Yes'], detailsLabel: 'Details', appNote: 'The form has Yes / No. The details box is an app addition so the problem appears in the note.' },
                    { id: 'doseDocumented', kind: 'check', label: 'Anaesthetic dose (dose as per overleaf) documented', appNote: 'The dose you entered appears in the note.' },
                    { id: 'recovery', kind: 'check', label: 'Key concerns for recovery and management discussed?' },
                    { id: 'usCleaned', kind: 'check', label: 'Ultrasound machine cleaned' },
                    { id: 'prescribed', kind: 'check', label: 'Medication prescribed, administered/signed' },
                    { id: 'leaflet', kind: 'check', label: 'Post procedural advice/ leaflet given to patient', appNote: 'The form also asks where the leaflet is located. The app has a printable advice sheet on the block page.' },
                    { id: 'signoutSigned', kind: 'paper', label: 'Signature of operator completing form · Name and designation', noteLabel: 'Sign out signed on the paper form', appNote: 'Sign the paper form.' }
                ]
            },
            { id: 'after', title: 'After the block', step: 'after' }
        ]
    }
];

// Used for blocks with no Trust LocSSIP loaded. Built from the app's own previous checklist and note.
// It is NOT a Trust document and the app says so wherever it is shown.
export function genericChecklist(block) {
    return {
        id: 'generic-' + block.id,
        generic: true,
        title: 'Generic checklist',
        observations: {
            label: 'Observations (BP, HR, SpO2, RR)',
            times: [
                { id: 'pre', label: 'Before the block', minutes: null },
                { id: 'm5', label: '5 minutes', minutes: 5 },
                { id: 'm10', label: '10 minutes', minutes: 10 },
                { id: 'm15', label: '15 minutes', minutes: 15 },
                { id: 'm30', label: '30 minutes', minutes: 30 },
                { id: 'm45', label: '45 minutes', minutes: 45 },
                { id: 'h1', label: '1 hour', minutes: 60 }
            ]
        },
        sections: [
            {
                id: 'pre',
                title: 'Before you start',
                items: [
                    { id: 'operator', kind: 'text', label: 'Operator name and designation', staff: 'operator' },
                    { id: 'supervisor', kind: 'text', label: 'Supervisor, if a trainee', optional: true, staff: 'supervisor' },
                    { id: 'patientDetails', kind: 'paper', label: 'Patient identity confirmed in person', appNote: 'Do not type patient details into this app.', noteLabel: 'Patient identity confirmed' },
                    { id: 'consent', kind: 'check', label: 'Valid consent', noteLabel: 'Valid consent' },
                    { id: 'side', kind: 'choice', label: 'Side', options: ['Left', 'Right', 'Bilateral'], sets: 'side' },
                    { id: 'allergies', kind: 'choice', label: 'Known allergies?', options: ['Yes', 'No'], details: ['Yes'], detailsLabel: 'Details' }
                ]
            },
            {
                id: 'contra',
                title: 'Contraindications',
                list: {
                    kind: 'present',
                    items: [...block.contraindications.absolute.map((c) => c + ' (absolute)'), ...block.contraindications.relative.map((c) => c + ' (relative)')]
                },
                items: [
                    { id: 'discussedWith', kind: 'text', showIf: 'anyContraindication', label: 'Decision to continue discussed with (name and designation)' }
                ]
            },
            {
                id: 'consentRisks',
                title: 'Verbal consent',
                list: {
                    kind: 'discussed',
                    items: ['Infection', 'Bleeding', 'Nerve injury', 'Local anaesthetic systemic toxicity', 'Block failure']
                },
                items: []
            },
            { id: 'dose', title: 'Dose', step: 'dose' },
            {
                id: 'sbyb',
                title: 'Stop Before You Block',
                items: [
                    { id: 'siteMarked', kind: 'check', label: 'Site marked' },
                    { id: 'monitoring', kind: 'check', label: 'Monitoring attached (SpO2, ECG, BP)' },
                    { id: 'ivAccess', kind: 'check', label: 'Intravenous access established' },
                    { id: 'resus', kind: 'check', label: 'Resuscitation equipment and lipid emulsion (Intralipid 20%) available' },
                    { id: 'guidance', kind: 'choice', label: 'Guidance', options: ['Ultrasound guided', 'Landmark guided'], sets: 'guidance' },
                    { id: 'sideSite', kind: 'check', label: 'Stop Before You Block: side and site confirmed immediately before needle insertion' }
                ]
            },
            { id: 'procedure', title: 'Procedure', step: 'procedure' },
            { id: 'after', title: 'After the block', step: 'after' }
        ]
    };
}

export function locssipFor(trustId, blockId) {
    return LOCSSIPS.find((l) => l.trust === trustId && l.block === blockId) || null;
}

export function trustById(id) {
    return TRUSTS.find((t) => t.id === id) || null;
}

// True when the document's review date has passed.
export function isPastReview(doc, today = new Date()) {
    if (!doc || !doc.reviewBy) return false;
    return today > new Date(doc.reviewBy + 'T23:59:59');
}

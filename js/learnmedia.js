// learnmedia.js - real ultrasound scans and probe-position pictures for the Learn tab.
// Scans are figures from open-access journal articles published under Creative Commons
// Attribution licences, which allow reuse with credit. Each legend is the authors' own; nothing
// has been added to the images. Figures marked reproduced from a third party were not used.
// Probe pictures are AI-generated illustrations, checked by eye for patient and probe position.

const BY4 = ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'];
const BY3 = ['CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/'];

export const MEDIA = {
    sap: {
        scan: {
            src: 'img/learn/sap-scan.webp', w: 368, h: 368,
            alt: 'Ultrasound of the lateral chest wall showing the needle, latissimus dorsi, serratus anterior, the 4th rib and pleura',
            legend: 'Serratus anterior plane block: an ultrasound image of the serratus anterior and latissimus dorsi muscles. The authors placed the probe at the fourth-rib level.',
            credit: { authors: 'But M, Wernicki K, Zieliński J, Szczecińska W', journal: 'J Clin Med', year: 2024, figure: 'Figure 3b', doi: '10.3390/jcm13164836', licence: BY4, cropped: 'Panel b only' }
        },
        probe: { src: 'img/learn/sap-probe.webp', w: 960, h: 717, alt: 'Illustration: patient supine with the arm raised, linear probe on the lateral chest wall in the mid-axillary line' }
    },
    esp: {
        scan: {
            src: 'img/learn/esp-scan.webp', w: 960, h: 847,
            alt: 'Ultrasound of an erector spinae plane block showing trapezius, rhomboid major, erector spinae, the transverse process, intercostal muscle, pleura and local anaesthetic spread',
            legend: 'ESM: erector spinae muscle, ICM: intercostal muscle, TP: transverse process, LA: local anaesthetic spread between the ESM and ICM. The white arrow shows the needle trajectory.',
            credit: { authors: 'Abd Ellatif SE, et al.', journal: 'BMC Anesthesiol', year: 2026, figure: 'Figure 1', doi: '10.1186/s12871-025-03567-0', licence: BY4 }
        },
        probe: { src: 'img/learn/esp-probe.webp', w: 960, h: 717, alt: 'Illustration: patient sitting, viewed from behind, probe held vertically beside the thoracic spine' }
    },
    axillary: {
        scan: {
            src: 'img/learn/axillary-scan.webp', w: 628, h: 511,
            alt: 'Two axillary ultrasound images, before and after injection, labelling the axillary artery, median, ulnar, radial and musculocutaneous nerves, biceps and coracobrachialis',
            legend: 'Before injection (a) and after injection (b). AA: axillary artery; LA: local anaesthetic; MCN: musculocutaneous nerve; RN: radial nerve; MN: median nerve; UN: ulnar nerve; Bic: biceps brachii; CBM: coracobrachialis. These scans are from preschool-age children, so the structures are smaller and shallower than in an adult.',
            credit: { authors: 'Chen L, Shen Y, Liu S, Cao Y', journal: 'Sci Rep', year: 2021, figure: 'Figure 1', doi: '10.1038/s41598-021-96582-3', licence: BY4 }
        },
        probe: { src: 'img/learn/axillary-probe.webp', w: 960, h: 717, alt: 'Illustration: arm abducted, linear probe across the arm at the axillary crease' }
    },
    fib: {
        scan: {
            src: 'img/learn/fib-scan.webp', w: 779, h: 491,
            alt: 'Groin ultrasound, medial on the left, labelling the femoral artery, femoral nerve, fascia iliaca, iliopsoas and sartorius',
            legend: 'The sonoanatomy of the fascia iliaca block, performed at about the lateral third of the line from the anterior superior iliac spine to the pubic tubercle. FI: fascia iliaca; SaM: sartorius; FN: femoral nerve; FA: femoral artery; IM: iliopsoas.',
            credit: { authors: 'Vetrone F, Marelli S, Galimberti A, et al.', journal: 'J Pers Med', year: 2025, figure: 'Figure 3', doi: '10.3390/jpm15060230', licence: BY4 }
        },
        probe: { src: 'img/learn/fib-probe.webp', w: 720, h: 540, alt: 'Illustration viewed from above: patient supine, probe placed across the groin just lateral to the femoral pulse (red dot)' }
    },
    femoral: {
        scan: {
            src: 'img/learn/femoral-scan.webp', w: 742, h: 558,
            alt: 'Groin ultrasound, lateral on the left, labelling the femoral nerve, artery and vein, fascia iliaca, iliopsoas and the needle path',
            legend: 'Femoral nerve block. The yellow line is the fascia iliaca and the blue line is the needle path. Local anaesthetic is placed below and above the nerve. FN: femoral nerve; FA: femoral artery; FV: femoral vein. Note this scan has lateral on the left.',
            credit: { authors: 'Muse IO, Deiling B, Grinman L, Hadeed MM, Elkassabany N', journal: 'J Clin Med', year: 2024, figure: 'Figure 4', doi: '10.3390/jcm13123457', licence: BY4 }
        },
        probe: { src: 'img/learn/femoral-probe.webp', w: 960, h: 717, alt: 'Illustration: patient supine, probe placed across the femoral crease over the femoral pulse' }
    },
    popliteal: {
        scan: {
            src: 'img/learn/popliteal-scan.webp', w: 750, h: 529,
            alt: 'Ultrasound of the back of the thigh with the sciatic nerve circled above the popliteal artery',
            legend: 'Sonographic picture of the popliteal sciatic nerve. SN: sciatic nerve; PA: popliteal artery.',
            credit: { authors: 'Patel SK, Parikh R, Gupta H, et al.', journal: 'Cureus', year: 2023, figure: 'Figure 5', doi: '10.7759/cureus.41450', licence: BY3 }
        },
        probe: { src: 'img/learn/popliteal-probe.webp', w: 960, h: 717, alt: 'Illustration: patient prone, probe placed across the back of the thigh above the knee crease' }
    }
};

export const mediaFor = (id) => MEDIA[id] || null;
export const mediaFiles = () => Object.values(MEDIA).flatMap((m) => [m.scan.src, m.probe.src]);

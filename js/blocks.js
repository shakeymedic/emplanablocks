// blocks.js - teaching content for each block (carried over from the previous version of the app).
// This is general education. A Trust LocSSIP, where one is loaded, takes precedence for local practice.

export const REGIONS = ["Chest wall", "Upper limb", "Lower limb"];

export const BLOCKS = [
    {
        "id": "sap",
        "name": "Serratus Anterior Plane (SAP) Block",
        "region": "Chest wall",
        "summary": "Lateral and anterior rib fractures",
        "position": "Lateral or Supine",
        "equipment": "High-frequency linear probe. 50mm echogenic needle.",
        "target": "Intercostal nerves (Lateral cutaneous branches T2-T9)",
        "goldenRule": "Never lose sight of the needle tip. The pleura lies directly below your target plane.",
        "indications": [
            "Lateral rib fractures",
            "Anterior rib fractures",
            "Thoracostomy tube placement"
        ],
        "contraindications": {
            "absolute": [
                "Patient refusal",
                "Infection at site",
                "LA allergy"
            ],
            "relative": [
                "Coagulopathy",
                "Distorted anatomy"
            ]
        },
        "effects": [
            "Analgesia to the lateral chest wall"
        ],
        "technique": [
            [
                "Setup",
                "Position the patient supine or lateral. Abduct the arm to expose the axilla."
            ],
            [
                "Scanning",
                "Place the linear probe transversely at the mid-axillary line over the 5th rib."
            ],
            [
                "Identification",
                "Identify the latissimus dorsi (superficial) and serratus anterior (deep) muscles. Find the bright pleural line between the ribs."
            ],
            [
                "Needling",
                "Insert the needle in-plane from anterior to posterior."
            ],
            [
                "Injection",
                "Advance the tip into the fascial plane superficial to the serratus anterior. Aspirate. Inject 20-30ml of local anaesthetic to hydrodissect the plane."
            ]
        ],
        "tips": [
            "You can inject deep to the serratus anterior directly on the rib. Both approaches work.",
            "Use colour Doppler to locate and avoid the thoracodorsal artery."
        ],
        "variations": [
            "The thoracodorsal artery may run superficial or deep to the latissimus dorsi."
        ],
        "troubleshooting": [
            "Poor fluid spread: Ensure the entire needle bevel is within the fascial plane. Rotate the needle 90 degrees.",
            "Unable to see pleura: Decrease probe frequency or increase depth."
        ],
        "highRiskStructures": [
            "Pleura (Pneumothorax)",
            "Thoracodorsal Artery"
        ],
        "probePosition": "Transverse, mid-axillary line, 5th rib.",
        "needleAngle": "Shallow (10-20 degrees)",
        "typicalVolume": "20-30ml of 0.25% Levobupivacaine",
        "link": "https://www.nysora.com/techniques/trunk/serratus-anterior-plane-block/"
    },
    {
        "id": "esp",
        "name": "Erector Spinae Plane (ESP) Block",
        "region": "Chest wall",
        "summary": "Posterior rib fractures and back pain",
        "position": "Sitting or Prone",
        "equipment": "High-frequency linear probe. 50mm or 80mm echogenic needle.",
        "target": "Dorsal and ventral rami of spinal nerves",
        "goldenRule": "You must feel the needle hit the bone of the transverse process before injecting.",
        "indications": [
            "Posterior rib fractures",
            "Acute back pain",
            "Vertebral fractures"
        ],
        "contraindications": {
            "absolute": [
                "Patient refusal",
                "Infection at site",
                "LA allergy"
            ],
            "relative": [
                "Severe coagulopathy",
                "Prior spinal surgery"
            ]
        },
        "effects": [
            "Somatic and visceral analgesia over multiple dermatomes"
        ],
        "technique": [
            [
                "Setup",
                "Position the patient sitting or prone."
            ],
            [
                "Scanning",
                "Place the probe in a sagittal orientation over the midline spinous processes. Slide 3cm laterally."
            ],
            [
                "Identification",
                "Identify the trapezius, rhomboid major, and erector spinae muscles lying above the flat transverse process shadow."
            ],
            [
                "Needling",
                "Insert the needle in-plane from cranial to caudal."
            ],
            [
                "Injection",
                "Advance until the needle contacts the transverse process. Aspirate. Inject 20-30ml of local anaesthetic deep to the erector spinae fascia to lift the muscle off the bone."
            ]
        ],
        "tips": [
            "Advance slightly to pierce the fascia if you see muscle swelling instead of linear spread.",
            "Count the ribs carefully to target the correct vertebral level."
        ],
        "variations": [
            "Transverse processes lie deeper in muscular or obese patients. You may need a curvilinear probe."
        ],
        "troubleshooting": [
            "Hitting rib instead of transverse process: Slide the probe slightly medial."
        ],
        "highRiskStructures": [
            "Pleura (Deep to intercostal space)",
            "Neuraxis (If medial)"
        ],
        "probePosition": "Sagittal, 3cm lateral to spinous process.",
        "needleAngle": "Steep (30-45 degrees)",
        "typicalVolume": "20-30ml of 0.25% Levobupivacaine",
        "link": "https://www.nysora.com/techniques/trunk/erector-spinae-plane-block/"
    },
    {
        "id": "axillary",
        "name": "Axillary Nerve Block",
        "region": "Upper limb",
        "summary": "Forearm, wrist and hand",
        "position": "Supine, arm abducted 90 degrees",
        "equipment": "High-frequency linear probe. 50mm echogenic needle.",
        "target": "Median, ulnar, radial, and musculocutaneous nerves",
        "goldenRule": "Aspirate before every 5ml injection. The axilla is highly vascular.",
        "indications": [
            "Forearm fractures",
            "Wrist injuries",
            "Hand injuries"
        ],
        "contraindications": {
            "absolute": [
                "Patient refusal",
                "Infection at site",
                "LA allergy"
            ],
            "relative": [
                "Pre-existing nerve injury",
                "Coagulopathy"
            ]
        },
        "effects": [
            "Complete motor and sensory block of arm below shoulder"
        ],
        "technique": [
            [
                "Setup",
                "Abduct the arm to 90 degrees and externally rotate it."
            ],
            [
                "Scanning",
                "Place the probe transversely across the high axillary crease."
            ],
            [
                "Identification",
                "Find the pulsatile axillary artery. Locate the median (superior), ulnar (inferior), and radial (posterior) nerves. Find the musculocutaneous nerve separately within the coracobrachialis muscle."
            ],
            [
                "Needling",
                "Insert the needle in-plane. Target the musculocutaneous nerve first."
            ],
            [
                "Injection",
                "Aspirate frequently. Inject 15-20ml total split around the nerves."
            ]
        ],
        "tips": [
            "Apply minimal probe pressure. Veins compress easily and hide from view.",
            "The nerves often look like a honeycomb structure."
        ],
        "variations": [
            "Veins form a complex plexus around the artery. The musculocutaneous nerve may sit very proximal."
        ],
        "troubleshooting": [
            "Cannot find the radial nerve: Look posterior to the artery and apply a heel-toe tilt to correct anisotropy."
        ],
        "highRiskStructures": [
            "Axillary Artery",
            "Axillary Veins (Intravascular injection)"
        ],
        "probePosition": "Transverse, high in the axillary crease.",
        "needleAngle": "Shallow (10-20 degrees)",
        "typicalVolume": "15-20ml total of 0.25% Levobupivacaine",
        "link": "https://www.nysora.com/techniques/upper-extremity/axillary-brachial-plexus-block/"
    },
    {
        "id": "fib",
        "name": "Fascia Iliaca Block (FIB)",
        "region": "Lower limb",
        "summary": "Hip fractures and femoral shaft",
        "position": "Supine",
        "equipment": "High-frequency linear probe. 80mm echogenic needle.",
        "target": "Femoral nerve and lateral femoral cutaneous nerve",
        "goldenRule": "Volume is key. You need at least 30ml to push the anaesthetic high enough to work effectively.",
        "indications": [
            "Neck of femur fractures",
            "Femoral shaft fractures"
        ],
        "contraindications": {
            "absolute": [
                "Patient refusal",
                "Infection at site",
                "LA allergy"
            ],
            "relative": [
                "Previous femoral bypass grafting"
            ]
        },
        "effects": [
            "Blocks femoral nerve and lateral femoral cutaneous nerve"
        ],
        "technique": [
            [
                "Setup",
                "Position the patient supine."
            ],
            [
                "Scanning",
                "Place the probe transversely inferior to the inguinal ligament."
            ],
            [
                "Identification",
                "Find the femoral artery and vein. Slide laterally to visualise the iliopsoas muscle and the overlying fascia iliaca."
            ],
            [
                "Needling",
                "Insert the needle in-plane from lateral to medial."
            ],
            [
                "Injection",
                "Pierce the fascia iliaca. You may feel two distinct pops. Aspirate. Inject 30-40ml of local anaesthetic and watch the fluid spread medially."
            ]
        ],
        "tips": [
            "Ensure the fluid spreads underneath the fascia, not within the muscle tissue."
        ],
        "variations": [
            "The deep circumflex iliac artery may lie directly in your needle path. Use colour Doppler."
        ],
        "troubleshooting": [
            "Resistance to injection: You are likely intramuscular. Withdraw 1mm and re-attempt."
        ],
        "highRiskStructures": [
            "Femoral Artery",
            "Deep Circumflex Iliac Artery"
        ],
        "probePosition": "Transverse, lateral to femoral vessels.",
        "needleAngle": "Moderate (20-30 degrees)",
        "typicalVolume": "30-40ml of 0.25% Levobupivacaine",
        "link": "https://www.nysora.com/techniques/lower-extremity/fascia-iliaca-block/"
    },
    {
        "id": "femoral",
        "name": "Femoral Nerve Block",
        "region": "Lower limb",
        "summary": "Femur, patella and anterior thigh",
        "position": "Supine",
        "equipment": "High-frequency linear probe. 50mm or 80mm echogenic needle.",
        "target": "Femoral nerve",
        "goldenRule": "Never inject if the patient feels sharp pain or if the injection requires high pressure. Stop immediately.",
        "indications": [
            "Femur fractures",
            "Patella fractures",
            "Anterior thigh lacerations"
        ],
        "contraindications": {
            "absolute": [
                "Patient refusal",
                "Infection at site",
                "LA allergy"
            ],
            "relative": [
                "Vascular graft in groin"
            ]
        },
        "effects": [
            "Motor and sensory block to anterior thigh and knee"
        ],
        "technique": [
            [
                "Setup",
                "Position the patient supine."
            ],
            [
                "Scanning",
                "Place the probe transversely at the femoral crease."
            ],
            [
                "Identification",
                "Find the femoral artery. The femoral nerve lies lateral to it, often looking like a hyperechoic triangle or bow-tie beneath the fascia iliaca."
            ],
            [
                "Needling",
                "Insert the needle in-plane from lateral to medial."
            ],
            [
                "Injection",
                "Advance the tip adjacent to the nerve. Aspirate. Inject 15-20ml of local anaesthetic to bathe the nerve."
            ]
        ],
        "tips": [
            "Angle the probe slightly cranially or caudally to make the nerve stand out clearly.",
            "Do not inject directly into the nerve."
        ],
        "variations": [
            "The nerve may branch very high up in the groin. Lymph nodes can mimic the appearance of nerves."
        ],
        "troubleshooting": [
            "High injection pressure: Stop. You may be intraneural. Withdraw slightly."
        ],
        "highRiskStructures": [
            "Femoral Artery",
            "Femoral Nerve (Intraneural)"
        ],
        "probePosition": "Transverse, directly over femoral crease.",
        "needleAngle": "Moderate (20-30 degrees)",
        "typicalVolume": "15-20ml of 0.25% Levobupivacaine",
        "link": "https://www.nysora.com/techniques/lower-extremity/femoral-nerve-block/"
    },
    {
        "id": "popliteal",
        "name": "Popliteal Block",
        "region": "Lower limb",
        "summary": "Ankle, foot and Achilles",
        "position": "Prone or Lateral",
        "equipment": "High-frequency linear probe. 80mm echogenic needle.",
        "target": "Sciatic nerve (Tibial and common peroneal)",
        "goldenRule": "Inject inside the paraneural sheath but strictly outside the nerve fascicles. Look for the donut sign.",
        "indications": [
            "Ankle fractures",
            "Foot injuries",
            "Achilles tendon ruptures"
        ],
        "contraindications": {
            "absolute": [
                "Patient refusal",
                "Infection at site",
                "LA allergy"
            ],
            "relative": [
                "Pre-existing peripheral neuropathy"
            ]
        },
        "effects": [
            "Analgesia to lower leg and foot, sparing medial aspect"
        ],
        "technique": [
            [
                "Setup",
                "Position the patient prone or lateral."
            ],
            [
                "Scanning",
                "Place the probe transversely at the popliteal crease. Find the popliteal artery."
            ],
            [
                "Identification",
                "Look superficial and lateral to find the sciatic nerve. Trace it proximally until the tibial and common peroneal branches join."
            ],
            [
                "Needling",
                "Insert the needle in-plane from lateral to medial."
            ],
            [
                "Injection",
                "Advance inside the paraneural sheath but outside the epineurium. Aspirate. Inject 15-20ml of local anaesthetic. Look for the donut sign."
            ]
        ],
        "tips": [
            "Ask the patient to plantar flex their foot. Muscle movement makes the static nerve easier to spot."
        ],
        "variations": [
            "The bifurcation height varies massively between patients."
        ],
        "troubleshooting": [
            "Nerve splitting: Do not inject between the distinct fascicles. Stay in the common sheath.",
            "Deep nerve: Switch to a curvilinear probe if the patient is obese."
        ],
        "highRiskStructures": [
            "Popliteal Artery",
            "Popliteal Vein"
        ],
        "probePosition": "Transverse, 5-10cm proximal to popliteal crease.",
        "needleAngle": "Steep (30-45 degrees)",
        "typicalVolume": "15-20ml of 0.25% Levobupivacaine",
        "link": "https://www.nysora.com/techniques/lower-extremity/popliteal-sciatic-nerve-block/"
    }
];

export const blockById = (id) => BLOCKS.find((b) => b.id === id);

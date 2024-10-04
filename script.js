// Variables for speech recognition
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Set to Indian English

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Heard:", transcript);
        handleInput(transcript);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
    };
}

let medicationList = []; // Store medications here
let durationList = []; // Store durations here

// Start voice recognition
document.getElementById('start-btn')?.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
        console.log("Voice recognition started...");
    } else {
        console.error("Speech recognition not supported.");
    }
});

// Stop voice recognition
document.getElementById('stop-btn')?.addEventListener('click', () => {
    if (recognition) {
        recognition.stop();
        console.log("Voice recognition stopped.");
    }
});

// Medication and duration mappings
const medicationMapping = {
    "saridon": "Saridon - used for headaches",
    "dolo": "Dolo 650 - used for fever",
    "combiflam": "Combiflam - used for pain relief",
    "cetrizine": "Cetrizine - used for allergies",
    "crocin": "Crocin - used for fever",
    "zincovit": "Zincovit - multivitamin tablets"
};

const durationMapping = {
    "after breakfast": "After breakfast",
    "after lunch": "After lunch",
    "after dinner": "After dinner"
};

// Handle input from voice recognition
function handleInput(transcript) {
    if (transcript.includes("stop")) {
        if (recognition) {
            recognition.stop();
            console.log("Voice recognition stopped.");
        }
    } else {
        const patientNameInput = document.getElementById('patient-name');
        const symptomsInput = document.getElementById('symptoms');

        if (patientNameInput && !patientNameInput.value) {
            patientNameInput.value = transcript;
        } else if (symptomsInput && !symptomsInput.value) {
            symptomsInput.value = transcript;
        } else if (matchDuration(transcript)) {
            const duration = matchDuration(transcript);
            durationList.push(duration);
            updateDurationField();
        } else {
            const medication = mapMedication(transcript);
            medicationList.push(medication);
            updateMedicationsField();
        }
    }
}

// Map recognized speech to medications
function mapMedication(transcript) {
    for (let key in medicationMapping) {
        if (transcript.includes(key)) {
            return medicationMapping[key];
        }
    }
    return transcript;  // If no match, return the original transcript
}

// Match recognized speech to known durations
function matchDuration(transcript) {
    for (let key in durationMapping) {
        if (transcript.includes(key)) {
            return durationMapping[key];
        }
    }
    return null;
}

// Update medications field
function updateMedicationsField() {
    let medicationsText = medicationList.map((med, index) => `${index + 1}. ${med}`).join("\n");
    document.getElementById('medications').value = medicationsText;
}

// Update duration field
function updateDurationField() {
    let durationText = durationList.join("\n");
    document.getElementById('duration').value = durationText;
}

// Upload file functionality
document.getElementById('upload-btn')?.addEventListener('click', () => {
    const patientName = document.getElementById('patient-name')?.value || '';
    const symptoms = document.getElementById('symptoms')?.value || '';
    const medications = medicationList.join(", "); // Format medications list
    const duration = durationList.join(", "); // Format duration list
    const layoutLink = document.getElementById('layout-link')?.value || '';

    // Generate PDF invoice using jsPDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Patient Invoice", 105, 20, { align: 'center' }); // Centered title

    doc.setFontSize(12);
    doc.text(`Patient Name: ${patientName}`, 20, 40);
    doc.text(`Symptoms: ${symptoms}`, 20, 60);
    doc.text(`Medications:`, 20, 80);

    // Add medications as a list
    const meds = medications.split(", ");
    meds.forEach((med, index) => {
        doc.text(`${index + 1}. ${med}`, 30, 100 + (index * 10));
    });

    doc.text(`Duration: ${duration}`, 20, 150);
    doc.text(`Layout Link: ${layoutLink}`, 20, 170);

    // Save the PDF
    doc.save("patient_invoice.pdf");

    // Reset fields and medication list
    resetFields();
    console.log("All fields reset.");
});

// Reset fields and medication list
document.getElementById('reset-btn')?.addEventListener('click', resetFields);

function resetFields() {
    document.getElementById('patient-name').value = '';
    document.getElementById('symptoms').value = '';
    document.getElementById('medications').value = '';
    document.getElementById('duration').value = '';
    medicationList = []; // Clear the medication list
    durationList = []; // Clear the duration list
}

// Adjust container size
document.getElementById("adjustBtn")?.addEventListener("click", function() {
    const container = document.getElementById("mainContainer");
    if (container.classList.contains("collapsed")) {
        container.classList.remove("collapsed");
        container.classList.add("expanded");
        this.innerText = "Collapse";
    } else {
        container.classList.remove("expanded");
        container.classList.add("collapsed");
        this.innerText = "Expand";
    }
});

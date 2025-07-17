// Step 1: PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Step 2: Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Step 3: Get DOM elements
const form = document.getElementById('applicationForm');
const submitBtn = document.getElementById('submitBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const successMessage = document.getElementById('successMessage');

// Step 4: Add form submit event listener
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // --- UI Update: Start Loading ---
    submitBtn.disabled = true;
    loadingIndicator.classList.remove('hidden');
    successMessage.classList.add('hidden');

    try {
        // --- File Upload Logic ---
        const fileInput = document.getElementById('bankStatements');
        const file = fileInput.files[0];
        if (!file) {
            throw new Error("Bank statement file is required.");
        }
        
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const storageRef = storage.ref(`bank_statements/${fileName}`);
        
        // Upload the file
        const uploadTask = await storageRef.put(file);
        const downloadURL = await uploadTask.ref.getDownloadURL();

        // --- Data Collection Logic ---
        const formData = {
            personal: {
                fullName: document.getElementById('fullName').value,
                idNumber: document.getElementById('idNumber').value,
                dob: document.getElementById('dob').value,
                gender: document.getElementById('gender').value,
            },
            bank: {
                bankName: document.getElementById('bankName').value,
                accountType: document.getElementById('accountType').value,
                accountNumber: document.getElementById('accountNumber').value,
            },
            finance: {
                monthlyIncome: Number(document.getElementById('monthlyIncome').value),
                monthlyExpenses: Number(document.getElementById('monthlyExpenses').value),
                otherIncome: document.getElementById('otherIncome').value,
            },
            contact: {
                streetAddress: document.getElementById('streetAddress').value,
                city: document.getElementById('city').value,
                province: document.getElementById('province').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
            },
            references: [
                {
                    name: document.getElementById('ref1Name').value,
                    relationship: document.getElementById('ref1Relationship').value,
                    phone: document.getElementById('ref1Phone').value,
                },
                {
                    name: document.getElementById('ref2Name').value,
                    relationship: document.getElementById('ref2Relationship').value,
                    phone: document.getElementById('ref2Phone').value,
                }
            ],
            bankStatementUrl: downloadURL, // Add the file URL
            submittedAt: new Date(),
            status: 'pending' // Default status
        };

        // --- Firestore Submission ---
        await db.collection('applications').add(formData);

        // --- UI Update: Success ---
        form.reset();
        successMessage.classList.remove('hidden');
        console.log("Application successfully submitted!");

    } catch (error) {
        console.error("Error submitting application: ", error);
        alert(`Submission failed: ${error.message}`); // Show error to the user
    } finally {
        // --- UI Update: End Loading ---
        submitBtn.disabled = false;
        loadingIndicator.classList.add('hidden');
    }
});

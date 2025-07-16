document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    // IMPORTANT: Paste your Firebase config object here
    const firebaseConfig = {
  apiKey: "AIzaSyAp7UfFnyoAg3fZWVWt0gwoVoZEJBiZRgs",
  authDomain: "uselesssite-a1dfd.firebaseapp.com",
  projectId: "uselesssite-a1dfd",
  storageBucket: "uselesssite-a1dfd.firebasestorage.app",
  messagingSenderId: "557893414241",
  appId: "1:557893414241:web:ef331a77038ac45565a920"
};

    // --- Initialize Firebase ---
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // --- Element Selection ---
    const signInButton = document.getElementById('sign-in-btn');
    const signOutButton = document.getElementById('sign-out-btn');
    const userInfo = document.getElementById('user-info');
    const addSiteSection = document.getElementById('add-site-section');
    const addSiteForm = document.getElementById('add-site-form');
    const randomSiteButton = document.getElementById('random-site-btn');
    
    // (You can keep your theme and search elements here if you still need them)
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;


    // --- Local State ---
    let websitesFromDB = []; // This will hold websites fetched from Firestore

    // --- Authentication ---
    signInButton.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider).catch(error => console.error("Sign in error:", error));
    });

    signOutButton.addEventListener('click', () => {
        auth.signOut().catch(error => console.error("Sign out error:", error));
    });

    // Observer for authentication state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            signInButton.classList.add('hidden');
            signOutButton.classList.remove('hidden');
            userInfo.textContent = `Hi, ${user.displayName.split(' ')[0]}`;
            userInfo.classList.remove('hidden');
            addSiteSection.classList.remove('hidden');
        } else {
            // User is signed out
            signInButton.classList.remove('hidden');
            signOutButton.classList.add('hidden');
            userInfo.classList.add('hidden');
            addSiteSection.classList.add('hidden');
        }
    });

    // --- Firestore Database ---

    // 1. Fetch all websites from Firestore on page load
    const fetchWebsites = async () => {
        try {
            const snapshot = await db.collection('websites').get();
            websitesFromDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`${websitesFromDB.length} websites loaded from Firestore.`);
        } catch (error) {
            console.error("Error fetching websites:", error);
            alert("Could not load websites from the database.");
        }
    };
    
    // 2. Handle the "Add a Website" form submission
    addSiteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const siteName = document.getElementById('site-name').value.trim();
        const siteUrl = document.getElementById('site-url').value.trim();
        const user = auth.currentUser;

        if (!siteName || !siteUrl || !user) {
            alert("Form is incomplete or you are not signed in.");
            return;
        }

        try {
            await db.collection('websites').add({
                name: siteName,
                url: siteUrl,
                addedBy: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("Website submitted successfully! Thank you.");
            addSiteForm.reset();
            // Optional: Re-fetch websites to include the new one immediately
            fetchWebsites(); 
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to submit website. Please try again.");
        }
    });

    // 3. Update the Random Site Button to use Firestore data
    randomSiteButton.addEventListener('click', () => {
        if (websitesFromDB.length === 0) {
            alert("No websites in the database yet. Try adding one!");
            return;
        }
        const randomIndex = Math.floor(Math.random() * websitesFromDB.length);
        const randomUrl = websitesFromDB[randomIndex].url;
        window.open(randomUrl, '_blank');
    });

    // --- Initial Load ---
    fetchWebsites(); // Fetch websites when the script loads

    // --- Keep your existing theme toggler and search functionality ---
    // (The code for theme and search from the previous step goes here)
    const currentTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', currentTheme);
    themeToggleButton.querySelector('.material-symbols-outlined').textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';

    themeToggleButton.addEventListener('click', () => {
        const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggleButton.querySelector('.material-symbols-outlined').textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
    });

    // NOTE: The search functionality would also need to be updated to use `websitesFromDB`
    // instead of the old hardcoded object if you want it to search the live database.
});

// ============================================================
// DATA PULSE - FIREBASE CONFIGURATION
// ============================================================

// ============================================================
// FIREBASE APP
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";


// ============================================================
// FIREBASE AUTHENTICATION
// ============================================================

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


// ============================================================
// FIRESTORE DATABASE
// ============================================================

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// FIREBASE PROJECT CONFIGURATION
// ============================================================

const firebaseConfig = {

    apiKey: "AIzaSyB08oQPoJqhSstazVJXLAROJRz5L3XlYgs",

    authDomain: "data-pulse-eacae.firebaseapp.com",

    projectId: "data-pulse-eacae",

    storageBucket: "data-pulse-eacae.firebasestorage.app",

    messagingSenderId: "85489561763",

    appId: "1:85489561763:web:8c2fd1c8749f5d6df7cf16"

};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// FIREBASE AUTH
// ============================================================

export const auth = getAuth(app);


// ============================================================
// GOOGLE PROVIDER
// ============================================================

export const googleProvider =
    new GoogleAuthProvider();


// ============================================================
// GOOGLE LOGIN SETTINGS
// ============================================================

googleProvider.setCustomParameters({

    prompt: "select_account"

});


// ============================================================
// FIRESTORE
// ============================================================

export const db = getFirestore(app);


// ============================================================
// DEBUG
// ============================================================

console.log(
    "===================================="
);

console.log(
    "DATA PULSE Firebase Initialized"
);

console.log(
    "Project:",
    firebaseConfig.projectId
);

console.log(
    "Authentication:",
    auth
);

console.log(
    "Firestore:",
    db
);

console.log(
    "===================================="
);
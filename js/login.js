// =====================================================
// DATA PULSE - TEAM DASHBOARD FIREBASE LOGIN
// Firebase Google Authentication
// =====================================================

import {
    auth,
    googleProvider
} from "./firebase-config.js";

import {
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


// =====================================================
// ALLOWED DOMAIN
// =====================================================

const ALLOWED_DOMAIN = "@gitam.edu";


// =====================================================
// ADMIN ACCOUNT
// =====================================================

const ADMIN_EMAIL = "rkolluri@gitam.edu";


// =====================================================
// FIREBASE GOOGLE LOGIN
// =====================================================

async function handleFirebaseLogin() {

    try {

        console.log("Starting Firebase Google Login...");

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

        console.log(
            "Firebase user:",
            user.email
        );


        // =================================================
        // CHECK GITAM EMAIL
        // =================================================

        const email =
            (user.email || "").toLowerCase().trim();


        if (!email.endsWith(ALLOWED_DOMAIN)) {

            alert(
                "Access denied.\n\n" +
                "Only GITAM @gitam.edu accounts are allowed."
            );

            await signOut(auth);

            return;
        }


        // =================================================
        // SAVE USER INFORMATION
        // =================================================

        sessionStorage.setItem(
            "dataPulseFirebaseLoggedIn",
            "true"
        );

        sessionStorage.setItem(
            "dataPulseFirebaseUID",
            user.uid
        );

        sessionStorage.setItem(
            "dataPulseFirebaseEmail",
            email
        );

        sessionStorage.setItem(
            "dataPulseFirebaseName",
            user.displayName || ""
        );

        sessionStorage.setItem(
            "dataPulseFirebasePhoto",
            user.photoURL || ""
        );


        // =================================================
        // ADMIN FLAG
        // =================================================

        sessionStorage.setItem(
            "dataPulseFirebaseAdmin",
            email === ADMIN_EMAIL
                ? "true"
                : "false"
        );


        console.log(
            "Firebase authentication successful."
        );


        // =================================================
        // REDIRECT TO EXISTING DASHBOARD
        // =================================================

        window.location.href =
            "EditableDashboard.html";


    } catch (error) {

        console.error(
            "Firebase login error:",
            error
        );


        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            return;
        }


        alert(
            "Google Login failed.\n\n" +
            (error.message ||
                "Please try again.")
        );

    }

}


// =====================================================
// INITIALIZE LOGIN BUTTON
// =====================================================

function initializeLoginButton() {

    const button =
        document.getElementById(
            "google-signin-button"
        );


    if (!button) {

        console.error(
            "Google Sign-In button not found."
        );

        return;
    }


    // Clear existing content

    button.innerHTML = "";


    // Create Firebase login button

    const loginButton =
        document.createElement("button");


    loginButton.type = "button";

    loginButton.textContent =
        "Sign in with Google";


    loginButton.className =
        "firebase-google-login-button";


    loginButton.addEventListener(
        "click",
        handleFirebaseLogin
    );


    button.appendChild(
        loginButton
    );

}


// =====================================================
// START
// =====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeLoginButton
    );

} else {

    initializeLoginButton();

}

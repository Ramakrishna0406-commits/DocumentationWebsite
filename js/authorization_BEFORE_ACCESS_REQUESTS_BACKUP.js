// ============================================================
// DATA PULSE - AUTHORIZATION
// ============================================================
//
// SAFE SCALABLE AUTHORIZATION MIGRATION
//
// New architecture:
//
// User
//   ↓
// authorizedUsers/{authenticatedEmail}
//   ↓
// role
// permissionSet
// permissions[]
// active
//
// IMPORTANT:
//
// permissionSet does NOT automatically grant all permissions
// for normal USER accounts.
//
// Example:
//
// USER
// permissionSet = TCD
// permissions = [
//     "trainingReports",
//     "cocubesData"
// ]
//
// This user gets ONLY:
//     trainingReports
//     cocubesData
//
// They do NOT automatically receive:
//     presentationRepository
//     gcgcClassesFeedback
//     monthlyForecast
//     gcgcCoursesCalendar
//     trainingFeedbacks
//
// SPECIAL CASES:
//
// ADMIN
//     → full access
//
// permissionSet = FULL_ACCESS
//     → full access
//
// MIGRATION SAFETY:
//
// If authorizedUsers/{email} does not exist yet,
// the existing authorization/{Firebase UID} document
// is used as a temporary legacy fallback.
//
// Existing authorization documents are NEVER modified.
//
// ============================================================


// ============================================================
// FIREBASE
// ============================================================

import {
    auth,
    db
} from "./firebase-config.js";


// ============================================================
// FIREBASE AUTHENTICATION
// ============================================================

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


// ============================================================
// FIRESTORE
// ============================================================

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// DEBUG START
// ============================================================

console.log(
    "===================================="
);

console.log(
    "DATA PULSE Authorization Loaded"
);

console.log(
    "Scalable authorization migration enabled"
);

console.log(
    "===================================="
);


// ============================================================
// GET REQUESTED PERMISSION
// ============================================================
//
// app.js opens:
//
// authorization.html?permission=trainingReports
//
// ============================================================

function getRequestedPermission() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const permission =
        params.get("permission");


    if (permission) {

        console.log(
            "Authorization requested permission:",
            permission
        );

        return permission;
    }


    // --------------------------------------------------------
    // Fallback: sessionStorage
    // --------------------------------------------------------

    const storedPermission =
        sessionStorage.getItem(
            "dataPulseRequestedPermission"
        );


    if (storedPermission) {

        console.log(
            "Authorization permission from sessionStorage:",
            storedPermission
        );

        return storedPermission;
    }


    console.warn(
        "No authorization permission found."
    );


    return null;
}


// ============================================================
// GET REQUESTED PAGE
// ============================================================
//
// app.js already stores:
//
// dataPulseRequestedPage
//
// ============================================================

function getRequestedPage() {

    const requestedPage =
        sessionStorage.getItem(
            "dataPulseRequestedPage"
        );


    if (requestedPage) {

        console.log(
            "Requested protected page:",
            requestedPage
        );

        return requestedPage;
    }


    console.warn(
        "No requested protected page found in sessionStorage."
    );


    return null;
}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "error"
) {

    let messageElement =
        document.getElementById(
            "authorizationMessage"
        );


    // --------------------------------------------------------
    // Existing error element
    // --------------------------------------------------------

    if (!messageElement) {

        messageElement =
            document.getElementById(
                "errorMessage"
            );
    }


    // --------------------------------------------------------
    // Existing message element
    // --------------------------------------------------------

    if (!messageElement) {

        messageElement =
            document.getElementById(
                "message"
            );
    }


    // --------------------------------------------------------
    // Create message element
    // --------------------------------------------------------

    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );

        messageElement.id =
            "authorizationMessage";

        document.body.appendChild(
            messageElement
        );
    }


    messageElement.textContent =
        message;


    messageElement.style.display =
        "block";


    messageElement.style.color =
        type === "success"
            ? "green"
            : "red";
}


// ============================================================
// ACCESS DENIED
// ============================================================

function denyAccess() {

    console.warn(
        "DATA PULSE authorization denied."
    );


    showMessage(
        "User Access Denied",
        "error"
    );
}


// ============================================================
// ACCESS GRANTED
// ============================================================
//
// authorization.html runs inside an iframe.
//
// Therefore:
//
// window.parent.loadPageAfterAuthorization(page)
//
// is used to open the protected page.
//
// ============================================================

function allowAccess(
    requestedPage
) {

    console.log(
        "===================================="
    );

    console.log(
        "AUTHORIZATION SUCCESSFUL"
    );

    console.log(
        "Protected page:",
        requestedPage
    );


    // --------------------------------------------------------
    // Make sure requested page exists
    // --------------------------------------------------------

    if (!requestedPage) {

        console.error(
            "ERROR: Requested protected page is missing."
        );


        showMessage(
            "Protected page information is missing.",
            "error"
        );

        return;
    }


    // --------------------------------------------------------
    // Check parent DATA PULSE window
    // --------------------------------------------------------

    if (
        window.parent &&
        window.parent !== window
    ) {

        console.log(
            "Authorization page is running inside DATA PULSE iframe."
        );


        // ----------------------------------------------------
        // Check parent function
        // ----------------------------------------------------

        if (
            typeof window.parent
                .loadPageAfterAuthorization
                === "function"
        ) {

            console.log(
                "Calling parent.loadPageAfterAuthorization()"
            );


            // ------------------------------------------------
            // Clear authorization state after success
            // ------------------------------------------------

            sessionStorage.removeItem(
                "dataPulseRequestedPermission"
            );

            sessionStorage.removeItem(
                "dataPulseAuthorizationEmail"
            );


            // ------------------------------------------------
            // Keep requested page until parent receives it
            // ------------------------------------------------

            window.parent
                .loadPageAfterAuthorization(
                    requestedPage
                );


            console.log(
                "Protected page navigation requested."
            );


            console.log(
                "===================================="
            );


            return;
        }


        // ----------------------------------------------------
        // Parent function missing
        // ----------------------------------------------------

        console.error(
            "ERROR: parent.loadPageAfterAuthorization() was not found."
        );


        showMessage(
            "Unable to open the protected page.",
            "error"
        );


        return;
    }


    // ========================================================
    // FALLBACK
    // ========================================================

    console.warn(
        "Authorization page is not inside the DATA PULSE iframe."
    );


    showMessage(
        "Authorization completed, but the DATA PULSE page could not be located.",
        "error"
    );
}


// ============================================================
// GRANT ALL ACCESS
// ============================================================
//
// Used only for:
//
// 1. ADMIN role
// 2. FULL_ACCESS permission set
//
// IMPORTANT:
//
// TCD, ACS, CCM do NOT use this function.
//
// ============================================================

function grantFullAccess(
    requestedPage,
    reason
) {

    console.log(
        "FULL ACCESS GRANTED:"
    );

    console.log(
        reason
    );


    allowAccess(
        requestedPage
    );
}


// ============================================================
// CHECK NEW SCALABLE AUTHORIZATION
// ============================================================
//
// Reads:
//
// authorizedUsers/{authenticatedEmail}
//
// Fields:
//
// active
// role
// permissionSet
// permissions[]
//
// ============================================================

async function checkNewAuthorization(
    user,
    requestedPermission,
    requestedPage
) {

    // ========================================================
    // 1. GET AUTHENTICATED EMAIL
    // ========================================================

    const email =
        user.email;


    if (!email) {

        console.error(
            "Authenticated Firebase user has no email."
        );


        denyAccess();


        return {
            exists: false,
            granted: false
        };
    }


    // ========================================================
    // 2. NORMALIZE EMAIL
    // ========================================================

    const normalizedEmail =
        email
            .trim()
            .toLowerCase();


    console.log(
        "Checking new authorization record:"
    );

    console.log(
        "authorizedUsers/" + normalizedEmail
    );


    // ========================================================
    // 3. BUILD NEW AUTHORIZATION REFERENCE
    // ========================================================

    const authorizedUserRef =
        doc(
            db,
            "authorizedUsers",
            normalizedEmail
        );


    // ========================================================
    // 4. READ NEW AUTHORIZATION DOCUMENT
    // ========================================================

    const authorizedUserSnapshot =
        await getDoc(
            authorizedUserRef
        );


    // ========================================================
    // 5. NEW DOCUMENT DOES NOT EXIST
    // ========================================================
    //
    // IMPORTANT:
    //
    // We return exists:false so the caller can safely use
    // the legacy authorization/{UID} document.
    //
    // Existing users can therefore migrate gradually.
    //
    // ========================================================

    if (
        !authorizedUserSnapshot.exists()
    ) {

        console.warn(
            "New authorizedUsers document not found."
        );

        console.warn(
            "Expected path:",
            "authorizedUsers/" + normalizedEmail
        );


        return {
            exists: false,
            granted: false
        };
    }


    // ========================================================
    // 6. READ NEW AUTHORIZATION DATA
    // ========================================================

    const userData =
        authorizedUserSnapshot.data();


    console.log(
        "New authorization data:",
        userData
    );


    // ========================================================
    // 7. VERIFY EMAIL
    // ========================================================

    if (
        userData.email &&
        userData.email
            .trim()
            .toLowerCase()
            !== normalizedEmail
    ) {

        console.error(
            "New authorization email mismatch."
        );


        console.error(
            "Firebase email:",
            normalizedEmail
        );


        console.error(
            "Firestore email:",
            userData.email
        );


        denyAccess();


        return {
            exists: true,
            granted: false
        };
    }


    // ========================================================
    // 8. VERIFY ACTIVE STATUS
    // ========================================================

    if (
        userData.active !== true
    ) {

        console.warn(
            "USER ACCOUNT IS NOT ACTIVE."
        );


        console.warn(
            "Authorization denied."
        );


        denyAccess();


        return {
            exists: true,
            granted: false
        };
    }


    // ========================================================
    // 9. READ ROLE
    // ========================================================

    const role =
        typeof userData.role === "string"
            ? userData.role.trim().toUpperCase()
            : "";


    console.log(
        "User role:",
        role
    );


    // ========================================================
    // 10. ADMIN ACCESS
    // ========================================================
    //
    // ADMIN is a special system role.
    //
    // This preserves the existing admin behavior without
    // requiring us to modify the existing admin document.
    //
    // ========================================================

    if (
        role === "ADMIN"
    ) {

        grantFullAccess(
            requestedPage,
            "Role = ADMIN"
        );


        return {
            exists: true,
            granted: true
        };
    }


    // ========================================================
    // 11. READ PERMISSION SET
    // ========================================================

    const permissionSet =
        typeof userData.permissionSet === "string"
            ? userData.permissionSet.trim().toUpperCase()
            : "";


    console.log(
        "User permission set:",
        permissionSet
    );


    // ========================================================
    // 12. FULL ACCESS PERMISSION SET
    // ========================================================
    //
    // FULL_ACCESS is intentionally different from:
    //
    // TCD
    // ACS
    // CCM
    //
    // Only FULL_ACCESS grants all permissions.
    //
    // ========================================================

    if (
        permissionSet === "FULL_ACCESS"
    ) {

        grantFullAccess(
            requestedPage,
            "Permission Set = FULL_ACCESS"
        );


        return {
            exists: true,
            granted: true
        };
    }


    // ========================================================
    // 13. READ USER-SPECIFIC PERMISSIONS
    // ========================================================

    const permissions =
        Array.isArray(
            userData.permissions
        )
            ? userData.permissions
            : [];


    console.log(
        "User-specific permissions:",
        permissions
    );


    // ========================================================
    // 14. NORMALIZE PERMISSIONS
    // ========================================================

    const normalizedPermissions =
        permissions
            .filter(
                permission =>
                    typeof permission === "string"
            )
            .map(
                permission =>
                    permission.trim()
            );


    console.log(
        "Normalized user-specific permissions:",
        normalizedPermissions
    );


    // ========================================================
    // 15. CHECK REQUESTED PERMISSION
    // ========================================================
    //
    // IMPORTANT:
    //
    // We check permissions[] directly.
    //
    // permissionSet = TCD does NOT automatically grant
    // every TCD permission.
    //
    // ========================================================

    const hasPermission =
        normalizedPermissions.includes(
            requestedPermission
        );


    console.log(
        "Requested permission:",
        requestedPermission
    );


    console.log(
        "User has requested permission:",
        hasPermission
    );


    // ========================================================
    // 16. PERMISSION GRANTED
    // ========================================================

    if (
        hasPermission
    ) {

        console.log(
            "USER-SPECIFIC PERMISSION = TRUE"
        );


        console.log(
            "Authorization granted."
        );


        allowAccess(
            requestedPage
        );


        return {
            exists: true,
            granted: true
        };
    }


    // ========================================================
    // 17. PERMISSION DENIED
    // ========================================================

    console.warn(
        "Requested permission is not present in permissions[]."
    );


    console.warn(
        "Permission denied:",
        requestedPermission
    );


    console.warn(
        "Available user-specific permissions:",
        normalizedPermissions
    );


    denyAccess();


    return {
        exists: true,
        granted: false
    };
}


// ============================================================
// CHECK LEGACY AUTHORIZATION
// ============================================================
//
// This is a TEMPORARY migration fallback.
//
// It is used only when:
//
// authorizedUsers/{email}
//
// does not exist.
//
// IMPORTANT:
//
// Existing authorization/{UID} documents are READ ONLY.
//
// Nothing is written, updated, deleted, or replaced.
//
// ============================================================

async function checkLegacyAuthorization(
    user,
    requestedPermission,
    requestedPage
) {

    try {

        // ====================================================
        // 1. GET FIREBASE UID
        // ====================================================

        const uid =
            user.uid;


        console.log(
            "Checking legacy authorization document:"
        );


        console.log(
            "authorization/" + uid
        );


        // ====================================================
        // 2. BUILD LEGACY REFERENCE
        // ====================================================

        const authorizationRef =
            doc(
                db,
                "authorization",
                uid
            );


        // ====================================================
        // 3. READ LEGACY DOCUMENT
        // ====================================================

        const authorizationSnapshot =
            await getDoc(
                authorizationRef
            );


        // ====================================================
        // 4. DOCUMENT DOES NOT EXIST
        // ====================================================

        if (
            !authorizationSnapshot.exists()
        ) {

            console.error(
                "Legacy authorization document not found."
            );


            console.error(
                "Expected path:",
                "authorization/" + uid
            );


            denyAccess();


            return;
        }


        // ====================================================
        // 5. READ LEGACY DATA
        // ====================================================

        const authorizationData =
            authorizationSnapshot.data();


        console.log(
            "Legacy authorization data:",
            authorizationData
        );


        // ====================================================
        // 6. VERIFY EMAIL
        // ====================================================

        const email =
            user.email;


        if (
            authorizationData.email &&
            email &&
            authorizationData.email
                .toLowerCase()
                !== email.toLowerCase()
        ) {

            console.error(
                "Legacy authorization email mismatch."
            );


            denyAccess();


            return;
        }


        // ====================================================
        // 7. LEGACY ADMIN ACCESS
        // ====================================================

        if (
            authorizationData.admin === true
        ) {

            console.log(
                "LEGACY ADMIN ACCESS = TRUE"
            );


            grantFullAccess(
                requestedPage,
                "Legacy authorization admin = true"
            );


            return;
        }


        // ====================================================
        // 8. LEGACY FULL ACCESS
        // ====================================================

        if (
            authorizationData.fullAccess === true
        ) {

            console.log(
                "LEGACY FULL ACCESS = TRUE"
            );


            grantFullAccess(
                requestedPage,
                "Legacy authorization fullAccess = true"
            );


            return;
        }


        // ====================================================
        // 9. LEGACY PAGE-SPECIFIC PERMISSION
        // ====================================================

        const permission =
            authorizationData[
                requestedPermission
            ];


        console.log(
            "Legacy requested permission field:",
            requestedPermission
        );


        console.log(
            "Legacy permission value:",
            permission
        );


        // ====================================================
        // 10. LEGACY PERMISSION = TRUE
        // ====================================================

        if (
            permission === true ||
            permission === "YES" ||
            permission === "yes"
        ) {

            console.log(
                "LEGACY PAGE-SPECIFIC ACCESS = TRUE"
            );


            allowAccess(
                requestedPage
            );


            return;
        }


        // ====================================================
        // 11. LEGACY PERMISSION = FALSE
        // ====================================================

        if (
            permission === false ||
            permission === "NO" ||
            permission === "no"
        ) {

            console.warn(
                "LEGACY PAGE-SPECIFIC ACCESS = FALSE"
            );


            denyAccess();


            return;
        }


        // ====================================================
        // 12. LEGACY PERMISSION NOT FOUND
        // ====================================================

        console.warn(
            "Legacy permission field was not found:"
        );


        console.warn(
            requestedPermission
        );


        console.warn(
            "Available legacy Firestore fields:",
            Object.keys(
                authorizationData
            )
        );


        denyAccess();

    }
    catch (error) {

        console.error(
            "Legacy authorization error:",
            error
        );


        console.error(
            "Error code:",
            error.code
        );


        console.error(
            "Error message:",
            error.message
        );


        showMessage(
            "Authorization check failed. Please try again.",
            "error"
        );
    }
}


// ============================================================
// MAIN AUTHORIZATION CHECK
// ============================================================
//
// Priority:
//
// 1. Firebase Authentication
// 2. requested permission
// 3. requested page
// 4. authorizedUsers/{email}
// 5. If new document does not exist:
//       authorization/{UID} legacy fallback
//
// ============================================================

async function checkAuthorization(
    user
) {

    try {

        // ====================================================
        // 1. VERIFY AUTHENTICATED USER
        // ====================================================

        if (!user) {

            console.error(
                "No Firebase authenticated user."
            );


            showMessage(
                "Please sign in with your GITAM Google account.",
                "error"
            );


            return;
        }


        console.log(
            "Firebase user detected:",
            user.email
        );


        // ====================================================
        // 2. VERIFY EMAIL
        // ====================================================

        const email =
            user.email;


        if (!email) {

            console.error(
                "Authenticated Firebase user has no email."
            );


            denyAccess();


            return;
        }


        console.log(
            "Authenticated Firebase email:",
            email
        );


        // ====================================================
        // 3. VERIFY GITAM EMAIL
        // ====================================================
        //
        // Firebase Authentication is already configured for
        // GITAM accounts, but this additional check keeps the
        // authorization layer defensive.
        //
        // ====================================================

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        if (
            !normalizedEmail.endsWith(
                "@gitam.edu"
            )
        ) {

            console.warn(
                "Authenticated account is not a GITAM account."
            );


            denyAccess();


            return;
        }


        // ====================================================
        // 4. GET REQUESTED PERMISSION
        // ====================================================

        const requestedPermission =
            getRequestedPermission();


        if (!requestedPermission) {

            console.error(
                "Requested authorization permission is missing."
            );


            showMessage(
                "Authorization information is missing.",
                "error"
            );


            return;
        }


        // ====================================================
        // 5. GET REQUESTED PAGE
        // ====================================================

        const requestedPage =
            getRequestedPage();


        if (!requestedPage) {

            console.error(
                "Requested protected page is missing."
            );


            showMessage(
                "Protected page information is missing.",
                "error"
            );


            return;
        }


        // ====================================================
        // 6. LOG REQUEST
        // ====================================================

        console.log(
            "===================================="
        );


        console.log(
            "AUTHORIZATION REQUEST"
        );


        console.log(
            "Email:",
            normalizedEmail
        );


        console.log(
            "Requested permission:",
            requestedPermission
        );


        console.log(
            "Requested page:",
            requestedPage
        );


        console.log(
            "===================================="
        );


        // ====================================================
        // 7. CHECK NEW SCALABLE AUTHORIZATION
        // ====================================================

        const newAuthorizationResult =
            await checkNewAuthorization(
                user,
                requestedPermission,
                requestedPage
            );


        // ====================================================
        // 8. NEW DOCUMENT EXISTS
        // ====================================================
        //
        // If the new authorizedUsers document exists,
        // its decision is final.
        //
        // We DO NOT fall back to the old authorization
        // document when the new document exists.
        //
        // This is important because otherwise an old TRUE
        // permission could accidentally bypass the new
        // user-specific permissions[] model.
        //
        // ====================================================

        if (
            newAuthorizationResult.exists === true
        ) {

            console.log(
                "New scalable authorization document used."
            );


            return;
        }


        // ====================================================
        // 9. NEW DOCUMENT DOES NOT EXIST
        // ====================================================
        //
        // Temporary migration fallback.
        //
        // Existing users can continue working until their
        // authorizedUsers records are migrated.
        //
        // ====================================================

        console.warn(
            "No new authorizedUsers record."
        );


        console.warn(
            "Using legacy authorization document as migration fallback."
        );


        await checkLegacyAuthorization(
            user,
            requestedPermission,
            requestedPage
        );

    }
    catch (error) {

        // ====================================================
        // ERROR
        // ====================================================

        console.error(
            "DATA PULSE authorization error:",
            error
        );


        console.error(
            "Error code:",
            error.code
        );


        console.error(
            "Error message:",
            error.message
        );


        showMessage(
            "Authorization check failed. Please try again.",
            "error"
        );
    }
}


// ============================================================
// FIREBASE AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "Firebase authentication state changed."
        );


        if (!user) {

            console.warn(
                "No authenticated Firebase user."
            );


            showMessage(
                "Please sign in with your GITAM Google account.",
                "error"
            );


            return;
        }


        console.log(
            "Firebase user detected:",
            user.email
        );


        await checkAuthorization(
            user
        );
    }
);
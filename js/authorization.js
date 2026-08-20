// ============================================================
// DATA PULSE - AUTHORIZATION
// ============================================================
//
// SAFE SCALABLE AUTHORIZATION
//
// Architecture:
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
// ACCESS REQUEST FLOW:
//
// User requests protected page
//   ↓
// Authorization checked
//   ↓
// If permission denied
//   ↓
// Check for existing PENDING request
//   ↓
// If none exists
//   ↓
// Create accessRequests/{autoId}
//
// Access Request fields:
//
// email
// uid
// permission
// page
// status
// createdAt
//
// SPECIAL CASES:
//
// ADMIN
//     → full access
//
// permissionSet = FULL_ACCESS
//     → full access
//
// Normal users
//     → ONLY permissions[] explicitly assigned
//
// MIGRATION SAFETY:
//
// If authorizedUsers/{email} does not exist,
// authorization/{Firebase UID} is used as temporary
// legacy fallback.
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
    getDoc,
    collection,
    addDoc,
    query,
    where,
    limit,
    getDocs,
    serverTimestamp
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
    "Scalable authorization enabled"
);

console.log(
    "Automatic Access Requests enabled"
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
// ACCESS REQUEST MESSAGE
// ============================================================

function showAccessRequestMessage(
    message
) {

    showMessage(
        message,
        "success"
    );
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
// CREATE ACCESS REQUEST
// ============================================================
//
// Creates an Access Request only after authorization has
// determined that the authenticated GITAM user does not have
// the requested permission.
//
// Duplicate PENDING requests are prevented.
//
// ============================================================

async function createAccessRequest(
    user,
    requestedPermission,
    requestedPage
) {

    try {

        // ====================================================
        // 1. VERIFY USER
        // ====================================================

        if (!user) {

            console.warn(
                "Cannot create Access Request: no authenticated user."
            );

            return {
                created: false,
                reason: "NO_USER"
            };
        }


        // ====================================================
        // 2. GET EMAIL
        // ====================================================

        const email =
            user.email;


        if (!email) {

            console.warn(
                "Cannot create Access Request: user email missing."
            );

            return {
                created: false,
                reason: "NO_EMAIL"
            };
        }


        // ====================================================
        // 3. NORMALIZE EMAIL
        // ====================================================

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        // ====================================================
        // 4. VERIFY GITAM ACCOUNT
        // ====================================================

        if (
            !normalizedEmail.endsWith(
                "@gitam.edu"
            )
        ) {

            console.warn(
                "Access Request blocked: non-GITAM account."
            );

            return {
                created: false,
                reason: "NON_GITAM_ACCOUNT"
            };
        }


        // ====================================================
        // 5. VERIFY PERMISSION
        // ====================================================

        if (
            typeof requestedPermission !== "string"
            ||
            !requestedPermission.trim()
        ) {

            console.warn(
                "Cannot create Access Request: permission missing."
            );

            return {
                created: false,
                reason: "NO_PERMISSION"
            };
        }


        // ====================================================
        // 6. VERIFY PAGE
        // ====================================================

        if (
            typeof requestedPage !== "string"
            ||
            !requestedPage.trim()
        ) {

            console.warn(
                "Cannot create Access Request: page missing."
            );

            return {
                created: false,
                reason: "NO_PAGE"
            };
        }


        const permission =
            requestedPermission.trim();


        const page =
            requestedPage.trim();


        // ====================================================
        // 7. CHECK EXISTING PENDING REQUEST
        // ====================================================
        //
        // This prevents the same user from generating many
        // identical PENDING requests by repeatedly refreshing
        // the authorization page.
        //
        // ====================================================

        const existingRequestQuery =
            query(
                collection(
                    db,
                    "accessRequests"
                ),
                where(
                    "uid",
                    "==",
                    user.uid
                ),
                where(
                    "permission",
                    "==",
                    permission
                ),
                where(
                    "page",
                    "==",
                    page
                ),
                where(
                    "status",
                    "==",
                    "PENDING"
                ),
                limit(1)
            );


        const existingRequestSnapshot =
            await getDocs(
                existingRequestQuery
            );


        // ====================================================
        // 8. EXISTING REQUEST FOUND
        // ====================================================

        if (
            !existingRequestSnapshot.empty
        ) {

            console.log(
                "Existing PENDING Access Request found."
            );


            console.log(
                "No duplicate request created."
            );


            return {
                created: false,
                alreadyPending: true
            };
        }


        // ====================================================
        // 9. CREATE NEW ACCESS REQUEST
        // ====================================================

        const accessRequestData = {

            email:
                normalizedEmail,

            uid:
                user.uid,

            permission:
                permission,

            page:
                page,

            status:
                "PENDING",

            createdAt:
                serverTimestamp()
        };


        console.log(
            "Creating Access Request:"
        );

        console.log(
            accessRequestData
        );


        const accessRequestReference =
            await addDoc(
                collection(
                    db,
                    "accessRequests"
                ),
                accessRequestData
            );


        console.log(
            "Access Request created successfully."
        );


        console.log(
            "Access Request ID:",
            accessRequestReference.id
        );


        return {
            created: true,
            alreadyPending: false,
            id: accessRequestReference.id
        };

    }
    catch (error) {

        console.error(
            "Access Request creation failed:",
            error
        );


        console.error(
            "Access Request error code:",
            error.code
        );


        console.error(
            "Access Request error message:",
            error.message
        );


        return {
            created: false,
            reason: "ERROR",
            error: error
        };
    }
}


// ============================================================
// HANDLE ACCESS DENIED + REQUEST
// ============================================================
//
// This function keeps the existing "User Access Denied"
// behavior while additionally creating the Access Request.
//
// ============================================================

async function handleDeniedAccess(
    user,
    requestedPermission,
    requestedPage
) {

    // --------------------------------------------------------
    // First show normal denial
    // --------------------------------------------------------

    denyAccess();


    // --------------------------------------------------------
    // Create Access Request
    // --------------------------------------------------------

    const requestResult =
        await createAccessRequest(
            user,
            requestedPermission,
            requestedPage
        );


    // --------------------------------------------------------
    // Request created
    // --------------------------------------------------------

    if (
        requestResult.created === true
    ) {

        showAccessRequestMessage(
            "User Access Denied. Access request submitted to Admin."
        );


        return requestResult;
    }


    // --------------------------------------------------------
    // Existing pending request
    // --------------------------------------------------------

    if (
        requestResult.alreadyPending === true
    ) {

        showAccessRequestMessage(
            "User Access Denied. Your access request is already pending."
        );


        return requestResult;
    }


    // --------------------------------------------------------
    // Request could not be created
    // --------------------------------------------------------
    //
    // Keep access denied as the final state.
    //
    // --------------------------------------------------------

    console.warn(
        "Access Request was not created."
    );


    return requestResult;
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


        await handleDeniedAccess(
            user,
            requestedPermission,
            requestedPage
        );


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


        await handleDeniedAccess(
            user,
            requestedPermission,
            requestedPage
        );


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


    await handleDeniedAccess(
        user,
        requestedPermission,
        requestedPage
    );


    return {
        exists: true,
        granted: false
    };
}


// ============================================================
// CHECK LEGACY AUTHORIZATION
// ============================================================
//
// TEMPORARY MIGRATION FALLBACK.
//
// Used only when:
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


            await handleDeniedAccess(
                user,
                requestedPermission,
                requestedPage
            );


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


            await handleDeniedAccess(
                user,
                requestedPermission,
                requestedPage
            );


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


            await handleDeniedAccess(
                user,
                requestedPermission,
                requestedPage
            );


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


        await handleDeniedAccess(
            user,
            requestedPermission,
            requestedPage
        );

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
// 2. Requested permission
// 3. Requested page
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
        // No legacy fallback is performed.
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
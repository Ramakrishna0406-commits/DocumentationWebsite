// ============================================================
// DATA PULSE - app.js
// ============================================================
// MENU PAGE AUTHORIZATION
//
// Firebase / Google authentication remains unchanged.
//
// Flow:
//
// Sidebar
//    â†“
// loadPage(page)
//    â†“
// Identify required permission
//    â†“
// Save requested page
//    â†“
// Save authenticated Google email
//    â†“
// Open authorization.html?permission=...
//    â†“
// authorization.js verifies:
//      Google email
//      secret
//      requested permission
//      YES / NO
//
// YES â†’ protected report opens
// NO  â†’ User Access Denied
//
// ============================================================


// ============================================================
// LOAD TREE MENU WHEN PAGE OPENS
// ============================================================

window.onload = function () {
    loadTree();
};


// ============================================================
// PAGE â†’ FIRESTORE PERMISSION MAPPING
// ============================================================
//
// IMPORTANT:
// The permission values below MUST match the existing
// Firestore authorization document exactly.
//
// ============================================================

const DATA_PULSE_PAGE_PERMISSIONS = {

    // --------------------------------------------------------
    // TCD
    // --------------------------------------------------------

    "pages/Training_Reports.html":
        "trainingReports",

    "pages/Training_Reports_Years.html":
        "trainingReports",

    "pages/PresentationRepository.html":
        "presentationRepository",

    "pages/GCGCFeedbackReports.html":
        "gcgcClassesFeedback",

    "pages/MonthlyForecastReports.html":
        "monthlyForecast",

    "pages/GCGC_Courses_calendar.html":
        "gcgcCoursesCalendar",

    "pages/CocubesData.html":
        "cocubesData",

    "pages/TrainingFeedbacksReports.html":
        "trainingFeedbacks",


    // --------------------------------------------------------
    // ACS
    // --------------------------------------------------------

    "pages/higher-studies-achievements.html":
        "ACS",


    // --------------------------------------------------------
    // CCM
    // --------------------------------------------------------

    "pages/CCM.html":
        "CCM"
};


// ============================================================
// GET REQUIRED PERMISSION FOR REQUESTED PAGE
// ============================================================

function getRequiredPermission(page) {

    if (!page) {
        return null;
    }

    return DATA_PULSE_PAGE_PERMISSIONS[page] || null;
}


// ============================================================
// LOAD PAGE
// ============================================================
//
// Every protected sidebar page comes through this function.
//
// ============================================================

function loadPage(page) {

    console.log(
        "===================================="
    );

    console.log(
        "DATA PULSE PAGE REQUEST"
    );

    console.log(
        "Requested page:",
        page
    );


    // --------------------------------------------------------
    // Check content area
    // --------------------------------------------------------

    const contentArea =
        document.getElementById(
            "contentArea"
        );


    if (!contentArea) {

        console.error(
            "ERROR: contentArea was not found."
        );

        return;
    }


    // --------------------------------------------------------
    // Validate requested page
    // --------------------------------------------------------

    if (!page) {

        console.error(
            "ERROR: Requested page is empty."
        );

        contentArea.innerHTML = `
            <div
                style="
                    padding:40px;
                    text-align:center;
                    color:#d00000;
                    font-family:Arial,Helvetica,sans-serif;
                "
            >
                <h2>
                    Page Not Found
                </h2>

                <p>
                    No protected page was specified.
                </p>
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // Get required permission
    // --------------------------------------------------------

    const requiredPermission =
        getRequiredPermission(page);


    console.log(
        "Required permission:",
        requiredPermission
    );


    // --------------------------------------------------------
    // Make sure page is configured
    // --------------------------------------------------------

    if (!requiredPermission) {

        console.error(
            "ERROR: No authorization permission mapping found for:",
            page
        );

        contentArea.innerHTML = `
            <div
                style="
                    padding:40px;
                    text-align:center;
                    color:#d00000;
                    font-family:Arial,Helvetica,sans-serif;
                "
            >
                <h2>
                    Authorization Configuration Error
                </h2>

                <p>
                    This page has not been configured for authorization.
                </p>
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // Get Firebase / Google logged-in email
    // --------------------------------------------------------

    const userEmail =
        (
            localStorage.getItem(
                "dataPulseUserEmail"
            )
            || ""
        )
        .trim()
        .toLowerCase();


    console.log(
        "Authenticated Google email:",
        userEmail
    );


    // --------------------------------------------------------
    // Make sure user is authenticated
    // --------------------------------------------------------

    if (!userEmail) {

        console.error(
            "No authenticated Google email was found."
        );

        contentArea.innerHTML = `
            <div
                style="
                    padding:40px;
                    text-align:center;
                    color:#d00000;
                    font-family:Arial,Helvetica,sans-serif;
                "
            >

                <h2>
                    Authentication Required
                </h2>

                <p>
                    Please sign in with your GITAM Google account.
                </p>

            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // Save requested page
    // --------------------------------------------------------

    sessionStorage.setItem(
        "dataPulseRequestedPage",
        page
    );


    // --------------------------------------------------------
    // Save required permission
    // --------------------------------------------------------

    sessionStorage.setItem(
        "dataPulseRequestedPermission",
        requiredPermission
    );


    // --------------------------------------------------------
    // Save authenticated email
    // --------------------------------------------------------

    sessionStorage.setItem(
        "dataPulseAuthorizationEmail",
        userEmail
    );


    console.log(
        "Requested page saved:",
        page
    );

    console.log(
        "Required permission saved:",
        requiredPermission
    );

    console.log(
        "Authorization email saved:",
        userEmail
    );


    // --------------------------------------------------------
    // Build authorization URL
    // --------------------------------------------------------

    const authorizationUrl =
        "pages/authorization.html?permission=" +
        encodeURIComponent(
            requiredPermission
        );


    console.log(
        "Authorization URL:",
        authorizationUrl
    );


    // --------------------------------------------------------
    // Show authorization page
    // --------------------------------------------------------

    contentArea.innerHTML = `
        <iframe
            src="${authorizationUrl}"
            width="100%"
            height="900"
            style="
                border:none;
                background:#ffffff;
                overflow:auto;
            "
        ></iframe>
    `;


    console.log(
        "DATA PULSE authorization page displayed."
    );

    console.log(
        "===================================="
    );
}


// ============================================================
// LOAD PAGE AFTER AUTHORIZATION
// ============================================================
//
// This function is called by authorization.js only after
// permission has been successfully verified.
//
// ============================================================

function loadPageAfterAuthorization(page) {

    console.log(
        "===================================="
    );

    console.log(
        "AUTHORIZATION SUCCESSFUL"
    );

    console.log(
        "Opening protected page:",
        page
    );


    // --------------------------------------------------------
    // Validate page
    // --------------------------------------------------------

    if (!page) {

        console.error(
            "ERROR: Protected page is empty."
        );

        return;
    }


    // --------------------------------------------------------
    // Find content area
    // --------------------------------------------------------

    const contentArea =
        document.getElementById(
            "contentArea"
        );


    if (!contentArea) {

        console.error(
            "ERROR: contentArea was not found."
        );

        return;
    }


    // --------------------------------------------------------
    // Load protected page
    // --------------------------------------------------------

    contentArea.innerHTML = `
        <iframe
            src="${page}"
            width="100%"
            height="900"
            style="
                border:none;
                background:#ffffff;
                overflow:auto;
            "
        ></iframe>
    `;


    console.log(
        "Protected page loaded."
    );

    console.log(
        "===================================="
    );
}


// ============================================================
// END OF app.js
// ============================================================


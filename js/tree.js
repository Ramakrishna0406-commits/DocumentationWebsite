// ============================================================
// DATA PULSE - TREE MENU
// ============================================================
//
// IMPORTANT AUTHORIZATION ARCHITECTURE
//
// Google Authentication
//        ↓
// tree.js
//        ↓
// app.js
//        ↓
// authorization.html
//        ↓
// authorization.js
//        ↓
// Firebase Authentication + Firestore
//        ↓
// YES → Open page
// NO  → User Access Denied
//
// tree.js DOES NOT perform authorization.
// tree.js only handles the menu and sends the selected page
// to app.js.
//
// ============================================================


// ============================================================
// ADMIN EMAIL
// ============================================================

const ADMIN_EMAIL = "rkolluri@gitam.edu";


// ============================================================
// LOAD TREE MENU
// ============================================================

async function loadTree() {

    try {

        console.log(
            "DATA PULSE tree menu loading..."
        );


        // --------------------------------------------------------
        // Load menu.json
        // --------------------------------------------------------

        const response =
            await fetch(
                "data/menu.json"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load data/menu.json. HTTP status: " +
                response.status
            );

        }


        const menu =
            await response.json();


        // --------------------------------------------------------
        // Find tree container
        // --------------------------------------------------------

        const tree =
            document.getElementById(
                "treeMenu"
            );


        if (!tree) {

            console.error(
                "ERROR: treeMenu element not found."
            );

            return;

        }


        // --------------------------------------------------------
        // Clear existing menu
        // --------------------------------------------------------

        tree.innerHTML = "";


        // --------------------------------------------------------
        // Create normal menu
        // --------------------------------------------------------

        if (
            Array.isArray(menu)
        ) {

            menu.forEach(
                function(item) {

                    tree.appendChild(
                        createNode(item)
                    );

                }
            );

        }


        // --------------------------------------------------------
        // Add ADMIN ONLY Login History
        // --------------------------------------------------------

        addAdminLoginHistory(
            tree
        );


        console.log(
            "DATA PULSE tree menu loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Error loading DATA PULSE menu:",
            error
        );

    }

}


// ============================================================
// CREATE TREE NODE
// ============================================================

function createNode(item) {

    const li =
        document.createElement(
            "li"
        );


    // ========================================================
    // FOLDER
    // ========================================================

    if (
        item.children
    ) {

        const folder =
            document.createElement(
                "div"
            );


        folder.className =
            "folder";


        folder.textContent =
            item.title;


        const childList =
            document.createElement(
                "ul"
            );


        childList.className =
            "children";


        // ----------------------------------------------------
        // Create children
        // ----------------------------------------------------

        item.children.forEach(
            function(child) {

                childList.appendChild(
                    createNode(child)
                );

            }
        );


        // ----------------------------------------------------
        // Folder mouse enter
        // ----------------------------------------------------

        folder.addEventListener(
            "mouseenter",
            function() {

                document
                    .querySelectorAll(
                        "#treeMenu > li > .children"
                    )
                    .forEach(
                        function(list) {

                            list.classList.remove(
                                "show"
                            );

                        }
                    );


                document
                    .querySelectorAll(
                        "#treeMenu > li > .folder"
                    )
                    .forEach(
                        function(folderElement) {

                            folderElement.classList.remove(
                                "open"
                            );

                        }
                    );


                childList.classList.add(
                    "show"
                );


                folder.classList.add(
                    "open"
                );

            }
        );


        // ----------------------------------------------------
        // Child list mouse enter
        // ----------------------------------------------------

        childList.addEventListener(
            "mouseenter",
            function() {

                childList.classList.add(
                    "show"
                );


                folder.classList.add(
                    "open"
                );

            }
        );


        // ----------------------------------------------------
        // Folder mouse leave
        // ----------------------------------------------------

        li.addEventListener(
            "mouseleave",
            function() {

                childList.classList.remove(
                    "show"
                );


                folder.classList.remove(
                    "open"
                );

            }
        );


        li.appendChild(
            folder
        );


        li.appendChild(
            childList
        );

    }


    // ========================================================
    // PAGE
    // ========================================================

    else {

        const page =
            document.createElement(
                "div"
            );


        page.className =
            "page";


        page.textContent =
            item.title;


        // ----------------------------------------------------
        // PAGE CLICK
        // ----------------------------------------------------

        page.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                console.log(
                    "===================================="
                );


                console.log(
                    "DATA PULSE MENU CLICK"
                );


                console.log(
                    "Menu title:",
                    item.title
                );


                console.log(
                    "Requested page:",
                    item.page
                );


                console.log(
                    "===================================="
                );


                // ------------------------------------------------
                // Check that app.js loadPage() exists
                // ------------------------------------------------

                if (
                    typeof window.loadPage !==
                    "function"
                ) {

                    console.error(
                        "ERROR: loadPage() from app.js was not found."
                    );

                    return;

                }


                // ------------------------------------------------
                // Mark selected menu item active
                // ------------------------------------------------

                document
                    .querySelectorAll(
                        ".page"
                    )
                    .forEach(
                        function(pageElement) {

                            pageElement.classList.remove(
                                "active"
                            );

                        }
                    );


                page.classList.add(
                    "active"
                );


                // ------------------------------------------------
                // IMPORTANT:
                //
                // Do NOT check permissions here.
                //
                // app.js will:
                //
                // 1. Get Firebase authenticated email
                // 2. Find required Firestore permission
                // 3. Save requested page
                // 4. Open authorization.html
                //
                // ------------------------------------------------

                window.loadPage(
                    item.page
                );

            }
        );


        li.appendChild(
            page
        );

    }


    return li;

}


// ============================================================
// ADMIN LOGIN HISTORY + AUTHORIZATION MANAGEMENT
// ============================================================
//
// These menu items are visible only to:
// rkolluri@gitam.edu
//
// This is a menu visibility feature.
// Protected report authorization is handled separately.
//
// ============================================================

function addAdminLoginHistory(tree) {

    // --------------------------------------------------------
    // Import Firebase configuration
    // --------------------------------------------------------

    import(
        "./firebase-config.js"
    )

    .then(
        function(firebaseConfig) {

            // ------------------------------------------------
            // Import Firebase Auth listener
            // ------------------------------------------------

            import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"
            )

            .then(
                function(firebaseAuth) {

                    firebaseAuth.onAuthStateChanged(

                        firebaseConfig.auth,

                        function(user) {

                            // --------------------------------
                            // No authenticated user
                            // --------------------------------

                            if (!user) {

                                return;

                            }


                            // --------------------------------
                            // Get email
                            // --------------------------------

                            const email =
                                (
                                    user.email ||
                                    ""
                                )
                                .trim()
                                .toLowerCase();


                            // --------------------------------
                            // Only admin
                            // --------------------------------

                            if (
                                email !== ADMIN_EMAIL
                            ) {

                                return;

                            }


                            // ============================================
                            // ADMIN LOGIN HISTORY
                            // ============================================

                            // --------------------------------
                            // Prevent duplicate Login History
                            // --------------------------------

                            if (
                                !document.getElementById(
                                    "adminLoginHistory"
                                )
                            ) {

                                // --------------------------------
                                // Create menu item
                                // --------------------------------

                                const li =
                                    document.createElement(
                                        "li"
                                    );


                                li.id =
                                    "adminLoginHistory";


                                const page =
                                    document.createElement(
                                        "div"
                                    );


                                page.className =
                                    "page";


                                page.textContent =
                                    "🔐 Login History";


                                page.style.fontWeight =
                                    "bold";


                                page.style.color =
                                    "#007367";


                                page.style.cursor =
                                    "pointer";


                                // --------------------------------
                                // Login History click
                                // --------------------------------

                                page.addEventListener(
                                    "click",
                                    function(event) {

                                        event.stopPropagation();


                                        window.location.href =
                                            "./pages/LoginHistory.html";

                                    }
                                );


                                li.appendChild(
                                    page
                                );


                                tree.appendChild(
                                    li
                                );


                                console.log(
                                    "Admin Login History menu added."
                                );

                            }


                            // ============================================
                            // ADMIN AUTHORIZATION MANAGEMENT
                            // ============================================

                            // --------------------------------
                            // Prevent duplicate Authorization
                            // Management item
                            // --------------------------------

                            if (
                                document.getElementById(
                                    "adminAuthorizationManagement"
                                )
                            ) {

                                return;

                            }


                            // --------------------------------
                            // Create menu item
                            // --------------------------------

                            const authorizationLi =
                                document.createElement(
                                    "li"
                                );


                            authorizationLi.id =
                                "adminAuthorizationManagement";


                            const authorizationPage =
                                document.createElement(
                                    "div"
                                );


                            authorizationPage.className =
                                "page";


                            authorizationPage.textContent =
                                "🔐 Authorization Management";


                            authorizationPage.style.fontWeight =
                                "bold";


                            authorizationPage.style.color =
                                "#007367";


                            authorizationPage.style.cursor =
                                "pointer";


                            // --------------------------------
                            // Authorization Management click
                            // --------------------------------

                            authorizationPage.addEventListener(
                                "click",
                                function(event) {

                                    event.stopPropagation();


                                    window.location.href =
                                        "./pages/AdminAuthorization.html";

                                }
                            );


                            authorizationLi.appendChild(
                                authorizationPage
                            );


                            // --------------------------------
                            // IMPORTANT:
                            //
                            // Login History is appended first.
                            // Authorization Management is appended
                            // immediately after it.
                            //
                            // --------------------------------

                            tree.appendChild(
                                authorizationLi
                            );


                            console.log(
                                "Admin Authorization Management menu added."
                            );

                        }

                    );

                }
            )

            .catch(
                function(error) {

                    console.error(
                        "Firebase authentication import error:",
                        error
                    );

                }
            );

        }
    )

    .catch(
        function(error) {

            console.error(
                "Firebase configuration error:",
                error
            );

        }
    );

}


// ============================================================
// OLD PAGE LOADER
// ============================================================
//
// Kept for compatibility with any existing code that may still
// call loadPageOld().
//
// Protected pages should use app.js loadPage() instead.
//
// ============================================================

function loadPageOld(page) {

    fetch(page)

        .then(
            function(response) {

                if (!response.ok) {

                    throw new Error(
                        "Unable to load page. HTTP status: " +
                        response.status
                    );

                }

                return response.text();

            }
        )

        .then(
            function(data) {

                const contentArea =
                    document.getElementById(
                        "contentArea"
                    );


                if (!contentArea) {

                    console.error(
                        "contentArea element not found."
                    );

                    return;

                }


                contentArea.innerHTML =
                    data;


                // =============================================
                // ACS Higher Studies Achievements
                // =============================================

                if (
                    page ===
                    "pages/higher-studies-achievements.html"
                ) {

                    const year2026 =
                        document.getElementById(
                            "year2026"
                        );


                    if (year2026) {

                        year2026.addEventListener(
                            "mouseenter",
                            function() {

                                year2026.src =
                                    "images/img14on.png";

                            }
                        );


                        year2026.addEventListener(
                            "mouseleave",
                            function() {

                                year2026.src =
                                    "images/img14off.png";

                            }
                        );


                        year2026.addEventListener(
                            "click",
                            function() {

                                window.open(

                                    "https://docs.google.com/spreadsheets/d/1pxHOzUjqlObXqWdzw6YK1jTHF6s9BeRe/edit?usp=drive_link&ouid=102127505874932138201&rtpof=true&sd=true",

                                    "_blank"

                                );

                            }
                        );

                    }

                }

            }
        )

        .catch(
            function(error) {

                console.error(
                    "Error loading page:",
                    error
                );

            }
        );

}


// ============================================================
// LOAD TREE WHEN PAGE OPENS
// ============================================================
//
// index.html already calls loadTree() through window.onload.
// We intentionally do NOT call loadTree() again here.
//
// ============================================================

console.log(
    "DATA PULSE tree.js loaded."
);


// ============================================================
// END OF tree.js
// ============================================================
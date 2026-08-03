// ===============================
// app.js
// ===============================

// Load tree menu when page opens
window.onload = function () {
    loadTree();
};

// Load page inside the content area
function loadPage(page) {

    console.log("Loading page:", page);

    const contentArea = document.getElementById("contentArea");

    contentArea.innerHTML = `
        <iframe
            src="${page}"
            width="100%"
            height="900"
            style="
                border:none;
                background:#ffffff;
                overflow:auto;
            ">
        </iframe>
    `;
}
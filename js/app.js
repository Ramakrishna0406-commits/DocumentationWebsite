window.onload = function () {
    loadTree();
};

function loadPage(page) {

    document.getElementById("contentArea").innerHTML = `
        <iframe
            src="${page}"
            style="
                width:100%;
                height:900px;
                border:none;
                background:white;
            ">
        </iframe>
    `;

}
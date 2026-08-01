// Load Tree Menu
async function loadTree() {

    try {

        const response = await fetch("data/menu.json");
        const menu = await response.json();

        const tree = document.getElementById("treeMenu");
        tree.innerHTML = "";

        menu.forEach(item => {
            tree.appendChild(createNode(item));
        });

    } catch (error) {
        console.error("Error loading menu:", error);
    }

}


// Create Tree Nodes
function createNode(item) {

    const li = document.createElement("li");


    // Folder
    if (item.children) {

        const folder = document.createElement("div");
        folder.className = "folder";
        folder.textContent = item.title;


        const childList = document.createElement("ul");
        childList.className = "children";


        // Create child nodes
        item.children.forEach(child => {
            childList.appendChild(createNode(child));
        });


        // Open folder on mouse hover
        folder.addEventListener("mouseenter", function () {

            // Close all other folders
            document.querySelectorAll("#treeMenu > li > .children").forEach(list => {
                list.classList.remove("show");
            });

            document.querySelectorAll("#treeMenu > li > .folder").forEach(f => {
                f.classList.remove("open");
            });

            // Open selected folder
            childList.classList.add("show");
            folder.classList.add("open");

        });


        // Keep submenu open while mouse is inside child items
        childList.addEventListener("mouseenter", function () {

            childList.classList.add("show");
            folder.classList.add("open");

        });


        // Close folder when mouse leaves completely
        li.addEventListener("mouseleave", function () {

            childList.classList.remove("show");
            folder.classList.remove("open");

        });


        li.appendChild(folder);
        li.appendChild(childList);

    }


    // Page
    else {

        const page = document.createElement("div");
        page.className = "page";

        // Change all subpage names to "Testing Page"
        page.textContent = "Testing Page";

        page.addEventListener("click", function (e) {

            e.stopPropagation();

            // Remove previous selection
            document.querySelectorAll(".page").forEach(p => {
                p.classList.remove("active");
            });

            // Highlight selected page
            page.classList.add("active");

            // Load HTML page
            loadPage(item.page);

        });

        li.appendChild(page);

    }

    return li;

}
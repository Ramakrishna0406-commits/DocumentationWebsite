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



        item.children.forEach(child => {

            childList.appendChild(createNode(child));

        });



        folder.addEventListener("mouseenter", function () {


            document.querySelectorAll("#treeMenu > li > .children")
                .forEach(list => {

                    list.classList.remove("show");

                });



            document.querySelectorAll("#treeMenu > li > .folder")
                .forEach(f => {

                    f.classList.remove("open");

                });



            childList.classList.add("show");

            folder.classList.add("open");


        });



        childList.addEventListener("mouseenter", function () {


            childList.classList.add("show");

            folder.classList.add("open");


        });



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


        page.textContent = item.title;



        page.addEventListener("click", function (e) {


            e.stopPropagation();



            document.querySelectorAll(".page")
                .forEach(p => {

                    p.classList.remove("active");

                });



            page.classList.add("active");



            loadPage(item.page);



        });



        li.appendChild(page);



    }



    return li;


}



// Load page + run page specific functions

function loadPage(page) {


    fetch(page)

        .then(response => response.text())

        .then(data => {


            const contentArea = document.getElementById("contentArea");


            contentArea.innerHTML = data;



            // ACS Higher Studies Achievements Image Function

            if (page === "pages/higher-studies-achievements.html") {


                const year2026 = document.getElementById("year2026");



                if (year2026) {


                    year2026.addEventListener("mouseenter", function () {

                        year2026.src = "images/img14on.png";

                    });



                    year2026.addEventListener("mouseleave", function () {

                        year2026.src = "images/img14off.png";

                    });



                    year2026.addEventListener("click", function () {


                        window.open(

                            "https://docs.google.com/spreadsheets/d/1pxHOzUjqlObXqWdzw6YK1jTHF6s9BeRe/edit?usp=drive_link&ouid=102127505874932138201&rtpof=true&sd=true",

                            "_blank"

                        );


                    });


                }


            }



        })

        .catch(error => {


            console.error("Error loading page:", error);


        });


}





// Load tree when page opens

loadTree();
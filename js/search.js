const searchBox = document.getElementById("searchBox");

if (searchBox) {

    searchBox.addEventListener("keyup", function () {

        let value = this.value.toLowerCase();

        let pages = document.querySelectorAll(".page");

        pages.forEach(page => {

            if (page.innerText.toLowerCase().includes(value))
                page.style.display = "flex";
            else
                page.style.display = "none";

        });

    });

}
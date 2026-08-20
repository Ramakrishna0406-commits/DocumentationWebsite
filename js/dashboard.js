document.addEventListener("DOMContentLoaded", () => {

    loadForecast();

    // Search Function
    const search = document.getElementById("searchInput");

    if (search) {

        search.addEventListener("keyup", function () {

            let filter = this.value.toUpperCase();

            let rows = document.querySelectorAll("#forecastTable tbody tr");

            rows.forEach(row => {

                let text = row.innerText.toUpperCase();

                row.style.display = text.includes(filter) ? "" : "none";

            });

        });

    }

    // Secure Edit Button
    const editBtn = document.getElementById("secureEditBtn");

    if (editBtn) {

        editBtn.addEventListener("click", () => {

            alert("Team/Admin Login will be implemented in the next phase.");

        });

    }

});

async function loadForecast() {

    try {

        const response = await fetch("../data/forecast.json");

        const data = await response.json();

        populateTable(data);

        updateCards(data);

    }

    catch (error) {

        console.error("Unable to load Forecast Data", error);

    }

}

function populateTable(data) {

    const tbody = document.querySelector("#forecastTable tbody");

    tbody.innerHTML = "";

    data.forEach(item => {

        tbody.innerHTML += `

        <tr>

            <td>${item.slNo}</td>
            <td>${item.campus}</td>
            <td>${item.company}</td>
            <td>${item.ctc}</td>
            <td>${item.jobRole}</td>
            <td>${item.visitStatus}</td>

            <td class="${item.status.toLowerCase()}">
                ${item.status}
            </td>

            <td>${item.eligible}</td>
            <td>${item.selections}</td>
            <td>${item.poc}</td>
            <td>${item.nextStep}</td>
            <td>${item.remarks}</td>

            <td>
                <a href="${item.prepkit}" target="_blank">
                📄 View
                </a>
            </td>

        </tr>

        `;

    });

}

function updateCards(data) {

    const totalCompanies = data.length;

    const ongoing = data.filter(x => x.status === "Ongoing").length;

    const completed = data.filter(x => x.status === "Completed").length;

    document.querySelectorAll(".card h2")[0].innerText = totalCompanies;

    document.querySelectorAll(".card h2")[2].innerText = ongoing;

    document.querySelectorAll(".card h2")[3].innerText = completed;

}
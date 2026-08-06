// ========================================
// Get Mentor Name from URL
// ========================================

const params = new URLSearchParams(window.location.search);
const mentorName = params.get("mentor");

// ========================================
// Global Variables
// ========================================

let mentorStudents = [];
let filteredStudents = [];

// ========================================
// Display Mentor Name
// ========================================

document.getElementById("mentorTitle").innerHTML = "Students of " + mentorName;

// ========================================
// Filter Students
// ========================================

mentorStudents = students.filter(student => student["Mentor Name"] === mentorName);

filteredStudents = [...mentorStudents];

// ========================================
// Update Summary Cards
// ========================================

function updateCards() {

    let completed = 0;
    let started = 0;
    let yetToStart = 0;

    filteredStudents.forEach(student => {

        const completedCount = Number(student.Completed) || 0;
        const interimCount = Number(student.Interim) || 0;
        const groupCount = Number(student.Group) || 0;

        if (
            completedCount >= 1 &&
            interimCount >= 2 &&
            groupCount >= 1
        ) {

            completed++;

        }
        else if (
            completedCount === 0 &&
            interimCount === 0 &&
            groupCount === 0
        ) {

            yetToStart++;

        }
        else {

            started++;

        }

    });

    document.getElementById("totalStudents").innerHTML = filteredStudents.length;
    document.getElementById("completedStudents").innerHTML = completed;
    document.getElementById("startedStudents").innerHTML = started;
    document.getElementById("yetToStartStudents").innerHTML = yetToStart;

}

// ========================================
// Load Student Table
// ========================================

function loadTable() {

    const tbody = document.getElementById("studentTableBody");

    tbody.innerHTML = "";

    filteredStudents.forEach((student, index) => {

        const completedCount = Number(student.Completed) || 0;
        const interimCount = Number(student.Interim) || 0;
        const groupCount = Number(student.Group) || 0;

        let status = "";
        let badge = "";

        if (
            completedCount >= 1 &&
            interimCount >= 2 &&
            groupCount >= 1
        ) {

            status = "Completed";
            badge = "success";

        }
        else if (
            completedCount === 0 &&
            interimCount === 0 &&
            groupCount === 0
        ) {

            status = "Yet To Start";
            badge = "danger";

        }
        else {

            status = "Started";
            badge = "warning";

        }

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.Name}</td>
                <td>${student["Pass out Year"]}</td>
                <td>${student.Degree}</td>
                <td>
                    <span class="badge bg-${badge}">
                        ${status}
                    </span>
                </td>
            </tr>
        `;

    });

}

// ========================================
// Search Student
// ========================================

document.getElementById("searchStudent").addEventListener("keyup", function () {

    const searchText = this.value.toLowerCase().trim();

    filteredStudents = mentorStudents.filter(student =>
        student.Name.toLowerCase().includes(searchText)
    );

    updateCards();
    loadTable();

});

// ========================================
// Initial Load
// ========================================

updateCards();
loadTable();
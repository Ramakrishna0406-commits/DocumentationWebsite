// ========================================
// Global Variables
// ========================================

let allData = [];
let filteredData = [];
let selectedMentor = "";

//// ========================================
// Page Load
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    showCampusSelection();

});


// ========================================
// Campus Selection
// ========================================

function showCampusSelection(){

    const buttons = document.querySelectorAll(".campus-btn");


    buttons.forEach(button => {

        button.addEventListener("click", function(){

            const campus = this.getAttribute("data-campus");

            loadCampusData(campus);

        });

    });

}



// ========================================
// Load Campus Data
// ========================================

function loadCampusData(campus){

    document.getElementById("campusSelection").style.display = "none";

    document.getElementById("ccmDashboard").style.display = "block";


    let selectedCampus = "";


    if(campus === "Bangalore"){

        selectedCampus = "BLR";

    }

    else if(campus === "Hyderabad"){

        selectedCampus = "HYD";

    }

    else if(campus === "Vizag"){

        selectedCampus = "VSP";

    }


    allData = students.filter(student =>

        student.Campus === selectedCampus

    );


    filteredData = [...allData];


    loadFilters();

    attachEvents();

    updateDashboard();

}

// ========================================
// Load Filter Dropdowns
// ========================================

function loadFilters() {

    fillDropdown("schoolFilter", "School");
    fillDropdown("courseFilter", "Course");
    fillDropdown("departmentFilter", "Department");
    fillDropdown("yearFilter", "Pass out Year");

}

// ========================================
// Fill Dropdown
// ========================================

function fillDropdown(id, column) {

    const dropdown = document.getElementById(id);

    dropdown.innerHTML = "<option value=''>All</option>";

    const values = [...new Set(

        allData
            .map(item => (item[column] || "").toString().trim())
            .filter(item => item !== "")

    )].sort();

    values.forEach(value => {

        dropdown.innerHTML += `<option value="${value}">${value}</option>`;

    });

}


// ========================================
// Apply Filters
// ========================================

function applyFilters() {

    const school = document.getElementById("schoolFilter").value;
    const course = document.getElementById("courseFilter").value;
    const department = document.getElementById("departmentFilter").value;
    const year = document.getElementById("yearFilter").value;

    filteredData = allData.filter(student => {

        return (

            (school === "" || student["School"] == school) &&
            (course === "" || student["Course"] == course) &&
            (department === "" || student["Department"] == department) &&
            (year === "" || student["Pass out Year"] == year)

        );

    });

    updateDashboard();

}
// ========================================
// Attach Events
// ========================================

function attachEvents() {

    document.getElementById("schoolFilter")
        .addEventListener("change", applyFilters);

    document.getElementById("courseFilter")
        .addEventListener("change", applyFilters);

    document.getElementById("departmentFilter")
        .addEventListener("change", applyFilters);

    document.getElementById("yearFilter")
        .addEventListener("change", applyFilters);

}
// ========================================
// Reset Filters
// ========================================

function resetFilters() {

    document.getElementById("schoolFilter").value = "";
    document.getElementById("courseFilter").value = "";
    document.getElementById("departmentFilter").value = "";
    document.getElementById("yearFilter").value = "";

    filteredData = [...allData];

    updateDashboard();

}
// ========================================
// Update Dashboard
// ========================================

function updateDashboard() {

    // Total Students
    document.getElementById("totalStudents").innerHTML = filteredData.length;

    let started = 0;
    let yetToStart = 0;
    let completed = 0;

    filteredData.forEach(student => {

        const completedValue = Number(student["Completed"]);
        const interimValue = Number(student["Interim"]);
        const groupValue = Number(student["Group"]);

        // Completed
        if (
            completedValue >= 1 &&
            interimValue >= 2 &&
            groupValue >= 1
        ) {

            completed++;

        }

        // Yet To Start
        else if (
            completedValue === 0 &&
            interimValue === 0 &&
            groupValue === 0
        ) {

            yetToStart++;

        }

        // Started
        else {

            started++;

        }

    });

    // Update KPI Cards
    document.getElementById("startedStudents").innerHTML = started;
document.getElementById("yetStudents").innerHTML = yetToStart;
document.getElementById("completedStudents").innerHTML = completed;

    // Reload Mentor Summary
    loadMentorSummary();

// Student table will load only when needed
// loadStudentTable();

}

// ========================================
// Mentor Summary
// ========================================

function loadMentorSummary() {

    const tbody = document.getElementById("mentorTableBody");

    tbody.innerHTML = "";

    const mentors = {};

    filteredData.forEach(student => {

        const mentor = (student["Mentor Name"] || "No Mentor").trim();

        const completedValue = Number(student["Completed"]);
        const interimValue = Number(student["Interim"]);
        const groupValue = Number(student["Group"]);

        if (!mentors[mentor]) {

            mentors[mentor] = {

                total: 0,
                started: 0,
                yet: 0,
                completed: 0

            };

        }

        mentors[mentor].total++;

        // Completed
        if (
            completedValue >= 1 &&
            interimValue >= 2 &&
            groupValue >= 1
        ) {

            mentors[mentor].completed++;

        }

        // Yet To Start
        else if (
            completedValue === 0 &&
            interimValue === 0 &&
            groupValue === 0
        ) {

            mentors[mentor].yet++;

        }

        // Started
        else {

            mentors[mentor].started++;

        }

    });

    Object.keys(mentors)
        .sort()
        .forEach(mentor => {

            tbody.innerHTML += `
                <tr>
                    <td><a href="CCM-Students.html?mentor=${encodeURIComponent(mentor)}&campus=${encodeURIComponent(allData[0]?.Campus || '')}" target="_blank">
            ${mentor}
        </a>
    
    </td>
                    <td>${mentors[mentor].total}</td>
                    <td>${mentors[mentor].started}</td>
                    <td>${mentors[mentor].yet}</td>
                    <td>${mentors[mentor].completed}</td>
                    <td>${mentors[mentor].total}</td>
                </tr>
            `;

        });

}


// ========================================
// Student Details Table
// ========================================

function loadStudentTable() {

    const tbody = document.getElementById("studentTableBody");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const studentsToShow = selectedMentor === ""
        ? filteredData
        : filteredData.filter(
            student => student["Mentor Name"] === selectedMentor
        );


    studentsToShow.forEach((student, index) => {

        let status = "";

        const completedValue = Number(student["Completed"]);
        const interimValue = Number(student["Interim"]);
        const groupValue = Number(student["Group"]);


        // Completed

        if (
            completedValue >= 1 &&
            interimValue >= 2 &&
            groupValue >= 1
        ) {

            status = "Completed";

        }


        // Yet To Start

        else if (
            completedValue === 0 &&
            interimValue === 0 &&
            groupValue === 0
        ) {

            status = "Yet To Start";

        }


        // Started

        else {

            status = "Started";

        }


        tbody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${student["Name"] || ""}</td>

                <td>${student["School"] || ""}</td>

                <td>${student["Course"] || ""}</td>

                <td>${student["Department"] || ""}</td>

                <td>${student["Pass out Year"] || ""}</td>

                <td>${student["Degree"] || ""}</td>

                <td>${status}</td>

            </tr>
        `;

    });

}
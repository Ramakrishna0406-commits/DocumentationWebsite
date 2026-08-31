// ========================================
// Global Variables
// ========================================

let allData = [];
let filteredData = [];
let selectedMentor = "";

let ccmChart = null;


// ========================================
// Page Load
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    showCampusSelection();

});


// ========================================
// Campus Selection
// ========================================

function showCampusSelection() {

    const buttons = document.querySelectorAll(".campus-btn");

    buttons.forEach(button => {

        button.addEventListener("click", function () {

            const campus = this.getAttribute("data-campus");

            loadCampusData(campus);

        });

    });

}


// ========================================
// Load Campus Data
// ========================================

function loadCampusData(campus) {

    document.getElementById("campusSelection").style.display = "none";

    document.getElementById("ccmDashboard").style.display = "block";


    let fileName = "";


    if (campus === "Bangalore") {

        fileName = "Bangalore.json";

    }

    else if (campus === "Hyderabad") {

        fileName = "Hyderabad.json";

    }

    else if (campus === "Vizag") {

        fileName = "vizag.json";

    }


    fetch("../data/ccm/" + fileName)

        .then(response => {

            if (!response.ok) {

                throw new Error("Unable to load " + fileName);

            }

            return response.json();

        })

        .then(data => {

            allData = Array.isArray(data)
                ? data
                : (Object.values(data).find(value => Array.isArray(value)) || []);

            filteredData = [...allData];

            loadFilters();

            attachEvents();

            updateDashboard();

        })

        .catch(error => {

            console.error("Campus Data Error:", error);

            alert("Unable to load campus data.");

        });

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


    const values = [

        ...new Set(

            allData

                .map(item =>

                    (item[column] || "").toString().trim()

                )

                .filter(item => item !== "")

        )

    ].sort();


    values.forEach(value => {

        dropdown.innerHTML += `

            <option value="${value}">

                ${value}

            </option>

        `;

    });

}


// ========================================
// Apply Filters
// ========================================

function applyFilters() {

    const school =
        document.getElementById("schoolFilter").value;

    const course =
        document.getElementById("courseFilter").value;

    const department =
        document.getElementById("departmentFilter").value;

    const year =
        document.getElementById("yearFilter").value;


    filteredData = allData.filter(student => {

        return (

            (school === "" ||
                student["School"] == school) &&

            (course === "" ||
                student["Course"] == course) &&

            (department === "" ||
                student["Department"] == department) &&

            (year === "" ||
                student["Pass out Year"] == year)

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


    // Export

    document.getElementById("exportBtn")
        .addEventListener("click", exportMentorSummary);


    // Reset

    document.getElementById("resetBtn")
        .addEventListener("click", resetFilters);


    // ========================================
    // Graphical View Button
    // ========================================

    const graphicalViewBtn =
        document.getElementById("graphicalViewBtn");

    const graphicalView =
        document.getElementById("graphicalView");


    if (graphicalViewBtn) {

        graphicalViewBtn.addEventListener("click", function () {

            if (
                graphicalView.style.display === "none" ||
                graphicalView.style.display === ""
            ) {

                graphicalView.style.display = "block";

            }

            else {

                graphicalView.style.display = "none";

            }

        });

    }


    // ========================================
    // School Graph
    // ========================================

    const schoolGraphBtn =
        document.getElementById("schoolGraphBtn");


    if (schoolGraphBtn) {

        schoolGraphBtn.addEventListener("click", function () {

            createSchoolChart();

        });

    }


    // ========================================
    // Course Graph
    // ========================================

    const courseGraphBtn =
        document.getElementById("courseGraphBtn");


    if (courseGraphBtn) {

        courseGraphBtn.addEventListener("click", function () {

            createCourseChart();

        });

    }


    // ========================================
    // Year Graph
    // ========================================

    const yearGraphBtn =
        document.getElementById("yearGraphBtn");


    if (yearGraphBtn) {

        yearGraphBtn.addEventListener("click", function () {

            createYearChart();

        });

    }

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


    // Remove existing chart

    if (ccmChart) {

        ccmChart.destroy();

        ccmChart = null;

    }

}


// ========================================
// Update Dashboard
// ========================================

function updateDashboard() {

    document.getElementById("totalStudents").innerHTML =
        filteredData.length;


    let started = 0;
    let yetToStart = 0;
    let completed = 0;

    filteredData.forEach(student => {

        const completedValue =
            Number(student["Completed"]) || 0;

        const interimValue =
            Number(student["Interim"]) || 0;

        const groupValue =
            Number(student["Group"]) || 0;

        /*
         * CCM STATUS - FINAL BUSINESS RULE
         *
         * The source JSON already contains the authoritative CCM
         * Started / Yet To Start classification in the "Status " field.
         * Note: the field name intentionally contains a trailing space.
         *
         * Started:
         *   Status = "Started" OR Status = "Completed"
         *
         * Yet To Start:
         *   Status = "Yet To Start"
         *
         * Completed:
         *   Completed >= 1 AND Interim >= 2 AND Group >= 1
         *
         * Completed is included in Started.
         */

        const isCompleted =
            completedValue >= 1 &&
            interimValue >= 2 &&
            groupValue >= 1;

        const sourceStatus =
            String(
                student["Status "] ??
                student["Status"] ??
                ""
            ).trim();

        if (
            sourceStatus === "Started" ||
            sourceStatus === "Completed"
        ) {
            started++;
        } else if (sourceStatus === "Yet To Start") {
            yetToStart++;
        } else {
            /*
             * Safe fallback for records without a source Status.
             */
            const activityStarted =
                completedValue >= 1 ||
                interimValue >= 1 ||
                groupValue >= 1;

            if (activityStarted) {
                started++;
            } else {
                yetToStart++;
            }
        }

        if (isCompleted) {
            completed++;
        }

    });

    document.getElementById("startedStudents").innerHTML =
        started;

    document.getElementById("yetStudents").innerHTML =
        yetToStart;

    document.getElementById("completedStudents").innerHTML =
        completed;

    loadMentorSummary();

}


// ========================================
// Mentor Summary
// ========================================

function loadMentorSummary() {

    const tbody =
        document.getElementById("mentorTableBody");

    tbody.innerHTML = "";


    const mentors = {};


    filteredData.forEach(student => {

        const mentor =
            (student["Mentor Name"] || "No Mentor").trim();


        const completedValue =
            Number(student["Completed"]) || 0;

        const interimValue =
            Number(student["Interim"]) || 0;

        const groupValue =
            Number(student["Group"]) || 0;


        if (!mentors[mentor]) {

            mentors[mentor] = {

                department: String(student["Department"] ?? "").trim(),

                total: 0,

                started: 0,

                yet: 0

            };

        }


        mentors[mentor].total++;

        const studentDepartment = String(student["Department"] ?? "").trim();
        if (studentDepartment && !mentors[mentor].department) {
            mentors[mentor].department = studentDepartment;
        }


        // Completed

        if (

            completedValue >= 1 &&

            interimValue >= 2 &&

            groupValue >= 1

        ) {

            // Do nothing

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


    Object.keys(mentors).forEach(mentor => {
        if (!mentors[mentor].department) {
            const matchingStudent = filteredData.find(student =>
                (student["Mentor Name"] || "No Mentor").trim() === mentor &&
                (student["Department"] || "").trim() !== ""
            );
            if (matchingStudent) {
                mentors[mentor].department = matchingStudent["Department"];
            }
        }
    });

    Object.keys(mentors)

        .sort()

        .forEach(mentor => {

            tbody.innerHTML += `

                <tr>

                    <td>

                        <a href="CCM-Students.html?mentor=${encodeURIComponent(mentor)}&campus=${encodeURIComponent(
                               allData[0]?.Campus === "BLR" ? "Bangalore" :
                               allData[0]?.Campus === "HYD" ? "Hyderabad" :
                               allData[0]?.Campus === "VSP" || allData[0]?.Campus === "VIZAG" ? "Vizag" :
                               allData[0]?.Campus || ""
                           )}"
                           target="_blank">

                            ${mentor}

                        </a>

                    </td>


                    <td>

                        ${mentors[mentor].department}

                    </td>


                    <td>

                        ${mentors[mentor].total}

                    </td>


                    <td style="

                        color: ${
                            mentors[mentor].started === 0
                                ? 'red'
                                : 'inherit'
                        };

                        font-weight: ${
                            mentors[mentor].started === 0
                                ? 'bold'
                                : 'normal'
                        };

                    ">

                        ${mentors[mentor].started}

                    </td>


                    <td style="

                        color: ${
                            mentors[mentor].yet === 0
                                ? 'red'
                                : 'inherit'
                        };

                        font-weight: ${
                            mentors[mentor].yet === 0
                                ? 'bold'
                                : 'normal'
                        };

                    ">

                        ${mentors[mentor].yet}

                    </td>

                </tr>

            `;

        });

}


// ========================================
// Student Details Table
// ========================================

function loadStudentTable() {

    const tbody =
        document.getElementById("studentTableBody");


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    const studentsToShow = selectedMentor === ""

        ? filteredData

        : filteredData.filter(

            student =>
                student["Mentor Name"] === selectedMentor

        );


    studentsToShow.forEach((student, index) => {

        let status = "";


        const completedValue =
            Number(student["Completed"]) || 0;

        const interimValue =
            Number(student["Interim"]) || 0;

        const groupValue =
            Number(student["Group"]) || 0;


        if (

            completedValue >= 1 &&

            interimValue >= 2 &&

            groupValue >= 1

        ) {

            status = "Completed";

        }

        else if (

            completedValue === 0 &&

            interimValue === 0 &&

            groupValue === 0

        ) {

            status = "Yet To Start";

        }

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


// ========================================
// Student Status
// ========================================

function getStudentStatus(student) {

    const completedValue =
        Number(student["Completed"]) || 0;

    const interimValue =
        Number(student["Interim"]) || 0;

    const groupValue =
        Number(student["Group"]) || 0;

    /*
     * CCM FINAL STATUS RULE
     *
     * Started:
     *   JSON Status = Started OR Completed
     *
     * Yet To Start:
     *   JSON Status = Yet To Start
     *
     * Completed:
     *   Completed >= 1 AND Interim >= 2 AND Group >= 1
     *
     * Completed is included inside Started.
     */

    const sourceStatus =
        String(
            student["Status "] ??
            student["Status"] ??
            ""
        ).trim();

    const isCompleted =
        completedValue >= 1 &&
        interimValue >= 2 &&
        groupValue >= 1;

    if (isCompleted) {
        return "Completed";
    }

    if (
        sourceStatus === "Started" ||
        sourceStatus === "Completed"
    ) {
        return "Started";
    }

    if (sourceStatus === "Yet To Start") {
        return "Yet To Start";
    }

    /*
     * Safe fallback only when Status is unavailable.
     */
    if (
        completedValue >= 1 ||
        interimValue >= 1 ||
        groupValue >= 1
    ) {
        return "Started";
    }

    return "Yet To Start";
}


// ========================================
// Graph Data/ ========================================

function getGraphData(column) {

    const result = {};


    filteredData.forEach(student => {

        let category =
            (student[column] || "Unknown")
                .toString()
                .trim();


        if (category === "") {

            category = "Unknown";

        }


        if (!result[category]) {

            result[category] = {

                started: 0,

                yetToStart: 0

            };

        }


        const status =
            getStudentStatus(student);


        /*
         * Graph rule:
         * Started includes Completed because Completed is a subset
         * of Started. Therefore only Yet To Start is excluded from
         * the Started count.
         */

        if (status === "Yet To Start") {

            result[category].yetToStart++;

        }

        else {

            result[category].started++;

        }

    });


    return result;

}


// ========================================
// Chart Data Labels Options
// ========================================

function getDataLabelsOptions() {

    return {

        anchor: "end",

        align: "top",

        offset: 4,

        color: "#000",

        font: {

            weight: "bold",

            size: 12

        },

        formatter: function (value) {

            return value;

        }

    };

}


// ========================================
// Show Chart
// ========================================

function showChartContainer() {

    const chartContainer =
        document.getElementById("chartContainer");


    if (chartContainer) {

        chartContainer.style.display = "block";

    }

}


// ========================================
// Destroy Existing Chart
// ========================================

function destroyExistingChart() {

    if (ccmChart) {

        ccmChart.destroy();

        ccmChart = null;

    }

}


// ========================================
// Create School Wise Chart
// ========================================

function createSchoolChart() {

    showChartContainer();

    destroyExistingChart();


    const graphData =
        getGraphData("School");


    const labels =
        Object.keys(graphData).sort();


    const startedData =
        labels.map(label =>
            graphData[label].started
        );


    const yetData =
        labels.map(label =>
            graphData[label].yetToStart
        );


    const canvas =
        document.getElementById("ccmChart");


    ccmChart = new Chart(canvas, {

        type: "bar",


        data: {

            labels: labels,


            datasets: [

                {

                    label: "Started",

                    data: startedData,

                    backgroundColor: "#198754"

                },


                {

                    label: "Yet To Start",

                    data: yetData,

                    backgroundColor: "#dc3545"

                }

            ]

        },


        plugins: [ChartDataLabels],


        options: {

            responsive: true,

            maintainAspectRatio: false,


            layout: {

                padding: {

                    top: 35

                }

            },


            plugins: {

                title: {

                    display: true,

                    text:
                        "School Wise - Started vs Yet To Start",

                    font: {

                        size: 18,

                        weight: "bold"

                    }

                },


                legend: {

                    position: "top"

                },


                datalabels:
                    getDataLabelsOptions()

            },


            scales: {

                x: {

                    title: {

                        display: true,

                        text: "School"

                    }

                },


                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text: "Student Count"

                    },

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}


// ========================================
// Create Course Wise Chart
// ========================================

function createCourseChart() {

    showChartContainer();

    destroyExistingChart();


    const graphData =
        getGraphData("Course");


    const labels =
        Object.keys(graphData).sort();


    const startedData =
        labels.map(label =>
            graphData[label].started
        );


    const yetData =
        labels.map(label =>
            graphData[label].yetToStart
        );


    const canvas =
        document.getElementById("ccmChart");


    ccmChart = new Chart(canvas, {

        type: "bar",


        data: {

            labels: labels,


            datasets: [

                {

                    label: "Started",

                    data: startedData,

                    backgroundColor: "#198754"

                },


                {

                    label: "Yet To Start",

                    data: yetData,

                    backgroundColor: "#dc3545"

                }

            ]

        },


        plugins: [ChartDataLabels],


        options: {

            responsive: true,

            maintainAspectRatio: false,


            layout: {

                padding: {

                    top: 35

                }

            },


            plugins: {

                title: {

                    display: true,

                    text:
                        "Course Wise - Started vs Yet To Start",

                    font: {

                        size: 18,

                        weight: "bold"

                    }

                },


                legend: {

                    position: "top"

                },


                datalabels:
                    getDataLabelsOptions()

            },


            scales: {

                x: {

                    title: {

                        display: true,

                        text: "Course"

                    }

                },


                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text: "Student Count"

                    },

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}


// ========================================
// Create Pass Out Year Wise Chart
// ========================================

function createYearChart() {

    showChartContainer();

    destroyExistingChart();


    const graphData =
        getGraphData("Pass out Year");


    const labels =
        Object.keys(graphData).sort((a, b) => {

            const numA = Number(a);

            const numB = Number(b);


            if (!isNaN(numA) && !isNaN(numB)) {

                return numA - numB;

            }


            return a.localeCompare(b);

        });


    const startedData =
        labels.map(label =>
            graphData[label].started
        );


    const yetData =
        labels.map(label =>
            graphData[label].yetToStart
        );


    const canvas =
        document.getElementById("ccmChart");


    ccmChart = new Chart(canvas, {

        type: "bar",


        data: {

            labels: labels,


            datasets: [

                {

                    label: "Started",

                    data: startedData,

                    backgroundColor: "#198754"

                },


                {

                    label: "Yet To Start",

                    data: yetData,

                    backgroundColor: "#dc3545"

                }

            ]

        },


        plugins: [ChartDataLabels],


        options: {

            responsive: true,

            maintainAspectRatio: false,


            layout: {

                padding: {

                    top: 35

                }

            },


            plugins: {

                title: {

                    display: true,

                    text:
                        "Pass Out Year Wise - Started vs Yet To Start",

                    font: {

                        size: 18,

                        weight: "bold"

                    }

                },


                legend: {

                    position: "top"

                },


                datalabels:
                    getDataLabelsOptions()

            },


            scales: {

                x: {

                    title: {

                        display: true,

                        text: "Pass Out Year"

                    }

                },


                y: {

                    beginAtZero: true,

                    title: {

                        display: true,

                        text: "Student Count"

                    },

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}


// ========================================
// Export Mentor Summary to Excel
// ========================================

function exportMentorSummary() {

    const table =
        document.getElementById("mentorTable");


    if (!table) {

        alert("Mentor table not found.");

        return;

    }


    const workbook =
        XLSX.utils.table_to_book(table, {

            sheet: "Mentor Summary"

        });


    XLSX.writeFile(

        workbook,

        "Mentor_Mentee_Summary.xlsx"

    );

}













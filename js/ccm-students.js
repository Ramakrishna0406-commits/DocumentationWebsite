// ========================================
// CCM Mentor Student Details
// ========================================

const params = new URLSearchParams(window.location.search);
const mentorName = params.get("mentor") || "";
const campus = params.get("campus") || "";

let mentorStudents = [];
let filteredStudents = [];

document.getElementById("mentorTitle").innerHTML =
    "Students of " + mentorName;

function getDataFile(campusName) {
    if (campusName === "Bangalore") return "../data/ccm/Bangalore.json";
    if (campusName === "Hyderabad") return "../data/ccm/Hyderabad.json";
    if (campusName === "Vizag") return "../data/ccm/vizag.json";
    return "";
}

function loadMentorStudents() {

    const campusFiles = {
        "BANGALORE": "../data/ccm/Bangalore.json",
        "HYDERABAD": "../data/ccm/Hyderabad.json",
        "VIZAG": "../data/ccm/vizag.json",
        "BLR": "../data/ccm/Bangalore.json",
        "HYD": "../data/ccm/Hyderabad.json",
        "VSP": "../data/ccm/vizag.json"
    };

    const requestedCampus = String(campus || "").trim().toUpperCase();
    const targetMentor = String(mentorName || "").trim().replace(/\s+/g, " ").toLowerCase();

    let filesToLoad = [];

    if (campusFiles[requestedCampus]) {
        filesToLoad = [campusFiles[requestedCampus]];
    } else {
        filesToLoad = [
            campusFiles["BANGALORE"],
            campusFiles["HYDERABAD"],
            campusFiles["VIZAG"]
        ];
    }

    console.log("CCM Students - Mentor:", mentorName);
    console.log("CCM Students - Campus:", campus);
    console.log("CCM Students - Files:", filesToLoad);

    Promise.all(
        filesToLoad.map(file =>
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Unable to load " + file);
                    }
                    return response.json();
                })
        )
    )
    .then(results => {

        let allStudents = [];

        results.forEach(data => {

            let students = [];

            if (Array.isArray(data)) {
                students = data;
            } else if (Array.isArray(data.students)) {
                students = data.students;
            } else if (Array.isArray(data.data)) {
                students = data.data;
            } else {
                const arrayProperty = Object.values(data).find(value => Array.isArray(value));
                students = arrayProperty || [];
            }

            allStudents = allStudents.concat(students);
        });

        console.log("CCM Students - Loaded records:", allStudents.length);

        mentorStudents = allStudents.filter(student => {

            const studentMentor = String(
                student["Mentor Name"] ??
                student["Mentor"] ??
                student["mentorName"] ??
                ""
            )
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

            return studentMentor === targetMentor;
        });

        console.log("CCM Students - Matched mentor students:", mentorStudents.length);

        filteredStudents = [...mentorStudents];

        updateCards();
        loadTable();

    })
    .catch(error => {

        console.error("CCM student loading error:", error);

        document.getElementById("studentTableBody").innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Unable to load student details.</td></tr>';
    });
}
function updateCards() {

    let completed = 0;
    let started = 0;
    let yetToStart = 0;

    filteredStudents.forEach(student => {

        const completedCount = Number(student["Completed"]) || 0;
        const interimCount = Number(student["Interim"]) || 0;
        const groupCount = Number(student["Group"]) || 0;

        if (
            completedCount >= 1 &&
            interimCount >= 2 &&
            groupCount >= 1
        ) {
            completed++;
            started++;
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

function loadTable() {

    const tbody = document.getElementById("studentTableBody");
    tbody.innerHTML = "";

    if (filteredStudents.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="text-center">No student details found.</td></tr>';
        return;
    }

    filteredStudents.forEach((student, index) => {

        const completedCount = Number(student["Completed"]) || 0;
        const interimCount = Number(student["Interim"]) || 0;
        const groupCount = Number(student["Group"]) || 0;

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
                <td>${student["Name"] || ""}</td>
                <td>${student["School"] || ""}</td>
                <td>${student["Course"] || ""}</td>
                <td>${student["Department"] || ""}</td>
                <td>${student["Pass out Year"] || ""}</td>
                <td>${student["Degree"] || ""}</td>
                <td><span class="badge bg-${badge}">${status}</span></td>
            </tr>
        `;
    });
}

document.getElementById("searchStudent").addEventListener("keyup", function () {

    const searchText = this.value.toLowerCase().trim();

    filteredStudents = mentorStudents.filter(student =>
        (student["Name"] || "").toLowerCase().includes(searchText)
    );

    updateCards();
    loadTable();
});

document.getElementById("exportStudentsBtn").addEventListener("click", function () {

    if (filteredStudents.length === 0) {
        alert("No student data available to export.");
        return;
    }

    const exportData = filteredStudents.map((student, index) => {

        const completedCount = Number(student["Completed"]) || 0;
        const interimCount = Number(student["Interim"]) || 0;
        const groupCount = Number(student["Group"]) || 0;

        let status = "";

        if (
            completedCount >= 1 &&
            interimCount >= 2 &&
            groupCount >= 1
        ) {
            status = "Completed";
        }
        else if (
            completedCount === 0 &&
            interimCount === 0 &&
            groupCount === 0
        ) {
            status = "Yet To Start";
        }
        else {
            status = "Started";
        }

        return {
            "S.No": index + 1,
            "Student Name": student["Name"] || "",
            "School": student["School"] || "",
            "Course": student["Course"] || "",
            "Department": student["Department"] || "",
            "Pass Out Year": student["Pass out Year"] || "",
            "Degree": student["Degree"] || "",
            "Status": status
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
    );

    XLSX.writeFile(
        workbook,
        "Students_" + (mentorName || "All") + ".xlsx"
    );
});

loadMentorStudents();



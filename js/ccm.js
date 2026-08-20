/* =====================================================
   DATA PULSE - CCM ANALYTICS DASHBOARD
   Mentor Mentee Analytics
===================================================== */


let allData = [];
let filteredData = [];

let statusChart;
let mentorChart;
let campusChart;
let schoolChart;


// ===============================
// CAMPUS SELECTION
// ===============================

function showCampusSelection(){

    let container = document.getElementById("ccmDashboard");


    if(!container){

        console.error(
            "ccmDashboard container not found"
        );

        return;

    }


    container.innerHTML = `

        <div class="campus-selection text-center">

            <h2>Select Campus</h2>


            <button 
            class="btn btn-primary m-2"
            onclick="loadCampusData('Bangalore')">

                Bangalore

            </button>


            <button 
            class="btn btn-primary m-2"
            onclick="loadCampusData('Hyderabad')">

                Hyderabad

            </button>


            <button 
            class="btn btn-primary m-2"
            onclick="loadCampusData('vizag')">

                Vizag

            </button>


        </div>

    `;


}



// ===============================
// PAGE LOAD
// ===============================


document.addEventListener(
"DOMContentLoaded",
function(){

    showCampusSelection();

});

// ===============================
// FILTER INITIALIZATION
// ===============================


function initializeFilters(){


    fillFilter(
        "campusFilter",
        "Campus"
    );


    fillFilter(
        "schoolFilter",
        "School"
    );


    fillFilter(
        "departmentFilter",
        "Department"
    );


    fillFilter(
        "mentorFilter",
        "Mentor Name"
    );


    fillFilter(
        "statusFilter",
        "Status "
    );


}




function fillFilter(id,field){


    let select =
        document.getElementById(id);



    select.innerHTML =
    `<option value="">All</option>`;



    let values =
        [...new Set(
            allData.map(
                x=>x[field]
            )
        )]
        .filter(Boolean)
        .sort();



    values.forEach(value=>{


        let option =
            document.createElement(
                "option"
            );


        option.value=value;

        option.text=value;


        select.appendChild(option);


    });



}



// ===============================
// APPLY FILTERS
// ===============================


function applyFilters(){


    let campus =
        document.getElementById(
            "campusFilter"
        ).value;



    let school =
        document.getElementById(
            "schoolFilter"
        ).value;



    let department =
        document.getElementById(
            "departmentFilter"
        ).value;



    let mentor =
        document.getElementById(
            "mentorFilter"
        ).value;



    let status =
        document.getElementById(
            "statusFilter"
        ).value;



    let search =
        document.getElementById(
            "searchMentor"
        )
        .value
        .toLowerCase();



    filteredData =
        allData.filter(row=>{


            return (

                (!campus ||
                 row["Campus"]==campus)


                &&


                (!school ||
                 row["School"]==school)


                &&


                (!department ||
                 row["Department"]==department)


                &&


                (!mentor ||
                 row["Mentor Name"]==mentor)


                &&


                (!status ||
                 row["Status "]==status)


                &&


                (!search ||

                 (row["Mentor Name"]||"")
                 .toLowerCase()
                 .includes(search)
                )


            );


        });



    updateDashboard();


}




// ===============================
// UPDATE DASHBOARD
// ===============================


function updateDashboard(){



    document.getElementById(
        "totalStudents"
    ).innerHTML =
        filteredData.length;



    let mentors =
        new Set(
            filteredData.map(
                x=>x["Mentor Name"]
            )
        );



    document.getElementById(
        "totalMentors"
    ).innerHTML =
        mentors.size;



    document.getElementById(
        "completedCount"
    ).innerHTML =

        filteredData.filter(
            x=>
            String(x["Completed"])
            .toLowerCase()
            =="yes"
        ).length;




    document.getElementById(
        "interimCount"
    ).innerHTML =

        filteredData.filter(
            x=>
            String(x["Interim"])
            .toLowerCase()
            =="yes"
        ).length;



    createCharts();


    createMentorTable();



}



// ===============================
// CHART CREATION
// ===============================


function createCharts(){


    createStatusChart();


    createMentorChart();


    createCampusChart();


    createSchoolChart();


}



// ===============================
// STATUS DOUGHNUT
// ===============================


function createStatusChart(){


    let data={};



    filteredData.forEach(row=>{


        let status =
            row["Status "] ||
            "Unknown";


        data[status] =
        (data[status]||0)+1;


    });



    if(statusChart)
        statusChart.destroy();



    statusChart =
    new Chart(
        document.getElementById(
            "statusChart"
        ),
        {

        type:"doughnut",

        data:{

            labels:Object.keys(data),

            datasets:[{

                data:Object.values(data)

            }]

        },

        options:{

            responsive:true

        }


    });



}



// ===============================
// MENTOR BAR CHART
// ===============================


function createMentorChart(){


    let data={};



    filteredData.forEach(row=>{


        let mentor =
        row["Mentor Name"]
        ||
        "Unknown";


        data[mentor]=
        (data[mentor]||0)+1;


    });



    if(mentorChart)
        mentorChart.destroy();



    mentorChart =
    new Chart(
        document.getElementById(
            "mentorChart"
        ),
        {

        type:"bar",

        data:{

            labels:Object.keys(data),

            datasets:[{

                label:"Students",

                data:Object.values(data)

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{
                    display:false
                }

            }

        }


    });


}




// ===============================
// CAMPUS CHART
// ===============================


function createCampusChart(){


let data={};


filteredData.forEach(row=>{


let campus=row["Campus"]||"Unknown";


data[campus]=(data[campus]||0)+1;


});


if(campusChart)
campusChart.destroy();



campusChart =
new Chart(
document.getElementById("campusChart"),
{

type:"bar",

data:{

labels:Object.keys(data),

datasets:[{

label:"Students",

data:Object.values(data)

}]

}

});


}



// ===============================
// SCHOOL CHART
// ===============================


function createSchoolChart(){


let data={};


filteredData.forEach(row=>{


let school =
row["School"]||"Unknown";


data[school]=(data[school]||0)+1;


});



if(schoolChart)
schoolChart.destroy();



schoolChart =
new Chart(
document.getElementById("schoolChart"),
{

type:"bar",

data:{

labels:Object.keys(data),

datasets:[{

label:"Students",

data:Object.values(data)

}]

}

});


}





// ===============================
// MENTOR SUMMARY TABLE
// ===============================

function createMentorTable(){

    let tbody =
        document.querySelector(
            "#mentorTable tbody"
        );

    if (!tbody) {
        console.error("Mentor table body not found");
        return;
    }

    tbody.innerHTML = "";

    let summary = {};

    filteredData.forEach(row => {

        let mentor =
            (row["Mentor Name"] || "Unknown").toString().trim();

        if (!summary[mentor]) {

            summary[mentor] = {
                students: 0,
                completed: 0,
                interim: 0
            };

        }

        summary[mentor].students++;

        if (
            String(row["Completed"])
                .toLowerCase() == "yes"
        ) {
            summary[mentor].completed++;
        }

        if (
            String(row["Interim"])
                .toLowerCase() == "yes"
        ) {
            summary[mentor].interim++;
        }

    });

    Object.keys(summary)
        .sort()
        .forEach(mentor => {

            let s = summary[mentor];

            tbody.innerHTML += `
                <tr>
                    <td>
                        <a href="CCM-Students.html?mentor=${encodeURIComponent(mentor)}" target="_blank">
                            ${mentor}
                        </a>
                    </td>
                    <td>${s.students}</td>
                    <td>${s.interim}</td>
                    <td>${s.completed}</td>
                </tr>
            `;

        });

}
// ===============================
// RESET FILTERS
// ===============================


function resetFilters(){


document.querySelectorAll(
".filter-card select"
)
.forEach(
x=>x.value=""
);



document.getElementById(
"searchMentor"
).value="";



filteredData=[...allData];


updateDashboard();



}
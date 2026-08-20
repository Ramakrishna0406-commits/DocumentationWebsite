//====================================================
// DATA PULSE
// Monthly Forecast - Team Dashboard
// Version 3.0
// LocalStorage Enabled
//====================================================


//====================================================
// INITIAL DATA
//====================================================

let forecastData = [

{
    slNo:1,
    campus:"Visakhapatnam",
    company:"TCS",
    ctc:"7 LPA",
    role:"Graduate Trainee",
    visitStatus:"Planned",
    status:"Open",
    eligible:250,
    selections:0,
    poc:"Mr. Ramesh",
    nextStep:"PPT - 15 Aug 2026",
    remarks:"Awaiting confirmation",
    prepKit:"https://example.com"
},


{
    slNo:2,
    campus:"Hyderabad",
    company:"Infosys",
    ctc:"6.5 LPA",
    role:"System Engineer",
    visitStatus:"Confirmed",
    status:"In Progress",
    eligible:180,
    selections:15,
    poc:"Ms. Priya",
    nextStep:"Assessment - 18 Aug 2026",
    remarks:"Assessment Scheduled",
    prepKit:"https://example.com"
}

];


//====================================================
// GLOBAL VARIABLES
//====================================================

let editIndex = -1;


//====================================================
// PAGE LOAD
//====================================================

document.addEventListener("DOMContentLoaded",()=>{


    loadFromLocalStorage();


    loadTable();


    updateSummaryCards();

    updateLastUpdated();


});



//====================================================
// LOAD TABLE
//====================================================

function loadTable(data = forecastData){


    const tbody = document.getElementById("tableBody");


    if(!tbody){
        return;
    }


    tbody.innerHTML = "";



    data.forEach((item)=>{


        tbody.innerHTML += `


<tr>


<td>

<input

type="checkbox"

class="rowSelect"

data-index="${forecastData.indexOf(item)}"

>

</td>



<td>${item.slNo}</td>


<td>${item.campus}</td>


<td>${item.company}</td>


<td>${item.ctc}</td>


<td>${item.role}</td>


<td>${item.visitStatus}</td>



<td>

<span class="status ${item.status.replace(/\s+/g,'').toLowerCase()}">

${item.status}

</span>


</td>



<td>${item.eligible}</td>


<td>${item.selections}</td>


<td>${item.poc}</td>


<td>${item.nextStep}</td>


<td>${item.remarks}</td>



<td>

<a href="${item.prepKit}" target="_blank">

Open

</a>

</td>


</tr>


`;



    });


}



//====================================================
// SUMMARY CARDS
//====================================================


function updateSummaryCards(){


    const total =
    document.getElementById("totalCompanies");


    const open =
    document.getElementById("openCompanies");


    const progress =
    document.getElementById("progressCompanies");


    const closed =
    document.getElementById("closedCompanies");



    if(total){

        total.innerHTML = forecastData.length;

    }



    if(open){

        open.innerHTML =
        forecastData.filter(
            x=>x.status==="Open"
        ).length;

    }



    if(progress){

        progress.innerHTML =
        forecastData.filter(
            x=>x.status==="In Progress"
        ).length;

    }



    if(closed){

        closed.innerHTML =
        forecastData.filter(
            x=>x.status==="Closed"
        ).length;

    }


}


//====================================================
// END OF PART 1
//====================================================

//====================================================
// MODAL FUNCTIONS
//====================================================


const companyModal = document.getElementById("companyModal");

const addBtn = document.getElementById("addBtn");

const closeModalBtn = document.getElementById("closeModal");

const modalCancelBtn = document.getElementById("modalCancelBtn");

const modalSaveBtn = document.getElementById("modalSaveBtn");



//====================================================
// OPEN ADD COMPANY MODAL
//====================================================


if(addBtn){

addBtn.addEventListener("click",()=>{


    editIndex = -1;


    document.getElementById("modalTitle").innerHTML =
    "Add Company";


    modalSaveBtn.innerHTML =
    "Save";


    clearForm();


    companyModal.style.display="block";


});


}



//====================================================
// CLOSE MODAL
//====================================================


if(closeModalBtn){

closeModalBtn.addEventListener(
"click",
closeModal
);

}


if(modalCancelBtn){

modalCancelBtn.addEventListener(
"click",
closeModal
);

}



window.addEventListener("click",(event)=>{


    if(event.target === companyModal){

        closeModal();

    }


});




function closeModal(){


    if(companyModal){

        companyModal.style.display="none";

    }


}




//====================================================
// SAVE BUTTON EVENT
//====================================================


if(modalSaveBtn){

modalSaveBtn.addEventListener(
"click",
saveCompany
);

}



//====================================================
// SAVE / UPDATE COMPANY
//====================================================


function saveCompany(){



    const company = {


        slNo:
        editIndex === -1
        ?
        forecastData.length + 1
        :
        forecastData[editIndex].slNo,



        campus:
        document.getElementById("campus").value,



        company:
        document.getElementById("companyName").value,



        ctc:
        document.getElementById("ctc").value,



        role:
        document.getElementById("jobRole").value,



        visitStatus:
        document.getElementById("visitStatus").value,



        status:
        document.getElementById("status").value,



        eligible:
        document.getElementById("eligible").value,



        selections:
        document.getElementById("selections").value,



        poc:
        document.getElementById("poc").value,



        nextStep:
        document.getElementById("nextStep").value,



        remarks:
        document.getElementById("remarks").value,



        prepKit:
        document.getElementById("prepKit").value


    };




    if(company.company.trim()===""){


        alert(
        "Please enter Company Name."
        );


        return;


    }





    if(editIndex === -1){


        forecastData.push(company);


    }
    else{


        forecastData[editIndex]=company;


    }





    // SAVE DATA PERMANENTLY

    saveToLocalStorage();




    loadTable();


    updateSummaryCards();



    closeModal();


    clearForm();



    editIndex=-1;


    modalSaveBtn.innerHTML="Save";



}




//====================================================
// CLEAR FORM
//====================================================


function clearForm(){


    document.getElementById("companyName").value="";


    document.getElementById("campus").selectedIndex=0;


    document.getElementById("ctc").value="";


    document.getElementById("jobRole").value="";


    document.getElementById("visitStatus").selectedIndex=0;


    document.getElementById("status").selectedIndex=0;


    document.getElementById("eligible").value="";


    document.getElementById("selections").value="";


    document.getElementById("poc").value="";


    document.getElementById("nextStep").value="";


    document.getElementById("remarks").value="";


    document.getElementById("prepKit").value="";


}



//====================================================
// EDIT COMPANY
//====================================================


const editBtn =
document.getElementById("editBtn");



if(editBtn){


editBtn.addEventListener(
"click",
editCompany
);


}



function editCompany(){



    const selected =
    document.querySelectorAll(
    ".rowSelect:checked"
    );



    if(selected.length===0){


        alert(
        "Please select one company to edit."
        );


        return;


    }




    if(selected.length>1){


        alert(
        "Please select only one company."
        );


        return;


    }





    editIndex =
    Number(selected[0].dataset.index);




    const company =
    forecastData[editIndex];




    document.getElementById("companyName").value =
    company.company;


    document.getElementById("campus").value =
    company.campus;


    document.getElementById("ctc").value =
    company.ctc;


    document.getElementById("jobRole").value =
    company.role;


    document.getElementById("visitStatus").value =
    company.visitStatus;


    document.getElementById("status").value =
    company.status;


    document.getElementById("eligible").value =
    company.eligible;


    document.getElementById("selections").value =
    company.selections;


    document.getElementById("poc").value =
    company.poc;


    document.getElementById("nextStep").value =
    company.nextStep;


    document.getElementById("remarks").value =
    company.remarks;


    document.getElementById("prepKit").value =
    company.prepKit;




    document.getElementById("modalTitle").innerHTML =
    "Edit Company";



    modalSaveBtn.innerHTML =
    "Update";



    companyModal.style.display =
    "block";



}



//====================================================
// END OF PART 2
//====================================================


//====================================================
// DELETE COMPANY
//====================================================


const deleteBtn =
document.getElementById("deleteBtn");



if(deleteBtn){


deleteBtn.addEventListener(
"click",
deleteCompany
);


}



function deleteCompany(){



    const selectedRows =
    document.querySelectorAll(
    ".rowSelect:checked"
    );



    if(selectedRows.length===0){


        alert(
        "Please select at least one company to delete."
        );


        return;


    }




    const confirmDelete =
    confirm(
    "Are you sure you want to delete selected company(s)?"
    );



    if(!confirmDelete){

        return;

    }




    let indexes=[];



    selectedRows.forEach(row=>{


        indexes.push(
        Number(row.dataset.index)
        );


    });




    indexes.sort(
    (a,b)=>b-a
    );




    indexes.forEach(index=>{


        forecastData.splice(index,1);


    });





    forecastData.forEach(
    (item,index)=>{


        item.slNo=index+1;


    });





    saveToLocalStorage();



    loadTable();


    updateSummaryCards();



    alert(
    "Company deleted successfully."
    );


}





//====================================================
// SEARCH & FILTER
//====================================================


const searchCompany =
document.getElementById("searchCompany");

const campusFilter =
document.getElementById("campusFilter");

const statusFilter =
document.getElementById("statusFilter");



if(searchCompany){

searchCompany.addEventListener(
"keyup",
filterTable
);

}



if(campusFilter){

campusFilter.addEventListener(
"change",
filterTable
);

}



if(statusFilter){

statusFilter.addEventListener(
"change",
filterTable
);

}





function filterTable(){



    const search =
    searchCompany
    ?
    searchCompany.value.toLowerCase()
    :
    "";



    const campus =
    campusFilter
    ?
    campusFilter.value
    :
    "";



    const status =
    statusFilter
    ?
    statusFilter.value
    :
    "";





    const filtered =
    forecastData.filter(company=>{


        const companyMatch =
        company.company
        .toLowerCase()
        .includes(search);



        const campusMatch =
        campus===""
        ||
        company.campus===campus;



        const statusMatch =
        status===""
        ||
        company.status===status;



        return companyMatch
        &&
        campusMatch
        &&
        statusMatch;


    });




    loadTable(filtered);



}





//====================================================
// EXPORT TO EXCEL CSV
//====================================================


const exportBtn =
document.getElementById("exportBtn");



if(exportBtn){


exportBtn.addEventListener(
"click",
exportToExcel
);


}




function exportToExcel(){



    let csv=[];



    csv.push([


        "Sl No",

        "Campus",

        "Company Name",

        "CTC (LPA)",

        "Job Role",

        "Company Visit Status",

        "Status",

        "Total Eligible Students",

        "No of Selections",

        "Point of Contact",

        "Next Step",

        "Remarks",

        "PrepKit Link"



    ].join(","));





    forecastData.forEach(company=>{


        csv.push([


            company.slNo,

            company.campus,

            company.company,

            company.ctc,

            company.role,

            company.visitStatus,

            company.status,

            company.eligible,

            company.selections,

            company.poc,

            company.nextStep,

            company.remarks,

            company.prepKit



        ].join(","));



    });





    const blob =
    new Blob(
    [csv.join("\n")],
    {
        type:"text/csv"
    });



    const link =
    document.createElement("a");



    link.href =
    URL.createObjectURL(blob);



    link.download =
    "Monthly_Forecast.csv";



    document.body.appendChild(link);



    link.click();



    document.body.removeChild(link);



}





//====================================================
// LOCAL STORAGE
//====================================================



function saveToLocalStorage(){



    localStorage.setItem(

        "forecastData",

        JSON.stringify(forecastData)

    );



    localStorage.setItem(

        "forecastLastUpdated",

        new Date().toLocaleString()

    );



    console.log(
    "DATA SAVED TO LOCAL STORAGE",
    forecastData
    );


}




function loadFromLocalStorage(){



    const data =
    localStorage.getItem(
    "forecastData"
    );



    if(data){


        forecastData =
        JSON.parse(data);



        console.log(
        "DATA LOADED FROM LOCAL STORAGE",
        forecastData
        );



    }
    else{


        console.log(
        "NO LOCAL STORAGE DATA FOUND"
        );


    }


}



//====================================================
// END OF FILE
//====================================================

//====================================================
// LAST UPDATED
//====================================================


function updateLastUpdated(){


    const lastUpdated =
    document.getElementById("lastUpdated");


    if(lastUpdated){


        lastUpdated.innerHTML =

        localStorage.getItem(
            "forecastLastUpdated"
        )

        ||

        "No Updates";


    }


}
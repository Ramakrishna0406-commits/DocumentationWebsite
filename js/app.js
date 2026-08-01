window.onload=function(){

    loadTree();

}

async function loadPage(page,element){

    document.querySelectorAll(".page").forEach(p=>{

        p.classList.remove("active");

    });

    element.classList.add("active");

    const response=await fetch(page);

    const html=await response.text();

    document.getElementById("contentArea").innerHTML=html;

}
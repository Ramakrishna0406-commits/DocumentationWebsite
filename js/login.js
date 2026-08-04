document.addEventListener("DOMContentLoaded", () => {

    const sendOtpBtn = document.getElementById("sendOtpBtn");

    sendOtpBtn.addEventListener("click", () => {

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();

        if(username === "" || email === ""){

            alert("Please enter User Name and GITAM Email.");

            return;
        }

        alert("OTP functionality will be implemented in the next step.");

    });

});
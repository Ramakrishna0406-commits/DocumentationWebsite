// js/login.js

function handleCredentialResponse(response) {

    console.log("Google Credential Received");

    const idToken = response.credential;


    fetch("https://data-pulse-backend.onrender.com/verify-token", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            token: idToken

        })

    })

    .then(response => {

        console.log("Backend Response Status:", response.status);

        return response.json();

    })

    .then(data => {

        console.log("Authentication Response:", data);


        if (data.success) {


            console.log("Login Successful");


            // Save user information

            localStorage.setItem(

                "loggedInUser",

                JSON.stringify({

                    name: data.name,

                    email: data.email,

                    picture: data.picture

                })

            );


            // Redirect to editable dashboard

            window.location.href = "EditableDashboard.html";


        } else {


            alert(data.message || "Login failed");


        }


    })

    .catch(error => {


        console.error("Login Error:", error);


        alert(

            "Login failed. Backend server is not responding."

        );


    });


}



window.onload = function () {


    google.accounts.id.initialize({


        client_id:

        "550281488247-1c34ml0lg80i9agki949fop3lj9avm2d.apps.googleusercontent.com",


        callback: handleCredentialResponse


    });



    google.accounts.id.renderButton(


        document.getElementById("google-signin-button"),


        {


            theme: "outline",

            size: "large",

            width: 300


        }


    );


};
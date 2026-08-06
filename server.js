const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");

const app = express();


// Allow GitHub Pages frontend
app.use(cors({
    origin: "https://ramakrishna0406-commits.github.io",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());


// Read Google Client ID from environment variable
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;


// Create Google OAuth client
const client = new OAuth2Client(CLIENT_ID);


// Health check API
app.get("/", (req, res) => {

    res.send("DATA PULSE Authentication Server is Running...");

});


// Verify Google ID Token
app.post("/verify-token", async (req, res) => {

    const { token } = req.body;


    if (!token) {

        return res.status(400).json({
            success: false,
            message: "Google token missing"
        });

    }


    try {


        const ticket = await client.verifyIdToken({

            idToken: token,
            audience: CLIENT_ID

        });


        const payload = ticket.getPayload();


        const email = payload.email;


        // Allow only GITAM email accounts

        if (!email.endsWith("@gitam.edu")) {

            return res.status(403).json({

                success: false,
                message: "Only GITAM accounts are allowed."

            });

        }


        res.json({

            success: true,

            name: payload.name,

            email: payload.email,

            picture: payload.picture

        });


    } catch (error) {


        console.error("Google Token Verification Error:", error);


        res.status(401).json({

            success: false,

            message: "Invalid Google Token"

        });


    }

});



// Render uses PORT environment variable

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(`DATA PULSE Authentication Server running on port ${PORT}`);

});
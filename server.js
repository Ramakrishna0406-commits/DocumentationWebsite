const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");

const app = express();

app.use(cors());
app.use(express.json());

// Read Client ID from .env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Create Google OAuth client
const client = new OAuth2Client(CLIENT_ID);

app.get("/", (req, res) => {
    res.send("DATA PULSE Authentication Server is Running...");
});

// Verify Google ID Token
app.post("/verify-token", async (req, res) => {

    const { token } = req.body;

    try {

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();

        const email = payload.email;

        // Allow only GITAM accounts
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

        console.error(error);

        res.status(401).json({
            success: false,
            message: "Invalid Google Token"
        });

    }

});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
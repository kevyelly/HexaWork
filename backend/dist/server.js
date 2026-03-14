"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
async function getZoomAccessToken() {
    const accountId = (process.env.ZOOM_ACCOUNT_ID || '').trim();
    const clientId = (process.env.ZOOM_CLIENT_ID || '').trim();
    const clientSecret = (process.env.ZOOM_CLIENT_SECRET || '').trim();
    if (!accountId || !clientId || !clientSecret) {
        console.error("CRITICAL: Missing Zoom credentials in .env file");
        throw new Error("Missing Zoom credentials");
    }
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    try {
        const response = await axios_1.default.post(tokenUrl, '', {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    }
    catch (error) {
        console.error("Zoom Auth Error Details:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
        else {
            console.error("Message:", error.message);
        }
        throw new Error("Failed to authenticate with Zoom");
    }
}
app.post('/api/create-meeting', async (req, res) => {
    console.log("Received request to generate Zoom meeting...");
    try {
        const accessToken = await getZoomAccessToken();
        console.log("Successfully retrieved Zoom Access Token!");
        const meetingResponse = await axios_1.default.post('https://api.zoom.us/v2/users/me/meetings', {
            type: 1, // 1 = Instant meeting
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: true,
                waiting_room: false
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Successfully created Zoom meeting!");
        res.json({
            join_url: meetingResponse.data.join_url,
            start_url: meetingResponse.data.start_url
        });
    }
    catch (error) {
        console.error("Final Error creating meeting:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create Zoom meeting" });
    }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Zoom backend running on http://localhost:${PORT}`);
});

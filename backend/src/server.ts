import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dns from 'dns';
import path from 'path';

//npx ts-node server.ts

dns.setDefaultResultOrder('ipv4first');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

interface ZoomTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface ZoomMeetingResponse {
    join_url: string;
    start_url: string;
    [key: string]: any;
}

async function getZoomAccessToken(): Promise<string> {
    const accountId = (process.env.ZOOM_ACCOUNT_ID || '').trim();
    const clientId = (process.env.ZOOM_CLIENT_ID || '').trim();
    const clientSecret = (process.env.ZOOM_CLIENT_SECRET || '').trim();

    if (!accountId || !clientId || !clientSecret) {
        console.error("CRITICAL: Missing Zoom credentials in .env file");
        throw new Error("Missing Zoom credentials");
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'account_credentials');
    params.append('account_id', accountId);

    try {
        const response = await axios.post<ZoomTokenResponse>(
            'https://zoom.us/oauth/token',
            params.toString(),
            {
                headers: {
                    'Authorization': `Basic ${authHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error: any) {
        console.error("Zoom Auth Error Details:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Message:", error.message);
            console.error("Code:", error.code);
        }
        throw new Error("Failed to authenticate with Zoom");
    }
}

app.post('/api/create-meeting', async (req: Request, res: Response) => {
    console.log("👉 Received request to generate Zoom meeting...");

    try {
        const accessToken = await getZoomAccessToken();
        console.log("✅ Successfully retrieved Zoom Access Token!");

        const meetingResponse = await axios.post<ZoomMeetingResponse>(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                type: 1,
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: true,
                    waiting_room: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Successfully created Zoom meeting!");
        res.json({
            join_url: meetingResponse.data.join_url,
            start_url: meetingResponse.data.start_url
        });

    } catch (error: any) {
        console.error("Final Error creating meeting:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create Zoom meeting" });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Zoom backend running on http://localhost:${PORT}`);
});
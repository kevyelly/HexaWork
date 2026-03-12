import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

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
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;

    const clientId = process.env.ZOOM_CLIENT_ID || '';
    const clientSecret = process.env.ZOOM_CLIENT_SECRET || '';

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await axios.post<ZoomTokenResponse>(
            tokenUrl,
            {},
            {
                headers: {
                    'Authorization': `Basic ${authHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error: any) {
        console.error("Error getting Zoom token:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with Zoom");
    }
}

app.post('/api/create-meeting', async (req: Request, res: Response) => {
    try {
        const accessToken = await getZoomAccessToken();

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

        res.json({
            join_url: meetingResponse.data.join_url,
            start_url: meetingResponse.data.start_url
        });

    } catch (error: any) {
        console.error("Error creating meeting:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create Zoom meeting" });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`zoom running http://localhost:${PORT}`);
});
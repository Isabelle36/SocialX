import { NextResponse } from "next/server";
import axios from "axios";

const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Authorization code is required." }, { status: 400 });
  }

  try {
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
      })
    );

    const { access_token, user_id } = tokenResponse.data;

    // Save token securely in MongoDB or another database
    return NextResponse.json({ access_token, user_id });
  } catch (error) {
    console.error("Token exchange error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to exchange token." }, { status: 500 });
  }
}

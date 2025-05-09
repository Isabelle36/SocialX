import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/lib/generateToken";

export async function GET(req) {
  const cookies = req.headers.get("cookie");
  const token = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];
  const refreshToken = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("refreshToken="))
    ?.split("=")[1];

  if (!token && !refreshToken) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  try {
    const tokenSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    let decoded;

    if (token) {
      try {
        decoded = jwt.verify(token, tokenSecret);
        return new Response(JSON.stringify({ authenticated: true }), { status: 200 });
      } catch (error) {
        if (error.name !== "TokenExpiredError") {
          throw error;
        }
      }
    }

    // If access token is expired, verify the refresh token
    if (refreshToken) {
      try {
        const refreshDecoded = jwt.verify(refreshToken, refreshTokenSecret);
        const { instagramId } = refreshDecoded;

        // Generate a new access token
        const newAccessToken = generateAccessToken({ instagramId });
        return new Response(JSON.stringify({ authenticated: true }), {
          status: 200,
          headers: {
            "Set-Cookie": `token=${newAccessToken}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
          },
        });
      } catch (error) {
        console.error("Error verifying refresh token:", error.message);
        return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
      }
    }

    // If no valid tokens are found
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return new Response(JSON.stringify({ authenticated: false }), { status: 500 });
  }
}

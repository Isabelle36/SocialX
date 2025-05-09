import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { generateAccessToken } from "@/lib/generateToken";

export async function GET(req) {
  const cookies = req.headers.get("cookie");

  // Extract the access token and refresh token from cookies
  const token = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];

  const refreshToken = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("refreshToken="))
    ?.split("=")[1];

  if (!token && !refreshToken) {
    console.error("Both access token and refresh token are missing.");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const tokenSecret = `${process.env.JWT_SECRET}`;
    const refreshTokenSecret = `${process.env.REFRESH_TOKEN_SECRET}`;

    let decoded;

    if (token) {
      try {
        decoded = jwt.verify(token, tokenSecret);
        console.log("Decoded Token:", decoded);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          console.warn("Access token expired. Attempting to refresh...");
        } else {
          throw error;
        }
      }
    }

    if (!decoded && refreshToken) {
      try {
        const refreshDecoded = jwt.verify(refreshToken, refreshTokenSecret);
        const {instagramId}=refreshDecoded;
        const newAccessToken = generateAccessToken({instagramId});
        decoded=jwt.verify(token,newAccessToken);

        return new Response(JSON.stringify({token:newAccessToken}), {
          status: 200,
          headers: {
            "Set-Cookie": `token=${newAccessToken}; HttpOnly; Path=/; Max-Age=3600`,
          },
        });
      } catch (error) {
        console.error("Error verifying refresh token:", error);
        return new Response(JSON.stringify({ error: "Invalid or expired refresh token." }), { status: 401 });
      }
    }

    // If we have a valid decoded token, fetch the accounts
    const { instagramId } = decoded;

    if (!instagramId) {
      console.error("Invalid token payload: instagramId missing.");
      return new Response(JSON.stringify({ error: "Invalid token payload." }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("socialX");

    const accounts = await db.collection("instagram_accounts").find({ userInstaId: instagramId }).toArray();

    if (accounts.length === 0) {
      console.error("No accounts found for the given Instagram ID.");
      return new Response(JSON.stringify([],{ error: "No accounts found." }), { status: 404 });
    }

    return new Response(JSON.stringify(accounts), { status: 200 });
  } catch (error) {
    console.error("Error verifying token:", error);
    return new Response(JSON.stringify({ error: "Invalid or expired token." }), { status: 401 });
  }
}
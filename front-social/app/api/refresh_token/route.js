import jwt from "jsonwebtoken";

export async function GET(req) {
  const cookies = req.headers.get("cookie");
  const refreshToken = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("refreshToken="))
    ?.split("=")[1];

  if (!refreshToken) {
    return new Response(
      JSON.stringify({ error: "Refresh token missing." }),
      { status: 401 }
    );
  }

  try {
    const refreshTokenSecret = `${process.env.REFRESH_TOKEN_SECRET}`;
    const tokenSecret = `${process.env.JWT_SECRET}`;
    console.log(refreshToken)
   
    console.log("REFRESH_TOKEN_SECRET:", refreshTokenSecret);

   
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    const { instagramId } = decoded;

    
    const newAccessToken = jwt.sign(
      { instagramId },
      tokenSecret,
      { expiresIn: "30s" }
    );

    return new Response(
      JSON.stringify({ jwtToken: newAccessToken }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error refreshing token:", error);
    return new Response(
      JSON.stringify({ error: "Invalid or expired refresh token." }),
      { status: 401 }
    );
  }
}
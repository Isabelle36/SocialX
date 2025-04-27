import jwt from "jsonwebtoken";

export async function GET(req) {
  const cookies = req.headers.get("cookie");
  const token = cookies
    ?.split("; ")
    .find((cookie) => cookie.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  try {
    jwt.verify(token, `${process.env.JWT_SECRET}`); // Verifies token
    return new Response(JSON.stringify({ authenticated: true }), { status: 200 });
  } catch (error) {
    console.error("Token verification error:", error);
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }
}

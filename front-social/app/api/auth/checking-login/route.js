import jwt from "jsonwebtoken";

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
    jwt.verify(token, `${process.env.JWT_SECRET}`); // Verifies token
    return new Response(JSON.stringify({ authenticated: true }), { status: 200 });
  } catch (error) {
    console.error("Token verification error:", error);
    if(refreshToken)
    {
      try{
        jwt.verify(refreshToken,`${process.env.REFRESH_TOKEN_SECRET}`);
        return new Response(JSON.stringify({authenticated:true}),{status:200})
      }
      catch(err)
      {
        console.error("Refresh token verification error");
        return new Response(JSON.stringify({authenticated:false}),{status:401});
      }
    }
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }
}

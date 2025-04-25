
export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const code = searchParams.get("code");
      const redirect_uri=process.env.NEXT_PUBLIC_GETTING_INSTA_REDIRECT_URI;
  
      if (!code) {
        return new Response("Authorization code missing.", { status: 400 });
      }
  
      
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v22.0/oauth/access_token?` +
        `client_id=${process.env.NEXT_PUBLIC_APP_CLIENT_ID}&` +
        `redirect_uri=${process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI}&` +
        `client_secret=${process.env.NEXT_PUBLIC_APP_CLIENT_SECRET}&` +
        `code=${code}`
      );
  
      if (!tokenResponse.ok) {
        throw new Error("Failed to fetch access token.");
      }
  
      const tokenData = await tokenResponse.json();
      
      const redirectUrl = `${redirect_uri}?accessToken=${tokenData.access_token}`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }

  }
  
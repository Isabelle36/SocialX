export async function GET(req) {

    const facebookAuthUrl = `https://www.facebook.com/v22.0/dialog/oauth?` +
      `client_id=${process.env.NEXT_PUBLIC_APP_CLIENT_ID}&` +
      `redirect_uri=${process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI}&` +
      `scope=pages_show_list,instagram_basic,business_management,instagram_manage_insights&` +
      `response_type=code`;
  
      return new Response(null, { status: 302, headers: { Location: facebookAuthUrl } });
    }
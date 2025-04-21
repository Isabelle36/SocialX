export async function GET(req, res) {
    const {searchParams}= new URL(req.url);
    const accessToken = searchParams.get("accessToken");
  
    if (!accessToken) {
        return new Response(JSON.stringify({ error: "Access token missing." }), { status: 400 });
    }
  
    try {
      
      const pagesResponse = await fetch(`https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesResponse.json();
  
      if (pagesData.error) {
        return new Response(JSON.stringify({ error: pagesData.error.message }), { status: 400 });
      }
  
      const instagramAccounts = [];
  
      
      for (const page of pagesData.data) {
        const igResponse = await fetch(`https://graph.facebook.com/v22.0/${page.id}?` +
          `fields=instagram_business_account&access_token=${accessToken}`);
        const igData = await igResponse.json();
  
        if (igData.instagram_business_account) {
            const instagramId = igData.instagram_business_account.id;
            const igUserPfpResponse = await fetch(`https://graph.facebook.com/v22.0/${instagramId}?` +
                    `fields=username,profile_picture_url&access_token=${accessToken}`)
            const igDetailsWithPfp = await igUserPfpResponse.json();
            if(igDetailsWithPfp.username && igDetailsWithPfp.profile_picture_url)
            {
                instagramAccounts.push({
                    pageName: page.name,
                    instagramId,
                     username: igDetailsWithPfp.username,
                    profile_picture_url: igDetailsWithPfp.profile_picture_url
                  });
            }
          
        }
      }
  
      return new Response(null,
       { status: 302,
         headers : {Location: `${process.env.NEXT_PUBLIC_HOME_REDIRECT_URI}?accounts=${encodeURIComponent(JSON.stringify(instagramAccounts))}`} });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch Instagram accounts." }), { status: 500 });    }
  }
  
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get("accessToken");

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Access token or userId missing." }),
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("socialX");

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      return new Response(JSON.stringify({ error: pagesData.error.message }), {
        status: 400,
      });
    }

    const instagramAccounts = [];
    let jwtToken, refreshToken;

    for (const page of pagesData.data) {
      const igResponse = await fetch(
        `https://graph.facebook.com/v22.0/${page.id}?` +
          `fields=instagram_business_account&access_token=${accessToken}`
      );
      const igData = await igResponse.json();

      if (igData.instagram_business_account) {
        const instagramId = igData.instagram_business_account.id;

        const existingAccount = await db
          .collection("instagram_accounts")
          .findOne({ userInstaId: instagramId });
        if (existingAccount) {
          console.log(
            "Account already exists in the database:",
            existingAccount
          );
          instagramAccounts.push({
            message: "Account already exists in the database",
            ...existingAccount,
          });
          continue;
        }
        const igUserPfpResponse = await fetch(
          `https://graph.facebook.com/v22.0/${instagramId}?` +
            `fields=username,profile_picture_url&access_token=${accessToken}`
        );
        const igDetailsWithPfp = await igUserPfpResponse.json();
        if (igDetailsWithPfp.username && igDetailsWithPfp.profile_picture_url) {
          const accountData = {
            username: igDetailsWithPfp.username,
            profile_picture_url: igDetailsWithPfp.profile_picture_url,
            pageName: page.name,
            accessToken,
            pageId: page.id,
          };
          await db
            .collection("instagram_accounts")
            .updateOne(
              { userInstaId: instagramId },
              { $set: accountData },
              { upsert: true }
            );
          const tokenSecret = process.env.JWT_SECRET;
          const refreshTokSecret = process.env.REFRESH_TOKEN_SECRET;
          jwtToken = jwt.sign({ instagramId }, tokenSecret, {
            expiresIn: "1h",
          });
          refreshToken = jwt.sign({ instagramId }, refreshTokSecret, {
            expiresIn: "7d",
          });
          console.log("Generated JWT Token:", jwtToken);

          instagramAccounts.push({ ...accountData, jwtToken });
        }
      }
    }
    const HomeUri = `${process.env.NEXT_PUBLIC_HOME_REDIRECT_URI}`;

    return new Response(JSON.stringify({ instagramAccounts, jwtToken }), {
      status: 302,
      headers: {
        "Set-Cookie": [
          `token=${jwtToken}; HttpOnly; Path=/; Max-Age=3600`, // Access token (1 hour expiration)
          `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${
            7 * 24 * 60 * 60
          }`, 
        ].join(", "),
        Location: HomeUri,
      },
    });
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Instagram accounts." }),
      { status: 500 }
    );
  }
}

import { connectToDatabase } from "@/utils/mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const accessToken = process.env.NEXT_PUBLIC_META_ACCESS_TOKEN;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Access token not found" }), { status: 401 });
  }

  try {
    const userRes = await fetch(
      `https://graph.facebook.com/${userId}?fields=id,username,profile_picture_url&access_token=${accessToken}`
    );
    const userData = await userRes.json();

    if (userData.error) {
      console.error("Instagram API error:", userData.error);
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    const { db } = await connectToDatabase();
    await db.collection("accounts").insertOne(userData);

    return new Response(JSON.stringify(userData), { status: 200 });
  } catch (err) {
    console.error("Fetch failed:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch user" }), { status: 500 });
  }
}
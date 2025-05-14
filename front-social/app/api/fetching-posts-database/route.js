import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("socialX"); 
    const posts = await db.collection("scheduledPosts").find({}).toArray(); 

    return NextResponse.json(
      posts.map((post) => ({
        _id: post._id.toString(),
        caption: post.caption,
        images: post.image_url || post.children || null,
        videos: post.video_url || null,
        status: post.status,
        scheduledTime:post.scheduledTime,
        error:post.error,
      }))
    );
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.error();
  }
}

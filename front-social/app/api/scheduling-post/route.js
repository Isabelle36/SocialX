import clientPromise from "@/lib/mongodb";
import Agenda from "agenda";

const agenda = new Agenda({ db: { address: process.env.MONGODB_URI } });

export async function POST(req) {
  try {
    const { imageUrls, caption, scheduledTime, igUserId, accessToken } =
      await req.json();

    if (!imageUrls || !caption || !scheduledTime || !accessToken || !igUserId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("socialX");

    let mediaType, mediaUrlKey;
    let agendaJob;

    if (imageUrls.length === 1 && imageUrls[0].endsWith(".mp4")) {
      mediaType = "video";
      mediaUrlKey = "video_url";
      agendaJob = "publishSingleVideo";
    } else if (
      (imageUrls.length === 1 && imageUrls[0].endsWith(".jpg")) ||
      imageUrls[0].endsWith(".jpeg")
    ) {
      mediaType = "image";
      mediaUrlKey = "image_url";
      agendaJob = "publishSingleImage";
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported media type or multiple URLs" }),
        { status: 400 }
      );
    }

    const post = await db.collection("scheduledPosts").insertOne({
      [mediaUrlKey]: imageUrls[0],
      media_type: mediaType === "video" ? "REELS" : "IMAGE",
      caption,
      scheduledTime: new Date(scheduledTime),
      igUserId,
      accessToken,
      status: "pending",
    });

    await agenda.start();
    await agenda.schedule(new Date(scheduledTime), agendaJob, {
      postId: post.insertedId,
    });

    return new Response(
      JSON.stringify({
        message: "Post scheduled successfully",
        postId: post.insertedId,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error scheduling post", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

agenda.define("publishSingleImage", async (job) => {
  const { postId } = job.attrs.data;

  const client = await clientPromise;
  const db = client.db("socialX");
  try {
    const post = await db.collection("scheduledPosts").findOne({ _id: postId });

    if (!post) {
      console.error("Post not found", postId);
      await db
        .collection("scheduledPosts")
        .updateOne(
          { _id: postId },
          { $set: { status: "failed", error: "Post not found" } }
        );
      return;
    }

    const creatingCreationId = await fetch(
      `https://graph.facebook.com/v22.0/${post.igUserId}/media`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image_url: post.image_url,
          caption: post.caption,
          access_token: post.accessToken,
        }),
      }
    );

    const creationId = await creatingCreationId.json();

    if (creationId.error) {
      console.error("Error creating media", creationId.error.message);
      await db
        .collection("scheduledPosts")
        .updateOne(
          { _id: postId },
          { $set: { status: "failed", error: creationId.error.message } }
        );
      return;
    }

    const publishThePost = await fetch(
      `https://graph.facebook.com/v22.0/${post.igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId.id,
          access_token: post.accessToken,
        }),
      }
    );

    const publishResponse = await publishThePost.json();

    if (publishResponse.error) {
      console.error("Error publishing post", publishResponse.error.message);
      await db
        .collection("scheduledPosts")
        .updateOne(
          { _id: postId },
          { $set: { status: "failed", error: publishResponse.error.message } }
        );
      return;
    }

    await db
      .collection("scheduledPosts")
      .updateOne(
        { _id: postId },
        { $set: { status: "Published", PublishedAt: new Date() } }
      );

    console.log("Image post published successfully", publishResponse.id);
  } catch (err) {
    console.error("Error posting image to Instagram", err);
    await db
      .collection("scheduledPosts")
      .updateOne(
        { _id: postId },
        { $set: { status: "failed", error: err.message } }
      );
  }
});


agenda.define("publishSingleVideo", async (job) => {
  const { postId } = job.attrs.data;

  const client = await clientPromise;
  const db = client.db("socialX");

  try {
    const post = await db.collection("scheduledPosts").findOne({ _id: postId });

    if (!post) {
      console.error("Post not found:", postId);
      return;
    }

   
    if (post.status === "Published") {
      console.log("Post already published:", postId);
      return;
    }

    const creatingCreationId = await fetch(
      `https://graph.facebook.com/v22.0/${post.igUserId}/media`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          video_url: post.video_url,
          caption: post.caption,
          access_token: post.accessToken,
          media_type: "REELS",
        }),
      }
    );

    const creationResponse = await creatingCreationId.json();

    if (creationResponse.error) {
      console.error("Error creating media:", creationResponse.error.message);
      await db.collection("scheduledPosts").updateOne(
        { _id: postId },
        { $set: { status: "failed", error: creationResponse.error.message } }
      );
      return;
    }

    const creationId = creationResponse.id;

    const maxRetries = 20;
    let retries = 0;
    let mediaStatus = "IN_PROGRESS";

    while (mediaStatus === "IN_PROGRESS" && retries < maxRetries) {
      console.log(`Media not ready, retrying (${retries + 1}/${maxRetries})...`);
      await new Promise((resolved) => setTimeout(resolved, 5000)); 

      const statusCheck = await fetch(
        `https://graph.facebook.com/v22.0/${creationId}?fields=status_code&access_token=${post.accessToken}`
      );
      const statusResponse = await statusCheck.json();

      if (statusResponse.error) {
        console.error("Error checking status:", statusResponse.error.message);
        await db.collection("scheduledPosts").updateOne(
          { _id: postId },
          { $set: { status: "failed", error: statusResponse.error.message } }
        );
        return;
      }

      mediaStatus = statusResponse.status_code;
      retries++;
    }

    if (mediaStatus !== "FINISHED") {
      console.error("Media is not ready for publishing after retries.");
      await db.collection("scheduledPosts").updateOne(
        { _id: postId },
        { $set: { status: "failed", error: "Media not ready after retries." } }
      );
      return;
    }

    const publishThePost = await fetch(
      `https://graph.facebook.com/v22.0/${post.igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: post.accessToken,
        }),
      }
    );

    const publishResponse = await publishThePost.json();

    if (publishResponse.error) {
      console.error("Error publishing post:", publishResponse.error.message);
      await db.collection("scheduledPosts").updateOne(
        { _id: postId },
        { $set: { status: "failed", error: publishResponse.error.message } }
      );
      return;
    }

    await db.collection("scheduledPosts").updateOne(
      { _id: postId },
      { $set: { status: "Published", PublishedAt: new Date() } }
    );

    console.log("Video post published successfully:", publishResponse.id);
  } catch (err) {
    console.error("Error publishing video post:", err.message);
    await db.collection("scheduledPosts").updateOne(
      { _id: postId },
      { $set: { status: "failed", error: err.message } }
    );
  }
});

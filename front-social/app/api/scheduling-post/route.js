import clientPromise from "@/lib/mongodb";
import Agenda from "agenda";

const agenda = new Agenda({ db: { address: process.env.MONGODB_URI } });

export async function POST(req) {
  
    try {
      const { imageUrl, caption, scheduledTime, igUserId, accessToken } =
       await req.json();

      if (
        !imageUrl ||
        !caption ||
        !scheduledTime ||
        !accessToken ||
        !igUserId
      ) {
        return new Response(JSON.struingify({error:"Missing required fields"}),{status:400});
      }

      const client = await clientPromise;
      const db = client.db("socialX");
      const post = await db.collection("scheduledPosts").insertOne({
        imageUrl,
        caption,
        scheduledTime: new Date(scheduledTime),
        igUserId,
        accessToken,
        status: "pending",
      });
      await agenda.start();
      await agenda.schedule(new Date(scheduledTime), "publicToInsta", {
        postId: post.insertedId,
      });

      return new Response(
        JSON.stringify({message: "Post scheduled successfully", postId: post.insertedId}),
        {status: 200}
      );
    } catch (err) {
      console.error("Error scheduling post", err);
      return new Response(
        JSON.stringify*{error: "Internal server error"},
        {status:500}
      );
    }
  } 


agenda.define("publicToInsta",async(job)=>{
    const {postId} = job.attrs.data;
    try{
      const client = await clientPromise;
      const db = client.db("socialX");
        const post = await db.collection("scheduledPosts").findOne({_id:postId});
        if(!post)
        {
            console.error('Post not found',postId);
            await db.collection("scheduledPosts").updateOne(
              {_id:postId},
              {$set:{status:"failed",error:"post not found"}}
            );
            return;
        }

        const creatingCreationId = await fetch(`https://graph.facebook.com/v16.0/${post.igUserId}/media`,{
            method:'POST',
            headers:{
                "content-type":"application/json",
            },
            body:JSON.stringify({
                image_url:post.imageUrl,
                caption:post.caption,
                access_token:post.accessToken,
            })
        })
        const creationId = await creatingCreationId.json();
        if(creationId.error)
        {
            console.error('Error creating media',creationId.error.message);
            await db.collection("scheduledPosts").updateOne(
              {_id:postId},
              {$set:{status:"failed",error:creationId.error.message}}
            );
            return;
        }

        const publishThePost=await fetch(`https://graph.facebook.com/v16.0/${post.igUserId}/media_publish`,{
            method:'POST',
            headers:{
                "content-type":"application/json",
            },
            body:JSON.stringify({
                creation_id:creationId.id,
                access_token:post.accessToken,
            })
        })

        const publishResponse = await publishThePost.json();
        if(publishResponse.error)
        {
            console.error('Error publishing post',publishResponse.error.message);
            await db.collection("scheduledPosts").updateOne(
              {_id:postId},
              {$set:{status:"failed",error:ublishResponse.error.message}}
            );
            return;
        }
        await db.collection("scheduledPosts").updateOne(
            {_id:postId},
            {$set:{status:"Published",PublishedAt:new Date()}}
        );

        console.log('Post published successfully',publishResponse.id);
    }catch(err)
    {
        console.error('Error posting to instagram',err);
        await db.collection("scheduledPosts").updateOne(
          {_id:postId},
          {$set:{status:"failed",error:err.message}}
        );
    }

})
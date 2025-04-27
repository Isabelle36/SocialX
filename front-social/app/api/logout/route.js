import clientPromise from '@/lib/mongodb';

export async function DELETE(req)
{
    try {
        // const cookies = req.headers.get("cookie");
        // const userInstaId=cookies?.split("; ")
        // .find((cookie) => cookie.startsWith("userInstaId=")?.split("=")[1]);
        
        const body = await req.json();
        const { userInstaId } = body;
        if(!userInstaId)
        {
            return new Response(JSON.stringify(
                {error:"No userInstaId provided"}
            ),{status:400});
        }

        const client = await clientPromise;
        const db = client.db("socialX");

        const result = await db.collection("instagram_accounts").deleteOne({userInstaId});

        if(result.deletedCount===0)
        {
            return new Response(
                JSON.stringify({error:
                    "user not found in database"
                }),{status:404}
            );
        }

        return new Response(
            null,
            {
                status:200,
                headers:{
                    "Set-Cookie":[
                        `token=; HttpOnly; Path=/; Max-Age=0`,
                        `refreshToken=; HttpOnly; Path=/; Max-Age=0`,
                    ].join(", "),
                },
            }
        );
    } catch (error) {
        console.error("error during logging out : ",error);
        return new Response(
            JSON.stringify({error:"Failed to log out"}),
            {status:500}
        )
    }
}
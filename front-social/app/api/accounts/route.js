import { connectToDatabase } from "@/utils/mongodb";

export async function GET() {
  const { db } = await connectToDatabase();
  const accounts = await db.collection("accounts").find().toArray();
  return new Response(JSON.stringify(accounts), { status: 200 });
}

export async function DELETE(request) {
  const { username } = await request.json();
  const { db } = await connectToDatabase();
  await db.collection("accounts").deleteOne({ username });
  return new Response(JSON.stringify({ message: "Account disconnected" }), { status: 200 });
}
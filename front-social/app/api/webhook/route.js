export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;;

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified!');
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('❌ Verification failed', { status: 403 });
    }
  }

  return new Response('No hub params found', { status: 400 });
}

export async function POST(request) {
  const body = await request.json();

  // Do something with the incoming Instagram webhook event
  console.log('📥 Webhook event received:', JSON.stringify(body, null, 2));

  return new Response('Event received', { status: 200 });
}

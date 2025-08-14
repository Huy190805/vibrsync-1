export async function POST(req) {
  const body = await req.json();
  console.log("📩 Webhook nhận được:", body);
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

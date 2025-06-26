import { BreezeConnect } from "breezeconnect";

let breeze = null;

export async function POST(req) {
  try {
    const { api_key, secret_key, session_token } = await req.json();
    breeze = new BreezeConnect({ appKey: api_key });

    await breeze.generateSession(secret_key, session_token);

    console.log("✅ Breeze session initialized");
    return Response.json({ success: true, message: "Session initialized successfully" });
  } catch (err) {
    console.error("❌ init-session error:", err);
    return Response.json({ success: false, message: err.message }, { status: 400 });
  }
}

export { breeze };

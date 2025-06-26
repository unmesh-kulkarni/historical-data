import { BreezeConnect } from "breezeconnect";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      api_key,
      secret_key,
      session_token,
      interval,
      from_date,
      to_date,
      stock_code,
      exchange_code,
      product_type,
      expiry_date,
      right,
      strike_price,
    } = body;

    const breeze = new BreezeConnect({ appKey: api_key });
    await breeze.generateSession(secret_key, session_token);

    const result = await breeze.get_historical_data_v2({
      interval,
      from_date,
      to_date,
      stock_code,
      exchange_code,
      product_type,
      expiry_date,
      right,
      strike_price,
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error("Historical data fetch failed:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export default async function handler(req, res) {
  try {
    const supabaseUrl = (
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      ""
    ).trim();

    const supabaseKey = (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      ""
    ).trim();

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: "Supabase غير مربوط بالموقع."
      });
    }

    const url =
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/cars?select=*&order=created_at.desc`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Supabase error:", data);

      return res.status(response.status).json({
        error: "تعذر جلب السيارات من Supabase."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Cars API error:", error);

    return res.status(500).json({
      error: "صار خطأ أثناء جلب السيارات."
    });
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

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

    const { fileName, contentType, fileBase64 } = req.body || {};

    if (!fileName || !contentType || !fileBase64) {
      return res.status(400).json({
        error: "الصورة ناقصة."
      });
    }

    const safeFileName = String(fileName)
      .replace(/[^a-zA-Z0-9._-]/g, "-");

    const uniqueName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeFileName}`;

    const filePath = `cars/${uniqueName}`;

    const binaryString = Buffer.from(fileBase64, "base64");

    const uploadUrl =
      `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/car-images/${filePath}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": contentType,
        "x-upsert": "true"
      },
      body: binaryString
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Supabase Storage error:", data);

      return res.status(response.status).json({
        error: "تعذر رفع الصورة."
      });
    }

    const publicUrl =
      `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/car-images/${filePath}`;

    return res.status(200).json({
      success: true,
      image_url: publicUrl
    });

  } catch (error) {

    console.error("Upload image error:", error);

    return res.status(500).json({
      error: "صار خطأ أثناء رفع الصورة."
    });
  }
}
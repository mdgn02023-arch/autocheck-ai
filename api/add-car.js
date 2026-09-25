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

    const body = req.body || {};

    const requiredFields = [
      "brand",
      "model",
      "year",
      "mileage",
      "price",
      "governorate",
      "fuel",
      "gearbox",
      "seller_phone"
    ];

    const missingFields = requiredFields.filter((field) => {
      return (
        body[field] === undefined ||
        body[field] === null ||
        String(body[field]).trim() === ""
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "الرجاء تعمير جميع المعلومات المطلوبة."
      });
    }

    const car = {
      brand: String(body.brand).trim(),
      model: String(body.model).trim(),
      year: Number(body.year),
      mileage: Number(body.mileage),
      price: Number(body.price),
      governorate: String(body.governorate).trim(),
      fuel: String(body.fuel).trim(),
      gearbox: String(body.gearbox).trim(),
      description: body.description
        ? String(body.description).trim()
        : "",
      seller_phone: String(body.seller_phone).trim(),

      // صورة السيارة
      image_url: body.image_url
        ? String(body.image_url).trim()
        : null
    };

    if (
      !Number.isFinite(car.year) ||
      !Number.isFinite(car.mileage) ||
      !Number.isFinite(car.price)
    ) {
      return res.status(400).json({
        error: "السنة أو الكيلومترات أو السعر غير صحيح."
      });
    }

    const url =
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/cars`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify([car])
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Supabase add car error:", data);

      return res.status(response.status).json({
        error: "تعذر نشر السيارة في الوقت الحالي."
      });
    }

    return res.status(201).json({
      success: true,
      car: Array.isArray(data) ? data[0] : data
    });

  } catch (error) {
    console.error("Add car API error:", error);

    return res.status(500).json({
      error: "صار خطأ أثناء نشر السيارة."
    });
  }
}
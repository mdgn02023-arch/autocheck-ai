import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/* =========================
   🤖 AutoCheck AI Analyzer
========================= */

app.post("/api/analyze", async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      mileage,
      engine,
      gearbox,
      price,
      symptoms
    } = req.body;

    if (!brand || !model || !year || !symptoms) {
      return res.status(400).json({
        error: "كمّل المعلومات الأساسية أولاً."
      });
    }

    if (!client) {
      return res.status(503).json({
        error: "الموقع يحتاج OPENAI_API_KEY لتفعيل الذكاء الاصطناعي."
      });
    }

    const prompt = `
أنت مساعد محايد لفحص السيارات المستعملة. المستخدم في تونس.
حلّل السيارة بناءً على المعلومات التالية، ولا تدّعي أنك فحصت السيارة فعلياً.

أعطِ:
1) أهم نقاط الخطر المحتملة.
2) أسئلة يجب طرحها على البائع.
3) فحوصات عملية قبل الشراء.
4) متى يجب التوقف وطلب ميكانيكي.
5) خلاصة قصيرة: "يستحق الفحص" أو "يحتاج حذر شديد" فقط، بدون ضمان أن السيارة جيدة أو سيئة.

السيارة:
الماركة: ${brand}
الموديل: ${model}
السنة: ${year}
الكيلومترات: ${mileage || "غير معروف"}
المحرك: ${engine || "غير معروف"}
القير: ${gearbox || "غير معروف"}
السعر المطلوب: ${price || "غير معروف"}
الأعراض/ملاحظات المستخدم: ${symptoms}
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt
    });

    res.json({
      result: response.output_text
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "صار خطأ أثناء التحليل. جرّب مرة أخرى."
    });
  }
});


/* =========================
   🚗 Cars Marketplace
========================= */

app.get("/api/cars", async (req, res) => {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        error: "Supabase غير مربوط بالموقع."
      });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/cars?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error: "تعذر جلب السيارات."
      });
    }

    res.json(data);

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "صار خطأ أثناء جلب السيارات."
    });
  }
});


/* =========================
   🚀 Start server
========================= */

app.listen(process.env.PORT || 3000, () =>
  console.log(
    `AutoCheck AI running on port ${process.env.PORT || 3000}`
  )
);
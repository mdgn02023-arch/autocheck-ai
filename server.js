import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


/* =========================
   🤖 OpenAI
========================= */

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
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
أنت مساعد محايد لفحص السيارات المستعملة.
المستخدم في تونس.

حلّل السيارة بناءً على المعلومات التالية،
ولا تدّعي أنك فحصت السيارة فعلياً.

أعطِ:

1) أهم نقاط الخطر المحتملة.
2) أسئلة يجب طرحها على البائع.
3) فحوصات عملية قبل الشراء.
4) متى يجب التوقف وطلب ميكانيكي.
5) خلاصة قصيرة:
"يستحق الفحص" أو "يحتاج حذر شديد".

لا تضمن أن السيارة جيدة أو سيئة.

السيارة:

الماركة: ${brand}

الموديل: ${model}

السنة: ${year}

الكيلومترات: ${mileage || "غير معروف"}

المحرك: ${engine || "غير معروف"}

القير: ${gearbox || "غير معروف"}

السعر المطلوب: ${price || "غير معروف"}

الأعراض/ملاحظات المستخدم:
${symptoms}
`;


    const response = await client.responses.create({

      model: "gpt-5-mini",

      input: prompt

    });


    return res.json({

      result: response.output_text

    });


  } catch (error) {

    console.error("AI ERROR:", error);

    return res.status(500).json({

      error: "صار خطأ أثناء التحليل. جرّب مرة أخرى."

    });

  }

});


/* =========================
   🚗 Cars Marketplace
========================= */

app.get("/api/cars", async (req, res) => {

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


    const baseUrl = supabaseUrl.replace(/\/+$/, "");


    const apiUrl =
      `${baseUrl}/rest/v1/cars?select=*&order=created_at.desc`;


    const response = await fetch(apiUrl, {

      method: "GET",

      headers: {

        "apikey": supabaseKey,

        "Authorization": `Bearer ${supabaseKey}`,

        "Content-Type": "application/json",

        "Accept": "application/json"

      }

    });


    const data = await response.json();


    if (!response.ok) {

      console.error(
        "SUPABASE ERROR:",
        response.status,
        data
      );


      return res.status(response.status).json({

        error: "تعذر جلب السيارات من Supabase."

      });

    }


    return res.status(200).json(data);


  } catch (error) {

    console.error(
      "CARS API ERROR:",
      error
    );


    return res.status(500).json({

      error: "صار خطأ أثناء جلب السيارات."

    });

  }

});


/* =========================
   ❤️ Health Check
========================= */

app.get("/api/health", (req, res) => {

  res.json({

    status: "ok",

    app: "AutoCheck AI",

    marketplace: "enabled"

  });

});


/* =========================
   🚀 Start Server
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `AutoCheck AI running on port ${PORT}`
  );

});
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY غير موجودة في Vercel.",
      });
    }

    const client = new OpenAI({
      apiKey: apiKey,
    });

    const {
      brand,
      model,
      year,
      mileage,
      engine,
      gearbox,
      price,
      symptoms,
    } = req.body || {};

    if (!brand || !model || !year || !symptoms) {
      return res.status(400).json({
        error: "كمّل المعلومات الأساسية أولاً.",
      });
    }

    const prompt = `
أنت مساعد ذكي ومحايد لفحص السيارات المستعملة في تونس.

حلّل السيارة اعتماداً فقط على المعلومات التي أعطاها المستخدم.
لا تدّعي أنك فحصت السيارة فعلياً، ولا تعطِ ضماناً بأن السيارة جيدة أو سيئة.

أعطِ الإجابة باللهجة التونسية وبشكل واضح:

1. ⚠️ نقاط الخطر المحتملة
2. 🔧 الفحوصات التي يجب القيام بها قبل الشراء
3. 💬 أسئلة مهمة للبائع
4. 🚨 الحالات التي تستوجب إيقاف عملية الشراء واستشارة ميكانيكي
5. 💰 ملاحظات على السعر إذا كانت المعلومات تسمح بذلك
6. 📋 خلاصة قصيرة

معلومات السيارة:

الماركة: ${brand}
الموديل: ${model}
السنة: ${year}
الكيلومترات: ${mileage || "غير معروف"}
المحرك: ${engine || "غير معروف"}
القير: ${gearbox || "غير معروف"}
السعر: ${price || "غير معروف"}
الأعراض والملاحظات: ${symptoms}
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    return res.status(200).json({
      result: response.output_text,
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error);

    return res.status(500).json({
      error: "صار خطأ أثناء تحليل السيارة. جرّب مرة أخرى.",
    });
  }
}
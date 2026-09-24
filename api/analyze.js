import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      brand,
      model,
      year,
      mileage,
      engine,
      gearbox,
      price,
      symptoms,
    } = req.body;

    if (!brand || !model || !year || !symptoms) {
      return res.status(400).json({
        error: "كمّل المعلومات الأساسية أولاً.",
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
5) خلاصة قصيرة.

السيارة:
الماركة: ${brand}
الموديل: ${model}
السنة: ${year}
الكيلومترات: ${mileage || "غير معروف"}
المحرك: ${engine || "غير معروف"}
القير: ${gearbox || "غير معروف"}
السعر: ${price || "غير معروف"}
الأعراض/الملاحظات: ${symptoms}
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    return res.status(200).json({
      result: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "صار خطأ أثناء التحليل. جرّب مرة أخرى.",
    });
  }
}
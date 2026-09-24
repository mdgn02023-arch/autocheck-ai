export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body || {};

  const {
    brand, model, year, mileage, fuel, engine, power, gearbox,
    price, governorate, owners, condition, lastService,
    serviceInvoices, replacedParts, accident, ac, warningLights,
    tires, battery, symptoms
  } = data;

  if (!brand || !model || !year || !symptoms) {
    return res.status(400).json({
      error: "كمّل الماركة والموديل والعام والملاحظات أولاً."
    });
  }

  const text = symptoms.toLowerCase();

  const risks = [];
  const checks = [];
  const questions = [];

  if (
    text.includes("دخان") ||
    text.includes("دخان أسود") ||
    text.includes("دخان أبيض") ||
    text.includes("دخان أزرق")
  ) {
    risks.push("⚠️ فما دخان: يلزم فحص المحرك ونظام العادم قبل الشراء.");
  }

  if (
    text.includes("صوت") ||
    text.includes("طقطقة") ||
    text.includes("ضجيج")
  ) {
    risks.push("⚠️ فما صوت غير عادي: يلزم تحديد مصدره عند ميكانيكي.");
  }

  if (
    text.includes("اهتزاز") ||
    text.includes("يرج") ||
    text.includes("ترج")
  ) {
    risks.push("⚠️ فما اهتزاز: يلزم فحص العجلات، التعليق والمحرك.");
  }

  if (
    text.includes("حرارة") ||
    text.includes("يسخن") ||
    text.includes("سخانة")
  ) {
    risks.push("🚨 السخانة الزايدة تستوجب فحص نظام التبريد قبل الشراء.");
  }

  if (
    text.includes("زيت") ||
    text.includes("تهريب") ||
    text.includes("تسريب")
  ) {
    risks.push("⚠️ فما احتمال تسريب: يلزم تحديد المصدر وفحصه.");
  }

  if (
    text.includes("قير") ||
    text.includes("boîte") ||
    text.includes("embrayage") ||
    text.includes("كلتش")
  ) {
    risks.push("⚠️ فما ملاحظة تخص القير/الكلتش: يلزم تجربة السيارة مليح.");
  }

  if (accident === "إي") {
    risks.push("⚠️ السيارة صارتلها حادث حسب المعلومات المدخلة.");
  }

  if (warningLights === "إي") {
    risks.push("🚨 فما لمبة تحذير في الطابلو: لازم تشخيص OBD قبل الشراء.");
  }

  if (ac === "ما يخدمش") {
    risks.push("⚠️ المكيف ما يخدمش، يلزم معرفة سبب العطل وتكلفة إصلاحه.");
  }

  if (tires === "مستهلكة") {
    risks.push("⚠️ العجلات مستهلكة وتحتاج تبديل قريب.");
  }

  if (battery === "ضعيفة") {
    risks.push("⚠️ البطارية ضعيفة وقد تحتاج تبديل.");
  }

  if (serviceInvoices === "لا") {
    risks.push("⚠️ ما فماش فواتير صيانة: يصعب التأكد من تاريخ الصيانة.");
  }

  if (risks.length === 0) {
    risks.push(
      "✅ ما ذكرتش أعراض واضحة، أما هذا ما يعنيش أن السيارة سليمة 100%."
    );
  }

  checks.push("🔧 اعمل Diagnostic OBD قبل الشراء.");
  checks.push("🔧 افحص المحرك والقير والتسريبات.");
  checks.push("🔧 افحص الهيكل والطلاء وآثار الحوادث.");
  checks.push("🔧 جرّب السيارة وهي باردة وبعد ما تسخن.");
  checks.push("🔧 افحص العجلات والفرامل والتعليق.");
  checks.push("🔧 إذا السيارة عجبتك، خلي ميكانيكي مستقل يفحصها.");

  questions.push("💬 شنوّة تاريخ الصيانة بالتفصيل؟");
  questions.push("💬 عندك فواتير الصيانة والإصلاحات؟");
  questions.push("💬 السيارة عملت حادث قبل؟");
  questions.push("💬 علاش تحب تبيعها؟");
  questions.push("💬 الكيلومترات موثقة؟");

  if (replacedParts) {
    questions.push(`💬 القطع اللي تبدلت: ${replacedParts} — علاش تبدلت؟`);
  }

  let conclusion = "📋 الخلاصة: السيارة تستحق فحصاً عملياً قبل اتخاذ القرار.";

  if (risks.length >= 4) {
    conclusion =
      "📋 الخلاصة: فما برشا نقاط يلزم تتثبت منهم، وما ننصحش تعتمد على المعلومات وحدها قبل الفحص.";
  }

  const result = `
🚗 AutoCheck AI 🇹🇳

━━━━━━━━━━━━━━━━━━

السيارة:
${brand} ${model} — ${year}

📊 المعلومات:
• الكيلومترات: ${mileage || "ما نعرفش"}
• الوقود: ${fuel || "ما نعرفش"}
• المحرك: ${engine || "ما نعرفش"}
• القوة: ${power || "ما نعرفش"}
• القير: ${gearbox || "ما نعرفش"}
• السعر: ${price || "ما نعرفش"}
• الولاية: ${governorate || "ما نعرفش"}
• المالكين السابقين: ${owners || "ما نعرفش"}
• الحالة: ${condition || "ما نعرفش"}

🛠️ الصيانة:
• آخر صيانة: ${lastService || "ما نعرفش"}
• فواتير الصيانة: ${serviceInvoices || "ما نعرفش"}
• قطع تبدلت: ${replacedParts || "ما نعرفش"}
• حادث سابق: ${accident || "ما نعرفش"}

🔧 الحالة:
• المكيف: ${ac || "ما نعرفش"}
• لمبات الطابلو: ${warningLights || "ما نعرفش"}
• العجلات: ${tires || "ما نعرفش"}
• البطارية: ${battery || "ما نعرفش"}

━━━━━━━━━━━━━━━━━━

⚠️ نقاط يلزمك تشد فيها بالك:

${risks.join("\n")}

━━━━━━━━━━━━━━━━━━

🔧 شنوّة تعمل قبل الشراء:

${checks.join("\n")}

━━━━━━━━━━━━━━━━━━

💬 شنوّة تسأل المولّى:

${questions.join("\n")}

━━━━━━━━━━━━━━━━━━

${conclusion}

هذا تحليل أولي مبني على المعلومات المدخلة، وما يعوضش فحص ميكانيكي حقيقي.
`;

  return res.status(200).json({ result });
}
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    brand,
    model,
    year,
    mileage,
    engine,
    gearbox,
    price,
    symptoms
  } = req.body || {};

  if (!brand || !model || !year || !symptoms) {
    return res.status(400).json({
      error: "كمّل المعلومات الأساسية أولاً."
    });
  }

  const text = symptoms.toLowerCase();

  const risks = [];
  const checks = [];
  const questions = [];

  if (text.includes("دخان") || text.includes("دخان")) {
    risks.push("⚠️ وجود دخان من العادم يستحق فحص المحرك ونظام العادم.");
    checks.push("🔧 افحص لون الدخان عند التشغيل وبعد سخونة المحرك.");
  }

  if (text.includes("صوت") || text.includes("طقطقة")) {
    risks.push("⚠️ وجود صوت غير عادي قد يحتاج فحصاً ميكانيكياً.");
    checks.push("🔧 جرّب السيارة واستمع للمحرك والقير أثناء التسارع والتوقف.");
  }

  if (text.includes("اهتزاز") || text.includes("يرج")) {
    risks.push("⚠️ الاهتزاز قد يكون مرتبطاً بالعجلات أو التعليق أو المحرك.");
    checks.push("🔧 افحص العجلات والتعليق والمحرك عند ميكانيكي.");
  }

  if (text.includes("حرارة") || text.includes("يسخن")) {
    risks.push("🚨 ارتفاع الحرارة علامة تستوجب فحص نظام التبريد.");
    checks.push("🔧 افحص سائل التبريد، الردياتور، والمروحة.");
  }

  if (text.includes("زيت") || text.includes("تهريب")) {
    risks.push("⚠️ وجود تسريب زيت يحتاج إلى تحديد مصدره قبل الشراء.");
    checks.push("🔧 افحص أسفل السيارة وحجرة المحرك بحثاً عن التسريبات.");
  }

  if (risks.length === 0) {
    risks.push("✅ لم تذكر أعراضاً واضحة، لكن هذا لا يعني أن السيارة سليمة.");
  }

  checks.push("🔧 افحص السيارة بجهاز تشخيص OBD.");
  checks.push("🔧 افحص الهيكل والطلاء والحوادث السابقة.");
  checks.push("🔧 جرّب السيارة وهي باردة وساخنة.");
  checks.push("🔧 اطلب فحصاً عند ميكانيكي مستقل قبل الشراء.");

  questions.push("💬 هل توجد فواتير الصيانة والإصلاحات السابقة؟");
  questions.push("💬 هل تعرضت السيارة لحادث أو تغيير قطع هيكلية؟");
  questions.push("💬 هل الكيلومترات موثقة؟");
  questions.push("💬 متى تم آخر تغيير للزيت وقطع الصيانة؟");

  const result = `
🚗 تحليل ${brand} ${model} — ${year}

📊 المعلومات:
• الكيلومترات: ${mileage || "غير معروف"}
• المحرك: ${engine || "غير معروف"}
• القير: ${gearbox || "غير معروف"}
• السعر: ${price || "غير معروف"}

⚠️ نقاط الخطر:
${risks.join("\n")}

🔧 الفحوصات المقترحة:
${checks.join("\n")}

💬 أسئلة للبائع:
${questions.join("\n")}

📋 الخلاصة:
السيارة تستحق فحصاً عملياً قبل اتخاذ قرار الشراء.
هذا تحليل أولي للمعلومات المدخلة وليس فحصاً ميكانيكياً فعلياً.
`;

  return res.status(200).json({
    result
  });
}
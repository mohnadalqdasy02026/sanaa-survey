const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
    id: String,
    timestamp: String,
    
    // القسم الأول: المتغيرات الديموغرافية
    neckPainBefore: String, // هل عانيت من آلام في الرقبة أو الكتف من قبل؟
    gender: String,
    age: Number,
    weight: Number,
    height: Number,
    studyHours: Number,
    handDominance: String, // اليد المهيمنة
    smokingStatus: String, // سلوك التدخين
    exerciseStatus: String, // ممارسة الرياضة
    chronicDiseaseHistory: String, // تاريخ مرضي مزمن
    musculoskeletalDiseases: String, // أمراض عضلية هيكلية كامنة
    accidentHistory: String, // تاريخ التعرض لحادث عام
    specialization: String, // نوع التخصص

    // القسم الثاني: بيانات استخدام الهاتف الذكي
    phoneType: String, // النوع (شاشة لمس / لوحة مفاتيح)
    phoneLength: Number, // الطول
    phoneWidth: Number, // العرض
    phoneThickness: Number, // السمك
    phoneWeight: Number, // الوزن
    screenSize: Number, // حجم الشاشة
    usageDurationTotal: Number, // مدة الاستخدام منذ البداية وحتى الآن
    usageDurationDaily: Number, // مدة الاستخدام في المرة الواحدة يومياً
    usagePeriod: String, // فترة الاستخدام (الصباح، الظهيرة، إلخ)
    restTime: String, // وقت الراحة
    mainHandUsed: String, // اليد الأساسية المستخدمة
    dataEntryMethod: String, // طريقة إدخال البيانات (الكتابة)
    bodyPosture: String, // وضعية الجسم أثناء الاستخدام
    usagePurpose: String, // الغرض من الاستخدام
    otherDevicesUse: String, // استخدام أجهزة أخرى
    otherDevicesType: String, // نوع الأجهزة الأخرى
    otherDevicesDurationTotal: Number, // مدة استخدام الأجهزة الأخرى منذ البداية
    otherDevicesDurationSingle: Number, // مدة استخدام الأجهزة الأخرى في المرة الواحدة
    otherDevicesDurationDaily: Number, // مدة استخدام الأجهزة الأخرى يومياً

    // القسم الثالث: آلام الرقبة
    neckPostureHabit: String, // ما هي وضعية رقبتك المعتادة أثناء استخدام الهاتف؟
    associatedSymptoms: String, // هل عانيت من أي من الأعراض التالية المرتبطة باستخدام الهاتف؟
    anxietyImpact: String, // هل تشعر بالقلق إزاء المضاعفات طويلة المدى؟
    painSeverityNow: String, // شدة ألم الرقبة في الوقت الحالي
    neckPainAndSleep: String, // ألم الرقبة والنوم
    numbnessAndRest: String, // وخز وتنميل في الرقبة أو الكتف أثناء الراحة أو الحركة
    symptomPersistence: String // مدة استمرار الأعراض
    
}, { strict: false, timestamps: true });

module.exports = mongoose.model("Survey", surveySchema);

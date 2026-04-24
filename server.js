const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الاتصال بقاعدة البيانات
require("./db"); 

const User = require("./models/User");
const Survey = require("./models/Survey");

// خريطة ترجمة الحقول للعربية (بترتيب منظم للـ Excel)
const fieldMap = {
    neckPainBefore: "هل عانيت من آلام في الرقبة أو الكتف من قبل؟",
    gender: "الجنس",
    age: "العمر",
    weight: "الوزن",
    height: "الطول",
    studyHours: "ساعات الدراسة",
    handDominance: "اليد المهيمنة",
    smokingStatus: "سلوك التدخين",
    exerciseStatus: "ممارسة الرياضة",
    chronicDiseaseHistory: "تاريخ مرضي مزمن",
    musculoskeletalDiseases: "أمراض عضلية هيكلية كامنة",
    accidentHistory: "تاريخ التعرض لحادث عام",
    specialization: "نوع التخصص",
    phoneType: "نوع الهاتف",
    phoneLength: "الطول (ملم)",
    phoneWidth: "العرض (ملم)",
    phoneThickness: "السمك (ملم)",
    phoneWeight: "الوزن (جم)",
    screenSize: "حجم الشاشة (بوصة)",
    usageDurationTotal: "مدة الاستخدام (سنوات)",
    usageDurationDaily: "مدة الاستخدام اليومي (ساعات)",
    usagePeriod: "فترة الاستخدام",
    restTime: "وقت الراحة",
    mainHandUsed: "اليد الأساسية المستخدمة",
    dataEntryMethod: "طريقة إدخال البيانات",
    bodyPosture: "وضعية الجسم",
    usagePurpose: "الغرض من الاستخدام",
    otherDevicesUse: "استخدام أجهزة أخرى",
    otherDevicesType: "نوع الأجهزة الأخرى",
    otherDevicesDurationTotal: "مدة استخدام الأجهزة الأخرى (سنوات)",
    otherDevicesDurationSingle: "مدة استخدام الأجهزة الأخرى (ساعات)",
    otherDevicesDurationDaily: "مدة استخدام الأجهزة الأخرى يومياً (ساعات)",
    neckPostureHabit: "وضعية الرقبة المعتادة",
    associatedSymptoms: "الأعراض المرتبطة",
    anxietyImpact: "القلق من المضاعفات",
    painSeverityNow: "شدة الألم الحالية",
    neckPainAndSleep: "ألم الرقبة والنوم",
    numbnessAndRest: "وخز وتنميل أثناء الراحة",
    symptomPersistence: "مدة استمرار الأعراض",
    timestamp: "تاريخ الإرسال"
};

// نظام مطابقة الأكواد الرقمية (Mapping)
const codeMapping = {
    neckPainBefore: { "نعم": 1, "لا": 2 },
    gender: { "ذكر": 1, "أنثى": 2 },
    handDominance: { "اليمنى": 1, "اليسرى": 2, "كلتا اليدين": 3 },
    smokingStatus: { "مدخن حالي": 1, "مدخن سابق": 2, "لم أدخن أبداً": 3 },
    exerciseStatus: { "أمارس الرياضة حالياً": 1, "كنت أمارس الرياضة سابقاً": 2, "لم أمارس الرياضة أبداً": 3 },
    chronicDiseaseHistory: { "نعم": 1, "لا": 2 },
    musculoskeletalDiseases: { "نعم": 1, "لا": 2 },
    accidentHistory: { "نعم": 1, "لا": 2 },
    specialization: { "الطب": 1, "المختبرات": 2, "التمريض": 3 },
    phoneType: { "شاشة لمس": 1, "لوحة مفاتيح مع شاشة لمس": 2 },
    usagePeriod: { "الصباح": 1, "الظهيرة": 2, "بعد الظهر": 3, "المساء": 4, "أوقات أخرى": 5 },
    restTime: { "نعم": 1, "لا": 2 },
    mainHandUsed: { "اليد اليمنى فقط": 1, "اليد اليسرى فقط": 2, "كلتا اليدين": 3 },
    dataEntryMethod: { 
        "الإمساك بكلتا اليدين مع الكتابة بإبهامي اليدين": 1, 
        "الإمساك بكلتا اليدين مع الكتابة بإبهام اليد اليمنى": 2, 
        "الإمساك بكلتا اليدين مع الكتابة بإبهام اليد اليسرى": 3, 
        "الإمساك باليد اليمنى مع الكتابة بإبهام اليد اليمنى": 4 
    },
    bodyPosture: { "الجلوس": 1, "الوقوف": 2, "المشي": 3, "الاستلقاء": 4, "وضعيات أخرى": 5 },
    usagePurpose: { 
        "الدراسة": 1, "شبكات التواصل الاجتماعي": 2, "الأخبار": 3, 
        "البحث عن البيانات": 4, "الترفيه": 5, "أغراض أخرى": 6 
    },
    otherDevicesUse: { "نعم": 1, "لا": 2 },
    otherDevicesType: { "فأرة (ماوس)": 1, "حاسوب محمول (لابتوب)": 2, "حاسوب مكتبي (ديسكتوب)": 3, "جهاز لوحي (تابلت)": 4 },
    neckPostureHabit: { "0 درجة": 1, "15 درجة": 2, "30 درجة": 3, "45 درجة": 4, "60 درجة": 5 },
    associatedSymptoms: { 
        "ألم في الرقبة": 1, "ألم في الذراع": 2, "صداع": 3, "ألم في الظهر": 4, 
        "ألم في الكتف": 5, "تنميل في اليد": 6, "تيبس في الرقبة": 7 
    },
    anxietyImpact: { "نعم": 1, "لا": 2 },
    painSeverityNow: { 
        "لا أشعر بأي ألم في الوقت الحالي": 1, 
        "ألمي خفيف في الوقت الحالي": 2, 
        "ألمي متوسط في الوقت الحالي": 3, 
        "ألمي شديد في الوقت الحالي": 4, 
        "ألمي هو أسوأ ما يمكن تخيله في الوقت الحالي": 5 
    },
    neckPainAndSleep: { 
        "لا ينزعج نومي أبداً بسبب الألم": 1, 
        "ينزعج نومي أحياناً بسبب الألم": 2, 
        "ينزعج نومي بانتظام بسبب الألم": 3, 
        "بسبب الألم، أنام أقل من 5 ساعات في المجمل": 4, 
        "بسبب الألم، أنام أقل من ساعتين في المجمل": 5 
    },
    numbnessAndRest: { 
        "لا أعاني من وخز أو تنميل في الليل": 1, 
        "أعاني من وخز أو تنميل عرضي في الليل": 2, 
        "ينزعج نومي بانتظام بسبب الوخز أو التنميل": 3, 
        "بسبب الوخز أو التنميل، أنام أقل من 5 ساعات في المجمل": 4, 
        "بسبب الوخز أو التنميل، أنام أقل من ساعتين في المجمل": 5 
    },
    symptomPersistence: { 
        "أشعر بأن رقبتي وذراعي طبيعيتان طوال اليوم": 1, 
        "أعاني من أعراض في رقبتي أو ذراعي عند الاستيقاظ تستمر لأقل من ساعة": 2, 
        "الأعراض تظهر وتختفي لفترة إجمالية تتراوح بين 1-4 ساعات": 3, 
        "الأعراض تظهر وتختفي لفترة إجمالية تزيد عن 4 ساعات": 4, 
        "الأعراض موجودة بشكل مستمر طوال اليوم": 5 
    }
};

const fieldsRequiringCoding = Object.keys(codeMapping);

// =======================
// 🔐 إعداد المدير الافتراضي
// =======================
const setupAdmin = async () => {
    try {
        const adminUsername = "Engmohnadalqdasy";
        const adminPassword = "mohnadalqdasy783737425";
        const exists = await User.findOne({ username: adminUsername.toLowerCase() });
        if (!exists) {
            await User.create({
                name: "مهند القدسي",
                username: adminUsername.toLowerCase(),
                password: adminPassword,
                role: "admin"
            });
            console.log("✅ تم إنشاء حساب المدير");
        } else {
            // تحديث كلمة المرور في حال وجود المستخدم مسبقاً لضمان المطابقة
            exists.password = adminPassword;
            await exists.save();
        }
    } catch (err) {
        console.error("❌ خطأ في إعداد حساب المدير:", err);
    }
};
setupAdmin();

// =======================
// 🔐 تسجيل دخول
// =======================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase(), password });
        if (!user) return res.json({ success: false, message: "بيانات الدخول غير صحيحة" });
        res.json({ 
            success: true, 
            user: {
                name: user.name,
                username: user.username,
                type: user.role
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// 👥 إدارة المستخدمين
// =======================
app.post("/add-user", async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const exists = await User.findOne({ username: username.toLowerCase() });
        if (exists) return res.status(400).send("المستخدم موجود مسبقاً");
        await User.create({ name, username: username.toLowerCase(), password, role: "student" });
        res.send("تمت إضافة المستخدم بنجاح ✅");
    } catch (err) {
        res.status(500).send("خطأ في السيرفر");
    }
});

app.get("/users-list", async (req, res) => {
    try {
        const users = await User.find({ role: "student" }).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/delete-user/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.send("تم حذف المستخدم بنجاح 🗑️");
    } catch (err) {
        res.status(500).send("خطأ في الحذف");
    }
});

app.put("/update-user/:id", async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const updateData = { name, username: username.toLowerCase() };
        if (password && password !== "no_change") {
            updateData.password = password;
        }
        await User.findByIdAndUpdate(req.params.id, updateData);
        res.send("تم تحديث بيانات المستخدم بنجاح ✅");
    } catch (err) {
        res.status(500).send("خطأ في التحديث");
    }
});

// =======================
// 📝 حفظ الاستبيان
// =======================
app.post("/survey", async (req, res) => {
    try {
        const formData = req.body;
        const survey = new Survey(formData);
        await survey.save();
        res.send("تم حفظ استبيانك بنجاح ✅");
    } catch (err) {
        res.status(500).send("خطأ في السيرفر");
    }
});

// =======================
// 📊 عرض البيانات للوحة التحكم
// =======================
app.get("/data", async (req, res) => {
    try {
        const surveys = await Survey.find().sort({ createdAt: -1 });
        const translatedData = surveys.map(s => {
            const obj = s.toObject();
            const translated = {};
            Object.keys(fieldMap).forEach(key => {
                if (obj[key] !== undefined) translated[fieldMap[key]] = obj[key];
            });
            if (obj.createdAt) translated["تاريخ الإرسال"] = new Date(obj.createdAt).toLocaleString('ar-EG');
            return translated;
        });
        res.json(translatedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// دالة تحويل القيمة إلى كود
function convertToCode(fieldName, value) {
    if (fieldsRequiringCoding.includes(fieldName) && codeMapping[fieldName]) {
        if (typeof value === 'string' && value.includes(', ')) {
            const values = value.split(', ');
            const codes = values.map(v => codeMapping[fieldName][v.trim()] || '');
            return codes.filter(c => c !== '').join(', ');
        } else {
            return codeMapping[fieldName][value] || '';
        }
    }
    return value || '';
}

// دالة حساب التلخيص
function calculateSummary(surveys, fieldName) {
    const summary = {};
    surveys.forEach(survey => {
        const obj = survey.toObject();
        const value = obj[fieldName];
        if (value) {
            if (typeof value === 'string' && value.includes(', ')) {
                const values = value.split(', ');
                values.forEach(v => {
                    const code = codeMapping[fieldName] ? codeMapping[fieldName][v.trim()] : null;
                    if (code) summary[code] = (summary[code] || 0) + 1;
                });
            } else {
                const code = codeMapping[fieldName] ? codeMapping[fieldName][value] : null;
                if (code) summary[code] = (summary[code] || 0) + 1;
            }
        }
    });
    return summary;
}

// =======================
// 📥 تحميل Excel (أكواد + تلخيص)
// =======================
app.get("/download", async (req, res) => {
    try {
        const surveys = await Survey.find().sort({ createdAt: -1 });
        if (surveys.length === 0) return res.send("لا يوجد بيانات");

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("نتائج الاستبيان", {
            views: [{ rightToLeft: true }]
        });

        const columns = Object.values(fieldMap).map(header => ({
            header: header,
            key: header,
            width: 25
        }));
        worksheet.columns = columns;

        surveys.forEach(s => {
            const obj = s.toObject();
            const row = {};
            Object.keys(fieldMap).forEach(key => {
                const arabicKey = fieldMap[key];
                if (key === 'timestamp' && obj.createdAt) {
                    row[arabicKey] = new Date(obj.createdAt).toLocaleString('ar-EG');
                } else {
                    row[arabicKey] = convertToCode(key, obj[key]);
                }
            });
            worksheet.addRow(row);
        });

        // تنسيق
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

        let currentRow = surveys.length + 3;
        worksheet.getRow(currentRow - 1).getCell(1).value = "---- Summary ----";
        worksheet.getRow(currentRow - 1).getCell(1).font = { bold: true, size: 14 };

        fieldsRequiringCoding.forEach(fieldName => {
            const arabicFieldName = fieldMap[fieldName];
            const summary = calculateSummary(surveys, fieldName);
            if (Object.keys(summary).length > 0) {
                worksheet.getRow(currentRow).getCell(1).value = arabicFieldName + ":";
                worksheet.getRow(currentRow).getCell(1).font = { bold: true };
                currentRow++;
                Object.keys(summary).sort((a, b) => a - b).forEach(code => {
                    worksheet.getRow(currentRow).getCell(1).value = `${code} = ${summary[code]}`;
                    currentRow++;
                });
                currentRow++;
            }
        });

        const tempFilePath = path.join("/tmp", "Sanaa_University_Report.xlsx");
        await workbook.xlsx.writeFile(tempFilePath);
        res.download(tempFilePath, "Sanaa_University_Report.xlsx");
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في التصدير");
    }
});

app.get("/stats", async (req, res) => {
    try {
        const surveys = await Survey.countDocuments();
        const users = await User.countDocuments({ role: "student" });
        res.json({ surveys, users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/clear", async (req, res) => {
    try {
        await Survey.deleteMany({});
        res.send("تم تصفير البيانات بنجاح 🗑️");
    } catch (err) {
        res.status(500).send("خطأ في الحذف");
    }
});

app.use(express.static(path.join(__dirname)));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 Server running on port " + PORT);
});

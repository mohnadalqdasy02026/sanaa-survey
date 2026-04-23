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
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    googleEmail: "حساب جوجل",
    gender: "الجنس",
    age: "العمر",
    weight: "الوزن",
    height: "الطول",
    studyHours: "ساعات الدراسة",
    handDominance: "اليد المستخدمة",
    smoking: "التدخين",
    exercise: "ممارسة الرياضة",
    chronicDiseases: "أمراض مزمنة",
    phoneType: "نوع الهاتف",
    phoneSize: "حجم الهاتف",
    phoneUsageHours: "ساعات استخدام الهاتف",
    holdingMethod: "طريقة مسك الهاتف",
    neckPosture: "وضعية الرقبة",
    usagePurpose: "غرض الاستخدام",
    neckPain: "ألم الرقبة",
    painDuration: "مدة الألم",
    painSeverity: "شدة الألم",
    sleepImpact: "تأثير على النوم",
    numbness: "تنميل",
    painLocation: "مكان الألم",
    timestamp: "تاريخ الإرسال"
};

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
        // إرجاع البيانات المطلوبة للواجهة الأمامية
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
// 👥 إدارة المستخدمين (للمدير فقط)
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

// مسار حذف مستخدم
app.delete("/delete-user/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.send("تم حذف المستخدم بنجاح 🗑️");
    } catch (err) {
        res.status(500).send("خطأ في الحذف");
    }
});

// مسار تحديث مستخدم
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

// =======================
// 📥 تحميل Excel (RTL + تلوين + تصفية)
// =======================
app.get("/download", async (req, res) => {
    try {
        const surveys = await Survey.find().sort({ createdAt: -1 });
        if (surveys.length === 0) return res.send("لا يوجد بيانات");

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("نتائج الاستبيان", {
            views: [{ rightToLeft: true }]
        });

        // تعريف الأعمدة
        const columns = Object.values(fieldMap).map(header => ({
            header: header,
            key: header,
            width: 20
        }));
        worksheet.columns = columns;

        // إضافة البيانات
        surveys.forEach(s => {
            const obj = s.toObject();
            const row = {};
            Object.keys(fieldMap).forEach(key => {
                if (key === 'timestamp' && obj.createdAt) {
                    row[fieldMap[key]] = new Date(obj.createdAt).toLocaleString('ar-EG');
                } else {
                    row[fieldMap[key]] = obj[key] || "";
                }
            });
            worksheet.addRow(row);
        });

        // تنسيق الصف الأول (العناوين)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2C3E50' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // تلوين الأعمدة بشكل تبادلي لتحسين القراءة
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell, colNumber) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    if (rowNumber % 2 === 0) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF9F9F9' }
                        };
                    }
                });
            }
        });

        // إضافة تصفية (Filter) لجميع الأعمدة
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: columns.length }
        };

        // تجميد الصف الأول
        worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1, activePane: 'bottomRight', rightToLeft: true }
        ];

        // استخدام مسار مؤقت للملف لتجنب مشاكل الصلاحيات في Render
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

// خدمة الملفات الساكنة
app.use(express.static(path.join(__dirname)));

// أي مسار غير معرف يوجه لـ index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 Server running on port " + PORT);
});

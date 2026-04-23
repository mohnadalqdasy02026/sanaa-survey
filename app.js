// ============================================
// نظام استبيان جامعة صنعاء - app.js V3
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("surveyForm");

    // التحقق من حالة التعبئة المسبقة
    if (localStorage.getItem('surveySubmitted')) {
        showThankYou();
    }

    // إدارة الموافقة
    const consentRadios = document.querySelectorAll('input[name="consent"]');
    consentRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'no') {
                alert('يجب الموافقة للمتابعة');
                form.style.display = 'none';
            } else {
                form.style.display = 'block';
            }
        });
    });

    if (form) {
        form.addEventListener("submit", handleSurveySubmit);
    }
});

async function handleSurveySubmit(e) {
    e.preventDefault();

    const formData = collectFormData();

    try {
        const response = await fetch("/survey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            localStorage.setItem('surveySubmitted', 'true');
            showThankYou();
        } else {
            alert("❌ حدث خطأ في السيرفر");
        }
    } catch (err) {
        alert("❌ فشل الاتصال بالسيرفر");
    }
}

function showThankYou() {
    const form = document.getElementById('surveyForm');
    const thanks = document.getElementById('thankYouSection');
    if (form) form.style.display = 'none';
    if (thanks) thanks.style.display = 'block';
}

function collectFormData() {
    const data = {};
    const formData = new FormData(document.getElementById('surveyForm'));
    formData.forEach((value, key) => {
        data[key] = value;
    });
    // إضافة بيانات إضافية
    data.timestamp = new Date().toISOString();
    return data;
}

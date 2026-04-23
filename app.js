// ============================================
// نظام استبيان جامعة صنعاء - app.js (النسخة المفتوحة للجميع)
// ============================================

function goToDashboard() {
    window.location.href = 'login.html';
}

// دالة معالجة استجابة جوجل
function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    const email = responsePayload.email;
    
    // وضع الإيميل في الحقل المخفي وعرضه للمستخدم
    document.getElementById('googleEmail').value = email;
    const emailDisplay = document.getElementById('email-display');
    emailDisplay.textContent = "تم سحب الإيميل بنجاح: " + email;
    emailDisplay.style.display = 'block';
    
    // إخفاء زر تسجيل الدخول بعد النجاح
    document.querySelector('.g_id_signin').style.display = 'none';
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("surveyForm");

    // التحقق إذا كان المستخدم قد ملأ الاستبيان مسبقاً من هذا المتصفح
    if (localStorage.getItem('surveySubmitted')) {
        document.getElementById('surveyForm').innerHTML = `
            <div class="thank-you-box" style="text-align:center; padding:50px; background:white; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#2c3e50;">شكراً لك! 🎉</h2>
                <p>لقد قمت بتعبئة هذا الاستبيان مسبقاً من هذا المتصفح.</p>
                <p style="color:#7f8c8d;">Your survey has already been submitted from this browser.</p>
            </div>
        `;
    }

    // تحديث شدة الألم
    const painSlider = document.querySelector('input[name="painSeverity"]');
    if (painSlider) {
        painSlider.addEventListener('input', function () {
            document.getElementById('painValue').textContent = this.value;
        });
    }

    // التحقق من الموافقة
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

    if (!validateForm()) return;

    const formData = collectFormData();

    try {
        const response = await fetch("/survey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.text();
        console.log(result);

        // حفظ حالة التعبئة في المتصفح لمنع التكرار
        localStorage.setItem('surveySubmitted', 'true');

        // إظهار رسالة النجاح
        document.getElementById('surveyForm').style.display = 'none';
        document.getElementById('thankYouSection').style.display = 'block';
    } catch (err) {
        console.error(err);
        alert("❌ حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.");
    }
}

function validateForm() {
    const consent = document.querySelector('input[name="consent"]:checked');
    if (!consent || consent.value === 'no') {
        alert('يجب الموافقة على المشاركة');
        return false;
    }

    const requiredFields = [
        'fullName', 'phoneNumber', 'googleEmail',
        'gender', 'age', 'weight', 'height', 'studyHours',
        'handDominance', 'smoking', 'exercise', 'chronicDiseases',
        'phoneType', 'phoneSize', 'phoneUsageHours', 'holdingMethod',
        'neckPosture', 'neckPain'
    ];

    const googleEmail = document.getElementById('googleEmail').value;
    if (!googleEmail) {
        alert("يرجى تسجيل الدخول باستخدام حساب جوجل أولاً لسحب البريد الإلكتروني تلقائياً");
        return false;
    }

    for (let field of requiredFields) {
        let element = document.querySelector(`input[name="${field}"]:checked`) || document.querySelector(`[name="${field}"]`);
        if (!element || !element.value) {
            alert("يرجى تعبئة جميع الحقول المطلوبة");
            return false;
        }
    }
    return true;
}

function collectFormData() {
    return {
        id: 'survey_' + Date.now(),
        timestamp: new Date().toISOString(),
        fullName: getValue('fullName'),
        phoneNumber: getValue('phoneNumber'),
        googleEmail: getValue('googleEmail'),
        gender: getValue('gender'),
        age: getValue('age'),
        weight: getValue('weight'),
        height: getValue('height'),
        studyHours: getValue('studyHours'),
        handDominance: getValue('handDominance'),
        smoking: getValue('smoking'),
        exercise: getValue('exercise'),
        chronicDiseases: getValue('chronicDiseases'),
        phoneType: document.querySelector('select[name="phoneType"]').value,
        phoneSize: getValue('phoneSize'),
        phoneUsageHours: getValue('phoneUsageHours'),
        holdingMethod: getValue('holdingMethod'),
        neckPosture: getValue('neckPosture'),
        usagePurpose: getCheckedValues('usagePurpose'),
        neckPain: getValue('neckPain'),
        painDuration: getValue('painDuration'),
        painSeverity: getValue('painSeverity'),
        sleepImpact: getValue('sleepImpact'),
        numbness: getValue('numbness'),
        painLocation: getCheckedValues('painLocation')
    };
}

function getValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    if (radio) return radio.value;
    const input = document.querySelector(`[name="${name}"]`);
    return input ? input.value : "";
}

function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(el => el.value)
        .join(", ");
}

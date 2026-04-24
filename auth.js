// ============================================
// نظام استبيان جامعة صنعاء - auth.js
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');
    
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // حفظ بيانات المستخدم في localStorage
            const userData = {
                name: data.user.name,
                username: data.user.username,
                type: data.user.type // 'admin' أو 'student'
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // التوجه للوحة التحكم
            window.location.href = 'dashboard.html';
        } else {
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = data.message || "بيانات الدخول غير صحيحة";
            } else {
                alert(data.message || "بيانات الدخول غير صحيحة");
            }
        }
    } catch (err) {
        console.error("❌ خطأ في تسجيل الدخول:", err);
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = "حدث خطأ في الاتصال بالسيرفر";
        }
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function goToHome() {
    window.location.href = 'index.html';
}

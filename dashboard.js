// ============================================
// نظام استبيان جامعة صنعاء - dashboard.js
// ============================================

let currentUser = null;
let isAdmin = false;

document.addEventListener('DOMContentLoaded', function() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userJson);
    isAdmin = (currentUser.type === 'admin');

    updateUserInfo();

    // إظهار التبويبات والصلاحيات
    if (isAdmin) {
        const usersTabBtn = document.getElementById('usersTabBtn');
        if (usersTabBtn) usersTabBtn.style.display = 'inline-block';
        
        const adminStats = document.getElementById('adminStats');
        if (adminStats) adminStats.style.display = 'block';
        
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) addUserForm.addEventListener('submit', handleAddUser);
    } else {
        const adminStats = document.getElementById('adminStats');
        if (adminStats) adminStats.style.display = 'none';
    }

    loadDashboardData();
});

function updateUserInfo() {
    const userInfoEl = document.getElementById('userInfo');
    if (userInfoEl) {
        userInfoEl.textContent = `${currentUser.name} (${isAdmin ? 'مدير' : 'مستخدم'})`;
    }
}

function loadDashboardData() {
    // جلب الإحصائيات
    fetch('/stats')
    .then(res => res.json())
    .then(stats => {
        const totalSurveys = document.getElementById('totalSurveys');
        if (totalSurveys) totalSurveys.textContent = stats.surveys || 0;
        
        const totalUsers = document.getElementById('totalUsers');
        if (isAdmin && totalUsers) {
            totalUsers.textContent = stats.users || 0;
        }
    });

    // جلب بيانات الاستبيان
    fetch('/data')
    .then(res => res.json())
    .then(data => {
        loadDataTable(data);
    });

    if (isAdmin) loadUsersList();
}

function loadDataTable(surveys) {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!surveys || surveys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">لا توجد بيانات حالياً</td></tr>';
        return;
    }
    surveys.forEach((survey, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${survey["الجنس"] || '-'}</td>
            <td>${survey["العمر"] || '-'}</td>
            <td>${survey["نوع التخصص"] || '-'}</td>
            <td>${survey["شدة الألم الحالية"] || '-'}</td>
            <td>${survey["تاريخ الإرسال"] || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- إدارة المستخدمين ---

async function handleAddUser(e) {
    e.preventDefault();
    const name = document.getElementById('newName').value;
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    try {
        const res = await fetch('/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });
        const msg = await res.text();
        alert(msg);
        if (res.ok) {
            document.getElementById('addUserForm').reset();
            loadUsersList();
            loadDashboardData();
        }
    } catch (err) { alert("فشل الإضافة"); }
}

function loadUsersList() {
    fetch('/users-list')
    .then(res => res.json())
    .then(users => {
        const list = document.getElementById('usersList');
        if (!list) return;
        list.innerHTML = '';
        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div>
                    <strong>${user.name}</strong> (@${user.username})
                </div>
                <div>
                    <button class="btn-primary" style="padding:5px 10px; font-size:12px;" onclick="editUser('${user._id}', '${user.name}', '${user.username}')">تعديل</button>
                    <button class="btn-secondary" style="padding:5px 10px; font-size:12px; background:#e74c3c;" onclick="deleteUser('${user._id}')">حذف</button>
                </div>
            `;
            list.appendChild(item);
        });
    });
}

async function deleteUser(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
        const res = await fetch(`/delete-user/${id}`, { method: 'DELETE' });
        const msg = await res.text();
        alert(msg);
        loadUsersList();
        loadDashboardData();
    } catch (err) { alert("فشل الحذف"); }
}

async function editUser(id, oldName, oldUsername) {
    const newName = prompt("أدخل الاسم الجديد:", oldName);
    const newUsername = prompt("أدخل اسم المستخدم الجديد:", oldUsername);
    const newPassword = prompt("أدخل كلمة المرور الجديدة (أو اتركها كما هي):");
    
    if (!newName || !newUsername) return;

    try {
        const res = await fetch(`/update-user/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, username: newUsername, password: newPassword || "no_change" })
        });
        const msg = await res.text();
        alert(msg);
        loadUsersList();
    } catch (err) { alert("فشل التحديث"); }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(tabName + 'Tab');
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
}

function downloadExcel() {
    window.location.href = '/download';
}

function clearAllData() {
    if (!confirm('حذف كل البيانات؟')) return;
    fetch('/clear', { method: 'DELETE' }).then(() => loadDashboardData());
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

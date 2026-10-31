const STORAGE_KEY = "hasan_payroll_data";
const AUTH_KEY = "hasan_auth_status";

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const salaryForm = document.getElementById("salaryForm");
const salaryTableBody = document.getElementById("salaryTableBody");

const totalSalary = document.getElementById("totalSalary");
const totalDeductions = document.getElementById("totalDeductions");
const totalTaken = document.getElementById("totalTaken");
const totalRemaining = document.getElementById("totalRemaining");

const ADMIN_USERNAME = "alhasan";
const ADMIN_PASSWORD = "7AXJYAzM";

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function calculatePayroll(record) {
  const salary = Number(record.salary) || 0;
  const absentDays = Number(record.absentDays) || 0;
  const takenAmount = Number(record.takenAmount) || 0;

  const dailyRate = salary / 30;
  const deduction = absentDays * dailyRate;
  const remaining = salary - deduction - takenAmount;

  return {
    dailyRate: Number(dailyRate.toFixed(2)),
    deduction: Number(deduction.toFixed(2)),
    remaining: Number(remaining.toFixed(2)),
  };
}

function renderSummary() {
  const records = getRecords();
  let sumSalary = 0;
  let sumDeductions = 0;
  let sumTaken = 0;
  let sumRemaining = 0;

  records.forEach((record) => {
    const calc = calculatePayroll(record);
    sumSalary += Number(record.salary) || 0;
    sumDeductions += calc.deduction;
    sumTaken += Number(record.takenAmount) || 0;
    sumRemaining += calc.remaining;
  });

  totalSalary.textContent = sumSalary.toFixed(2);
  totalDeductions.textContent = sumDeductions.toFixed(2);
  totalTaken.textContent = sumTaken.toFixed(2);
  totalRemaining.textContent = sumRemaining.toFixed(2);
}

function renderTable() {
  const records = getRecords();
  salaryTableBody.innerHTML = "";

  if (records.length === 0) {
    salaryTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="color:#9ca3af; padding: 20px;">لا توجد بيانات بعد.</td>
      </tr>
    `;
    return;
  }

  records.forEach((record) => {
    const calc = calculatePayroll(record);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.employeeName}</td>
      <td>${record.month}</td>
      <td>${Number(record.salary).toFixed(2)}</td>
      <td>${record.absentDays}</td>
      <td>${calc.deduction.toFixed(2)}</td>
      <td>${Number(record.takenAmount).toFixed(2)}</td>
      <td>${calc.remaining.toFixed(2)}</td>
      <td>${record.notes || "-"}</td>
      <td><button class="delete-btn" data-id="${record.id}">حذف</button></td>
    `;
    salaryTableBody.appendChild(row);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const updated = getRecords().filter((item) => item.id !== id);
      saveRecords(updated);
      renderTable();
      renderSummary();
    });
  });
}

function showDashboard() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

function showLogin() {
  appScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
}

function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    showDashboard();
    return true;
  }

  loginMessage.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة";
  return false;
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  login(username, password);
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(AUTH_KEY);
  showLogin();
});

salaryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const employeeName = document.getElementById("employeeName").value.trim();
  const month = document.getElementById("salaryMonth").value;
  const salary = document.getElementById("salaryAmount").value;
  const absentDays = document.getElementById("absentDays").value;
  const takenAmount = document.getElementById("takenAmount").value;
  const notes = document.getElementById("notes").value.trim();

  if (!employeeName || !month || !salary || !absentDays || !takenAmount) {
    alert("يرجى تعبئة جميع الحقول المطلوبة");
    return;
  }

  const newRecord = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    employeeName,
    month,
    salary: Number(salary),
    absentDays: Number(absentDays),
    takenAmount: Number(takenAmount),
    notes,
    createdAt: new Date().toISOString(),
  };

  const records = getRecords();
  records.unshift(newRecord);
  saveRecords(records);
  salaryForm.reset();
  renderTable();
  renderSummary();
});

(function init() {
  const isLoggedIn = localStorage.getItem(AUTH_KEY) === "true";
  if (isLoggedIn) {
    showDashboard();
  } else {
    showLogin();
  }

  renderTable();
  renderSummary();
})();

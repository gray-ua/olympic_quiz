// URL-адреса вашого backend-сервера на Render
const BACKEND_URL = "https://quiz-results-wvxl.onrender.com/api/leaderboard";

async function fetchLeaderboard() {
    try {
        const response = await fetch(BACKEND_URL);
        const data = await response.json();

        renderStudentsTable(data.top_students);
        renderClassesTable(data.top_classes);
    } catch (error) {
        console.error("Помилка завантаження лідерборду:", error);
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById("students-table-body");
    tbody.innerHTML = "";

    if (students.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>Ще немає результатів</td></tr>";
        return;
    }

    students.forEach((s, index) => {
        const row = document.createElement("tr");
        if (index === 0) row.classList.add("top-1");
        if (index === 1) row.classList.add("top-2");
        if (index === 2) row.classList.add("top-3");

        const medal = index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : "";

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${medal}${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.class)}</td>
            <td><strong>${s.score}</strong></td>
            <td>${s.time} сек</td>
        `;
        tbody.appendChild(row);
    });
}

function renderClassesTable(classes) {
    const tbody = document.getElementById("classes-table-body");
    tbody.innerHTML = "";

    if (classes.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>Ще немає результатів</td></tr>";
        return;
    }

    classes.forEach((c, index) => {
        const row = document.createElement("tr");
        if (index === 0) row.classList.add("top-1");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(c.class)}</strong></td>
            <td>${c.avg_score.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Захист від XSS-атак при виведенні імен
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// Початкове завантаження
fetchLeaderboard();

// Автоматичне оновлення кожні 5 секунд (5000 мс)
setInterval(fetchLeaderboard, 5000);
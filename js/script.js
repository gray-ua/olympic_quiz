/*
// Заборона контекстного меню (правої кнопки миші)
document.addEventListener('contextmenu', event => event.preventDefault());

// Заборона гарячих клавіш (працює на всіх розкладках клавіатури)
document.addEventListener('keydown', event => {
    const isControlPressed = event.ctrlKey || event.metaKey;

    // 1. Блокування комбінацій Ctrl + Shift + I / J / C (DevTools)
    if (isControlPressed && event.shiftKey) {
        if (
            event.code === 'KeyI' || // Ctrl + Shift + I (DevTools)
            event.code === 'KeyJ' || // Ctrl + Shift + J (Консоль)
            event.code === 'KeyC'    // Ctrl + Shift + C (Інспектор елементів)
        ) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // 2. Блокування стандартних комбінацій з Ctrl
    if (isControlPressed && !event.shiftKey) {
        if (
            event.code === 'KeyU' || // Ctrl + U (Код сторінки)
            event.code === 'KeyC' || // Ctrl + C (Копіювання)
            event.code === 'KeyS' || // Ctrl + S (Збереження сторінки)
            event.code === 'KeyA'    // Ctrl + A (Виділити все)
        ) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // 3. Блокування клавіші F12
    if (event.code === 'F12') {
        event.preventDefault();
        event.stopPropagation();
    }
});

let tabSwitchCount = 0;

document.addEventListener("visibilitychange", () => {
    if (document.hidden && quizScreen.classList.contains("active")) {
        tabSwitchCount++;
        if (tabSwitchCount >= 2) {
            alert("Ви залишали сторінку тесту! Тест завершено достроково.");
            finishQuiz(); // Автоматичне завершення тесту
        } else {
            alert("Увага! Заборонено перемикати вкладки під час проходження квізу!");
        }
    }
});

setInterval(() => {
    const startTime = performance.now();
    debugger;
    const endTime = performance.now();
    
    if (endTime - startTime > 100) {
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 100px; font-family: sans-serif;">
                <h1 style="color: #e74c3c;">⚠️ Використання DevTools заблоковано!</h1>
                <p>Проходження квізу з відкритими інструментами розробника заборонено.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">Оновити сторінку</button>
            </div>
        `;
    }
}, 1000);
*/

import { questions } from './questions.js';

// Змінні стану
let activeQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userData = { name: "", class: "" };
let startTime = 0;
let timerInterval = null;
let totalTimeSeconds = 0;


// DOM елементи
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const userForm = document.getElementById("user-form");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const questionTracker = document.getElementById("question-tracker");
const timerDisplay = document.getElementById("timer");
const finalScoreDisplay = document.getElementById("final-score");
const timeTakenDisplay = document.getElementById("time-taken");
const statusMessage = document.getElementById("status-message");

// Запуск тесту при відправці форми
userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Оновлюємо дані користувача (перезапис)
    userData.name = document.getElementById("username").value.trim();
    userData.class = document.getElementById("user-class").value;

    // Обираємо 20 випадкових питань для поточного гравця
    activeQuestions = getRandomQuestions(questions, 20);
    currentQuestionIndex = 0;
    score = 0;

    // Перемикаємо екрани
    startScreen.classList.remove("active");
    quizScreen.classList.add("active");

    startTimer();
    loadQuestion();
});

// Таймер
function startTimer() {
    // Зупиняємо попередній таймер, якщо він існував
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Скидаємо накопичений час
    totalTimeSeconds = 0;
    startTime = Date.now();

    // Запускаємо новий інтервал
    timerInterval = setInterval(() => {
        totalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(totalTimeSeconds / 60)).padStart(2, '0');
        const secs = String(totalTimeSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `⏱️ ${mins}:${secs}`;
    }, 1000);
}

// Функція для отримання N випадкових питань з банку
function getRandomQuestions(allQuestions, count = 20) {
    // Створюємо копію масиву, щоб не змінювати оригінальний банк питань
    const shuffled = [...allQuestions];
    
    // Алгоритм Фішера — Йейтса для якісного перемішування
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Повертаємо перші `count` елементів (за замовчуванням count = 20)
    return shuffled.slice(0, count);
}

// Завантаження питання
function loadQuestion() {
    const q = activeQuestions[currentQuestionIndex];

    questionText.textContent = q.question;
    questionTracker.textContent = `Питання ${currentQuestionIndex + 1} з ${activeQuestions.length}`;
    
    optionsContainer.innerHTML = "";
    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.textContent = option;
        btn.onclick = () => selectOption(index);
        optionsContainer.appendChild(btn);
    });
}

// Обробка вибору відповіді
function selectOption(selectedIndex) {
    if (selectedIndex === activeQuestions[currentQuestionIndex].correct) {
        score++;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuestions.length) {
        loadQuestion();
        if (currentQuestionIndex == 14) {
            warmupBackend();
        }
    } else {
        finishQuiz();
    }
}

// Завершення тесту
function finishQuiz() {
    clearInterval(timerInterval);

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    finalScoreDisplay.textContent = `${score} / ${activeQuestions.length}`;
    timeTakenDisplay.textContent = `Час: ${totalTimeSeconds} сек.`;

    // Дані для відправки 11 класу
    const payload = {
        student_name: userData.name,
        class_name: userData.class,
        score: score,
        time_seconds: totalTimeSeconds
    };

    sendResultsToBackend(payload);
}

function warmupBackend() {
    const PING_URL = "https://quiz-results-wvxl.onrender.com/api/ping";
    
    // Фоновий запит, від якого ми не чекаємо відповіді у веб-інтерфейсі
    fetch(PING_URL).catch(() => {
        // Ігноруємо помилки, якщо вони виникнуть на етапі пігу
    });
}

// Відправка даних на backend (11 клас)
function sendResultsToBackend(data) {
    console.log("Надсилання даних для 11 класу:", data);
    
    // Сюди 11 клас вставить свою URL-адресу сервера
    const BACKEND_URL = "https://quiz-results-wvxl.onrender.com/api/submit";

    
    fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true
    })
    .then(response => response.json())
    .then(res => {
        statusMessage.textContent = "✅ Результат збережено в олімпійську базу!";
    })
    .catch(err => {
        statusMessage.textContent = "❌ Помилка збереження даних.";
        console.error(err);
    });
    
    /*
    // Тимчасова заглушка до підключення 11 класу:
    setTimeout(() => {
        statusMessage.textContent = "✅ Результат збережено! (Режим розробки)";
    }, 1000);
    */
}


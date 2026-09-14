import { questions } from './questions.js';

// Змінні стану
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
    userData.name = document.getElementById("username").value.trim();
    userData.class = document.getElementById("user-class").value;

    startScreen.classList.remove("active");
    quizScreen.classList.add("active");

    startTimer();
    loadQuestion();
});

// Таймер
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        totalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(totalTimeSeconds / 60)).padStart(2, '0');
        const secs = String(totalTimeSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `⏱️ ${mins}:${secs}`;
    }, 1000);
}

// Завантаження питання
function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    questionTracker.textContent = `Питання ${currentQuestionIndex + 1} з ${questions.length}`;
    
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
    if (selectedIndex === questions[currentQuestionIndex].correct) {
        score++;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

// Завершення тесту
function finishQuiz() {
    clearInterval(timerInterval);

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    finalScoreDisplay.textContent = `${score} / ${questions.length}`;
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

// Відправка даних на backend (11 клас)
function sendResultsToBackend(data) {
    console.log("Надсилання даних для 11 класу:", data);
    
    // Сюди 11 клас вставить свою URL-адресу сервера
    const BACKEND_URL = "https://quiz-results-wvxl.onrender.com/api/submit";

    
    fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
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

// --- Находим все элементы на странице ---
const circle = document.getElementById('circle');
const statusText = document.getElementById('status'); // Переименовано, чтобы не конфликтовать с window.status
const settingsIcon = document.getElementById('settings-icon');
const settingsPanel = document.getElementById('settings-panel');
const inhaleSlider = document.getElementById('inhale-slider');
const exhaleSlider = document.getElementById('exhale-slider');
const inhaleValue = document.getElementById('inhale-value');
const exhaleValue = document.getElementById('exhale-value');
const soundToggle = document.getElementById('sound-toggle');
const inhaleSound = document.getElementById('inhale-sound');
const exhaleSound = document.getElementById('exhale-sound');


// --- Переменные состояния ---
let inhaleTime = 5000;
let exhaleTime = 5000;
let isSoundOn = false;

// --- Функции-обработчики событий ---

// Показываем/скрываем панель настроек
function toggleSettingsPanel() {
    settingsPanel.classList.toggle('visible');
}

// Включаем/выключаем звук
function toggleSound() {
    isSoundOn = !isSoundOn;
    soundToggle.textContent = isSoundOn ? '🔊' : '🔇';
}

// Обновляем время вдоха при движении слайдера
function updateInhaleTime() {
    inhaleTime = inhaleSlider.value * 1000;
    inhaleValue.textContent = inhaleSlider.value;
}

// Обновляем время выдоха при движении слайдера
function updateExhaleTime() {
    exhaleTime = exhaleSlider.value * 1000;
    exhaleValue.textContent = exhaleSlider.value;
}

// --- Основная логика дыхания ---

function playSound(sound) {
    if (isSoundOn) {
        sound.currentTime = 0; // Позволяет проигрывать звук снова, не дожидаясь конца
        sound.play();
    }
}

// Функция для одной фазы дыхания
function breathPhase(text, time, growClass, sound) {
    statusText.textContent = text;
    circle.style.transitionDuration = `${time / 1000}s`; // Синхронизируем анимацию с таймером
    
    if (growClass) {
        circle.classList.add('grow');
    } else {
        circle.classList.remove('grow');
    }
    
    playSound(sound);
    
    return new Promise(resolve => setTimeout(resolve, time));
}

// Основной цикл дыхания
async function startBreathingCycle() {
    statusText.textContent = 'Приготовьтесь...';
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    while (true) {
        await breathPhase('Вдох', inhaleTime, true, inhaleSound);
        await breathPhase('Выдох', exhaleTime, false, exhaleSound);
    }
}

// --- Навешиваем все обработчики событий ---

settingsIcon.addEventListener('click', toggleSettingsPanel);
soundToggle.addEventListener('click', toggleSound);
inhaleSlider.addEventListener('input', updateInhaleTime);
exhaleSlider.addEventListener('input', updateExhaleTime);

// Запускаем цикл дыхания после загрузки страницы
window.addEventListener('load', startBreathingCycle);

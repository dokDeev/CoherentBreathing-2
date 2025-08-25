// Находим нужные элементы на странице
const circle = document.getElementById('circle');
const status = document.getElementById('status');

// Настройки дыхательного цикла (в миллисекундах)
const inhaleTime = 5000; // 5 секунд на вдох
const exhaleTime = 5000; // 5 секунд на выдох

// Функция для одной фазы дыхания (вдох или выдох)
function breathPhase(text, time, growClass) {
    status.textContent = text;
    if (growClass) {
        circle.classList.add('grow');
    } else {
        circle.classList.remove('grow');
    }
    
    return new Promise(resolve => setTimeout(resolve, time));
}

// Основной цикл дыхания
async function startBreathingCycle() {
    // Начальная задержка перед первым вдохом
    status.textContent = 'Приготовьтесь...';
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    while (true) {
        // Фаза вдоха
        await breathPhase('Вдох', inhaleTime, true);
        
        // Фаза выдоха
        await breathPhase('Выдох', exhaleTime, false);
    }
}

// Запускаем цикл дыхания после загрузки страницы
window.addEventListener('load', startBreathingCycle);

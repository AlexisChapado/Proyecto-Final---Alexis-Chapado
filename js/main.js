
document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar');
    const monthYear = document.getElementById('month-year');
    const taskList = document.getElementById('task-list');
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.getElementById('close-modal');
    const addTaskButton = document.getElementById('add-task');
    const taskInput = document.getElementById('task-input');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

    async function fetchTasks() {
        try {
            const response = await fetch('/tasks'); // Ruta del servidor para obtener tareas
            if (!response.ok) throw new Error('Network response was not ok');
            tasks = await response.json();
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderCalendar();
            renderTaskList();
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async function saveTasks() {
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tasks)
            });
            if (!response.ok) throw new Error('Network response was not ok');
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    function renderCalendar() {
        calendarContainer.innerHTML = '';
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Fill days of the week
        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(day => {
            const div = document.createElement('div');
            div.innerText = day;0
            div.className = 'day-name'; 
            calendarContainer.appendChild(div);
        });

        // Fill days of the month
        for (let i = 0; i < firstDay; i++) {
            calendarContainer.appendChild(document.createElement('div'));
        }
        for (let day = 1; day <= lastDate; day++) {
            const div = document.createElement('div');
            div.innerText = day;
            div.classList.add('calendar-day');
            div.dataset.date = `${currentYear}-${currentMonth + 1}-${day}`;
            if (tasks[div.dataset.date]) {
                div.classList.add('has-task');
            }
            div.addEventListener('click', openTaskModal);
            calendarContainer.appendChild(div);
        }

        monthYear.innerText = `${currentYear} - ${currentMonth + 1}`;
    }

    function openTaskModal(event) {
        const date = event.target.dataset.date;
        taskInput.dataset.date = date;
        taskInput.value = ''; 
        taskModal.style.display = 'flex';
    }

    function closeTaskModal() {
        taskModal.style.display = 'none';
    }

    async function addTask() {
        const date = taskInput.dataset.date;
        const description = taskInput.value.trim();
        if (description) {
            tasks[date] = tasks[date] || [];
            tasks[date].push(description);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            await saveTasks(); // Guardar en el servidor
            renderCalendar();
            renderTaskList();
            closeTaskModal();
        }
    }
    

    function renderTaskList() {
        taskList.innerHTML = '';
        Object.keys(tasks).forEach(date => {
            tasks[date].forEach((task, index) => {
                const li = document.createElement('li');
                li.innerHTML = `${task} <span class="date">(${date})</span>
                <button onclick="viewDate('${date}')">Ir al Calendario</button>
                <button onclick="removeTask('${date}', ${index})">Eliminar</button>`;
                taskList.appendChild(li);
            });
        });
    }

    window.viewDate = function(date) {
        const [year, month, day] = date.split('-').map(Number);
        currentYear = year;
        currentMonth = month - 1;
        renderCalendar();
    };

    window.removeTask = function(date, index) {
        tasks[date].splice(index, 1);
        if (tasks[date].length === 0) {
            delete tasks[date];
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderCalendar();
        renderTaskList();
    };

    prevMonthButton.addEventListener('click', () => {
        currentMonth -= 1;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        }
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth += 1;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
        renderCalendar();
    });

    closeModal.addEventListener('click', closeTaskModal);
    addTaskButton.addEventListener('click', addTask);

    renderCalendar();
    renderTaskList();
});

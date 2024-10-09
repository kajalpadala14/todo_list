// Select elements
const taskInput = document.getElementById('taskInput');
const taskStartTime = document.getElementById('taskStartTime');
const taskDeadline = document.getElementById('taskDeadline');
const addTaskButton = document.getElementById('addTaskButton');
const resetButton = document.getElementById('resetButton');
const taskTable = document.querySelector('#taskTable tbody');

// Load tasks from local storage
document.addEventListener('DOMContentLoaded', loadTasks);

// Function to add a new task
function addTask() {
    const taskValue = taskInput.value.trim();
    const startTimeValue = taskStartTime.value;
    const deadlineValue = taskDeadline.value;

    if (taskValue && startTimeValue) {
        const task = {
            id: Date.now(),
            text: taskValue,
            startTime: startTimeValue,
            deadline: deadlineValue,
            addedAt: Date.now(),
            completed: false,
            completedAt: null
        };
        addTaskToDOM(task);
        saveTask(task);
        taskInput.value = '';
        taskStartTime.value = '';
        taskDeadline.value = '';
    }
}

// Function to add a task to the DOM
function addTaskToDOM(task) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', task.id);

    const taskCell = document.createElement('td');
    taskCell.textContent = task.text;
    row.appendChild(taskCell);

    const startDateCell = document.createElement('td');
    startDateCell.textContent = task.startTime ? new Date(task.startTime).toLocaleString() : '';
    row.appendChild(startDateCell);

    const deadlineCell = document.createElement('td');
    deadlineCell.textContent = task.deadline ? new Date(task.deadline).toLocaleString() : '';
    row.appendChild(deadlineCell);

    const completedCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = function() { toggleTaskCompletion(task.id, checkbox.checked); };
    completedCell.appendChild(checkbox);
    row.appendChild(completedCell);

    const completionDateCell = document.createElement('td');
    completionDateCell.textContent = task.completedAt ? new Date(task.completedAt).toLocaleString() : '';
    row.appendChild(completionDateCell);

    const durationCell = document.createElement('td');
    durationCell.textContent = task.completedAt ? getDuration(task.addedAt, task.completedAt) : '';
    row.appendChild(durationCell);

    const extraTimeCell = document.createElement('td');
    extraTimeCell.textContent = task.completedAt ? getExtraTime(task.deadline, task.completedAt) : '';
    row.appendChild(extraTimeCell);

    const actionsCell = document.createElement('td');

    // Create and append Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.onclick = function() { removeTask(task.id, row); };
    actionsCell.appendChild(deleteButton);

    // Create and append Padding button
    const paddingButton = document.createElement('button');
    paddingButton.textContent = 'Padding';
    paddingButton.className = 'padding-button';
    paddingButton.onclick = function() { addPadding(row); };
    actionsCell.appendChild(paddingButton);

    row.appendChild(actionsCell);

    taskTable.appendChild(row);
}

// Function to toggle task completion
function toggleTaskCompletion(taskId, completed) {
    const task = updateTaskCompletion(taskId, completed);
    const rows = taskTable.querySelectorAll('tr');
    rows.forEach(row => {
        if (row.getAttribute('data-id') == taskId) {
            const completionDateCell = row.children[4];
            const durationCell = row.children[6];
            const extraTimeCell = row.children[7];
            if (task.completed) {
                completionDateCell.textContent = new Date(task.completedAt).toLocaleString();
                durationCell.textContent = getDuration(task.addedAt, task.completedAt);
                extraTimeCell.textContent = getExtraTime(task.deadline, task.completedAt);
                row.classList.add('completed');
            } else {
                completionDateCell.textContent = '';
                durationCell.textContent = '';
                extraTimeCell.textContent = '';
                row.classList.remove('completed');
            }
        }
    });
}

// Function to remove a task
function removeTask(taskId, row) {
    taskTable.removeChild(row);
    deleteTask(taskId);
}

// Function to add padding to the row
function addPadding(row) {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
        cell.style.padding = '16px'; // Adjust padding as needed
    });
}

// Function to save task in local storage
function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task));
}

// Function to update task completion status in local storage
function updateTaskCompletion(taskId, completed) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.id == taskId) {
            task.completed = completed;
            task.completedAt = completed ? Date.now() : null;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return tasks.find(task => task.id == taskId);
}

// Function to delete task from local storage
function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id != taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to reset the task list
function resetTasks() {
    localStorage.removeItem('tasks');
    taskTable.innerHTML = '';
}

// Function to calculate duration in days, hours, and minutes
function getDuration(start, end) {
    let duration = end - start;
    let days = Math.floor(duration / (1000 * 60 * 60 * 24));
    let hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
}

// Function to calculate extra time if the task is completed after the deadline
function getExtraTime(deadline, completedAt) {
  if (!deadline) return '';
  let deadlineTime = new Date(deadline).getTime();
  let completionTime = new Date(completedAt).getTime();

  // Calculate the difference in milliseconds
  let difference = completionTime - deadlineTime;

  // Handle both positive and negative differences
  let days = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
  let hours = Math.floor(Math.abs(difference) % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
  let minutes = Math.floor(Math.abs(difference) % (1000 * 60 * 60) / (1000 * 60));

  // Add a prefix based on positive or negative difference
  let prefix = difference > 0 ? '+' : '-';

  return `${prefix}${days}d ${hours}h ${minutes}m`;
}

// Event listeners
addTaskButton.addEventListener('click', addTask);
resetButton.addEventListener('click', resetTasks);
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

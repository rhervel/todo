// Select DOM elements
const taskInput = document.getElementById('task-input');
const taskTime = document.getElementById('task-time'); // Select for time
const addTaskButton = document.getElementById('add-task');
const todoList = document.getElementById('todo-list');

// Load tasks from localStorage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Array of pastel colors
const pastelColors = [
  '#FFB3BA', // Light pink
  '#FFDFBA', // Peach
  '#FFFFBA', // Light yellow
  '#Baffba', // Mint green
  '#BADEFA', // Light blue
  '#BAADF0', // Lavender
];

// Function to save tasks to localStorage
function saveTasksToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to render the to-do list
function renderTodoList() {
  todoList.innerHTML = ''; // Clear the current list

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between';
    if (task.completed) {
      li.classList.add('completed');
    }

    // Assign a random pastel color to each task
    li.style.backgroundColor = pastelColors[index % pastelColors.length];
    li.style.borderRadius = '5px'; // Añadimos bordes redondeados

    // Task text (aligned to the left)
    const taskContainer = document.createElement('div');
    taskContainer.className = 'd-flex align-items-center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = 'form-check-input me-2';
    checkbox.addEventListener('change', () => toggleTaskCompletion(index));

    const spanText = document.createElement('span');
    spanText.className = 'task-text';
    spanText.textContent = task.text;

    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(spanText);

    // Task time (aligned to the right)
    const spanTime = document.createElement('span');
    spanTime.className = 'task-time ms-auto me-2';
    spanTime.textContent = task.time ? `Due: ${task.time}` : '';

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button btn-sm';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(index));

    // Append everything to the list item
    li.appendChild(taskContainer);
    li.appendChild(spanTime);
    li.appendChild(deleteButton);

    todoList.appendChild(li);
  });

  saveTasksToLocalStorage(); // Save tasks after rendering
  enableDragAndDrop(); // Enable drag-and-drop functionality
}

// Function to add a new task
function addTask() {
  const taskText = taskInput.value.trim();
  const taskTimeValue = taskTime.value; // Get the selected time
  if (taskText === '') return; // Prevent empty tasks

  tasks.push({ text: taskText, time: taskTimeValue, completed: false });
  taskInput.value = ''; // Clear the input field
  taskTime.value = ''; // Reset the select to default
  renderTodoList();
}

// Function to toggle task completion
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTodoList();
}

// Function to delete a task
function deleteTask(index) {
  tasks.splice(index, 1); // Remove the task from the array
  renderTodoList();
}

// Event listeners
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});

// Initial rendering of tasks when the page loads
renderTodoList();

// Generate time options every 15 minutes
function generateTimeOptions() {
  const startHour = 0;
  const endHour = 23;
  const intervalMinutes = 15;

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinute = String(minute).padStart(2, '0');
      const timeValue = `${formattedHour}:${formattedMinute}`;
      const option = document.createElement('option');
      option.value = timeValue;
      option.textContent = timeValue;
      taskTime.appendChild(option);
    }
  }
}

// Call the function to generate time options
generateTimeOptions();

// Drag-and-Drop functionality
function enableDragAndDrop() {
  const items = Array.from(todoList.children);

  items.forEach((item) => {
    item.setAttribute('draggable', true);

    item.addEventListener('dragstart', () => {
      item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
  });

  todoList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const draggingElement = document.querySelector('.dragging');
    if (afterElement == null) {
      todoList.appendChild(draggingElement);
    } else {
      todoList.insertBefore(draggingElement, afterElement);
    }

    updateTasksOrder();
  });
}

// Helper function to determine where to insert the dragged element
function getDragAfterElement(container, y) {
  const draggableElements = Array.from(
    container.querySelectorAll('.list-group-item:not(.dragging)')
  );

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Function to update the tasks array based on the current DOM order
function updateTasksOrder() {
  const orderedItems = Array.from(todoList.children).map((item, index) => {
    const taskText = item.querySelector('.task-text').textContent;
    const taskTime = item.querySelector('.task-time').textContent
      .replace('Due: ', '')
      .trim() || null;
    const completed = item.classList.contains('completed');

    return { text: taskText, time: taskTime, completed: completed };
  });

  tasks = orderedItems; // Update the tasks array with the new order
  saveTasksToLocalStorage(); // Save the updated order to localStorage
}
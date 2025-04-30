class TodoApp {
    constructor() {
        this.baseUrl = 'backend/todos';
        this.elements = {
            addTaskBtn: document.getElementById('add-task-btn'),
            taskInput: document.getElementById('task-input'),
            dueDateInput: document.getElementById('due-date'),
            taskList: document.getElementById('task-list'),
            filterButtons: document.querySelectorAll('.filter-buttons button'),
            clearTasksBtn: document.getElementById('clear-tasks-btn'),
            logoutBtn: document.getElementById('logoutBtn'),
            taskCount: document.getElementById('task-count')
        };

        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
        this.updateTaskCount();
    }

    setupEventListeners() {
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.elements.clearTasksBtn.addEventListener('click', () => this.clearCompletedTasks());
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentFilter = button.dataset.filter;
                this.updateFilterButtons();
                this.filterTasks(this.currentFilter);
            });
        });
    }

    async addTask() {
        try {
            const response = await fetch('backend/todos/create.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(/* your data */),
                credentials: 'include'
            });
    
            // Check for JSON response
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const errorText = await response.text();
                throw new Error(`Server returned: ${errorText}`);
            }
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            // Success handling
        } catch (error) {
            console.error('Full error:', error);
            alert(`Operation failed: ${error.message}`);
        }
    }
    createTaskElement(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        if (task.is_completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.is_completed;
        checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));

        const span = document.createElement('span');
        span.textContent = task.task;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        if (task.due_date) {
            dateSpan.textContent = this.formatDate(task.due_date);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => this.editTask(task.id, task.task, task.due_date));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(dateSpan);
        li.appendChild(actionsDiv);

        this.elements.taskList.appendChild(li);
    }
    async addTask() {
        const taskText = this.elements.taskInput.value.trim();
        const dueDate = this.elements.dueDateInput.value;
    
        if (!taskText) {
            alert('Task cannot be empty');
            return;
        }
    
        try {
            const response = await fetch('backend/todos/create.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Explicitly request JSON
                },
                body: JSON.stringify({
                    task: taskText,
                    due_date: dueDate || null
                }),
                credentials: 'include'
            });
    
            // First check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Invalid response: ${text}`);
            }
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add task');
            }
    
            this.createTaskElement(data);
            this.elements.taskInput.value = "";
            this.elements.dueDateInput.value = "";
            this.updateTaskCount();
        } catch (error) {
            console.error('Full error:', error);
            alert(`Error: ${error.message}\nCheck console for details`);
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`${this.baseUrl}/delete.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: taskId }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            const data = await response.json();
            const li = document.querySelector(`li[data-id="${taskId}"]`);
            if (li) {
                li.classList.add('fade-out');
                setTimeout(() => {
                    li.remove();
                    this.updateTaskCount();
                }, 400);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete task');
        }
    }

    async toggleTaskCompletion(taskId) {
        const li = document.querySelector(`li[data-id="${taskId}"]`);
        if (!li) return;

        const isCompleted = li.classList.contains('completed');
        
        try {
            const response = await fetch(`${this.baseUrl}/update.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: taskId,
                    task: li.querySelector('span').textContent,
                    is_completed: !isCompleted
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            li.classList.toggle('completed');
            this.updateTaskCount();
        } catch (error) {
            console.error('Error:', error);
            // Revert the checkbox if the request fails
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = isCompleted;
            }
        }
    }

    async loadTasks() {
        try {
            const response = await fetch(`${this.baseUrl}/read.php?filter=${this.currentFilter}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load tasks');
            }

            const tasks = await response.json();
            this.elements.taskList.innerHTML = '';
            tasks.forEach(task => this.createTaskElement(task));
            this.updateTaskCount();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load tasks');
        }
    }

    async clearCompletedTasks() {
        if (!confirm('Are you sure you want to clear all completed tasks?')) return;

        try {
            // First get all completed tasks
            const response = await fetch(`${this.baseUrl}/read.php?filter=completed`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch completed tasks');
            }

            const completedTasks = await response.json();
            
            // Delete each completed task
            for (const task of completedTasks) {
                await fetch(`${this.baseUrl}/delete.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: task.id }),
                    credentials: 'include'
                });
            }

            this.loadTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to clear completed tasks');
        }
    }

    filterTasks(filter) {
        const tasks = this.elements.taskList.querySelectorAll('li');
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');
            
            switch(filter) {
                case 'all':
                    task.style.display = '';
                    break;
                case 'completed':
                    task.style.display = isCompleted ? '' : 'none';
                    break;
                case 'pending':
                    task.style.display = !isCompleted ? '' : 'none';
                    break;
            }
        });
    }

    updateFilterButtons() {
        this.elements.filterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === this.currentFilter);
        });
    }

    async updateTaskCount() {
        try {
            const allResponse = await fetch(`${this.baseUrl}/read.php?filter=all`, {
                credentials: 'include'
            });
            const completedResponse = await fetch(`${this.baseUrl}/read.php?filter=completed`, {
                credentials: 'include'
            });

            if (!allResponse.ok || !completedResponse.ok) {
                throw new Error('Failed to fetch task counts');
            }

            const allTasks = await allResponse.json();
            const completedTasks = await completedResponse.json();

            this.elements.taskCount.textContent = 
                `${completedTasks.length} of ${allTasks.length} tasks completed`;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async logout() {
        try {
            const response = await fetch('backend/auth/logout.php', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            window.location.href = 'login.php';
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to logout');
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
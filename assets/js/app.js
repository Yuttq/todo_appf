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

    async handleApiRequest(endpoint, method, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    async addTask() {
        const taskText = this.elements.taskInput.value.trim();
        if (!taskText) {
            alert('Please enter a task');
            return;
        }

        try {
            const task = await this.handleApiRequest('create.php', 'POST', {
                task: taskText,
                due_date: this.elements.dueDateInput.value || null
            });
            
            this.createTaskElement(task);
            this.elements.taskInput.value = '';
            this.elements.dueDateInput.value = '';
            this.updateTaskCount();
        } catch (error) {
            alert(`Failed to add task: ${error.message}`);
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

    async editTask(taskId, currentText, currentDueDate) {
        const newText = prompt('Edit your task:', currentText);
        if (newText === null || newText.trim() === "") return;

        const newDueDate = prompt('Edit due date (YYYY-MM-DD):', currentDueDate || '');
        
        try {
            await this.handleApiRequest('update.php', 'POST', {
                id: taskId,
                task: newText.trim(),
                due_date: newDueDate || null
            });
            this.loadTasks();
        } catch (error) {
            alert('Failed to update task');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await this.handleApiRequest('delete.php', 'POST', { id: taskId });
            const li = document.querySelector(`li[data-id="${taskId}"]`);
            if (li) {
                li.classList.add('fade-out');
                setTimeout(() => {
                    li.remove();
                    this.updateTaskCount();
                }, 400);
            }
        } catch (error) {
            alert('Failed to delete task');
        }
    }

    async toggleTaskCompletion(taskId) {
        const li = document.querySelector(`li[data-id="${taskId}"]`);
        if (!li) return;

        const isCompleted = li.classList.contains('completed');
        const checkbox = li.querySelector('input[type="checkbox"]');
        
        try {
            await this.handleApiRequest('update.php', 'POST', {
                id: taskId,
                task: li.querySelector('span').textContent,
                is_completed: !isCompleted
            });
            li.classList.toggle('completed');
            this.updateTaskCount();
        } catch (error) {
            console.error('Error:', error);
            if (checkbox) checkbox.checked = isCompleted; // Revert on error
        }
    }

    async loadTasks() {
        try {
            const tasks = await this.handleApiRequest(`read.php?filter=${this.currentFilter}`, 'GET', null);
            this.elements.taskList.innerHTML = '';
            tasks.forEach(task => this.createTaskElement(task));
            this.updateTaskCount();
        } catch (error) {
            alert('Failed to load tasks');
        }
    }

    async clearCompletedTasks() {
        if (!confirm('Are you sure you want to clear all completed tasks?')) return;

        try {
            const completedTasks = await this.handleApiRequest('read.php?filter=completed', 'GET', null);
            for (const task of completedTasks) {
                await this.handleApiRequest('delete.php', 'POST', { id: task.id });
            }
            this.loadTasks();
        } catch (error) {
            alert('Failed to clear completed tasks');
        }
    }

    filterTasks(filter) {
        const tasks = this.elements.taskList.querySelectorAll('li');
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');
            task.style.display = 
                filter === 'all' ? '' :
                filter === 'completed' ? (isCompleted ? '' : 'none') :
                (!isCompleted ? '' : 'none');
        });
    }

    updateFilterButtons() {
        this.elements.filterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === this.currentFilter);
        });
    }

    async updateTaskCount() {
        try {
            const [allTasks, completedTasks] = await Promise.all([
                this.handleApiRequest('read.php?filter=all', 'GET', null),
                this.handleApiRequest('read.php?filter=completed', 'GET', null)
            ]);
            this.elements.taskCount.textContent = 
                `${completedTasks.length} of ${allTasks.length} tasks completed`;
        } catch (error) {
            console.error('Failed to update task count:', error);
        }
    }

    async logout() {
        try {
            await this.handleApiRequest('../auth/logout.php', 'POST', null);
            window.location.href = 'login.php';
        } catch (error) {
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
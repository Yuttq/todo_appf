<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My To-Do List</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="app-container">
        <header>
            <h1>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h1>
            <div class="user-actions">
                <button id="logoutBtn" class="danger-btn">Logout</button>
            </div>
        </header>

        <main>
            <div class="todo-container">
            <div class="input-group">
    <input type="text" id="task-input" placeholder="Add a new task..." aria-label="Task description">
    <input type="date" id="due-date" aria-label="Due date">
    <button id="add-task-btn" class="primary-btn">Add Task</button>
</div>

                <div class="controls">
                    <div class="filter-buttons" role="group" aria-label="Task filters">
                        <button data-filter="all" class="filter-btn active">All</button>
                        <button data-filter="pending" class="filter-btn">Pending</button>
                        <button data-filter="completed" class="filter-btn">Completed</button>
                    </div>

                    <button id="clear-tasks-btn" class="danger-btn">Clear Completed</button>
                </div>

                <ul id="task-list" aria-live="polite"></ul>
                <div id="task-count" class="task-counter">0 tasks</div>
            </div>
        </main>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>
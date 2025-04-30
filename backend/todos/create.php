

<?php

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Absolute path resolution
require __DIR__ . '/../../backend/auth/session.php';  // Adjusted path
require __DIR__ . '/../../backend/config/db.php';

// Error handling before any output
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

header('Content-Type: application/json');

try {
    // Rest of your create.php code...
    // Get and validate input
    $input = file_get_contents('php://input');
    if (!$input) {
        throw new Exception('No data received');
    }

    $data = json_decode($input, true);
    if (!$data || !isset($data['task'])) {
        throw new Exception('Invalid task data');
    }

    // Insert task
    $stmt = $conn->prepare("INSERT INTO todos (user_id, task, due_date) VALUES (?, ?, ?)");
    $success = $stmt->execute([
        $_SESSION['user_id'],
        trim($data['task']),
        $data['due_date'] ?? null
    ]);

    if (!$success) {
        throw new Exception('Database insert failed');
    }

    // Return the new task
    $taskId = $conn->lastInsertId();
    $stmt = $conn->prepare("SELECT * FROM todos WHERE id = ?");
    $stmt->execute([$taskId]);
    
    http_response_code(201);
    echo json_encode($stmt->fetch());

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to add task',
        'message' => $e->getMessage()
    ]);
}
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]));
}



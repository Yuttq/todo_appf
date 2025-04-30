<?php
// backend/todos/create.php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Don't output errors to response

// Absolute paths - adjust based on your actual structure
require __DIR__ . '/../auth/session.php';
require __DIR__ . '/../config/db.php';

// Headers must come before any output
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");

try {
    $json = file_get_contents('php://input');
    if (!$json) throw new Exception('No input received');
    
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data['task']) || empty(trim($data['task']))) {
        throw new Exception('Task is required');
    }

    $stmt = $conn->prepare("INSERT INTO todos (user_id, task, due_date) VALUES (?, ?, ?)");
    $stmt->execute([
        $_SESSION['user_id'],
        trim($data['task']),
        $data['due_date'] ?? null
    ]);

    // Return the created task
    $taskId = $conn->lastInsertId();
    $stmt = $conn->prepare("SELECT * FROM todos WHERE id = ?");
    $stmt->execute([$taskId]);
    
    http_response_code(201);
    echo json_encode($stmt->fetch());

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to create task',
        'message' => $e->getMessage()
    ]);
    exit();
}
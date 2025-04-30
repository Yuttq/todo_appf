<?php
require '../session.php';
require '../config/db.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id']) || !isset($data['task'])) {
        http_response_code(400);
        echo json_encode(["error" => "Task ID and content are required"]);
        exit();
    }

    $id = $data['id'];
    $task = trim($data['task']);
    $is_completed = isset($data['is_completed']) ? (bool)$data['is_completed'] : false;
    $due_date = isset($data['due_date']) ? $data['due_date'] : null;
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("UPDATE todos SET task = ?, is_completed = ?, due_date = ? WHERE id = ? AND user_id = ?");
    $stmt->execute([$task, $is_completed, $due_date, $id, $user_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Task not found or not owned by user"]);
        exit();
    }

    // Return the updated task
    $stmt = $conn->prepare("SELECT * FROM todos WHERE id = ?");
    $stmt->execute([$id]);
    $task = $stmt->fetch();

    echo json_encode($task);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to update task"]);
}
?>
<?php
require '../session.php';
require '../config/db.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Task ID is required"]);
        exit();
    }

    $id = $data['id'];
    $user_id = $_SESSION['user_id'];

    // First get the task to return it before deletion
    $stmt = $conn->prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);
    $task = $stmt->fetch();

    if (!$task) {
        http_response_code(404);
        echo json_encode(["error" => "Task not found or not owned by user"]);
        exit();
    }

    // Now delete the task
    $stmt = $conn->prepare("DELETE FROM todos WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);

    echo json_encode(["message" => "Task deleted", "task" => $task]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete task"]);
}
?>
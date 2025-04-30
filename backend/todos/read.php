<?php
require '../session.php';
require '../config/db.php';

header('Content-Type: application/json');

try {
    $user_id = $_SESSION['user_id'];
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';

    $query = "SELECT * FROM todos WHERE user_id = ?";
    
    switch ($filter) {
        case 'completed':
            $query .= " AND is_completed = TRUE";
            break;
        case 'pending':
            $query .= " AND is_completed = FALSE";
            break;
    }

    $query .= " ORDER BY is_completed, due_date IS NULL, due_date, created_at DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id]);
    $todos = $stmt->fetchAll();

    echo json_encode($todos);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch tasks"]);
}
?>
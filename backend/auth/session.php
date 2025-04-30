<?php
// backend/auth/session.php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}
// Return user data if session is valid
echo json_encode([
    "user" => [
        "id" => $_SESSION['user_id'],
        "username" => $_SESSION['username']
    ]
]);
?>
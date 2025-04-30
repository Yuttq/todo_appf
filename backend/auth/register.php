<?php
require '../config/db.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Username and password are required"]);
        exit();
    }

    $username = trim($data['username']);
    $password = $data['password'];

    // Validate username
    if (strlen($username) < 3) {
        http_response_code(400);
        echo json_encode(["error" => "Username must be at least 3 characters"]);
        exit();
    }

    // Validate password
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(["error" => "Password must be at least 6 characters"]);
        exit();
    }

    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Username already exists"]);
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $hashedPassword]);

    http_response_code(201);
    echo json_encode(["message" => "Registration successful"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed"]);
}
?>
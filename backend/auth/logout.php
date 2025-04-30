<?php
session_start();

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

header('Content-Type: application/json');
echo json_encode(["message" => "Logged out successfully"]);
?>
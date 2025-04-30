<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="assets/css/auth.css">
</head>
<body>
    <div class="auth-container">
        <h2>Register</h2>
        <form id="registerForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="Choose a username" required>
                <small>Minimum 3 characters</small>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Choose a password" required>
                <small>Minimum 6 characters</small>
            </div>
            <button type="submit" class="primary-btn">Register</button>
            <div class="auth-links">
                <p>Already have an account? <a href="login.php">Login</a></p>
            </div>
        </form>
        <div id="message" class="message"></div>
    </div>

    <script src="assets/js/auth.js"></script>
</body>
</html>
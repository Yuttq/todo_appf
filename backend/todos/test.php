<?php
session_start();
$_SESSION['user_id'] = 1; // Test value
require 'auth/session.php';
echo "Session validation passed!";
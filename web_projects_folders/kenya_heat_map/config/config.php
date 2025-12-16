<?php
/**
 * Database Configuration
 * Kenya Education Heatmap - LMS Sales Platform
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'kenya_lms_db');

// Application settings
define('APP_NAME', 'Kenya Education Heatmap');
define('APP_URL', 'http://localhost/kenya_heat_map');
define('APP_VERSION', '1.0.0');

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Africa/Nairobi');

// Session settings
session_start();

/**
 * Database connection function
 * @return mysqli|false
 */
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}
?>

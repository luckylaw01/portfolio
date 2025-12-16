<?php
/**
 * API Endpoint: Get Institutions
 * Kenya Education Heatmap
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/config.php';

// For now, return static data (will connect to DB in Phase 3)
// This allows the frontend to work before database is set up

$response = [
    'success' => true,
    'message' => 'API is working. Database integration pending.',
    'data' => []
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>

<?php
/**
 * API Index - Lists available endpoints
 * Kenya Education Heatmap
 */

header('Content-Type: application/json');

$endpoints = [
    'name' => 'Kenya Education Heatmap API',
    'version' => '1.0.0',
    'endpoints' => [
        [
            'path' => '/api/institutions.php',
            'method' => 'GET',
            'description' => 'Get all institutions'
        ],
        [
            'path' => '/api/institutions.php?type=University',
            'method' => 'GET',
            'description' => 'Get institutions filtered by type'
        ],
        [
            'path' => '/api/institutions.php?county=Nairobi',
            'method' => 'GET',
            'description' => 'Get institutions filtered by county'
        ],
        [
            'path' => '/api/leads.php',
            'method' => 'GET, POST',
            'description' => 'Manage leads (Coming in Phase 2)'
        ],
        [
            'path' => '/api/auth.php',
            'method' => 'POST',
            'description' => 'User authentication (Coming in Phase 3)'
        ]
    ],
    'status' => 'Development',
    'documentation' => 'See README.md for full documentation'
];

echo json_encode($endpoints, JSON_PRETTY_PRINT);
?>

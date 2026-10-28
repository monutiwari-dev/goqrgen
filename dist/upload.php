<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Allow CORS for local dev and production
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$maxFileSize = 20 * 1024 * 1024; // 20MB
$allowedTypes = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg',
];

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded.']);
    exit();
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload error: ' . $file['error']]);
    exit();
}
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large.']);
    exit();
}
if (!in_array(mime_content_type($file['tmp_name']), $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type.']);
    exit();
}
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$basename = bin2hex(random_bytes(8));
$targetFile = $uploadDir . $basename . '.' . $ext;
if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file.']);
    exit();
}
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$publicUrl = $protocol . '://' . $host . dirname($_SERVER['SCRIPT_NAME']) . '/uploads/' . basename($targetFile);
$publicUrl = str_replace('//', '/', $publicUrl); // Clean double slashes
$publicUrl = preg_replace('#:/#', '://', $publicUrl, 1); // Fix protocol
header('Content-Type: application/json');
echo json_encode(['url' => $publicUrl]); 
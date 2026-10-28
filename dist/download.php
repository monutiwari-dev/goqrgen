<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$uploadDir = __DIR__ . '/uploads/';
if (!isset($_GET['file'])) {
    http_response_code(400);
    echo 'Missing file parameter.';
    exit();
}
$filename = basename($_GET['file']);
$filepath = $uploadDir . $filename;
if (!file_exists($filepath)) {
    http_response_code(404);
    echo 'File not found.';
    exit();
}
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filepath));
readfile($filepath);
exit(); 
<?php
require_once 'vendor/autoload.php';
use Dotenv\Dotenv;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Обрабатываем preflight запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Завершаем скрипт для preflight запроса
}

$data = json_decode(file_get_contents('php://input'), true);
$recaptchaToken = $data['recaptchaToken'] ?? '';

if (!$recaptchaToken) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'reCAPTCHA token is missing']);
    exit;
}

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
$recaptchaSecretKey = $_ENV['RECAPTCHA_SECRET_KEY'];

$url = 'https://www.google.com/recaptcha/api/siteverify';
$postData = http_build_query([
    'secret' => $recaptchaSecretKey,
    'response' => $recaptchaToken,
]);

$options = [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $postData,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false,
];

$curl = curl_init();
curl_setopt_array($curl, $options);
$response = curl_exec($curl);
if (curl_errno($curl)) {
    curl_close($curl);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . curl_error($curl)]);
    exit;
}
curl_close($curl);

$responseData = json_decode($response, true);

if ($responseData && $responseData['success']) {
    echo json_encode(['success' => true, 'message' => 'reCAPTCHA successfully verified']);
} else {
    $errorCodes = isset($responseData['error-codes']) ? implode(', ', $responseData['error-codes']) : 'N/A';
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'reCAPTCHA verification failed', 'errorCodes' => $errorCodes]);
}
?>

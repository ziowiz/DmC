<?php
require_once 'vendor/autoload.php';
use Dotenv\Dotenv;
use MongoDB\Client as MongoDBClient;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
$mongoClient = new MongoDBClient($_ENV['DB_CONNECTION_STRING']);
$database = $mongoClient->selectDatabase('DmC');
$userCollection = $database->selectCollection('userData');

$userName = $_GET['userName'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Предзапрос CORS успешен
    exit(0);
}
if ($userName === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Имя пользователя не предоставлено']);
    exit;
}

$userExists = $userCollection->findOne(['userName' => $userName]);
$data = json_decode(file_get_contents('php://input'), true);
error_log(print_r($data, true)); // Для отладки, увидеть получаемые данные
if ($userExists) {
    echo json_encode(['exists' => true]);
} else {
    echo json_encode(['exists' => false]);
}
?>
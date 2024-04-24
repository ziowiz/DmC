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

$data = json_decode(file_get_contents('php://input'), true);
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Предзапрос CORS успешен
    exit(0);
}
if (!isset($data['userName']) || !isset($data['password']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Некорректные данные пользователя']);
    exit;
}

$newUser = [
    'userName' => $data['userName'],
    'email' => $data['email'],
    'password' => $data['password'], // Сохранение пароля напрямую без хеширования
    'admin' => $data['admin'] ?? false,
    'moderator' => $data['moderator'] ?? false,
    'id' => $data['id'] ?? '',
];

try {
    $result = $userCollection->insertOne($newUser);
    $newUser['_id'] = $result->getInsertedId();
    http_response_code(201);
    echo json_encode($newUser);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при создании пользователя: ' . $e->getMessage()]);
}
?>

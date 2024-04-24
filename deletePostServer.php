<?php
require_once 'vendor/autoload.php';
use Dotenv\Dotenv;
use Firebase\JWT\JWT;
use MongoDB\Client as MongoDBClient;
use Firebase\JWT\Key;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
$mongoClient = new MongoDBClient($_ENV['DB_CONNECTION_STRING']);
$database = $mongoClient->selectDatabase('DmC');
$collection = $database->selectCollection('userPost');

// Сначала обработайте OPTIONS запрос
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Нет необходимости добавлять другие заголовки, так как они уже установлены выше
    exit(0);
}

// Проверка на метод DELETE идет после OPTIONS
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['message' => 'Метод не разрешен']);
    exit;
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$authHeader) {
    http_response_code(403);
    echo json_encode(['message' => 'Токен не предоставлен']);
    exit;
}

list(, $token) = explode(" ", $authHeader, 2);
try {
    $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
    // Аутентификация прошла успешно, можно продолжать
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['message' => 'Неверный токен', 'error' => $e->getMessage()]);
    exit;
}

$postId = $_GET['postId'] ?? '';
try {
    $deleteResult = $collection->deleteOne(['_id' => new MongoDB\BSON\ObjectId($postId)]);
    if ($deleteResult->getDeletedCount() == 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Пост не найден']);
    } else {
        echo json_encode(['message' => 'Пост удален']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка на сервере: ' . $e->getMessage()]);
}
?>

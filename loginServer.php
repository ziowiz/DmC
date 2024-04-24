<?php
require_once 'vendor/autoload.php';
use Dotenv\Dotenv;
use Firebase\JWT\JWT;
use MongoDB\Client as MongoDBClient;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
$mongoClient = new MongoDBClient($_ENV['DB_CONNECTION_STRING']);
$database = $mongoClient->selectDatabase('DmC');
$userCollection = $database->selectCollection('userData'); 

// Обработка POST запроса для логина
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userName = $data['userName'] ?? '';
    $password = $data['password'] ?? '';

    if (!$userName || !$password) {
        http_response_code(400); // Неверный запрос
        echo json_encode(['message' => 'Необходимо указать имя пользователя и пароль']);
        exit;
    }

    try {
        $user = $userCollection->findOne(['userName' => $userName]);

        if (!$user) {
            http_response_code(401); // Не авторизован
            echo json_encode(['message' => 'Пользователь не найден']);
            exit;
        }

        // Здесь должна быть проверка пароля, например, через password_verify() если вы используете хеширование
        if ($user['password'] !== $password) {
            http_response_code(401); // Не авторизован
            echo json_encode(['message' => 'Неверный пароль']);
            exit;
        }

        $payload = [
            'userName' => $user['userName'],
            'exp' => time() + 3600, // Срок действия 1 час
        ];

        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        echo json_encode([
            'message' => 'Вы успешно вошли в систему',
            'token' => $jwt,
            'userName' => $user['userName'],
            'admin' => $user['admin'] ?? false,
            'moderator' => $user['moderator'] ?? false,
            'userId' => (string) $user['_id'], // Приведение типа, т.к. _id в MongoDB - объект
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка на сервере: ' . $e->getMessage()]);
    }
    exit;
}
?>

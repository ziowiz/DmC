<?php
require_once 'vendor/autoload.php';
use Dotenv\Dotenv;
use MongoDB\Client as MongoDBClient;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST');
// Немедленно возвращаем ответ на предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); // OK
    exit();
}
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Создаем клиента MongoDB
$mongoClient = new MongoDBClient($_ENV['DB_CONNECTION_STRING']);
$database = $mongoClient->selectDatabase('DmC');
$collection = $database->selectCollection('userPost');

// Получаем данные из POST запроса
$data = json_decode(file_get_contents('php://input'), true);
error_log(print_r($data, true)); // Исправлено здесь
if ($data === null || !is_array($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => 'Некорректный ввод данных']);
    exit;
}
// Форматируем дату
$date = date('d.m.Y');

$newPost = [
  'user' => isset($data['user']) ? $data['user'] : 'anonim',
    'post' => $data['post'],
    'date' => $date,
];
error_log(print_r($newPost, true)); // Исправлено здесь
try {
    $result = $collection->insertOne($newPost);
    echo json_encode(['success' => true, 'message' => 'Пост успешно добавлен', 'id' => (string)$result->getInsertedId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка при добавлении поста: ' . $e->getMessage()]);
}
?>

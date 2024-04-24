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
$collection = $database->selectCollection('userPost');

try {
    $cursor = $collection->find();
    $result = [];
    foreach ($cursor as $document) {
        $doc = (array)$document;
        // Преобразование ObjectId в строку
        $doc['_id'] = (string)$doc['_id'];
        $result[] = $doc;
    }
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка на сервере: ' . $e->getMessage()]);
}
?>

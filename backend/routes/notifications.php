<?php
require_once '../db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') { exit(); }

$conn = conectarDB();

// OBTENER NOTIFICACIONES
if ($method === 'GET') {
    // Asumimos el psicólogo con ID 1
    $result = $conn->query("SELECT * FROM notificaciones WHERE profesional_id = 1 ORDER BY fecha DESC LIMIT 20");
    $notificaciones = [];
    
    while ($row = $result->fetch_assoc()) {
        $notificaciones[] = [
            "id" => (int)$row['id'],
            "tipo" => $row['tipo'],
            "mensaje" => $row['mensaje'],
            "fecha" => $row['fecha'], // Enviaremos la fecha real
            "leida" => (bool)$row['leida']
        ];
    }
    echo json_encode(["success" => true, "data" => $notificaciones]);
} 

// MARCAR TODAS COMO LEÍDAS
elseif ($method === 'PUT') {
    $conn->query("UPDATE notificaciones SET leida = 1 WHERE profesional_id = 1");
    echo json_encode(["success" => true]);
}

$conn->close();
?>
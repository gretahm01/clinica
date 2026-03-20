<?php
require_once __DIR__ . '/config/headers.php';

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$partes = explode('/', trim($url, '/'));

$modulo = $partes[3] ?? '';
$accion = $partes[4] ?? '';

switch ($modulo) {
    case 'auth':
        switch ($accion) {
            case 'login':
                require __DIR__ . '/routes/auth.php';
                break;
            default:
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Ruta no encontrada"]);
        }
        break;

    case '':
        echo json_encode([
            "success" => true,
            "message" => "✅ Backend MedTrack funcionando",
            "rutas"   => ["POST /api/auth/login"]
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Ruta no encontrada"]);
}
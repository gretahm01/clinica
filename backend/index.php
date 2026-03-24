<?php

require_once __DIR__ . '/config/headers.php';

$url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Obtener solo lo que está después de "backend"
$ruta = substr($url, strpos($url, 'backend') + strlen('backend'));

// Limpiar slash inicial
$ruta = trim($ruta, '/');

// Separar partes
$partes = explode('/', $ruta);

// Obtener módulo y acción
$modulo = $partes[0] ?? '';
$accion = $partes[1] ?? '';

var_dump($url, $ruta, $modulo);
exit;

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
        
    case 'pacientes':
        require __DIR__ . '/routes/pacientes.php';
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
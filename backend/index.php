<?php
require_once __DIR__ . '/config/headers.php';

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'backend') + strlen('backend'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

$modulo = $partes[0] ?? '';
$accion = $partes[1] ?? '';

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
            "rutas"   => ["POST /api/auth/login", "GET /pacientes"]
        ]);
        break;
        
    case 'citas':
    require __DIR__ . '/routes/citas.php';
    break;
    case 'profesional':
    require __DIR__ . '/routes/profesional.php';
    break;
    case 'expediente':
    require __DIR__ . '/routes/expediente.php';
    break;

    default:
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Ruta no encontrada"]);
}
<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo']);

$method = $_SERVER['REQUEST_METHOD'];

// ===========================
// GET /profesional/perfil
// ===========================
if ($method === 'GET') {

    $conn = conectarDB();

    $sql = "
        SELECT 
            u.user_id           AS userId,
            u.first_name        AS nombre,
            u.last_name         AS apellido,
            u.middle_name       AS apellidoMaterno,
            u.email             AS email,
            u.phone             AS telefono,
            u.birth_date        AS fechaNacimiento,
            p.professional_id   AS profesionalId,
            p.license_number    AS numerolicencia,
            s.specialty_name    AS especialidad,
            r.role_name         AS rol
        FROM user u
        JOIN professional p ON p.user_id = u.user_id
        JOIN specialty s ON p.specialty_id = s.specialty_id
        JOIN user_access ua ON ua.user_id = u.user_id
        JOIN role r ON ua.role_id = r.role_id
        WHERE u.user_id = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $usuario['userId']);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Perfil no encontrado"]);
        exit();
    }

    $perfil = $resultado->fetch_assoc();

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $perfil]);

    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// PUT /profesional/perfil — actualizar datos
// ===========================
if ($method === 'PUT') {

    $body = json_decode(file_get_contents("php://input"), true);

    $nombre          = trim($body['nombre']         ?? '');
    $apellido        = trim($body['apellido']        ?? '');
    $apellidoMaterno = trim($body['apellidoMaterno'] ?? '');
    $telefono        = trim($body['telefono']        ?? '');
    $numerolicencia  = trim($body['numerolicencia']  ?? '');

    if (!$nombre || !$apellido) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nombre y apellido son requeridos"]);
        exit();
    }

    $conn = conectarDB();

    $stmtUser = $conn->prepare("
        UPDATE user SET first_name = ?, last_name = ?, middle_name = ?, phone = ?
        WHERE user_id = ?
    ");
    $stmtUser->bind_param("ssssi", $nombre, $apellido, $apellidoMaterno, $telefono, $usuario['userId']);
    $stmtUser->execute();
    $stmtUser->close();

    if ($numerolicencia) {
        $stmtProf = $conn->prepare("
            UPDATE professional SET license_number = ? WHERE user_id = ?
        ");
        $stmtProf->bind_param("si", $numerolicencia, $usuario['userId']);
        $stmtProf->execute();
        $stmtProf->close();
    }

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Perfil actualizado correctamente"]);

    $conn->close();
    exit();
}

// ===========================
// PUT /profesional/cambiar-contrasena
// ===========================
if ($method === 'PATCH') {

    $body = json_decode(file_get_contents("php://input"), true);

    $contrasenaActual = trim($body['contrasenaActual'] ?? '');
    $contrasenaNueva  = trim($body['contrasenaNueva']  ?? '');

    if (!$contrasenaActual || !$contrasenaNueva) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Ambas contraseñas son requeridas"]);
        exit();
    }

    $conn = conectarDB();

    $stmt = $conn->prepare("SELECT password FROM user_access WHERE user_id = ?");
    $stmt->bind_param("i", $usuario['userId']);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $acceso = $resultado->fetch_assoc();
    $stmt->close();

    if (!password_verify($contrasenaActual, $acceso['password'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "La contraseña actual es incorrecta"]);
        exit();
    }

    $nuevoHash = password_hash($contrasenaNueva, PASSWORD_BCRYPT);
    $stmtUpdate = $conn->prepare("UPDATE user_access SET password = ? WHERE user_id = ?");
    $stmtUpdate->bind_param("si", $nuevoHash, $usuario['userId']);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Contraseña actualizada correctamente"]);

    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método no permitido"]);
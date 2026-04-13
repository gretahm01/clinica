<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo', 'secretaria']);

$method = $_SERVER['REQUEST_METHOD'];

// Extraer el ID del paciente de la URL si existe
$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'backend') + strlen('backend'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);
$pacienteId = isset($partes[1]) && is_numeric($partes[1]) ? (int)$partes[1] : null;

// ===========================
// GET /pacientes — lista
// ===========================
if ($method === 'GET' && $pacienteId === null) {

    $conn = conectarDB();

    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resultProf = $stmtProf->get_result();

    if ($resultProf->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Profesional no encontrado"]);
        exit();
    }

    $professional_id = $resultProf->fetch_assoc()['professional_id'];

    $sql = "
        SELECT 
            p.patient_id        AS id,
            p.user_id           AS userId,
            u.first_name        AS nombre,
            u.last_name         AS apellido,
            u.middle_name       AS apellidoMaterno,
            u.email             AS email,
            u.phone             AS telefono,
            u.birth_date        AS fechaNacimiento,
            p.registration_date AS fechaRegistro,
            COUNT(CASE WHEN a.status != 'cancelada' THEN 1 END) AS totalCitas
        FROM patient p
        JOIN user u ON p.user_id = u.user_id
        LEFT JOIN appointment a ON a.patient_id = p.patient_id
        WHERE p.professional_id = ?
        GROUP BY p.patient_id
        ORDER BY u.first_name ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $professional_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $pacientes = [];
    while ($fila = $resultado->fetch_assoc()) {
        $pacientes[] = $fila;
    }

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $pacientes]);

    $stmtProf->close();
    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// GET /pacientes/:id — perfil específico
// ===========================
if ($method === 'GET' && $pacienteId !== null) {

    $conn = conectarDB();

    $sql = "
        SELECT 
            p.patient_id        AS id,
            p.user_id           AS userId,
            u.first_name        AS nombre,
            u.last_name         AS apellido,
            u.middle_name       AS apellidoMaterno,
            u.email             AS email,
            u.phone             AS telefono,
            u.birth_date        AS fechaNacimiento,
            p.registration_date AS fechaRegistro,
            COUNT(a.appointment_id) AS totalCitas
        FROM patient p
        JOIN user u ON p.user_id = u.user_id
        LEFT JOIN appointment a ON a.patient_id = p.patient_id
        WHERE p.patient_id = ?
        GROUP BY p.patient_id
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pacienteId);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Paciente no encontrado"]);
        exit();
    }

    $paciente = $resultado->fetch_assoc();

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $paciente]);

    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// POST /pacientes — registrar nuevo
// ===========================
if ($method === 'POST') {

    $body = json_decode(file_get_contents("php://input"), true);

    $nombre          = trim($body['nombre']         ?? '');
    $apellido        = trim($body['apellido']        ?? '');
    $segundoApellido = trim($body['segundoApellido'] ?? '');
    $email           = trim($body['email']           ?? '');
    $telefono        = trim($body['telefono']        ?? '');
    $fechaNacimiento = trim($body['fechaNacimiento'] ?? '');

    $contactoNombre     = trim($body['contactoNombre']     ?? '');
    $contactoTelefono   = trim($body['contactoTelefono']   ?? '');
    $contactoParentesco = trim($body['contactoParentesco'] ?? '');

    if (!$nombre || !$apellido || !$email || !$telefono || !$fechaNacimiento) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan campos requeridos"]);
        exit();
    }

    $conn = conectarDB();

    $stmtCheck = $conn->prepare("SELECT user_id FROM user WHERE email = ?");
    $stmtCheck->bind_param("s", $email);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "Ya existe un usuario con ese correo"]);
        exit();
    }
    $stmtCheck->close();

    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resultProf = $stmtProf->get_result();

    if ($resultProf->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Profesional no encontrado"]);
        exit();
    }
    $professional_id = $resultProf->fetch_assoc()['professional_id'];
    $stmtProf->close();

    $passwordTemporal = bin2hex(random_bytes(4));
    $passwordHash     = password_hash($passwordTemporal, PASSWORD_BCRYPT);
    $username = strtolower(substr($nombre, 0, 1) . $apellido . rand(100, 999));
    $username = preg_replace('/[^a-z0-9]/', '', $username);

    $conn->begin_transaction();

    try {
        $stmtUser = $conn->prepare("
            INSERT INTO user (first_name, last_name, middle_name, email, phone, birth_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmtUser->bind_param("ssssss", $nombre, $apellido, $segundoApellido, $email, $telefono, $fechaNacimiento);
        $stmtUser->execute();
        $newUserId = $conn->insert_id;
        $stmtUser->close();

        $stmtAccess = $conn->prepare("INSERT INTO user_access (user_id, role_id, username, password) VALUES (?, 3, ?, ?)");
        $stmtAccess->bind_param("iss", $newUserId, $username, $passwordHash);
        $stmtAccess->execute();
        $stmtAccess->close();

        $fechaHoy = date('Y-m-d');
        $stmtPatient = $conn->prepare("INSERT INTO patient (user_id, professional_id, registration_date) VALUES (?, ?, ?)");
        $stmtPatient->bind_param("iis", $newUserId, $professional_id, $fechaHoy);
        $stmtPatient->execute();
        $newPatientId = $conn->insert_id;
        $stmtPatient->close();

        if ($contactoNombre && $contactoTelefono) {
            $stmtContacto = $conn->prepare("INSERT INTO emergency_contact (patient_id, full_name, phone, relationship) VALUES (?, ?, ?, ?)");
            $stmtContacto->bind_param("isss", $newPatientId, $contactoNombre, $contactoTelefono, $contactoParentesco);
            $stmtContacto->execute();
            $stmtContacto->close();
        }

        $conn->commit();

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Paciente registrado correctamente",
            "data" => [
                "id"              => $newPatientId,
                "userId"          => $newUserId,
                "nombre"          => $nombre,
                "apellido"        => $apellido,
                "apellidoMaterno" => $segundoApellido,
                "email"           => $email,
                "telefono"        => $telefono,
                "fechaNacimiento" => $fechaNacimiento,
                "fechaRegistro"   => $fechaHoy,
                "totalCitas"      => 0,
                "credenciales"    => ["username" => $username, "password" => $passwordTemporal]
            ]
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al registrar el paciente"]);
    }

    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método no permitido"]);
<?php
// ===========================
// backend/routes/admin.php
// ===========================
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario_token = verificarToken();
verificarRol($usuario_token, ['admin']);

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'admin') + strlen('admin'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);
$subPath = $partes[0] ?? '';

// Validamos estrictamente si hay un ID numérico al final de la ruta (Ej: psicologos/1)
$hasId = isset($partes[1]) && is_numeric($partes[1]);
$idParam = $hasId ? (int)$partes[1] : null;

$conn = conectarDB();

// ===========================
// 1. GET /admin/stats - Estadísticas
// ===========================
if ($method === 'GET' && $subPath === 'stats') {
    $resPsi = $conn->query("SELECT COUNT(*) as total FROM professional");
    $totPsi = $resPsi->fetch_assoc()['total'];

    $resPac = $conn->query("SELECT COUNT(*) as total FROM patient");
    $totPac = $resPac->fetch_assoc()['total'];

    echo json_encode(["success" => true, "data" => ["totalPsicologos" => (int)$totPsi, "totalPacientes" => (int)$totPac]]);
    $conn->close(); exit();
}

// ===========================
// 2. GET /admin/psicologos (LISTA DE TODOS - Solo si NO hay ID)
// ===========================
if ($method === 'GET' && $subPath === 'psicologos' && !$hasId) {
    $res = $conn->query("
        SELECT p.professional_id as id, u.first_name as nombre, u.last_name as apellido, u.email, u.phone as telefono, p.license_number as cedula 
        FROM professional p JOIN user u ON p.user_id = u.user_id ORDER BY u.first_name ASC
    ");
    $psicologos = [];
    while($row = $res->fetch_assoc()) { $psicologos[] = $row; }
    echo json_encode(["success" => true, "data" => $psicologos]);
    $conn->close(); exit();
}

// ===========================
// 3. GET /admin/psicologos/:id (PERFIL DETALLADO - Solo si SÍ hay ID)
// ===========================
if ($method === 'GET' && $subPath === 'psicologos' && $hasId) {
    $stmt = $conn->prepare("
        SELECT p.professional_id as id, u.first_name as nombre, u.last_name as apellido, u.email, u.phone as telefono, p.license_number as cedula 
        FROM professional p JOIN user u ON p.user_id = u.user_id WHERE p.professional_id = ?
    ");
    $stmt->bind_param("i", $idParam);
    $stmt->execute();
    $resProf = $stmt->get_result();
    
    if ($resProf->num_rows === 0) {
        http_response_code(404); echo json_encode(["success" => false, "message" => "Psicólogo no encontrado"]);
        $stmt->close(); $conn->close(); exit();
    }
    $psicologoInfo = $resProf->fetch_assoc();
    $stmt->close();

    $stmtPac = $conn->prepare("
        SELECT p.patient_id as id, u.first_name as nombre, u.last_name as apellido, u.email, u.phone as telefono
        FROM patient p JOIN user u ON p.user_id = u.user_id WHERE p.professional_id = ? ORDER BY u.first_name ASC
    ");
    $stmtPac->bind_param("i", $idParam);
    $stmtPac->execute();
    $resPac = $stmtPac->get_result();
    
    $pacientesAsignados = [];
    while($row = $resPac->fetch_assoc()) { $pacientesAsignados[] = $row; }
    $stmtPac->close();

    echo json_encode(["success" => true, "data" => ["profesional" => $psicologoInfo, "pacientes" => $pacientesAsignados]]);
    $conn->close(); exit();
}

// ===========================
// 4. PUT /admin/psicologos/:id (ACTUALIZAR - Solo si SÍ hay ID)
// ===========================
if ($method === 'PUT' && $subPath === 'psicologos' && $hasId) {
    $body = json_decode(file_get_contents("php://input"), true);
    $nombre = $body['nombre'] ?? null;
    $apellido = $body['apellido'] ?? null;
    $email = $body['email'] ?? null;
    $telefono = $body['telefono'] ?? null;
    $cedula = $body['cedula'] ?? null;

    $conn->begin_transaction();
    try {
        $stmtId = $conn->prepare("SELECT user_id FROM professional WHERE professional_id = ?");
        $stmtId->bind_param("i", $idParam);
        $stmtId->execute();
        $resId = $stmtId->get_result()->fetch_assoc();
        $stmtId->close();

        if($resId) {
            $userId = $resId['user_id'];
            $stmtU = $conn->prepare("UPDATE user SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE user_id = ?");
            $stmtU->bind_param("ssssi", $nombre, $apellido, $email, $telefono, $userId);
            $stmtU->execute(); $stmtU->close();

            $stmtP = $conn->prepare("UPDATE professional SET license_number = COALESCE(?, license_number) WHERE professional_id = ?");
            $stmtP->bind_param("si", $cedula, $idParam);
            $stmtP->execute(); $stmtP->close();
        }
        $conn->commit();
        http_response_code(200); echo json_encode(["success" => true, "message" => "Psicólogo actualizado correctamente"]);
    } catch (Exception $e) {
        $conn->rollback(); http_response_code(500); echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
    $conn->close(); exit();
}

// ===========================
// 5. POST /admin/psicologos (CREAR NUEVO - Solo si NO hay ID)
// ===========================
if ($method === 'POST' && $subPath === 'psicologos' && !$hasId) {
    $body = json_decode(file_get_contents("php://input"), true);
    $nombre = trim($body['nombre'] ?? '');
    $apellido = trim($body['apellido'] ?? '');
    $email = trim($body['email'] ?? '');
    $telefono = trim($body['telefono'] ?? '');
    $cedula = trim($body['cedula'] ?? '');
    $fechaNacimiento = trim($body['fechaNacimiento'] ?? null);
    
    if (!$nombre || !$email) {
        http_response_code(400); echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]); exit();
    }

    $conn->begin_transaction();
    try {
        $stmtUser = $conn->prepare("INSERT INTO user (first_name, last_name, email, phone, birth_date) VALUES (?, ?, ?, ?, ?)");
        $stmtUser->bind_param("sssss", $nombre, $apellido, $email, $telefono, $fechaNacimiento);
        $stmtUser->execute();
        $userId = $conn->insert_id;

        $username = strtolower(substr($nombre, 0, 1) . explode(' ', $apellido)[0] . rand(100, 999));
        $passwordHash = password_hash("password123", PASSWORD_BCRYPT);
        $roleId = 1; 

        $stmtAcc = $conn->prepare("INSERT INTO user_access (user_id, role_id, username, password) VALUES (?, ?, ?, ?)");
        $stmtAcc->bind_param("iiss", $userId, $roleId, $username, $passwordHash);
        $stmtAcc->execute();

        $specialtyId = 1;
        $stmtProf = $conn->prepare("INSERT INTO professional (user_id, license_number, specialty_id) VALUES (?, ?, ?)");
        $stmtProf->bind_param("isi", $userId, $cedula, $specialtyId);
        $stmtProf->execute();

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Psicólogo registrado. Usuario: $username"]);
    } catch (Exception $e) {
        $conn->rollback(); http_response_code(500); echo json_encode(["success" => false, "message" => "Error al registrar psicólogo: " . $e->getMessage()]);
    }
    $conn->close(); exit();
}

// ===========================
// 6. GET /admin/pacientes (LISTA DE TODOS - Solo si NO hay ID)
// ===========================
if ($method === 'GET' && $subPath === 'pacientes' && !$hasId) {
    $res = $conn->query("
        SELECT p.patient_id as id, u.first_name as nombre, u.last_name as apellido, u.email, u.phone as telefono, p.professional_id as profesionalId 
        FROM patient p JOIN user u ON p.user_id = u.user_id ORDER BY u.first_name ASC
    ");
    $pacientes = [];
    while($row = $res->fetch_assoc()) { $pacientes[] = $row; }
    echo json_encode(["success" => true, "data" => $pacientes]);
    $conn->close(); exit();
}

// ===========================
// 7. POST /admin/pacientes (CREAR NUEVO - Solo si NO hay ID)
// ===========================
if ($method === 'POST' && $subPath === 'pacientes' && !$hasId) {
    $body = json_decode(file_get_contents("php://input"), true);
    $nombre = trim($body['nombre'] ?? '');
    $apellido = trim($body['apellido'] ?? '');
    $email = trim($body['email'] ?? '');
    $telefono = trim($body['telefono'] ?? '');
    $fechaNacimiento = trim($body['fechaNacimiento'] ?? null);
    $psicologoId = intval($body['psicologoId'] ?? 0);
    
    if (!$nombre || !$email || !$psicologoId) {
        http_response_code(400); echo json_encode(["success" => false, "message" => "Faltan datos o psicólogo no asignado"]); exit();
    }

    $conn->begin_transaction();
    try {
        $stmtUser = $conn->prepare("INSERT INTO user (first_name, last_name, email, phone, birth_date) VALUES (?, ?, ?, ?, ?)");
        $stmtUser->bind_param("sssss", $nombre, $apellido, $email, $telefono, $fechaNacimiento);
        $stmtUser->execute();
        $userId = $conn->insert_id;

        $username = strtolower(substr($nombre, 0, 1) . explode(' ', $apellido)[0] . rand(100, 999));
        $passwordHash = password_hash("password123", PASSWORD_BCRYPT);
        $roleId = 3; 

        $stmtAcc = $conn->prepare("INSERT INTO user_access (user_id, role_id, username, password) VALUES (?, ?, ?, ?)");
        $stmtAcc->bind_param("iiss", $userId, $roleId, $username, $passwordHash);
        $stmtAcc->execute();

        $stmtPat = $conn->prepare("INSERT INTO patient (user_id, professional_id, registration_date) VALUES (?, ?, CURDATE())");
        $stmtPat->bind_param("ii", $userId, $psicologoId);
        $stmtPat->execute();

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Paciente registrado asignado al psicólogo $psicologoId. Usuario: $username"]);
    } catch (Exception $e) {
        $conn->rollback(); http_response_code(500); echo json_encode(["success" => false, "message" => "Error al registrar paciente: " . $e->getMessage()]);
    }
    $conn->close(); exit();
}

// ===========================
// 8. GET /admin/pacientes/:id (PERFIL DETALLADO PACIENTE)
// ===========================
if ($method === 'GET' && $subPath === 'pacientes' && $hasId) {
    $stmt = $conn->prepare("
        SELECT p.patient_id as id, u.first_name as nombre, u.last_name as apellido, u.email, u.phone as telefono, p.professional_id as profesionalId, u.birth_date as fechaNacimiento
        FROM patient p JOIN user u ON p.user_id = u.user_id WHERE p.patient_id = ?
    ");
    $stmt->bind_param("i", $idParam);
    $stmt->execute();
    $resPac = $stmt->get_result();
    
    if ($resPac->num_rows === 0) {
        http_response_code(404); echo json_encode(["success" => false, "message" => "Paciente no encontrado"]);
        $stmt->close(); $conn->close(); exit();
    }
    
    $pacienteInfo = $resPac->fetch_assoc();
    $stmt->close();

    echo json_encode(["success" => true, "data" => $pacienteInfo]);
    $conn->close(); exit();
}

// ===========================
// 9. PUT /admin/pacientes/:id (ACTUALIZAR PACIENTE)
// ===========================
if ($method === 'PUT' && $subPath === 'pacientes' && $hasId) {
    $body = json_decode(file_get_contents("php://input"), true);
    $nombre = $body['nombre'] ?? null;
    $apellido = $body['apellido'] ?? null;
    $email = $body['email'] ?? null;
    $telefono = $body['telefono'] ?? null;
    $fechaNacimiento = $body['fechaNacimiento'] ?? null;
    $psicologoId = isset($body['psicologoId']) ? (int)$body['psicologoId'] : null;

    $conn->begin_transaction();
    try {
        $stmtId = $conn->prepare("SELECT user_id FROM patient WHERE patient_id = ?");
        $stmtId->bind_param("i", $idParam);
        $stmtId->execute();
        $resId = $stmtId->get_result()->fetch_assoc();
        $stmtId->close();

        if($resId) {
            $userId = $resId['user_id'];
            $stmtU = $conn->prepare("UPDATE user SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone), birth_date = COALESCE(?, birth_date) WHERE user_id = ?");
            $stmtU->bind_param("sssssi", $nombre, $apellido, $email, $telefono, $fechaNacimiento, $userId);
            $stmtU->execute(); $stmtU->close();

            if ($psicologoId) {
                $stmtP = $conn->prepare("UPDATE patient SET professional_id = ? WHERE patient_id = ?");
                $stmtP->bind_param("ii", $psicologoId, $idParam);
                $stmtP->execute(); $stmtP->close();
            }
        }

        $conn->commit();
        http_response_code(200); echo json_encode(["success" => true, "message" => "Paciente actualizado correctamente"]);
    } catch (Exception $e) {
        $conn->rollback(); http_response_code(500); echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }
    $conn->close(); exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método no permitido en Admin"]);
$conn->close();
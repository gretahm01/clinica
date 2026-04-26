<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo', 'secretaria']);

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'citas') + strlen('citas'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

// GET /citas/paciente/:id
if ($method === 'GET' && isset($partes[0]) && $partes[0] === 'paciente' && isset($partes[1]) && is_numeric($partes[1])) {
    $pacienteId = (int)$partes[1];
    $conn = conectarDB();
    $conn->query("UPDATE appointment SET status = 'completada' WHERE appointment_date < CURDATE() AND status IN ('confirmada', 'pendiente')");
    $sql = "SELECT a.appointment_id AS id, a.patient_id AS pacienteId, a.professional_id AS profesionalId, a.appointment_date AS fecha, a.appointment_time AS hora, a.status AS estado, a.feedback AS feedback FROM appointment a WHERE a.patient_id = ? ORDER BY a.appointment_date ASC, a.appointment_time ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pacienteId);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $citas = [];
    while ($fila = $resultado->fetch_assoc()) { $citas[] = $fila; }
    http_response_code(200);
    echo json_encode(["success" => true, "data" => $citas]);
    $stmt->close();
    $conn->close();
    exit();
}

// GET /citas/hoy
if ($method === 'GET' && isset($partes[0]) && $partes[0] === 'hoy') {
    $conn = conectarDB();
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resultProf = $stmtProf->get_result();
    if ($resultProf->num_rows === 0) { http_response_code(404); echo json_encode(["success" => false, "message" => "Profesional no encontrado"]); exit(); }
    $professional_id = $resultProf->fetch_assoc()['professional_id'];
    $stmtProf->close();
    $hoy = date('Y-m-d');
    $sql = "SELECT a.appointment_id AS id, a.appointment_time AS hora, a.status AS estado, u.first_name AS nombre, u.last_name AS apellido FROM appointment a JOIN patient p ON a.patient_id = p.patient_id JOIN user u ON p.user_id = u.user_id WHERE a.professional_id = ? AND a.appointment_date = ? AND a.status != 'cancelada' ORDER BY a.appointment_time ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $professional_id, $hoy);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $citas = [];
    while ($fila = $resultado->fetch_assoc()) { $citas[] = $fila; }
    http_response_code(200);
    echo json_encode(["success" => true, "data" => $citas]);
    $stmt->close();
    $conn->close();
    exit();
}

// GET /citas
if ($method === 'GET') {
    $conn = conectarDB();
    $conn->query("UPDATE appointment SET status = 'completada' WHERE appointment_date < CURDATE() AND status IN ('confirmada', 'pendiente')");
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resultProf = $stmtProf->get_result();
    if ($resultProf->num_rows === 0) { http_response_code(404); echo json_encode(["success" => false, "message" => "Profesional no encontrado"]); exit(); }
    $professional_id = $resultProf->fetch_assoc()['professional_id'];
    $stmtProf->close();
    $sql = "SELECT a.appointment_id AS id, a.patient_id AS pacienteId, a.professional_id AS profesionalId, 
               a.appointment_date AS fecha, a.appointment_time AS hora, a.status AS estado, 
               a.feedback AS feedback, u.first_name AS pacienteNombre, u.last_name AS pacienteApellido 
        FROM appointment a 
        JOIN patient p ON a.patient_id = p.patient_id 
        JOIN user u ON p.user_id = u.user_id 
        WHERE a.professional_id = ? 
        AND a.status != 'cancelada' -- <--- ESTA ES LA LÍNEA MÁGICA
        ORDER BY a.appointment_date ASC, a.appointment_time ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $professional_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $citas = [];
    while ($fila = $resultado->fetch_assoc()) { $citas[] = $fila; }
    http_response_code(200);
    echo json_encode(["success" => true, "data" => $citas]);
    $stmt->close();
    $conn->close();
    exit();
}

// POST /citas
if ($method === 'POST') {
    $body = json_decode(file_get_contents("php://input"), true);
    $pacienteId = intval($body['pacienteId'] ?? 0);
    $fecha      = trim($body['fecha'] ?? '');
    $hora       = trim($body['hora'] ?? '');
    $duracion   = intval($body['duracion'] ?? 60);

    if (!$pacienteId || !$fecha || !$hora) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Paciente, fecha y hora son requeridos"]);
        exit();
    }

    $conn = conectarDB();
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resultProf = $stmtProf->get_result();
    if ($resultProf->num_rows === 0) { http_response_code(404); echo json_encode(["success" => false, "message" => "Profesional no encontrado"]); exit(); }
    $professional_id = $resultProf->fetch_assoc()['professional_id'];
    $stmtProf->close();

$stmtCheck = $conn->prepare("
    SELECT appointment_id FROM appointment 
    WHERE professional_id = ? 
    AND appointment_date = ? 
    AND status != 'cancelada'
    AND (
        (appointment_time <= ? AND ADDTIME(appointment_time, SEC_TO_TIME(duration * 60)) > ?)
        OR
        (appointment_time >= ? AND appointment_time < ADDTIME(?, SEC_TO_TIME(? * 60)))
    )
");
$stmtCheck->bind_param("isssssi", $professional_id, $fecha, $hora, $hora, $hora, $hora, $duracion);
$stmtCheck->execute();
if ($stmtCheck->get_result()->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "Ya hay una cita en ese horario o se empalma con una existente"]);
    exit();
}
$stmtCheck->close();

    $status = "pendiente";
    $stmt = $conn->prepare("INSERT INTO appointment (patient_id, professional_id, appointment_date, appointment_time, status, duration) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iisssi", $pacienteId, $professional_id, $fecha, $hora, $status, $duracion);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();

    http_response_code(201);
    echo json_encode(["success" => true, "message" => "Cita agendada correctamente", "data" => ["id" => $newId, "pacienteId" => $pacienteId, "profesionalId" => $professional_id, "fecha" => $fecha, "hora" => $hora, "estado" => $status, "feedback" => null]]);
    $conn->close();
    exit();
}

// PUT /citas/:id/cancelar
if ($method === 'PUT' && isset($partes[0]) && is_numeric($partes[0]) && isset($partes[1]) && $partes[1] === 'cancelar') {
    $citaId = (int)$partes[0];
    $conn = conectarDB();
    $stmt = $conn->prepare("UPDATE appointment SET status = 'cancelada' WHERE appointment_id = ?");
    $stmt->bind_param("i", $citaId);
    $stmt->execute();
    if ($stmt->affected_rows === 0) { http_response_code(404); echo json_encode(["success" => false, "message" => "Cita no encontrada"]); exit(); }
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Cita cancelada correctamente"]);
    $stmt->close();
    $conn->close();
    exit();
}

// PUT /citas/:id/confirmar
if ($method === 'PUT' && isset($partes[0]) && is_numeric($partes[0]) && isset($partes[1]) && $partes[1] === 'confirmar') {
    $citaId = (int)$partes[0];
    $conn = conectarDB();
    $stmt = $conn->prepare("UPDATE appointment SET status = 'confirmada' WHERE appointment_id = ?");
    $stmt->bind_param("i", $citaId);
    $stmt->execute();
    if ($stmt->affected_rows === 0) { http_response_code(404); echo json_encode(["success" => false, "message" => "Cita no encontrada"]); exit(); }
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Cita confirmada correctamente"]);
    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// PUT /citas/:id/feedback
// ===========================
if ($method === 'PUT' && isset($partes[0]) && is_numeric($partes[0]) && isset($partes[1]) && $partes[1] === 'feedback') {

    $citaId = (int)$partes[0];
    $body   = json_decode(file_get_contents("php://input"), true);
    $feedback = trim($body['feedback'] ?? '');

    if (!$feedback) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El feedback no puede estar vacío"]);
        exit();
    }

    $conn = conectarDB();
    $stmt = $conn->prepare("UPDATE appointment SET feedback = ? WHERE appointment_id = ?");
    $stmt->bind_param("si", $feedback, $citaId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Cita no encontrada"]);
        exit();
    }

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Retroalimentación guardada"]);

    $stmt->close();
    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Metodo no permitido"]);
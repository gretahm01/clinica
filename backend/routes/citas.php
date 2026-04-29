<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo', 'secretaria', 'paciente']);

$method = $_SERVER['REQUEST_METHOD'];

// Obtenemos la ruta relativa
$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pos    = strpos($url, 'citas');
$ruta   = substr($url, $pos + strlen('citas'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

$conn = conectarDB();

// ============================================================
// 1. OBTENER CITAS (MÉTODOS GET)
// ============================================================

// GET /citas/paciente/:id -> Citas de un paciente específico
if ($method === 'GET' && isset($partes[0]) && $partes[0] === 'paciente' && isset($partes[1]) && is_numeric($partes[1])) {
    $pacienteIdBusqueda = (int)$partes[1]; 

    if ($usuario['rol'] === 'paciente') {
        $stmtUser = $conn->prepare("SELECT patient_id FROM patient WHERE user_id = ?");
        $stmtUser->bind_param("i", $usuario['userId']);
        $stmtUser->execute();
        $resUser = $stmtUser->get_result();
        if ($resUser->num_rows === 0) { http_response_code(403); echo json_encode(["success" => false]); exit(); }
        $pacienteIdBusqueda = $resUser->fetch_assoc()['patient_id'];
    }

    $sql = "SELECT a.appointment_id AS id, a.patient_id AS pacienteId, a.professional_id AS profesionalId, 
                   a.appointment_date AS fecha, a.appointment_time AS hora, a.status AS estado, 
                   a.feedback AS feedback, a.motivo AS motivo, a.notes AS notas 
            FROM appointment a 
            WHERE a.patient_id = ? 
            ORDER BY a.appointment_date ASC";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pacienteIdBusqueda);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $citas = [];
    while ($fila = $resultado->fetch_assoc()) { $citas[] = $fila; }
    echo json_encode(["success" => true, "data" => $citas]);
    exit();
}

// GET /citas/hoy -> Lista rápida para el Dashboard
if ($method === 'GET' && isset($partes[0]) && $partes[0] === 'hoy') {
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $profId = $stmtProf->get_result()->fetch_assoc()['professional_id'];
    
    $hoy = date('Y-m-d');
    $sql = "SELECT a.appointment_id AS id, a.appointment_time AS hora, a.status AS estado, u.first_name AS nombre, u.last_name AS apellido 
            FROM appointment a 
            JOIN patient p ON a.patient_id = p.patient_id 
            JOIN user u ON p.user_id = u.user_id 
            WHERE a.professional_id = ? AND a.appointment_date = ? AND a.status != 'cancelada'";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $profId, $hoy);
    $stmt->execute();
    $res = $stmt->get_result();
    $lista = [];
    while ($f = $res->fetch_assoc()) { $lista[] = $f; }
    echo json_encode(["success" => true, "data" => $lista]);
    exit();
}

// GET /citas -> Todas las citas (Calendario)
if ($method === 'GET' && empty($partes[0])) {
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $profId = $stmtProf->get_result()->fetch_assoc()['professional_id'];

    $sql = "SELECT a.appointment_id AS id, a.appointment_date AS fecha, a.appointment_time AS hora, a.status AS estado,
                   u.first_name AS pacienteNombre, u.last_name AS pacienteApellido 
            FROM appointment a JOIN patient p ON a.patient_id = p.patient_id JOIN user u ON p.user_id = u.user_id 
            WHERE a.professional_id = ? AND a.status != 'cancelada'";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $profId);
    $stmt->execute();
    $res = $stmt->get_result();
    $lista = [];
    while ($f = $res->fetch_assoc()) { $lista[] = $f; }
    echo json_encode(["success" => true, "data" => $lista]);
    exit();
}

// ============================================================
// 2. CREAR CITA (MÉTODO POST)
// ============================================================
if ($method === 'POST') {
    $body = json_decode(file_get_contents("php://input"), true);
    
    // Mapeo correcto de React a Columnas DB
    $pacienteId = $body['pacienteId'] ?? null;
    $fecha      = $body['fecha'] ?? null;
    $hora       = $body['hora'] ?? null;
    $motivo     = $body['motivo'] ?? 'Solicitada por paciente';
    $estado     = $body['estado'] ?? 'pendiente';
    $duracion   = $body['duracion'] ?? 60;
    
    // Si el logueado es psicólogo, tomamos su ID real
    if ($usuario['rol'] === 'psicologo') {
        $stmtP = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
        $stmtP->bind_param("i", $usuario['userId']);
        $stmtP->execute();
        $profesionalId = $stmtP->get_result()->fetch_assoc()['professional_id'];
    } else {
        $profesionalId = $body['profesionalId'] ?? 1;
    }

    if (!$pacienteId || !$fecha || !$hora) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit();
    }

    $sql = "INSERT INTO appointment (patient_id, professional_id, appointment_date, appointment_time, status, motivo, duration) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissssi", $pacienteId, $profesionalId, $fecha, $hora, $estado, $motivo, $duracion);
    
    if ($stmt->execute()) {
        // === LA NOTIFICACIÓN VA AQUÍ ADENTRO, ANTES DEL EXIT ===
        $fechaCita = $body['fecha'];
        $conn->query("INSERT INTO notificaciones (tipo, mensaje) VALUES ('cita_solicitada', 'Un paciente solicitó una nueva cita para el $fechaCita')");
        // =======================================================
        
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
    exit();
}

    
// ============================================================
// 3. ACCIONES DE CITA (MÉTODO PUT)
// ============================================================
if ($method === 'PUT' && is_numeric($partes[0]) && isset($partes[1])) {
    $id = (int)$partes[0];
    $accion = $partes[1];
    $body = json_decode(file_get_contents("php://input"), true);

    if ($accion === 'confirmar') {
        $conn->query("UPDATE appointment SET status = 'confirmada' WHERE appointment_id = $id");
        // Notificación de confirmación
        $conn->query("INSERT INTO notificaciones (tipo, mensaje) VALUES ('cita_confirmada', 'Se ha confirmado una cita agendada o reagendada')");
    } 
    elseif ($accion === 'cancelar') {
        $conn->query("UPDATE appointment SET status = 'cancelada' WHERE appointment_id = $id");
        // Notificación de cancelación
        $conn->query("INSERT INTO notificaciones (tipo, mensaje) VALUES ('cita_cancelada', 'Una cita ha sido cancelada')");
    }
    elseif ($accion === 'completar') {
        $conn->query("UPDATE appointment SET status = 'completada' WHERE appointment_id = $id");
    }
    elseif ($accion === 'reagendar') {
    // Recibimos el estado desde el body (pendiente o reagendada)
    $nuevoEstado = $body['estado'] ?? 'reagendada'; 
    
    $stmt = $conn->prepare("UPDATE appointment SET appointment_date = ?, appointment_time = ?, status = ?, motivo = ? WHERE appointment_id = ?");
    // Cambiamos a "ssssi" porque ahora enviamos 4 strings y 1 entero
    $stmt->bind_param("ssssi", $body['fecha'], $body['hora'], $nuevoEstado, $body['motivo'], $id);
    
    if ($stmt->execute()) {
        // Notificación para el psicólogo
        $mensajeNotif = ($nuevoEstado === 'pendiente') 
            ? "Un paciente solicitó cambiar el horario de su cita" 
            : "Se propuso un cambio de horario para la cita";
            
        $conn->query("INSERT INTO notificaciones (tipo, mensaje) VALUES ('cita_reagendada', '$mensajeNotif')");
    }
}
    elseif ($accion === 'feedback') {
        $stmt = $conn->prepare("UPDATE appointment SET feedback = ? WHERE appointment_id = ?");
        $stmt->bind_param("si", $body['feedback'], $id);
        $stmt->execute();
    } 
    elseif ($accion === 'notes') {
        $stmt = $conn->prepare("UPDATE appointment SET notes = ? WHERE appointment_id = ?");
        $stmt->bind_param("si", $body['notes'], $id);
        $stmt->execute();
    }

    echo json_encode(["success" => true]);
    exit();
}

if ($stmt->execute()) {
        // === LA MAGIA AQUÍ ===
        // Solo mandamos la notificación de "solicitud" si el estado es pendiente (creada por paciente)
        if ($estado === 'pendiente') {
            $fechaCita = $body['fecha'];
            $conn->query("INSERT INTO notificaciones (tipo, mensaje) VALUES ('cita_solicitada', 'Un paciente solicitó una nueva cita para el $fechaCita')");
        }
        
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
    exit();

$conn->close();
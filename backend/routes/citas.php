<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo', 'secretaria', 'paciente']);

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pos    = strpos($url, 'citas');
$ruta   = substr($url, $pos + strlen('citas'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

$conn = conectarDB();

// ============================================================
// CANDADO DE SEGURIDAD: Identificar al Psicólogo Actual
// ============================================================
$esPsicologo = ($usuario['rol'] === 'psicologo');
$profId = 0;

if ($esPsicologo) {
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $profResult = $stmtProf->get_result()->fetch_assoc();
    if ($profResult) {
        $profId = $profResult['professional_id'];
    }
    $stmtProf->close();
}

// Función para validar que una cita no sea espiada por otro psicólogo
function citaEsMia($conn, $citaId, $profId, $esPsicologo) {
    if (!$esPsicologo) return true; // Secretaria o Admin pasan
    $stmt = $conn->prepare("SELECT 1 FROM appointment WHERE appointment_id = ? AND professional_id = ?");
    $stmt->bind_param("ii", $citaId, $profId);
    $stmt->execute();
    $esSuyo = $stmt->get_result()->num_rows > 0;
    $stmt->close();
    return $esSuyo;
}

// ============================================================
// 1. OBTENER CITAS (MÉTODOS GET)
// ============================================================

// --- GET /citas/paciente/:id ---
if ($method === 'GET' && isset($partes[0]) && $partes[0] === 'paciente' && isset($partes[1]) && is_numeric($partes[1])) {
    $pacienteIdBusqueda = (int)$partes[1]; 
    
    if ($usuario['rol'] === 'paciente') {
        $stmtUser = $conn->prepare("SELECT patient_id FROM patient WHERE user_id = ?");
        $stmtUser->bind_param("i", $usuario['userId']);
        $stmtUser->execute();
        $resUser = $stmtUser->get_result();
        if ($resUser->num_rows === 0) { 
            http_response_code(403); echo json_encode(["success" => false]); exit(); 
        }
        $pacienteIdBusqueda = $resUser->fetch_assoc()['patient_id'];
    }

    $sql = "SELECT a.appointment_id AS id, a.patient_id AS pacienteId, a.professional_id AS profesionalId, 
                   a.appointment_date AS fecha, a.appointment_time AS hora, a.status AS estado, 
                   a.feedback AS feedback, a.motivo AS motivo, a.notes AS notas 
            FROM appointment a 
            WHERE a.patient_id = ?";
    
    // FILTRO ESTRICTO: Solo las de este psicólogo
    if ($esPsicologo) {
        $sql .= " AND a.professional_id = " . (int)$profId;
    }
    $sql .= " ORDER BY a.appointment_date ASC";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pacienteIdBusqueda);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $citas = [];
    while ($fila = $resultado->fetch_assoc()) { $citas[] = $fila; }
    
    echo json_encode(["success" => true, "data" => $citas]);
    exit();
}

// --- GET /citas/hoy ---
if ($method === 'GET' && isset($partes[0]) && $partes[0] === 'hoy') {
    if ($esPsicologo && $profId === 0) {
        echo json_encode(["success" => true, "data" => []]); exit();
    }
    
    $hoy = date('Y-m-d');
    $sql = "SELECT a.appointment_id AS id, a.appointment_time AS hora, a.status AS estado, u.first_name AS nombre, u.last_name AS apellido, a.motivo AS motivo 
            FROM appointment a 
            JOIN patient p ON a.patient_id = p.patient_id 
            JOIN user u ON p.user_id = u.user_id 
            WHERE a.appointment_date = ? AND a.status != 'cancelada'";
            
    // FILTRO ESTRICTO: Solo las de este psicólogo
    if ($esPsicologo) {
        $sql .= " AND a.professional_id = " . (int)$profId;
    }
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $hoy);
    $stmt->execute();
    $res = $stmt->get_result();
    
    $lista = [];
    while ($f = $res->fetch_assoc()) { $lista[] = $f; }
    
    echo json_encode(["success" => true, "data" => $lista]);
    exit();
}

// --- GET /citas (Calendario General) ---
if ($method === 'GET' && empty($partes[0])) {
    if ($esPsicologo && $profId === 0) {
        echo json_encode(["success" => true, "data" => []]); exit();
    }

    $sql = "SELECT a.appointment_id AS id, a.appointment_date AS fecha, a.appointment_time AS hora, a.status AS estado,
                   a.motivo AS motivo, a.feedback AS feedback, a.notes AS notas,
                   u.first_name AS pacienteNombre, u.last_name AS pacienteApellido 
            FROM appointment a 
            JOIN patient p ON a.patient_id = p.patient_id 
            JOIN user u ON p.user_id = u.user_id 
            WHERE a.status != 'cancelada'";
            
    // FILTRO ESTRICTO: Solo las de este psicólogo
    if ($esPsicologo) {
        $sql .= " AND a.professional_id = " . (int)$profId;
    }
            
    $stmt = $conn->prepare($sql);
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
    
    $pacienteId = $body['pacienteId'] ?? null;
    $fecha      = $body['fecha'] ?? null;
    $hora       = $body['hora'] ?? null;
    $motivo     = $body['motivo'] ?? 'Solicitada por sistema';
    $estado     = 'pendiente'; 
    $duracion   = $body['duracion'] ?? 60;
    
    // EL FIX: Ignoramos el ID que manda React. Usamos el token seguro (userId)
    // para buscar el patient_id y el professional_id reales en la BD.
    if ($esPsicologo) {
        $profesionalIdInsert = $profId;
    } elseif ($usuario['rol'] === 'paciente') {
        $stmtP = $conn->prepare("SELECT patient_id, professional_id FROM patient WHERE user_id = ?");
        $stmtP->bind_param("i", $usuario['userId']);
        $stmtP->execute();
        $resP = $stmtP->get_result()->fetch_assoc();
        
        if ($resP) {
            $pacienteId = $resP['patient_id']; // Sobrescribimos con el ID real (ej. 11)
            $profesionalIdInsert = $resP['professional_id']; // Asignamos el psicólogo real (ej. 2)
        } else {
            $profesionalIdInsert = 1; 
        }
        $stmtP->close();
    } else {
        $profesionalIdInsert = $body['profesionalId'] ?? 1;
    }

    if (!$pacienteId || !$fecha || !$hora) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit();
    }

    $sql = "INSERT INTO appointment (patient_id, professional_id, appointment_date, appointment_time, status, motivo, duration) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissssi", $pacienteId, $profesionalIdInsert, $fecha, $hora, $estado, $motivo, $duracion);
    
    if ($stmt->execute()) {
        $stmtNotif = $conn->prepare("INSERT INTO notificaciones (profesional_id, tipo, mensaje) VALUES (?, 'cita_solicitada', 'Nueva cita pendiente en agenda')");
        $stmtNotif->bind_param("i", $profesionalIdInsert);
        $stmtNotif->execute();
        
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

    // Candado: ¿La cita que intenta modificar le pertenece?
    if (!citaEsMia($conn, $id, $profId, $esPsicologo)) {
        http_response_code(403); echo json_encode(["success" => false, "message" => "Acceso denegado a esta cita"]); exit();
    }

    // Sacamos a quién le pertenece la cita para notificarle correctamente
    $stmtP = $conn->query("SELECT professional_id FROM appointment WHERE appointment_id = $id");
    $profCita = $stmtP->fetch_assoc()['professional_id'];

    if ($accion === 'confirmar') {
        $conn->query("UPDATE appointment SET status = 'confirmada' WHERE appointment_id = $id");
        $conn->query("INSERT INTO notificaciones (profesional_id, tipo, mensaje) VALUES ($profCita, 'cita_confirmada', 'Cita confirmada exitosamente')");
        echo json_encode(["success" => true]);
    } 
    elseif ($accion === 'cancelar') {
        $conn->query("UPDATE appointment SET status = 'cancelada' WHERE appointment_id = $id");
        $conn->query("INSERT INTO notificaciones (profesional_id, tipo, mensaje) VALUES ($profCita, 'cita_cancelada', 'Una cita ha sido cancelada')");
        echo json_encode(["success" => true]);
    }
    elseif ($accion === 'completar') {
        $conn->query("UPDATE appointment SET status = 'completada' WHERE appointment_id = $id");
        echo json_encode(["success" => true]);
    }
    elseif ($accion === 'reagendar') {
        $nuevoEstado = $body['estado'] ?? 'pendiente'; 
        $stmt = $conn->prepare("UPDATE appointment SET appointment_date = ?, appointment_time = ?, status = ?, motivo = ? WHERE appointment_id = ?");
        $stmt->bind_param("ssssi", $body['fecha'], $body['hora'], $nuevoEstado, $body['motivo'], $id);
        $stmt->execute();
        $conn->query("INSERT INTO notificaciones (profesional_id, tipo, mensaje) VALUES ($profCita, 'cita_reagendada', 'Se ha reagendado una cita')");
        echo json_encode(["success" => true]);
    }
    elseif ($accion === 'feedback') {
        $stmt = $conn->prepare("UPDATE appointment SET feedback = ? WHERE appointment_id = ?");
        $stmt->bind_param("si", $body['feedback'], $id);
        $stmt->execute();
        echo json_encode(["success" => true]);
    }
    elseif ($accion === 'notes') {
        $stmt = $conn->prepare("UPDATE appointment SET notes = ? WHERE appointment_id = ?");
        $stmt->bind_param("si", $body['notes'], $id);
        $stmt->execute();
        echo json_encode(["success" => true]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Metodo no permitido"]);
$conn->close();
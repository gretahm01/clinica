<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
$method = $_SERVER['REQUEST_METHOD'];

// Re-calculamos las partes de la ruta
$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pos    = strpos($url, 'pacientes');
$rutaRelativa = substr($url, $pos + strlen('pacientes'));
$rutaRelativa = trim($rutaRelativa, '/');
$partes = explode('/', $rutaRelativa);

$pacienteId = (isset($partes[0]) && is_numeric($partes[0])) ? (int)$partes[0] : 0;
$subAccion  = $partes[1] ?? '';

$conn = conectarDB();

// ============================================================
// CASO A: CONTACTO DE EMERGENCIA
// ============================================================
if ($pacienteId > 0 && $subAccion === 'contacto-emergencia') {
    if ($method === 'GET') {
        $sql = "SELECT full_name AS nombre, phone AS telefono, relationship AS parentesco 
                FROM emergency_contact WHERE patient_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $pacienteId);
        $stmt->execute();
        $res = $stmt->get_result();
        $data = $res->fetch_assoc();
        echo json_encode(["success" => true, "data" => $data]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $body = json_decode(file_get_contents("php://input"), true);
        
        $check = $conn->query("SELECT emergency_contact_id FROM emergency_contact WHERE patient_id = $pacienteId");
        
        if ($check->num_rows > 0) {
            $stmt = $conn->prepare("UPDATE emergency_contact SET full_name = ?, phone = ?, relationship = ? WHERE patient_id = ?");
            $stmt->bind_param("sssi", $body['nombre'], $body['telefono'], $body['parentesco'], $pacienteId);
        } else {
            $stmt = $conn->prepare("INSERT INTO emergency_contact (patient_id, full_name, phone, relationship) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $pacienteId, $body['nombre'], $body['telefono'], $body['parentesco']);
        }
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Contacto actualizado"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al guardar"]);
        }
        exit();
    }
}

// ============================================================
// CASO B: DATOS DE UN PACIENTE ESPECÍFICO (GET /pacientes/:id)
// ============================================================
if ($method === 'GET' && $pacienteId > 0 && empty($subAccion)) {
    $sql = "SELECT p.patient_id AS id, u.first_name AS nombre, u.last_name AS apellido, 
                   u.middle_name AS apellidoMaterno, u.email, u.phone AS telefono, 
                   u.birth_date AS fechaNacimiento, p.registration_date AS fechaRegistro,
                   (SELECT COUNT(*) FROM appointment WHERE patient_id = p.patient_id AND status = 'completada') AS citasAtendidas
            FROM patient p
            JOIN user u ON p.user_id = u.user_id
            WHERE p.patient_id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pacienteId);
    $stmt->execute();
    $data = $stmt->get_result()->fetch_assoc();
    
    if ($data) {
        echo json_encode(["success" => true, "data" => $data]);
    } else {
        echo json_encode(["success" => false, "message" => "Paciente no encontrado"]);
    }
    exit();
}

// ============================================================
// CASO C: LISTADO GENERAL PARA TARJETAS (GET /pacientes)
// ============================================================
if ($method === 'GET' && $pacienteId === 0) {
    
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $profResult = $stmtProf->get_result()->fetch_assoc();
    
    if (!$profResult) {
        echo json_encode(["success" => true, "data" => []]);
        exit();
    }
    
    $profId = $profResult['professional_id'];

    // CORRECCIÓN: Filtramos por el professional_id que guardamos al crear al paciente
    // Y contamos las citas 'completada' para saber si es nuevo o no
    $sql = "SELECT 
                p.patient_id AS id, 
                u.first_name AS nombre, 
                u.last_name AS apellido, 
                u.middle_name AS apellidoMaterno,
                u.email AS email,
                u.phone AS telefono,
                (SELECT COUNT(*) FROM appointment WHERE patient_id = p.patient_id AND status = 'completada') AS citasRealizadas
            FROM patient p 
            JOIN user u ON p.user_id = u.user_id
            WHERE p.professional_id = ?"; // <--- Esta es la clave para que aparezcan los nuevos
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $profId);
    $stmt->execute();
    $res = $stmt->get_result();
    
    $lista = [];
    while($row = $res->fetch_assoc()) $lista[] = $row;
    echo json_encode(["success" => true, "data" => $lista]);
    exit();
}



// ============================================================
// CASO D: CREAR NUEVO PACIENTE (POST /pacientes)
// ============================================================
if ($method === 'POST') {
    $body = json_decode(file_get_contents("php://input"), true);
    
    // Empezamos la transacción
    $conn->begin_transaction();
    
    try {
        // 1. Obtener ID del psicólogo que está creando al paciente (para la vinculación)
        $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
        $stmtProf->bind_param("i", $usuario['userId']);
        $stmtProf->execute();
        $resProf = $stmtProf->get_result()->fetch_assoc();
        
        if (!$resProf) {
            throw new Exception("El usuario actual no es un profesional válido.");
        }
        $profesionalId = $resProf['professional_id'];

        // 2. Datos de React
        $nombre = $body['nombre'] ?? '';
        $apellido = $body['apellido'] ?? '';
        $segundoApellido = $body['segundoApellido'] ?? '';
        $email = $body['email'] ?? '';
        $telefono = $body['telefono'] ?? '';
        $fechaNac = $body['fechaNacimiento'] ?? null;
        
        // 3. Insertar en tabla `user`
        $stmtUser = $conn->prepare("INSERT INTO user (first_name, last_name, middle_name, email, phone, birth_date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtUser->bind_param("ssssss", $nombre, $apellido, $segundoApellido, $email, $telefono, $fechaNac);
        $stmtUser->execute();
        $nuevoUserId = $conn->insert_id; 
        
        // 4. Crear credenciales en `user_access`
        // Generamos un username automático usando la primera parte de su correo + un número al azar
        $partesEmail = explode('@', $email);
        $usernameGenerado = $partesEmail[0] . rand(100, 999); 
        $passwordPorDefecto = password_hash("password123", PASSWORD_BCRYPT);
        
        // Insertamos el role_id = 3 (paciente) y las columnas correctas
        $stmtAccess = $conn->prepare("INSERT INTO user_access (user_id, role_id, username, password) VALUES (?, 3, ?, ?)");
        $stmtAccess->bind_param("iss", $nuevoUserId, $usernameGenerado, $passwordPorDefecto);
        $stmtAccess->execute();
        
        // 5. Insertar en tabla `patient` y VINCULAR al psicólogo automáticamente
        $stmtPatient = $conn->prepare("INSERT INTO patient (user_id, registration_date, professional_id) VALUES (?, CURDATE(), ?)");
        $stmtPatient->bind_param("ii", $nuevoUserId, $profesionalId);
        $stmtPatient->execute();
        $nuevoPatientId = $conn->insert_id;
        
        // 6. Opcional: Insertar contacto de emergencia si lo llenaron
        if (!empty($body['contactoNombre'])) {
            $stmtEmerg = $conn->prepare("INSERT INTO emergency_contact (patient_id, full_name, phone, relationship) VALUES (?, ?, ?, ?)");
            $stmtEmerg->bind_param("isss", $nuevoPatientId, $body['contactoNombre'], $body['contactoTelefono'], $body['contactoParentesco']);
            $stmtEmerg->execute();
        }
        
        // ¡Si todo sale bien, aplicamos los cambios a la base de datos!
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Paciente creado y vinculado con éxito"]);
        
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al crear paciente: " . $e->getMessage()]);
    }
    
    exit();
}
$conn->close();
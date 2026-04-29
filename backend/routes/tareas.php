<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo']);

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'tareas') + strlen('tareas'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

$subPath = $partes[0] ?? '';
$subId   = isset($partes[1]) && is_numeric($partes[1]) ? (int)$partes[1] : null;

// ===========================
// GET /tareas/paciente/:id — tareas de un paciente
// ===========================
if ($method === 'GET' && $subPath === 'paciente' && $subId !== null) {

    $conn = conectarDB();

    $stmt = $conn->prepare("
        SELECT
            t.task_id           AS id,
            t.patient_id        AS pacienteId,
            t.professional_id   AS profesionalId,
            t.title             AS titulo,
            t.content           AS contenido,
            t.due_date          AS fechaLimite,
            t.status            AS estado,
            t.created_at        AS fechaCreacion,
            t.delivered_at      AS fechaEntrega,
            t.therapist_comment AS comentarioTerapeuta
        FROM task t
        WHERE t.patient_id = ?
        ORDER BY t.created_at DESC
    ");
    $stmt->bind_param("i", $subId);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $tareas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $tareas[] = $fila;
    }

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $tareas]);

    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// POST /tareas — crear nueva tarea
// ===========================
if ($method === 'POST') {

    $body = json_decode(file_get_contents("php://input"), true);

    $pacienteId  = intval($body['pacienteId']  ?? 0);
    $titulo      = trim($body['titulo']        ?? '');
    $contenido   = trim($body['contenido']     ?? '');
    $fechaLimite = trim($body['fechaLimite']   ?? '');

    if (!$pacienteId || !$titulo || !$contenido) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Paciente, título y contenido son requeridos"]);
        exit();
    }

    $conn = conectarDB();

    // Obtener professional_id del psicólogo logueado
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resProf = $stmtProf->get_result()->fetch_assoc();
    $stmtProf->close();

    if (!$resProf) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Profesional no encontrado"]);
        exit();
    }

    $profesionalId = $resProf['professional_id'];
    $status = 'pendiente';
    $fechaLimiteVal = $fechaLimite ?: null;

    $stmt = $conn->prepare("
        INSERT INTO task (patient_id, professional_id, title, content, due_date, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->bind_param("iissss", $pacienteId, $profesionalId, $titulo, $contenido, $fechaLimiteVal, $status);
    $stmt->execute();
    $newId = $conn->insert_id;
    $stmt->close();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Tarea creada correctamente",
        "data" => [
            "id"          => $newId,
            "pacienteId"  => $pacienteId,
            "titulo"      => $titulo,
            "contenido"   => $contenido,
            "fechaLimite" => $fechaLimiteVal,
            "estado"      => $status,
        ]
    ]);

    $conn->close();
    exit();
}

// ===========================
// GET /tareas/:id — detalle de una tarea
// ===========================
if ($method === 'GET' && is_numeric($subPath)) {
    $tareaId = (int)$subPath;
    $conn = conectarDB();

    $stmt = $conn->prepare("
        SELECT task_id AS id, patient_id AS pacienteId, professional_id AS profesionalId,
               title AS titulo, content AS contenido, due_date AS fechaLimite,
               status AS estado, image_path AS imagePath,
               therapist_comment AS comentarioTerapeuta,
               created_at AS fechaCreacion, delivered_at AS fechaEntrega
        FROM task WHERE task_id = ?
    ");
    $stmt->bind_param("i", $tareaId);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Tarea no encontrada"]);
        exit();
    }

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $resultado->fetch_assoc()]);
    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// PUT /tareas/:id — actualizar tarea
// ===========================
if ($method === 'PUT' && is_numeric($subPath)) {
    $tareaId = (int)$subPath;
    $body    = json_decode(file_get_contents("php://input"), true);

    $estado              = $body['estado']              ?? null;
    $comentarioTerapeuta = $body['comentarioTerapeuta'] ?? null;

    $conn = conectarDB();

    $stmt = $conn->prepare("
        UPDATE task SET
            status = COALESCE(?, status),
            therapist_comment = COALESCE(?, therapist_comment)
        WHERE task_id = ?
    ");
    $stmt->bind_param("ssi", $estado, $comentarioTerapeuta, $tareaId);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Tarea actualizada"]);
    $stmt->close();
    $conn->close();
    exit();
}

// ===========================
// DELETE /tareas/:id — Eliminar una tarea
// ===========================
if ($method === 'DELETE' && is_numeric($subPath)) {
    $tareaId = (int)$subPath;
    $conn = conectarDB();

    $stmt = $conn->prepare("DELETE FROM task WHERE task_id = ?");
    $stmt->bind_param("i", $tareaId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Tarea eliminada"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "No se encontró la tarea"]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Metodo no permitido"]);
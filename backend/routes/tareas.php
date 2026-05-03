<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$usuario = verificarToken();
verificarRol($usuario, ['psicologo', 'paciente']);

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'tareas') + strlen('tareas'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

$subPath = $partes[0] ?? '';
$subId   = isset($partes[1]) && is_numeric($partes[1]) ? (int)$partes[1] : null;

$conn = conectarDB();

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

function pacienteEsMio($conn, $pacienteIdBusqueda, $profId, $usuario) {
    if ($usuario['rol'] === 'psicologo') {
        $stmt = $conn->prepare("SELECT 1 FROM patient WHERE patient_id = ? AND professional_id = ?");
        $stmt->bind_param("ii", $pacienteIdBusqueda, $profId);
        $stmt->execute();
        $esSuyo = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $esSuyo;
    } elseif ($usuario['rol'] === 'paciente') {
        $stmt = $conn->prepare("SELECT patient_id FROM patient WHERE user_id = ?");
        $stmt->bind_param("i", $usuario['userId']);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return ($res && $res['patient_id'] == $pacienteIdBusqueda);
    }
    return true; 
}

function tareaEsMia($conn, $tareaId, $profId, $usuario) {
    if ($usuario['rol'] === 'psicologo') {
        $stmt = $conn->prepare("SELECT 1 FROM task WHERE task_id = ? AND professional_id = ?");
        $stmt->bind_param("ii", $tareaId, $profId);
        $stmt->execute();
        $esSuyo = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $esSuyo;
    } elseif ($usuario['rol'] === 'paciente') {
        $stmt = $conn->prepare("SELECT 1 FROM task t JOIN patient p ON t.patient_id = p.patient_id WHERE t.task_id = ? AND p.user_id = ?");
        $stmt->bind_param("ii", $tareaId, $usuario['userId']);
        $stmt->execute();
        $esSuyo = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $esSuyo;
    }
    return true;
}

try {
    if ($method === 'GET' && empty($subPath)) {
        if (!$profId) {
            http_response_code(404); echo json_encode(["success" => false, "message" => "Profesional no encontrado"]); exit();
        }
        $stmt = $conn->prepare("SELECT task_id AS id, patient_id AS pacienteId, professional_id AS profesionalId, title AS titulo, content AS contenido, material_path AS materialApoyo, patient_response AS respuestaPaciente, file_path AS imagePath, due_date AS fechaLimite, status AS estado, created_at AS fechaCreacion, delivered_at AS fechaEntrega, therapist_comment AS comentarioTerapeuta FROM task WHERE professional_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("i", $profId);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $tareas = [];
        while ($fila = $resultado->fetch_assoc()) { $tareas[] = $fila; }
        http_response_code(200); echo json_encode(["success" => true, "data" => $tareas]);
        $stmt->close(); $conn->close(); exit();
    }

    if ($method === 'GET' && $subPath === 'paciente' && $subId !== null) {
        if (!pacienteEsMio($conn, $subId, $profId, $usuario)) {
            http_response_code(403); echo json_encode(["success" => false, "message" => "Acceso denegado a este paciente"]); exit();
        }
        $stmt = $conn->prepare("SELECT task_id AS id, patient_id AS pacienteId, professional_id AS profesionalId, title AS titulo, content AS contenido, material_path AS materialApoyo, patient_response AS respuestaPaciente, file_path AS imagePath, due_date AS fechaLimite, status AS estado, created_at AS fechaCreacion, delivered_at AS fechaEntrega, therapist_comment AS comentarioTerapeuta FROM task WHERE patient_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("i", $subId);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $tareas = [];
        while ($fila = $resultado->fetch_assoc()) { $tareas[] = $fila; }
        http_response_code(200); echo json_encode(["success" => true, "data" => $tareas]);
        $stmt->close(); $conn->close(); exit();
    }

    // === CREAR TAREA (PSICÓLOGO) AHORA LEE $_POST PORQUE USAMOS FORMDATA ===
    if ($method === 'POST' && empty($subPath)) {
        $pacienteId  = intval($_POST['pacienteId']  ?? 0);
        $titulo      = trim($_POST['titulo']        ?? '');
        $contenido   = trim($_POST['contenido']     ?? '');
        $fechaLimite = trim($_POST['fechaLimite']   ?? '');

        if (!$pacienteId || !$titulo || !$contenido) {
            http_response_code(400); echo json_encode(["success" => false, "message" => "Faltan datos requeridos"]); exit();
        }
        if (!pacienteEsMio($conn, $pacienteId, $profId, $usuario)) {
            http_response_code(403); echo json_encode(["success" => false, "message" => "Acceso denegado a este paciente"]); exit();
        }

        // Subida del material de apoyo (Psicólogo)
        $dbMaterialPath = null;
        if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/tareas/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileName = time() . '_psicologo_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $_FILES['archivo']['name']);
            $targetFilePath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['archivo']['tmp_name'], $targetFilePath)) {
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                $host = $_SERVER['HTTP_HOST'];
                $dbMaterialPath = $protocol . "://" . $host . "/clinica/backend/uploads/tareas/" . $fileName;
            }
        }

        $status = 'pendiente';
        $fechaLimiteVal = $fechaLimite ?: null;
        $stmt = $conn->prepare("INSERT INTO task (patient_id, professional_id, title, content, due_date, status, created_at, material_path) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)");
        $stmt->bind_param("iisssss", $pacienteId, $profId, $titulo, $contenido, $fechaLimiteVal, $status, $dbMaterialPath);
        $stmt->execute();
        $newId = $conn->insert_id;
        $stmt->close();
        http_response_code(201); echo json_encode(["success" => true, "data" => ["id" => $newId, "titulo" => $titulo]]);
        $conn->close(); exit();
    }

    if (is_numeric($subPath)) {
        $tareaId = (int)$subPath;
        if (!tareaEsMia($conn, $tareaId, $profId, $usuario)) {
            http_response_code(403); echo json_encode(["success" => false, "message" => "Acceso denegado a esta tarea"]); exit();
        }
        
        // === ENTREGAR TAREA (PACIENTE) ===
        if ($method === 'POST' && isset($partes[1]) && $partes[1] === 'entregar') {
            $texto = $_POST['texto'] ?? '';
            $dbFilePath = null;

            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/tareas/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", $_FILES['archivo']['name']);
                $targetFilePath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['archivo']['tmp_name'], $targetFilePath)) {
                    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                    $host = $_SERVER['HTTP_HOST'];
                    $dbFilePath = $protocol . "://" . $host . "/clinica/backend/uploads/tareas/" . $fileName;
                }
            }

            $stmt = $conn->prepare("UPDATE task SET status = 'entregada', patient_response = ?, file_path = ?, delivered_at = NOW() WHERE task_id = ?");
            $stmt->bind_param("ssi", $texto, $dbFilePath, $tareaId);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Tarea entregada con éxito"]);
            $stmt->close();
            $conn->close(); exit();
        }

        if ($method === 'GET') {
            // CORREGIDO: Se agregaron created_at y delivered_at que se habían borrado sin querer
            $stmt = $conn->prepare("SELECT task_id AS id, patient_id AS pacienteId, title AS titulo, content AS contenido, material_path AS materialApoyo, patient_response AS respuestaPaciente, file_path AS imagePath, due_date AS fechaLimite, status AS estado, created_at AS fechaCreacion, delivered_at AS fechaEntrega, therapist_comment AS comentarioTerapeuta FROM task WHERE task_id = ?");
            $stmt->bind_param("i", $tareaId);
            $stmt->execute();
            $resultado = $stmt->get_result();
            echo json_encode(["success" => true, "data" => $resultado->fetch_assoc()]);
            $stmt->close();
        } elseif ($method === 'PUT') {
            $body = json_decode(file_get_contents("php://input"), true);
            $estado = $body['estado'] ?? null;
            $comentarioTerapeuta = $body['comentarioTerapeuta'] ?? null;
            $stmt = $conn->prepare("UPDATE task SET status = COALESCE(?, status), therapist_comment = COALESCE(?, therapist_comment) WHERE task_id = ?");
            $stmt->bind_param("ssi", $estado, $comentarioTerapeuta, $tareaId);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Tarea actualizada"]);
            $stmt->close();
        } elseif ($method === 'DELETE') {
            $stmt = $conn->prepare("DELETE FROM task WHERE task_id = ?");
            $stmt->bind_param("i", $tareaId);
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Tarea eliminada"]);
            $stmt->close();
        }
        $conn->close(); exit();
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    if (isset($conn) && $conn) { $conn->close(); }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Metodo no permitido"]);
$conn->close();
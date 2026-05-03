<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

// Evitar caché fantasma del navegador
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$usuario = verificarToken();
verificarRol($usuario, ['psicologo']); 

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'expediente') + strlen('expediente'));
$ruta   = trim($ruta, '/');
$partesExp = explode('/', $ruta);

$subPath = $partesExp[0] ?? '';
$subId   = isset($partesExp[1]) && is_numeric($partesExp[1]) ? (int)$partesExp[1] : null;
$expId   = is_numeric($subPath) ? (int)$subPath : null;

$conn = conectarDB();

// ============================================================
// CANDADO DE SEGURIDAD
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

function pacienteEsMio($conn, $pacienteId, $profId, $esPsicologo) {
    if (!$esPsicologo) return true;
    $stmt = $conn->prepare("SELECT 1 FROM patient WHERE patient_id = ? AND professional_id = ?");
    $stmt->bind_param("ii", $pacienteId, $profId);
    $stmt->execute();
    $esSuyo = $stmt->get_result()->num_rows > 0;
    $stmt->close();
    return $esSuyo;
}

function expedienteEsMio($conn, $expId, $profId, $esPsicologo) {
    if (!$esPsicologo) return true;
    $stmt = $conn->prepare("
        SELECT 1 FROM medical_record mr
        JOIN patient p ON mr.patient_id = p.patient_id
        WHERE mr.medical_record_id = ? AND p.professional_id = ?
    ");
    $stmt->bind_param("ii", $expId, $profId);
    $stmt->execute();
    $esSuyo = $stmt->get_result()->num_rows > 0;
    $stmt->close();
    return $esSuyo;
}

// ==================================================================
// GET /expediente/paciente/:id
// ==================================================================
if ($method === 'GET' && $subPath === 'paciente' && $subId !== null) {
    
    if (!pacienteEsMio($conn, $subId, $profId, $esPsicologo)) {
        http_response_code(403); echo json_encode(["success" => false, "message" => "Acceso denegado a este paciente"]); exit();
    }

    try {
        $stmt = $conn->prepare("
            SELECT mr.medical_record_id AS id, mr.patient_id AS pacienteId, mr.professional_id AS profesionalId, mr.creation_date AS fechaCreacion,
                   mr.consultation_reason AS motivoConsulta, mr.current_condition AS condicionActual, mr.childhood_adolescence AS infanciaAdolescencia,
                   mr.significant_events AS eventosSignificativos, mr.abuse_history AS historialAbuso, mr.therapeutic_goals AS metasTerapeuticas,
                   u.first_name AS pacienteNombre, u.last_name AS pacienteApellido
            FROM medical_record mr
            JOIN patient p ON mr.patient_id = p.patient_id
            JOIN user u ON p.user_id = u.user_id
            WHERE mr.patient_id = ?
        ");
        $stmt->bind_param("i", $subId);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmtIns = $conn->prepare("INSERT INTO medical_record (patient_id, professional_id, creation_date) VALUES (?, ?, CURDATE())");
            $stmtIns->bind_param("ii", $subId, $profId);
            $stmtIns->execute();
            $newId = $conn->insert_id;
            $stmtIns->close();

            $stmt2 = $conn->prepare("
                SELECT mr.medical_record_id AS id, mr.patient_id AS pacienteId, mr.professional_id AS profesionalId, mr.creation_date AS fechaCreacion,
                       mr.consultation_reason AS motivoConsulta, mr.current_condition AS condicionActual, mr.childhood_adolescence AS infanciaAdolescencia, 
                       mr.significant_events AS eventosSignificativos, mr.abuse_history AS historialAbuso, mr.therapeutic_goals AS metasTerapeuticas,
                       u.first_name AS pacienteNombre, u.last_name AS pacienteApellido
                FROM medical_record mr
                JOIN patient p ON mr.patient_id = p.patient_id
                JOIN user u ON p.user_id = u.user_id
                WHERE mr.medical_record_id = ?
            ");
            $stmt2->bind_param("i", $newId);
            $stmt2->execute();
            $expediente = $stmt2->get_result()->fetch_assoc();
            $stmt2->close();
        } else {
            $expediente = $resultado->fetch_assoc();
        }

        // 🔥 CORRECCIÓN CLAVE: Castear IDs a enteros para que React pueda leerlos correctamente 🔥
        $expediente['id'] = (int)$expediente['id'];
        $expediente['pacienteId'] = (int)$expediente['pacienteId'];
        $expediente['profesionalId'] = (int)$expediente['profesionalId'];
        
        $stmtDx = $conn->prepare("SELECT d.diagnosis_id AS id, d.diagnosis_name AS nombre FROM medical_record_diagnosis mrd JOIN diagnosis d ON mrd.diagnosis_id = d.diagnosis_id WHERE mrd.medical_record_id = ? ORDER BY d.diagnosis_name ASC");
        $stmtDx->bind_param("i", $expediente['id']);
        $stmtDx->execute();
        $resultDx = $stmtDx->get_result();
        
        $diagnosticos = [];
        while ($dx = $resultDx->fetch_assoc()) {
            $dx['id'] = (int)$dx['id']; // Convertir a número puro
            $diagnosticos[] = $dx;
        }
        $stmtDx->close();

        $stmtCat = $conn->query("SELECT diagnosis_id AS id, diagnosis_name AS nombre FROM diagnosis ORDER BY diagnosis_name ASC");
        $catalogo = [];
        while ($dx = $stmtCat->fetch_assoc()) {
            $dx['id'] = (int)$dx['id']; // Convertir a número puro
            $catalogo[] = $dx;
        }

        $stmtN = $conn->prepare("SELECT appointment_id AS id, appointment_date AS fechaCita, appointment_time AS horaCita, notes AS contenido FROM appointment WHERE patient_id = ? AND notes IS NOT NULL AND notes != '' ORDER BY appointment_date DESC");
        $stmtN->bind_param("i", $subId);
        $stmtN->execute();
        $resN = $stmtN->get_result();
        
        $notasSesion = [];
        while($n = $resN->fetch_assoc()) {
            $n['id'] = (int)$n['id']; // Convertir a número puro
            $notasSesion[] = $n;
        }
        $stmtN->close();

        $expediente['diagnosticos']            = $diagnosticos;
        $expediente['diagnosticosDisponibles'] = $catalogo;
        $expediente['notasSesion']             = $notasSesion;

        http_response_code(200);
        echo json_encode(["success" => true, "data" => $expediente]);

    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener expediente: " . $e->getMessage()]);
    }
    $conn->close(); exit();
}

// ==================================================================
// PUT /expediente/:id
// ==================================================================
if ($method === 'PUT' && $expId !== null) {
    
    if (!expedienteEsMio($conn, $expId, $profId, $esPsicologo)) {
        http_response_code(403); echo json_encode(["success" => false, "message" => "Acceso denegado a este expediente"]); exit();
    }

    $rawBody = file_get_contents("php://input");
    $body = json_decode($rawBody, true);

    if (!$body) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Los datos llegaron vacíos al servidor."]);
        exit();
    }

    $motivoConsulta        = $body['motivoConsulta']        ?? '';
    $condicionActual       = $body['condicionActual']       ?? '';
    $infanciaAdolescencia  = $body['infanciaAdolescencia']  ?? '';
    $eventosSignificativos = $body['eventosSignificativos'] ?? '';
    $historialAbuso        = $body['historialAbuso']        ?? '';
    $metasTerapeuticas     = $body['metasTerapeuticas']     ?? '';
    
    $diagnosticosArray     = $body['diagnosticosIds'] ?? $body['diagnosticos'] ?? [];

    $conn->begin_transaction();
    try {
        $stmtUp = $conn->prepare("
            UPDATE medical_record SET
                consultation_reason   = ?, 
                current_condition     = ?, 
                childhood_adolescence = ?,
                significant_events    = ?, 
                abuse_history         = ?, 
                therapeutic_goals     = ?
            WHERE medical_record_id = ?
        ");
        $stmtUp->bind_param("ssssssi", $motivoConsulta, $condicionActual, $infanciaAdolescencia, $eventosSignificativos, $historialAbuso, $metasTerapeuticas, $expId);
        $stmtUp->execute();
        $stmtUp->close();

        $stmtDel = $conn->prepare("DELETE FROM medical_record_diagnosis WHERE medical_record_id = ?");
        $stmtDel->bind_param("i", $expId);
        $stmtDel->execute();
        $stmtDel->close();

        // Filtro supremo para evitar duplicados en el ciclo
        if (!empty($diagnosticosArray)) {
            $stmtIns = $conn->prepare("INSERT IGNORE INTO medical_record_diagnosis (medical_record_id, diagnosis_id, notes, created_at) VALUES (?, ?, '', NOW())");
            
            $diagnosticosYaInsertados = [];
            foreach ($diagnosticosArray as $dx) {
                $dxId = is_array($dx) ? (int)($dx['id'] ?? 0) : (int)$dx; 
                
                if ($dxId > 0 && !in_array($dxId, $diagnosticosYaInsertados)) {
                    $stmtIns->bind_param("ii", $expId, $dxId);
                    $stmtIns->execute();
                    $diagnosticosYaInsertados[] = $dxId;
                }
            }
            $stmtIns->close();
        }

        $conn->commit();
        http_response_code(200); 
        echo json_encode(["success" => true, "message" => "Expediente actualizado correctamente"]);

    } catch (Throwable $e) {
        $conn->rollback();
        http_response_code(500); 
        echo json_encode(["success" => false, "message" => "Error SQL: " . $e->getMessage()]);
    }
    $conn->close(); exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método no permitido"]);
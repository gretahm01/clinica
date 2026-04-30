<?php
// ==================================================================
// 1. Cimientos y Seguridad (Combinado)
// ==================================================================
require_once __DIR__ . '/../config/headers.php'; // De Greta
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo']); // De Greta: Seguridad extra

$method = $_SERVER['REQUEST_METHOD'];

// ==================================================================
// 2. Enrutamiento dinámico (Adaptado para funcionar en ambos casos)
// ==================================================================
$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'expediente') + strlen('expediente'));
$ruta   = trim($ruta, '/');
$partesExp = explode('/', $ruta);

// /expediente/paciente/:id → $subPath='paciente', $subId=id
// /expediente/:id          → $expId=id
$subPath = $partesExp[0] ?? '';
$subId   = isset($partesExp[1]) && is_numeric($partesExp[1]) ? (int)$partesExp[1] : null;
$expId   = is_numeric($subPath) ? (int)$subPath : null;

$conn = conectarDB();

// ==================================================================
// GET /expediente/paciente/:id (Combinación de datos)
// ==================================================================
if ($method === 'GET' && $subPath === 'paciente' && $subId !== null) {
    
    // Consulta principal combinando tus datos (nombre) y los de Greta (creation_date)
    $stmt = $conn->prepare("
        SELECT
            mr.medical_record_id     AS id,
            mr.patient_id            AS pacienteId,
            mr.professional_id       AS profesionalId,
            mr.creation_date         AS fechaCreacion,
            mr.consultation_reason   AS motivoConsulta,
            mr.current_condition     AS condicionActual,
            mr.childhood_adolescence AS infanciaAdolescencia,
            mr.significant_events    AS eventosSignificativos,
            mr.abuse_history         AS historialAbuso,
            mr.therapeutic_goals     AS metasTerapeuticas,
            u.first_name             AS pacienteNombre,
            u.last_name              AS pacienteApellido
        FROM medical_record mr
        JOIN patient p ON mr.patient_id = p.patient_id
        JOIN user u ON p.user_id = u.user_id
        WHERE mr.patient_id = ?
    ");
    $stmt->bind_param("i", $subId);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        // Creación automática si no existe (Lógica de Greta)
        $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
        $stmtProf->bind_param("i", $usuario['userId']);
        $stmtProf->execute();
        $resProf = $stmtProf->get_result()->fetch_assoc();
        $stmtProf->close();

        $profId = $resProf['professional_id'] ?? 1;

        $stmtIns = $conn->prepare("INSERT INTO medical_record (patient_id, professional_id, creation_date) VALUES (?, ?, CURDATE())");
        $stmtIns->bind_param("ii", $subId, $profId);
        $stmtIns->execute();
        $newId = $conn->insert_id;
        $stmtIns->close();

        // Volver a consultar con los JOINs para obtener el nombre
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
    
    // 1. Diagnósticos actuales del paciente (De tu código y de Greta)
    $stmtDx = $conn->prepare("
        SELECT d.diagnosis_id AS id, d.diagnosis_name AS nombre
        FROM medical_record_diagnosis mrd
        JOIN diagnosis d ON mrd.diagnosis_id = d.diagnosis_id
        WHERE mrd.medical_record_id = ?
        ORDER BY d.diagnosis_name ASC
    ");
    $stmtDx->bind_param("i", $expediente['id']);
    $stmtDx->execute();
    $resultDx = $stmtDx->get_result();
    $diagnosticos = [];
    while ($dx = $resultDx->fetch_assoc()) $diagnosticos[] = $dx;
    $stmtDx->close();

    // 2. Catálogo completo de diagnósticos (De Greta)
    $stmtCat = $conn->query("SELECT diagnosis_id AS id, diagnosis_name AS nombre FROM diagnosis ORDER BY diagnosis_name ASC");
    $catalogo = [];
    while ($dx = $stmtCat->fetch_assoc()) $catalogo[] = $dx;

    // 3. Notas de sesión de citas anteriores (De tu código)
    $stmtN = $conn->prepare("
        SELECT appointment_id AS id, appointment_date AS fechaCita, appointment_time AS horaCita, notes AS contenido 
        FROM appointment 
        WHERE patient_id = ? AND notes IS NOT NULL AND notes != ''
        ORDER BY appointment_date DESC
    ");
    $stmtN->bind_param("i", $subId);
    $stmtN->execute();
    $resN = $stmtN->get_result();
    $notasSesion = [];
    while($n = $resN->fetch_assoc()) $notasSesion[] = $n;
    $stmtN->close();

    // Empaquetar todo en el expediente
    $expediente['diagnosticos']            = $diagnosticos;
    $expediente['diagnosticosDisponibles'] = $catalogo;
    $expediente['notasSesion']             = $notasSesion;

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $expediente]);
    $conn->close();
    exit();
}

// ==================================================================
// PUT /expediente/:id -> Guardar cambios (Usando transacción de Greta)
// ==================================================================
if ($method === 'PUT' && $expId !== null) {

    $body = json_decode(file_get_contents("php://input"), true);

    $motivoConsulta        = $body['motivoConsulta']        ?? null;
    $condicionActual       = $body['condicionActual']       ?? null;
    $infanciaAdolescencia  = $body['infanciaAdolescencia']  ?? null;
    $eventosSignificativos = $body['eventosSignificativos'] ?? null;
    $historialAbuso        = $body['historialAbuso']        ?? null;
    $metasTerapeuticas     = $body['metasTerapeuticas']     ?? null;
    
    // Soporte para ambos estilos de front-end (El tuyo y el de Greta)
    $diagnosticosArray = $body['diagnosticosIds'] ?? $body['diagnosticos'] ?? [];

    $stmtCheck = $conn->prepare("SELECT medical_record_id FROM medical_record WHERE medical_record_id = ?");
    $stmtCheck->bind_param("i", $expId);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Expediente no encontrado"]);
        $conn->close();
        exit();
    }
    $stmtCheck->close();

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
        $stmtUp->bind_param("ssssssi",
            $motivoConsulta, $condicionActual, $infanciaAdolescencia,
            $eventosSignificativos, $historialAbuso, $metasTerapeuticas,
            $expId
        );
        $stmtUp->execute();
        $stmtUp->close();

        // Sincronizar diagnósticos
        $stmtDel = $conn->prepare("DELETE FROM medical_record_diagnosis WHERE medical_record_id = ?");
        $stmtDel->bind_param("i", $expId);
        $stmtDel->execute();
        $stmtDel->close();

        if (!empty($diagnosticosArray)) {
            $stmtIns = $conn->prepare("INSERT INTO medical_record_diagnosis (medical_record_id, diagnosis_id, notes, created_at) VALUES (?, ?, '', NOW())");
            foreach ($diagnosticosArray as $dx) {
                // Si viene como array de objetos (tu código) o array de IDs (código de Greta)
                $dxId = is_array($dx) ? (int)$dx['id'] : (int)$dx; 
                
                $stmtIns->bind_param("ii", $expId, $dxId);
                $stmtIns->execute();
            }
            $stmtIns->close();
        }

        $conn->commit();
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Expediente actualizado correctamente"]);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar"]);
    }

    $conn->close();
    exit();
}

// ==================================================================
// Fallback
// ==================================================================
http_response_code(405);
echo json_encode(["success" => false, "message" => "Método no permitido"]);
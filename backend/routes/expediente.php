<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$usuario = verificarToken();
verificarRol($usuario, ['psicologo']);

$method = $_SERVER['REQUEST_METHOD'];

$url    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ruta   = substr($url, strpos($url, 'expediente') + strlen('expediente'));
$ruta   = trim($ruta, '/');
$partes = explode('/', $ruta);

// /expediente/paciente/:id → $partes[0]='paciente', $partes[1]=id
// /expediente/:id          → $partes[0]=id (numeric)

$subPath = $partes[0] ?? '';
$subId   = isset($partes[1]) && is_numeric($partes[1]) ? (int)$partes[1] : null;
$expId   = is_numeric($subPath) ? (int)$subPath : null;

// ===========================
// GET /expediente/paciente/:id
// ===========================
if ($method === 'GET' && $subPath === 'paciente' && $subId !== null) {

    $conn = conectarDB();

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
            mr.therapeutic_goals     AS metasTerapeuticas
        FROM medical_record mr
        WHERE mr.patient_id = ?
    ");
    $stmt->bind_param("i", $subId);
    $stmt->execute();
    $resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    // Obtener professional_id del psicólogo logueado
    $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
    $stmtProf->bind_param("i", $usuario['userId']);
    $stmtProf->execute();
    $resProf = $stmtProf->get_result()->fetch_assoc();
    $stmtProf->close();

    $profId = $resProf['professional_id'] ?? 1;

    // Crear expediente vacío
    $stmtIns = $conn->prepare("
        INSERT INTO medical_record (patient_id, professional_id, creation_date)
        VALUES (?, ?, CURDATE())
    ");
    $stmtIns->bind_param("ii", $subId, $profId);
    $stmtIns->execute();
    $newId = $conn->insert_id;
    $stmtIns->close();

    // Volver a traer el expediente recién creado
    $stmt2 = $conn->prepare("
        SELECT medical_record_id AS id, patient_id AS pacienteId,
               professional_id AS profesionalId, creation_date AS fechaCreacion,
               consultation_reason AS motivoConsulta, current_condition AS condicionActual,
               childhood_adolescence AS infanciaAdolescencia, significant_events AS eventosSignificativos,
               abuse_history AS historialAbuso, therapeutic_goals AS metasTerapeuticas
        FROM medical_record WHERE medical_record_id = ?
    ");
    $stmt2->bind_param("i", $newId);
    $stmt2->execute();
    $expediente = $stmt2->get_result()->fetch_assoc();
    $stmt2->close();
} else {
    $expediente = $resultado->fetch_assoc();
}
    // Diagnósticos del paciente
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
    while ($dx = $resultDx->fetch_assoc()) {
        $diagnosticos[] = $dx;
    }
    $stmtDx->close();

    // Catálogo completo
    $stmtCat = $conn->query("SELECT diagnosis_id AS id, diagnosis_name AS nombre FROM diagnosis ORDER BY diagnosis_name ASC");
    $catalogo = [];
    while ($dx = $stmtCat->fetch_assoc()) {
        $catalogo[] = $dx;
    }

    $expediente['diagnosticos']            = $diagnosticos;
    $expediente['diagnosticosDisponibles'] = $catalogo;

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $expediente]);

    $conn->close();
    exit();
}

// ===========================
// PUT /expediente/:id
// ===========================
if ($method === 'PUT' && $expId !== null) {

    $body = json_decode(file_get_contents("php://input"), true);

    $motivoConsulta        = $body['motivoConsulta']        ?? null;
    $condicionActual       = $body['condicionActual']       ?? null;
    $infanciaAdolescencia  = $body['infanciaAdolescencia']  ?? null;
    $eventosSignificativos = $body['eventosSignificativos'] ?? null;
    $historialAbuso        = $body['historialAbuso']        ?? null;
    $metasTerapeuticas     = $body['metasTerapeuticas']     ?? null;
    $diagnosticosIds       = $body['diagnosticosIds']       ?? [];

    $conn = conectarDB();

    $stmtCheck = $conn->prepare("SELECT medical_record_id FROM medical_record WHERE medical_record_id = ?");
    $stmtCheck->bind_param("i", $expId);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Expediente no encontrado"]);
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

        if (!empty($diagnosticosIds)) {
            $stmtIns = $conn->prepare("INSERT INTO medical_record_diagnosis (medical_record_id, diagnosis_id, notes, created_at) VALUES (?, ?, '', NOW())");
        foreach ($diagnosticosIds as $dxId) {
                $dxId = (int)$dxId;
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

http_response_code(405);
echo json_encode(["success" => false, "message" => "Metodo no permitido"]);
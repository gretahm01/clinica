<?php
// 1. Cimientos: Sin esto, el archivo no puede hablar con la DB ni saber quién eres
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

// 2. Seguridad: Verificamos que el psicólogo esté logueado
$usuario = verificarToken();

$method = $_SERVER['REQUEST_METHOD'];

// 3. Ajustamos las partes según tu index.php
// partes[0] = 'expediente', partes[1] = 'paciente' o el ID, partes[2] = el ID (si aplica)
$accion = $partes[1] ?? ''; 
$parametro = $partes[2] ?? '';

// ============================================================
// GET /expediente/paciente/:id
// ============================================================
if ($method === 'GET' && $accion === 'paciente' && is_numeric($parametro)) {
    $pacienteId = (int)$parametro;
    $conn = conectarDB();
    
    // Consulta principal del expediente clínico
    $sql = "SELECT m.medical_record_id AS id, m.consultation_reason AS motivoConsulta, 
                   m.current_condition AS condicionActual, m.childhood_adolescence AS infanciaAdolescencia, 
                   m.significant_events AS eventosSignificativos, m.abuse_history AS historialAbuso, 
                   m.therapeutic_goals AS metasTerapeuticas,
                   u.first_name AS pacienteNombre, u.last_name AS pacienteApellido
            FROM medical_record m
            JOIN patient p ON m.patient_id = p.patient_id
            JOIN user u ON p.user_id = u.user_id
            WHERE m.patient_id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pacienteId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Si el paciente no tiene expediente (como los pacientes 2 al 5 de tu SQL), lo creamos
    if ($result->num_rows === 0) {
        $stmtIns = $conn->prepare("INSERT INTO medical_record (patient_id, professional_id) 
                                   SELECT patient_id, professional_id FROM patient WHERE patient_id = ?");
        $stmtIns->bind_param("i", $pacienteId);
        $stmtIns->execute();
        $stmtIns->close();
        
        // Volvemos a consultar ahora que ya existe
        $stmt->execute();
        $result = $stmt->get_result();
    }
    
    $row = $result->fetch_assoc();
    $expedienteId = $row['id'];

    $expediente = [
        "id" => (int)$row['id'],
        "pacienteNombre" => $row['pacienteNombre'],
        "pacienteApellido" => $row['pacienteApellido'],
        "motivoConsulta" => $row['motivoConsulta'] ?? "",
        "condicionActual" => $row['condicionActual'] ?? "",
        "infanciaAdolescencia" => $row['infanciaAdolescencia'] ?? "",
        "eventosSignificativos" => $row['eventosSignificativos'] ?? "",
        "historialAbuso" => $row['historialAbuso'] ?? "",
        "metasTerapeuticas" => $row['metasTerapeuticas'] ?? "",
        "diagnosticos" => [],
        "notasSesion" => []
    ];
    
    // Traer diagnósticos
    $resD = $conn->query("SELECT d.diagnosis_id AS id, d.diagnosis_name AS nombre 
                          FROM medical_record_diagnosis mrd 
                          JOIN diagnosis d ON mrd.diagnosis_id = d.diagnosis_id 
                          WHERE mrd.medical_record_id = $expedienteId");
    while($d = $resD->fetch_assoc()) {
        $expediente['diagnosticos'][] = ["id" => (int)$d['id'], "nombre" => $d['nombre']];
    }

    // Traer notas registradas en las citas
    $stmtN = $conn->prepare("SELECT appointment_id AS id, appointment_date AS fechaCita, appointment_time AS horaCita, notes AS contenido 
                             FROM appointment 
                             WHERE patient_id = ? AND notes IS NOT NULL AND notes != ''
                             ORDER BY appointment_date DESC");
    $stmtN->bind_param("i", $pacienteId);
    $stmtN->execute();
    $resN = $stmtN->get_result();
    while($n = $resN->fetch_assoc()) $expediente['notasSesion'][] = $n;
    
    echo json_encode(["success" => true, "data" => $expediente]);
    $stmt->close(); $conn->close();
    exit();
}

// ============================================================
// PUT /expediente/:id -> Guardar cambios
// ============================================================
if ($method === 'PUT' && is_numeric($accion)) {
    $expedienteId = (int)$accion;
    $body = json_decode(file_get_contents("php://input"), true);
    $conn = conectarDB();
    
    $sql = "UPDATE medical_record SET 
            consultation_reason = ?, current_condition = ?, 
            childhood_adolescence = ?, significant_events = ?, 
            abuse_history = ?, therapeutic_goals = ? 
            WHERE medical_record_id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssi", 
        $body['motivoConsulta'], $body['condicionActual'], 
        $body['infanciaAdolescencia'], $body['eventosSignificativos'], 
        $body['historialAbuso'], $body['metasTerapeuticas'], 
        $expedienteId
    );
    $stmt->execute();

    // Sincronizar diagnósticos (Borrar y volver a insertar)
    $conn->query("DELETE FROM medical_record_diagnosis WHERE medical_record_id = $expedienteId");
    if (!empty($body['diagnosticos'])) {
        $stmtI = $conn->prepare("INSERT INTO medical_record_diagnosis (medical_record_id, diagnosis_id) VALUES (?, ?)");
        foreach ($body['diagnosticos'] as $d) {
            $dId = (int)$d['id'];
            $stmtI->bind_param("ii", $expedienteId, $dId);
            $stmtI->execute();
        }
    }
    
    echo json_encode(["success" => true, "message" => "Expediente guardado"]);
    $conn->close();
    exit();
}
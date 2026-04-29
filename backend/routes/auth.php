<?php
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body = json_decode(file_get_contents("php://input"), true);
    $email = $body['email'] ?? '';
    $password = $body['password'] ?? '';

    $conn = conectarDB();

    // 1. Buscamos al usuario por su email y obtenemos su rol
    $sql = "SELECT u.user_id, u.first_name, u.last_name, ua.password, r.role_name, ua.role_id 
            FROM user u 
            JOIN user_access ua ON u.user_id = ua.user_id 
            JOIN role r ON ua.role_id = r.role_id 
            WHERE u.email = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // 2. Verificamos la contraseña (asumiendo que usas password_hash)
        if (password_verify($password, $user['password'])) {
            
            $responseData = [
                "userId" => $user['user_id'],
                "nombre" => $user['first_name'],
                "apellido" => $user['last_name'],
                "rol" => $user['role_name'],
                "token" => "JWT_SIMULADO_" . bin2hex(random_bytes(16)) // Aquí iría tu generación de JWT real
            ];

            // 3. TRUCO CLAVE: Si es paciente, buscamos su patient_id
            if ($user['role_id'] == 3) { // 3 es el ID de rol para 'paciente'
                $stmtPatient = $conn->prepare("SELECT patient_id FROM patient WHERE user_id = ?");
                $stmtPatient->bind_param("i", $user['user_id']);
                $stmtPatient->execute();
                $resPatient = $stmtPatient->get_result();
                
                if ($rowP = $resPatient->fetch_assoc()) {
                    $responseData["pacienteId"] = $rowP['patient_id'];
                }
                $stmtPatient->close();
            }

            // 4. Si es psicólogo, podrías buscar su professional_id de la misma forma
            if ($user['role_id'] == 1) {
                $stmtProf = $conn->prepare("SELECT professional_id FROM professional WHERE user_id = ?");
                $stmtProf->bind_param("i", $user['user_id']);
                $stmtProf->execute();
                $resProf = $stmtProf->get_result();
                
                if ($rowPr = $resProf->fetch_assoc()) {
                    $responseData["profesionalId"] = $rowPr['professional_id'];
                }
                $stmtProf->close();
            }

            echo json_encode([
                "success" => true,
                "data" => $responseData
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    }

    $stmt->close();
    $conn->close();
    exit();
}
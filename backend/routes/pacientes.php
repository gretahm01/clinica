<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

// Verificar token y rol
$usuario = verificarToken();
verificarRol($usuario, ['psicologa', 'secretaria']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

$conn = conectarDB();

// Primero obtenemos el professional_id de la psicóloga logueada
// porque $usuario['userId'] es el user_id, no el professional_id
$stmtProf = $conn->prepare(
    "SELECT professional_id FROM professional WHERE user_id = ?"
);
$stmtProf->bind_param("i", $usuario['userId']);
$stmtProf->execute();
$resultProf = $stmtProf->get_result();

if ($resultProf->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Profesional no encontrado"]);
    exit();
}

$professional = $resultProf->fetch_assoc();
$professional_id = $professional['professional_id'];

// Ahora obtenemos los pacientes de esa psicóloga
$sql = "
    SELECT 
        p.patient_id        AS id,
        p.user_id           AS userId,
        u.first_name        AS nombre,
        u.last_name         AS apellido,
        u.middle_name       AS apellidoMaterno,
        u.email             AS email,
        u.phone             AS telefono,
        u.birth_date        AS fechaNacimiento,
        p.registration_date AS fechaRegistro,
        COUNT(a.appointment_id) AS totalCitas
    FROM patient p
    JOIN user u ON p.user_id = u.user_id
    LEFT JOIN appointment a ON a.patient_id = p.patient_id
    WHERE p.professional_id = ?
    GROUP BY p.patient_id
    ORDER BY u.first_name ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $professional_id);
$stmt->execute();
$resultado = $stmt->get_result();

$pacientes = [];
while ($fila = $resultado->fetch_assoc()) {
    $pacientes[] = $fila;
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "data"    => $pacientes
]);

$stmtProf->close();
$stmt->close();
$conn->close();
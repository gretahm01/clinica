<?php
require_once __DIR__ . '/../config/headers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit();
}

$body     = json_decode(file_get_contents("php://input"), true);
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email y contraseña son requeridos"
    ]);
    exit();
}

$conn = conectarDB();

$sql = "
    SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        ua.password,
        r.role_name
    FROM user u
    JOIN user_access ua ON u.user_id = ua.user_id
    JOIN role r         ON ua.role_id = r.role_id
    WHERE u.email = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas"
    ]);
    exit();
}

$usuario = $resultado->fetch_assoc();

if (!password_verify($password, $usuario['password'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas"
    ]);
    exit();
}

$datosToken = [
    "userId"   => $usuario['user_id'],
    "email"    => $usuario['email'],
    "rol"      => $usuario['role_name'],
    "nombre"   => $usuario['first_name'],
    "apellido" => $usuario['last_name'],
];

$token = crearToken($datosToken);

http_response_code(200);
echo json_encode([
    "success" => true,
    "data"    => [
        "userId"   => $usuario['user_id'],
        "nombre"   => $usuario['first_name'],
        "apellido" => $usuario['last_name'],
        "email"    => $usuario['email'],
        "rol"      => $usuario['role_name'],
        "token"    => $token
    ]
]);

$stmt->close();
$conn->close();
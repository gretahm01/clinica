<?php
function verificarToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "No se proporcionó un token de acceso"]);
        exit();
    }

    // Extraemos el token
    $token = str_replace('Bearer ', '', $authHeader);

    if (empty($token)) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token inválido"]);
        exit();
    }

    // ==========================================
    // ¡AQUÍ ESTÁ LA MAGIA!
    // Desencriptamos el token para leer el ID real
    // ==========================================
    $decoded = base64_decode($token);
    $userData = json_decode($decoded, true);

    // Si el token es de los viejos "JWT_SIMULADO...", esto va a fallar y pedirá relogueo
    if (!$userData || !isset($userData['userId'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token expirado o corrupto. Vuelve a iniciar sesión."]);
        exit();
    }

    // Retornamos los datos REALES del usuario que inició sesión
    return [
        "userId" => (int)$userData['userId'],
        "rol" => $userData['rol'] ?? 'paciente'
    ];
}

function verificarRol($usuario, $rolesPermitidos) {
    // Ahora sí verificamos que el rol coincida
    if (!in_array($usuario['rol'], $rolesPermitidos)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No tienes permisos para esta acción"]);
        exit();
    }
    return true; 
}
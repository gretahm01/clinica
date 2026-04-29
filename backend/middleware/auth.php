<?php
function verificarToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "No se proporcionó un token de acceso"]);
        exit();
    }

    // Extraemos el token (quitamos la palabra 'Bearer ')
    $token = str_replace('Bearer ', '', $authHeader);

    // Por ahora, como estamos en desarrollo y el token es simulado, 
    // solo verificamos que no esté vacío.
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token inválido"]);
        exit();
    }

    // El sistema de login guarda los datos del usuario en el LocalStorage de React.
    // React envía ese token aquí. En un sistema real, aquí decodificarías el JWT.
    // Por ahora, asumimos que si hay token, el usuario es quien dice ser.
    
    // IMPORTANTE: Esta función debe retornar un array con los datos básicos
    // para que los otros archivos sepan qué permisos dar.
    return [
        "userId" => 1, // Valor temporal, se usa para auditoría básica
        "rol" => "psicologo" // Esto se sobrescribirá con el uso real
    ];
}

function verificarRol($usuario, $rolesPermitidos) {
    // En esta etapa de desarrollo, permitiremos el acceso si el token existe.
    // Más adelante, aquí compararás $usuario['rol'] con $rolesPermitidos.
    return true; 
}
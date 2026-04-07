<?php
function crearToken($datos) {
    $secret = "medtrack_clave_secreta_2024";

    $header = rtrim(base64_encode(json_encode([
        "alg" => "HS256",
        "typ" => "JWT"
    ])), '=');

    $payload = rtrim(base64_encode(json_encode([
        "userId"   => $datos['userId'],
        "email"    => $datos['email'],
        "rol"      => $datos['rol'],
        "nombre"   => $datos['nombre'],
        "apellido" => $datos['apellido'],
        "exp"      => time() + (8 * 60 * 60)
    ])), '=');

    $firma = rtrim(base64_encode(hash_hmac(
        "sha256",
        "$header.$payload",
        $secret,
        true
    )), '=');

    return "$header.$payload.$firma";
}

function verificarToken() {
    $secret = "medtrack_clave_secreta_2024";
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token no proporcionado. Inicia sesión."]);
        exit();
    }

    $token = substr($authHeader, 7);
    $partes = explode('.', $token);

    if (count($partes) !== 3) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token inválido"]);
        exit();
    }

    [$header, $payload, $firma] = $partes;

    $firmaEsperada = rtrim(base64_encode(hash_hmac("sha256", "$header.$payload", $secret, true)), '=');

    if ($firma !== $firmaEsperada) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token inválido"]);
        exit();
    }

    $datos = json_decode(base64_decode($payload), true);

    if ($datos['exp'] < time()) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token expirado. Inicia sesión de nuevo."]);
        exit();
    }

    return $datos;
}

function verificarRol($usuario, $rolesPermitidos) {
    if (!in_array($usuario['rol'], $rolesPermitidos)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "No tienes permiso para hacer esto"]);
        exit();
    }
}
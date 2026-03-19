<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');        // en XAMPP normalmente está vacío
define('DB_NAME', 'medtrack');

function conectarDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error de conexión a la base de datos"
        ]);
        exit();
    }

    $conn->set_charset("utf8");
    return $conn;
}
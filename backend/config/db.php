//configuración de la base de datos
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');        
define('DB_NAME', 'medtrack');

//funccion para crear la conexión a la base de datos
function conectarDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    //si hay error de conexión se devuelve un mensaje de error y se detiene la ejecución
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error de conexión a la base de datos"
        ]);
        exit();
    }

    //establecer utf8 para evitar problemas con caracteres especiales
    $conn->set_charset("utf8");
    return $conn;
}
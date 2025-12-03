<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    $res = $conn->query("SELECT S_ID, Company_Name, Sector FROM stock");
    $stocks = [];
    while ($row = $res->fetch_assoc()) {
        $stocks[] = $row;
    }
    echo json_encode(["stocks" => $stocks]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

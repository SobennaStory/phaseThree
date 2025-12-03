<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
try {
    $res = $conn->query("SELECT ID, First_Name, Middle_Initial, Last_Name, Email FROM Investor ORDER BY Last_Name, First_Name");
    if (!$res) {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
        exit;
    }
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
try {
    if (!isset($_GET['pId'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing pId parameter"]);
        exit;
    }
    $pId = intval($_GET['pId']);

    // NOTE: placeholder hardcoded price 100.00 per specification
    $sql = "SELECT COALESCE(SUM(h.Quantity * 100.00), 0) AS totalValue FROM Holding h WHERE h.P_ID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pId);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
        exit;
    }
    $res = $stmt->get_result()->fetch_assoc();
    echo json_encode(["totalValue" => floatval($res['totalValue'])]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
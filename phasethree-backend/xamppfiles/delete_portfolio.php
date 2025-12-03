<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
try {
    if (!isset($_GET['pId'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing pId"]);
        exit;
    }
    $pId = intval($_GET['pId']);
    $stmt = $conn->prepare("DELETE FROM Portfolio WHERE P_ID = ?");
    $stmt->bind_param("i", $pId);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
        exit;
    }
    echo json_encode(["success" => true, "message" => "Portfolio deleted"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
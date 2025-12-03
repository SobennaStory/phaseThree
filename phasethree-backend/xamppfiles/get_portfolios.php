<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
try {
    $investorId = isset($_GET['investorId']) ? intval($_GET['investorId']) : null;

    if ($investorId) {
        $stmt = $conn->prepare("SELECT * FROM Portfolio WHERE ID = ?");
        $stmt->bind_param("i", $investorId);
    } else {
        $stmt = $conn->prepare("SELECT * FROM Portfolio");
    }

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
        exit;
    }

    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;

    echo json_encode(["portfolios" => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
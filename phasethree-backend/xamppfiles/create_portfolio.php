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
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['investorId']) || !isset($data['name']) || !isset($data['deposit'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing fields: investorId, name, deposit required"]);
        exit;
    }
    $investorId = intval($data['investorId']);
    $name = $data['name'];
    $deposit = floatval($data['deposit']);

    $sql = "INSERT INTO Portfolio (ID, Name, Account_Balance, Creation_Date) VALUES (?, ?, ?, CURDATE())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $investorId, $name, $deposit);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
        exit;
    }
    $insertId = $conn->insert_id;
    echo json_encode(["success" => true, "pId" => $insertId, "portfolio" => ["P_ID"=>$insertId,"ID"=>$investorId,"Name"=>$name,"Account_Balance"=>$deposit,"Creation_Date"=>date('Y-m-d')]]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
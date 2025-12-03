<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
try {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing id"]);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Missing JSON body"]);
        exit;
    }
    $first = $data['firstName'] ?? null;
    $email = $data['email'] ?? null;
    $risk = $data['riskProfile'] ?? null;

    $sql = "UPDATE Investor SET First_Name = ?, Email = ?, Risk_Profile = ? WHERE ID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $first, $email, $risk, $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
        exit;
    }
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
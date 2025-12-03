<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // avoid CORS during dev
$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing investor ID"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT ID, First_Name, Middle_Initial, Last_Name, Email, Risk_Profile FROM Investor WHERE ID = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Investor not found"]);
        exit;
    }
    echo json_encode($result->fetch_assoc());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

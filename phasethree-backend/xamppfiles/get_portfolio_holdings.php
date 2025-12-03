<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
try {
    if (!isset($_GET['pId'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing pId parameter"]);
        exit;
    }
    $pId = intval($_GET['pId']);

    $sql = "
        SELECT 
            h.P_ID,
            h.S_ID,
            ml.Symbol_Code,
            s.Company_Name,
            s.Sector,
            h.Quantity,
            h.Purchase_Price,
            ml.Exchange_Code
        FROM Holding h
        JOIN Stock s ON h.S_ID = s.S_ID
        JOIN Market_Listings ml ON h.S_ID = ml.S_ID
        WHERE h.P_ID = ?
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $pId);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
        exit;
    }
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) $rows[] = $r;
    echo json_encode(["holdings" => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
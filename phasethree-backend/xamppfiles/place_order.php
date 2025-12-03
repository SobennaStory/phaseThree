<?php
include "db.php";
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['sId'], $data['quantity'], $data['price'], $data['type'], $data['investorId'], $data['pId'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing fields: investorId, sId, quantity, price, type, pId"]);
        exit;
    }

    $investorId = intval($data['investorId']);
    $pId = intval($data['pId']);
    $sId = intval($data['sId']);
    $quantity = intval($data['quantity']);
    $price = floatval($data['price']);
    $type = strtolower($data['type']);

    $sql = "INSERT INTO `Orders` (`Date`, `Price`, `Quantity`, `S_ID`, `ID`, `Status`) VALUES (NOW(), ?, ?, ?, ?, 'Pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("diii", $price, $quantity, $sId, $investorId);
    if (!$stmt->execute()) throw new Exception($stmt->error);
    $orderId = $conn->insert_id;

    if ($type === 'buy') {
        $stmt2 = $conn->prepare("INSERT INTO BuyOrder (Order_ID, Payment_Type) VALUES (?, 'Cash')");
        $stmt2->bind_param("i", $orderId);
        $stmt2->execute();

        $stmt3 = $conn->prepare("
            INSERT INTO Holding (P_ID, S_ID, Purchase_Price, Quantity) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                Quantity = Quantity + VALUES(Quantity),
                Purchase_Price = VALUES(Purchase_Price)
        ");
        $stmt3->bind_param("iidi", $pId, $sId, $price, $quantity);
        $stmt3->execute();
    } else if ($type === 'sell') {
        $stmt4 = $conn->prepare("INSERT INTO SellOrder (Order_ID, Settlement_Date) VALUES (?, CURDATE())");
        $stmt4->bind_param("i", $orderId);
        $stmt4->execute();

        $stmt5 = $conn->prepare("
            UPDATE Holding 
            SET Quantity = Quantity - ? 
            WHERE P_ID = ? AND S_ID = ?
        ");
        $stmt5->bind_param("iii", $quantity, $pId, $sId);
        $stmt5->execute();

        $stmt6 = $conn->prepare("DELETE FROM Holding WHERE P_ID = ? AND S_ID = ? AND Quantity <= 0");
        $stmt6->bind_param("ii", $pId, $sId);
        $stmt6->execute();
    } else {
        throw new Exception("Invalid order type");
    }

    echo json_encode([
        "success" => true,
        "orderId" => $orderId,
        "id" => $investorId,
        "pId" => $pId,
        "sId" => $sId,
        "quantity" => $quantity,
        "price" => $price,
        "status" => "Pending"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

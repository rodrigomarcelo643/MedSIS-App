<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . "/../config/connection.php";

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $user_id = isset($data['user_id']) ? $data['user_id'] : '';
    $push_token = isset($data['push_token']) ? $data['push_token'] : '';
    $platform = isset($data['platform']) ? $data['platform'] : 'unknown';

    if (empty($user_id) || empty($push_token)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
        ]);
        exit();
    }

    try {
        // Check if token exists
        $checkSql = "SELECT id FROM push_tokens WHERE user_id = ? AND push_token = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ss", $user_id, $push_token);
        $checkStmt->execute();
        $result = $checkStmt->get_result();

        if ($result->num_rows > 0) {
            // Update token
            $updateSql = "UPDATE push_tokens 
                          SET platform = ?, updated_at = NOW() 
                          WHERE user_id = ? AND push_token = ?";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param("sss", $platform, $user_id, $push_token);
            $updateStmt->execute();
            $updateStmt->close();

            echo json_encode([
                "success" => true,
                "message" => "Token updated successfully"
            ]);
        } else {
            // Insert token
            $insertSql = "INSERT INTO push_tokens (user_id, push_token, platform, created_at) 
                          VALUES (?, ?, ?, NOW())";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bind_param("sss", $user_id, $push_token, $platform);

            if ($insertStmt->execute()) {
                echo json_encode([
                    "success" => true,
                    "message" => "Push token saved successfully"
                ]);
            } else {
                throw new Exception($insertStmt->error);
            }

            $insertStmt->close();
        }

        $checkStmt->close();
        $conn->close();

    } catch (Exception $e) {
        error_log("Save Push Token Error: " . $e->getMessage());

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Internal server error"
        ]);
    }
}
?>
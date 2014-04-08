<?php
if (!empty($_FILES)) {
    $tempPath = $_FILES['Filedata']['tmp_name'];
    $uploadPath = dirname(__FILE__) . '\uploads\\' . $_FILES['Filedata']['name'];

    move_uploaded_file($tempPath, $uploadPath);

    $answer = array('filename' => 'uploads/'.$_FILES['Filedata']['name'], 'success' => true, 'data' => $_POST['test']);

    echo json_encode($answer);
} else {
    $postdata = file_get_contents("php://input");
    $request = json_decode($postdata, true);

    if ($request['photo']) {
        $img = str_replace('data:image/png;base64,', '', $request['photo']);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        $file = dirname(__FILE__) . '\uploads\\' . uniqid() . '.png';
        $success = file_put_contents($file, $data);

        if ($success) {
            $answer = array('filename' => 'uploads/'.$_FILES['Filedata']['name'], 'success' => true);
        } else {
            $answer = array('answer' => 'Не фига не вышло!');
        }
    } else {
        $answer = array('answer' => 'no files');
    }

    echo json_encode($answer);
}
<?php
//redirect to homepage
$redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/index.html';
header('refresh: 5; url='. filter_var($redirect_uri, FILTER_SANITIZE_URL));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <!--tell mobile browsers to make the size of the layout viewport equal to the device width or the size of the screen-->
    <meta name="viewport" content="width=device-width">
    <!--to fix this modify the meta element that you just added so that it is as follows-->
    <meta name="viewport" content="width=device-width,maximum-scale=1.0">
    <title>Living Planet</title>
    <link rel="stylesheet" type="text/css" href="../../assets/css/style.css">
</head>
<body>
<div class="error_container">
    <div class="error">
        <h1>Something went wrong</h1>
        <p>We are unable to process your request at this moment. Please try again later.</p>
        <p>You will be direct to home page in few seconds.</p>
    </div>
</div>

</body>
</html>


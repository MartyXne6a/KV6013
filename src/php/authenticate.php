<?php
//include Google OAuth dependencies
require_once __DIR__. '/../../vendor/autoload.php';
//Attempt to start a session, if it fails handle error
if (!session_start()) {
    // Log the error
    error_log("Session start failed at " . date('Y-m-d H:i:s'));
    // Redirect to a custom error page
    $redirect_uri = 'http://' . $_SERVER['HTTP_HOST'] . '/error.php';
    header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
    exit();
}
//Initialise new Google Client instance and set configuration with details provided in the Google OAuth client JSON file
$client = new Google\Client();
$configPath = __DIR__ ."/../../config/client_secret.json";
$client->setAuthConfig($configPath);

// add the scope for authorising access to the app (the app won't authorise without a scope set)
$client->addScope('https://www.googleapis.com/auth/userinfo.email');

//check if the user has an access token in the SESSION
if(isset($_SESSION['access_token']) && $_SESSION['access_token']) {
    //if user is authorized redirect to private.php.
    //if the user does not have access token, redirect them to OAuth callback URL for restarting the OAuth authentication flow
    $redirect_uri = 'http://'.$_SERVER['HTTP_HOST'].'/src/php/private.php';
    header('Location:'.filter_var($redirect_uri, FILTER_SANITIZE_URL));
}else {
    //if the user does not have access token, redirect them to OAuth callback URL for restarting the OAuth authentication flow
    $redirect_uri = 'http://'.$_SERVER['HTTP_HOST'].'/src/php/oauth2callback.php';
    header('Location:'.filter_var($redirect_uri, FILTER_SANITIZE_URL));
}
//check if user clicked to logout link and revoke access to the app, destroying also the session
//redirect user back to index.html
if($_SERVER['REQUEST_METHOD'] == 'GET' and isset($_GET['logout'])) {
    $client->revokeToken($_SESSION['access_token']);
    session_destroy();
    $redirect_uri = 'http://'.$_SERVER['HTTP_HOST'].'/index.html';
    header('Location:'.filter_var($redirect_uri, FILTER_SANITIZE_URL));
}
?>

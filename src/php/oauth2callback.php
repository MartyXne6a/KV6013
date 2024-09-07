<?php
//include Google OAuth dependencies
require_once __DIR__. '/../../vendor/autoload.php';
//Attempt to start a session, if it fails handle error
if (!session_start()) {
    // Log the error
    error_log("Session start failed at " . date('Y-m-d H:i:s'));
    // Redirect to a custom error page
    header('Location: /error.php');
    exit();
}
//Initialise new Google Client instance and set configuration with details provided in the Google OAuth client JSON file
$client = new Google\Client();
$configPath = __DIR__ ."/../../config/client_secret.json";
$client->setAuthConfig($configPath);

//set the redirect url
$client->setRedirectUri('http://'.$_SERVER['HTTP_HOST'].'/src/php/oauth2callback.php');
//add a scope for authorising the app with
$client->addScope('https://www.googleapis.com/auth/userinfo.email');

//If the authorization code is not present in the URL, redirect the user to the Google sign-in page.
if(! isset($_GET['code'])) {
    $auth_url = $client->createAuthUrl();
    header('Location:'.filter_var($auth_url, FILTER_SANITIZE_URL));
} else {
    //authenticates the user using information provided, retrieve and store the access token
    //otherwise get the user sign in information
    $client->authenticate($_GET['code']);
    $_SESSION['access_token'] = $client->getAccessToken();
    //redirect the user back to the authorised page
    $redirect_uri = 'http://'.$_SERVER['HTTP_HOST'].'/src/php/private.php';
    header('Location:'.filter_var($redirect_uri, FILTER_SANITIZE_URL));
}
?>
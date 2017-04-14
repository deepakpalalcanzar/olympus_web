<?php
	session_start();
	// error_reporting(E_ALL);
	// ini_set('display_errors', '1');
	$systemPassword = $_SESSION['system_password'];

	$getInstallName= $_REQUEST['install'];

	switch($getInstallName){

		case 'node' :
			putenv("FILENAME=$systemPassword");
			$message=exec("/var/www/test_bash/test_installer.sh");
			print_r($message);
			while(empty($message))
				echo "<img src='ajax-loader.gif'>";
			}

			break;
	}
?>
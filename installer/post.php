<?php 
	session_start();
	include "class.php";

	if($_REQUEST['action'] == 'database'){
		$config = new Configuration;
		$config->saveDataBase($_POST);
	}

	if($_REQUEST['action'] == 'mandrill'){
		$config = new Configuration;
		$config->saveMandrill($_POST);
	}

	if($_REQUEST['action'] == 'adminLogin'){
		$config = new Configuration;
		$config->adminLogin($_POST);
	}

	if($_REQUEST['action'] == 'storage'){
		$config = new Configuration;
		$config->saveStorageLocation($_POST);
	}

	if($_REQUEST['action'] == 'ssl'){
		$config = new Configuration;
		$config->sslConfiguration($_FILES);
	}

	if($_REQUEST['action'] == 'launch'){
		$config = new Configuration;
		$config->launch();
	}

	if($_REQUEST['action'] == 'themesetup'){

		$config = new Configuration;
		$config->themesetup($_POST);
	}

?>
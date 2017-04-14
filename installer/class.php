<?php 

class Configuration {

	var $dataBase_Configuration; 
	var $adaptor_Configuration; 
	var $mandrill_Configuration; 
	var $localConfig; 
	var $path;
	var $url_base = '/olympus/installer'; 

	function __construct() {

		$url_base = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
		$urlparts = explode('/', $url_base); // explode on slash
		array_pop($urlparts); // remove last part
		$url_base = implode($urlparts, '/'); // put it back together

		if( $url_base != '' ){
			$this->url_base = $url_base;
		}//else default '/olympus/installer'
    }
	

/**
*	@author: Abhishek
*	Used to create a new database before installation 
*	Update the data credentials in all files of olympus where it is required
*		api/local.js
*		master/localConfig.js
*		master/local.js
*/

	function saveDataBase($postData){

		error_reporting(1);//important otherwise mysql connect error will be displayed in the page itself
		ini_set('display_errors',true);
		if(!empty($postData)){

			$_SESSION['databaseName'] = $postData['database_name'];
			$_SESSION['hostname'] 	  = $postData['database_hostname'];
			$_SESSION['domain_name']  = $postData['domain_hostname'];
			$_SESSION['username'] 	  = $postData['username'];
			$_SESSION['password']	  = $postData['password'];
			$_SESSION['serverName']	  = $postData['server_hostname'];
			$_SESSION['protocal']	  = $postData['protocal'];

			// connect to the mysql database server.
			$con = mysql_connect($postData['database_hostname'], $postData['username'], $postData["password"]);
			// Check connection

			if($con === FALSE){

				$_SESSION['msg'] = "Unable to connect database.[".mysql_error()."]";
				header("Location:index.php");
			}else{

		    	// If we couldn't, then it either doesn't exist, or we can't see it.
				$query="CREATE DATABASE IF NOT EXISTS $postData[database_name]";

				if (mysql_query($query)) {

					// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/mandrill.php";
					header("Location:mandrill.php");
					// echo '<script>window.location.href="'.$url.'"</script>';

				} else {
					$_SESSION['msg'] = "Error in creating database.[".mysql_error()."]";
					header("Location:index.php");
					// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/index.php";
					//echo '<script>window.location.href="'.$url.'"</script>';
				}
  			}
		}

	}

/**
*	@author: Abhishek
*	This function is used to save data of mandrill configuration.
*	Mandrill api is used to send mail on request and adding new users.
*	If Mandrill credentials are not provided then admin is not able to send mail.
*/

	function saveMandrill($mandrillConfig){

		$_SESSION['mail_service'] = $mandrillConfig['mail_service'];

		if( $mandrillConfig['mail_service'] == 'mandrill' ){
			$_SESSION['mandrill_api_key'] = $mandrillConfig['mandrill_key'];
			// print_r($_SESSION['serverName']);
		}else{//internal
			$_SESSION['smtp_host'] = $mandrillConfig['smtp_host'];
			$_SESSION['smtp_port'] = $mandrillConfig['smtp_port'];
			$_SESSION['smtp_user'] = $mandrillConfig['smtp_user'];
			$_SESSION['smtp_pass'] = $mandrillConfig['smtp_pass'];
		}
		header("Location:admin-login.php");
		// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/admin-login.php";
		// echo '<script>window.location.href="'.$url.'"</script>';
	}


/**
	*	@author: Abhishek
	*	This function is used to store admin login information 
	*	Email and password here are going to be used for the user login
*/
	function adminLogin($adminLogin){
		$_SESSION['login_email'] 		= $adminLogin['email'];
		$_SESSION['login_password'] 	= $adminLogin['password'];
		header("Location:storage.php");
		// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/storage.php";
		// echo '<script>window.location.href="'.$url.'"</script>';

	}

/*
	This function is used to save data of file storage location and 
*/
	function saveStorageLocation($selectedStorage){

		$distribution_version 	=  exec("lsb_release -r | cut -f2"); 

		if(null !== dirname(__FILE__)){
			$path = dirname(__FILE__).'/../..';//Note- last '/' is skipped deliberately as per behaviour of the code below
		}
		elseif($distribution_version == '12.04'){
			$path = "/var/www";
		}else if ($distribution_version == '14.04'){
			$path = "/var/www/html";
		}else{
			$path = "/var/www/html";
		}

		$fileAdapter 			= '';
		$localConfigFileAdaptor = '';
		$_SESSION['error']		= false;

		$_SESSION['storage'] 	  				= $selectedStorage['storage'];
		//S3
		$_SESSION['S3']['api_key'] 	  			= $selectedStorage['api_key'];
		$_SESSION['S3']['api_secret_key'] 		= $selectedStorage['api_secret_key'];
		$_SESSION['S3']['bucket']  				= $selectedStorage['bucket'];
		$_SESSION['S3']['region'] 	  			= $selectedStorage['region'];
		//swift
		$_SESSION['swift']['host']	  			= $selectedStorage['host'];
		$_SESSION['swift']['port']	  			= $selectedStorage['port'];
		$_SESSION['swift']['serviceHash']	  	= $selectedStorage['serviceHash'];
		$_SESSION['swift']['container']	  		= $selectedStorage['container'];
		//Ormuco
		$_SESSION['Ormuco']['ormuco_user']	  	= $selectedStorage['ormuco_user'];
		$_SESSION['Ormuco']['ormuco_pass']	  	= $selectedStorage['ormuco_pass'];
		$_SESSION['Ormuco']['ormuco_container']	= $selectedStorage['ormuco_container'];

		/*switch($selectedStorage['storage']){

			case 'S3' :

			$selectedStorage['host'] = $selectedStorage['port'] = $selectedStorage['serviceHash'] = $selectedStorage['container'] = '';

			if( !$selectedStorage['api_key'] || trim( $selectedStorage['api_key'] ) == '' ||
				!$selectedStorage['api_secret_key'] || trim( $selectedStorage['api_secret_key'] ) == '' ||
				!$selectedStorage['bucket'] || trim( $selectedStorage['bucket'] ) == '' ||
				!$selectedStorage['region'] || trim( $selectedStorage['region'] ) == '' )
				{
					$_SESSION['msg'] = "Please Fill in all the details.";
				 	$_SESSION['storage'] = 'S3';
				 	$_SESSION['selectedStorage'] = $selectedStorage;
				 	header("Location:storage.php");
				}

// File store adapter configuration
				$fileAdapter = "fileAdapter: { \n
									// Which adapter to use \n
										adapter: 's3', \n
									// Amazon S3 API credentials \n
										s3: { \n
											accessKeyId		: '".$selectedStorage['api_key']."', \n
											secretAccessKey	: '".$selectedStorage['api_secret_key']."', \n
											bucket			: '".$selectedStorage['bucket']."', \n
											region			: '".$selectedStorage['region']."' \n
										}, \n
										// OpenStack Swift API credentials \n
											swift: { \n
												host  		: 'SWIFT_HOST', \n
												port 		: 'SWIFT_PORT', \n
												serviceHash : 'SWIFT_HASH', \n
												container 	: 'SWIFT_CONTAINER', \n
											}, \n
										// Keystone API credentials \n
											keystone: { \n
												host    : '', \n
												port    : '', \n
												tenant  : '', // tenant === 'project' in Horizon dashboard \n
												username: '', \n
												password: '' \n
											} \n
										},\n ";

				$localConfigFileAdaptor = "exports.fileAdapter = { \n // Choose a file adapter for uploads / downloads \n
	 								adapter: 's3', \n
							// Amazon s3 credentials \n
									s3: { \n
										accessKeyId		: '".$selectedStorage['api_key']."', \n
										secretAccessKey	: '".$selectedStorage['api_secret_key']."', \n
										bucket			: '".$selectedStorage['bucket']."', \n
										region			: '".$selectedStorage['region']."' \n
									}, \n
							// OpenStack Swift API credentials \n
							// OpenStack Swift API credentials \n
									swift: { \n
										host 		: 'SWIFT_HOST', \n
										port 		: 'SWIFT_PORT', \n
										serviceHash : 'SWIFT_HASH', \n
										container   : 'SWIFT_CONTAINER' \n
									}, \n
								}";

							break;
			

			case 'swift' :

				$selectedStorage['api_key'] = $selectedStorage['api_secret_key'] = $selectedStorage['bucket'] = $selectedStorage['region'] = '';

				if( !$selectedStorage['host'] || trim( $selectedStorage['host'] ) == '' ||
				!$selectedStorage['port'] || trim( $selectedStorage['port'] ) == '' ||
				!$selectedStorage['serviceHash'] || trim( $selectedStorage['serviceHash'] ) == '' ||
				!$selectedStorage['container'] || trim( $selectedStorage['container'] ) == '' )
				{
					$_SESSION['msg'] = "Please Fill in all the details.";
				 	$_SESSION['storage'] = 'swift';
				 	$_SESSION['selectedStorage'] = $selectedStorage;
				 	header("Location:storage.php");
				}

// File store adapter configuration
				$fileAdapter = "fileAdapter: { \n // Which adapter to use \n
											adapter: 'swift', \n
										// Amazon S3 API credentials \n
											s3: { \n
												accessKeyId		: 'AWS_ACCESS_KEY_ID', \n
												secretAccessKey	: 'AWS_SECRET_ACCESS_KEY', \n
												bucket			: 'AWS_BUCKET', \n
												region			: 'US_EAST_1' \n
											}, \n
										// OpenStack Swift API credentials \n
											swift: { \n
												host  		: 'SWIFT_HOST', \n
												port 		: 'SWIFT_PORT', \n
												serviceHash : 'SWIFT_HASH', \n
												container 	: 'SWIFT_CONTAINER', \n
											}, \n
										// Keystone API credentials \n
											keystone: { \n
												host    : '', \n
												port    : '', \n
												tenant  : '', // tenant === 'project' in Horizon dashboard \n
												username: '', \n
												password: '' \n
											} \n
										},\n ";


				$localConfigFileAdaptor = "exports.fileAdapter = { \n // Choose a file adapter for uploads / downloads \n
							adapter: 'swift', \n
				// Amazon s3 credentials \n
						s3: { \n
							accessKeyId		: 'AWS_ACCESS_KEY_ID', \n
							secretAccessKey	: 'AWS_SECRET_ACCESS_KEY', \n
							bucket			: 'AWS_BUCKET', \n
							region			: 'US_EAST_1' \n
						}, \n
				// OpenStack Swift API credentials \n
				// OpenStack Swift API credentials \n
						swift: { \n
							host: '".$selectedStorage['host']."', \n
							port: '".$selectedStorage['port']."', \n
							serviceHash: '".$selectedStorage['serviceHash']."', \n
							container: '".$selectedStorage['container']."', \n
						}, \n
					}\n";

				break;

			case 'Disk' :

// File store adapter configuration
				$fileAdapter = "fileAdapter: { \n // Which adapter to use \n
										adapter: 'disk', \n
										// Amazon S3 API credentials \n
											s3: { \n
												accessKeyId		: 'AWS_ACCESS_KEY_ID', \n
												secretAccessKey	: 'AWS_SECRET_ACCESS_KEY', \n
												bucket			: 'AWS_BUCKET', \n
												region			: 'US_EAST_1' \n
											}, \n
										// OpenStack Swift API credentials \n
											swift: { \n
												host  		: 'SWIFT_HOST', \n
												port 		: 'SWIFT_PORT', \n
												serviceHash : 'SWIFT_HASH', \n
												container 	: 'SWIFT_CONTAINER', \n
											}, \n
										// Keystone API credentials \n
											keystone: { \n
												host    : '', \n
												port    : '', \n
												tenant  : '', // tenant === 'project' in Horizon dashboard \n
												username: '', \n
												password: '' \n
											} \n
										},\n ";


				$localConfigFileAdaptor = "exports.fileAdapter = { \n // Choose a file adapter for uploads / downloads \n
							adapter: 'disk', \n
				// Amazon s3 credentials \n
						s3: { \n
							accessKeyId		: 'AWS_ACCESS_KEY_ID', \n
							secretAccessKey	: 'AWS_SECRET_ACCESS_KEY', \n
							bucket			: 'AWS_BUCKET', \n
							region			: 'US_EAST_1' \n
						}, \n
				// OpenStack Swift API credentials \n
				// OpenStack Swift API credentials \n
						swift: { \n
							host: 'SWIFT_HOST', \n
							port: 'SWIFT_PORT', \n
							serviceHash: 'SWIFT_HASH', \n
							container: 'SWIFT_CONTAINER', \n
						}, \n
					}\n";		


				break;
		}*/



		//Save Adapter Settings
		$con = mysql_connect($_SESSION['hostname'], $_SESSION['username'], $_SESSION["password"]);
		// Check connection
		if($con === FALSE){
			 $_SESSION['msg'] = "Unable to connect database.";
			 header("Location:index.php");
		}else{

			if(mysql_select_db($_SESSION['databaseName'], $con) === FALSE){

 				$_SESSION['msg'] = "Could not select database.";
 				header("Location:index.php");
			}else{
				$query_drop 	= "DROP TABLE IF EXISTS `uploadpaths`";

		    	// If we couldn't, then it either doesn't exist, or we can't see it.
				$query_create 	= "CREATE TABLE IF NOT EXISTS `uploadpaths` (
						  `type` varchar(255) DEFAULT NULL,
						  `path` varchar(255) DEFAULT NULL,
						  `accessKeyId` varchar(255) DEFAULT NULL,
						  `secretAccessKey` varchar(255) DEFAULT NULL,
						  `bucket` varchar(255) DEFAULT NULL,
						  `region` varchar(255) DEFAULT NULL,
						  `id` int(11) NOT NULL AUTO_INCREMENT,
						  `createdAt` datetime DEFAULT NULL,
						  `updatedAt` datetime DEFAULT NULL,
						  `isActive` int(11) DEFAULT NULL,
						  PRIMARY KEY (`id`)
						)";

				$query_insert = "";
				switch($selectedStorage['storage']){

					case 'swift' :
							// SWIFT KEYS  :=> TABLE COLUMNS
							// host 	   :=> bucket
							// port 	   :=> region
							// serviceHash :=> accessKeyId
							// container   :=> secretAccessKey
						$query_insert 	="INSERT INTO `uploadpaths` (`type`, `path`, `accessKeyId`, `secretAccessKey`, `bucket`, `region`, `id`, `createdAt`, `updatedAt`, `isActive`) VALUES ('S3', NULL, '".$selectedStorage['serviceHash']."', '".$selectedStorage['container']."', '".$selectedStorage['host']."', '".$selectedStorage['port']."', 1, '".date("Y-m-d H:i:s")."', '".date("Y-m-d H:i:s")."', 1)";
						break;
					case 'S3' :
						$query_insert 	="INSERT INTO `uploadpaths` (`type`, `path`, `accessKeyId`, `secretAccessKey`, `bucket`, `region`, `id`, `createdAt`, `updatedAt`, `isActive`) VALUES ('S3', NULL, '".$selectedStorage['api_key']."', '".$selectedStorage['api_secret_key']."', '".$selectedStorage['bucket']."', '".$selectedStorage['region']."', 1, '".date("Y-m-d H:i:s")."', '".date("Y-m-d H:i:s")."', 1)";
						break;
					case 'Ormuco' :
						$query_insert 	="INSERT INTO `uploadpaths` (`type`, `path`, `accessKeyId`, `secretAccessKey`, `bucket`, `region`, `id`, `createdAt`, `updatedAt`, `isActive`) VALUES ('Ormuco', NULL, '".$selectedStorage['ormuco_user']."', '".$selectedStorage['ormuco_pass']."', '".$selectedStorage['ormuco_container']."', NULL, 1, '".date("Y-m-d H:i:s")."', '".date("Y-m-d H:i:s")."', 1)";
						break;
					case 'Disk' :
						$query_insert 	="INSERT INTO `uploadpaths` (`type`, `path`, `accessKeyId`, `secretAccessKey`, `bucket`, `region`, `id`, `createdAt`, `updatedAt`, `isActive`) VALUES ('Disk', '/var/www/html/olympus/api/files/', NULL, NULL, NULL, NULL, 1, '".date("Y-m-d H:i:s")."', '".date("Y-m-d H:i:s")."', 1)";
						break;
				}

				if (mysql_query($query_drop) && mysql_query($query_create) && mysql_query($query_insert)) {
					//All queries executed perfectly
				} else {
					// echo $query_drop.'<br>';
					// echo $query_create.'<br>';
					// echo $query_insert;die;
					$_SESSION['msg'] = "Error in creating database tables.[".mysql_error()."]";
					header("Location:storage.php");
					// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/index.php";
					//echo '<script>window.location.href="'.$url.'"</script>';
				}
			}
		}


		$dataBaseConfiguration 	= "exports.datasource = {\n database: '".$_SESSION['databaseName']."', \n username: '".$_SESSION['username']."', \n host: '".$_SESSION['hostname']."', \n password: '".$_SESSION['password']."' \n // Choose a SQL dialect, one of sqlite, postgres, or mysql (default mysql) \n // dialect:  'mysql', \n // Choose a file storage location (sqlite only) \n //storage:  ':memory:', \n // mySQL only \n // pool: { maxConnections: 5, maxIdleTime: 30} \n };\n
					// Self-awareness of hostname \n
					exports.host = '".$_SESSION['domain_name']."'; \n
					//port: '".$_SESSION['protocal']."', // change to 80 if you're not using SSL\n";


		if($_SESSION['protocal'] == '80'){

			$masterConfigFile ="module.exports = {\n
									specialAdminCode: 'ad8h4FJADSLJah34ajsdajchALz2494gasdasdhjasdhj23bn',\n
									mailService: '".$_SESSION['mail_service']."',
									mandrillApiKey: '".$_SESSION['mandrill_api_key']."',\n
									smtpDetails: { \n
											host: '".$_SESSION['smtp_host']."', \n
											port: '".$_SESSION['smtp_port']."', \n
											user: '".$_SESSION['smtp_user']."', \n
											pass: '".$_SESSION['smtp_pass']."' \n
										}, \n
									bootstrap: function(bootstrap_cb) { \n
										if(bootstrap_cb) bootstrap_cb(); \n
									},\n";
									
					//--removed//$fileAdapter\n
								
			$masterConfigFile .="// Default title for layout\n
									appName: 'Olympus | Sharing the Cloud',\n
								
								// App hostname\n
									host: '".$_SESSION['domain_name']."', \n
								
								// App root path\n
									appPath: __dirname + '/..', \n
								
								// Port to run the app on \n
								
									port: '".$_SESSION['protocal']."', //5008, \n
								    //express: { \n
									//	serverOptions: { \n
									  // 		ca: fs.readFileSync(__dirname + '/../ssl/gd_bundle.crt'), \n
									   	//	key: fs.readFileSync(__dirname + '/../ssl/olympus.key'), \n
									   	//	cert: fs.readFileSync(__dirname + '/../ssl/olympus.crt') \n
										//} \n
									//}, \n

								// Development or production environment \n
									environment: 'development', \n
								
								// Path to the static web root for serving images, css, etc. \n
									staticPath: './public', \n
								
								// Rigging configuration (automatic asset compilation) \n
									rigging: { \n
										outputPath: './.compiled', \n
										sequence: ['./public/dependencies', './public/js/blueimp/vendor', './public/js/blueimp/cors', './public/js/blueimp/main', './mast'] \n
									}, \n
									
								// Prune the session before returning it to the client over socket.io \n
									sessionPruneFn: function(session) { \n
										var avatar = (session.Account && session.Account.id === 1) ? '/images/' + session.Account.id + '.png' : '/images/avatar_anonymous.png'; \n
										var prunedSession = { \n
											Account: _.extend(session.Account || {}, { \n
												avatar: avatar \n
											}) \n
										}; \n
										return prunedSession; \n
									}, \n
								// API token \n
									apiToken: 'Xw46nGv1Nrearden', \n
								// Information about your organization \n
									organization: { \n
										name: 'Olympus', \n
										copyright: '&copy; Olympus.io Inc.', \n
										squareLogoSrc: '/images/logo_square.png', \n
								// Configurable footer link endpoints \n
										links: { \n
											termsOfUse: 'http://www.olympus.io/terms-and-privacy/', \n
											privacyPolicy: 'http://www.olympus.io/privacy/', \n
											help: 'http://www.olympus.io/contact-us/' \n
										} \n
									}, \n
									publicLinksEnabledByDefault: true, \n
								// NOTE: This is just to test for privateDevelopment feature. Need to figure out \n
								// what determines this config options and implement that. \n
	    							privateDeployment: false, \n
	    							trash_setting: 'manual', \n
            						trash_setting_days: '', \n
								};\n";
		}else{

						$masterConfigFile ="module.exports = {\n
									specialAdminCode: 'ad8h4FJADSLJah34ajsdajchALz2494gasdasdhjasdhj23bn',\n
									mailService: '".$_SESSION['mail_service']."',
									mandrillApiKey: '".$_SESSION['mandrill_api_key']."',\n
									smtpDetails: { \n
											host: '".$_SESSION['smtp_host']."', \n
											port: '".$_SESSION['smtp_port']."', \n
											user: '".$_SESSION['smtp_user']."', \n
											pass: '".$_SESSION['smtp_pass']."' \n
										}, \n
									bootstrap: function(bootstrap_cb) { \n
										if(bootstrap_cb) bootstrap_cb(); \n
									},\n";
									
					//--removed//$fileAdapter\n
								
			$masterConfigFile .="// Default title for layout\n
									appName: 'Olympus | Sharing the Cloud',\n
								
								// App hostname\n
									host: '".$_SESSION['domain_name']."', \n
								
								// App root path\n
									appPath: __dirname + '/..', \n
								
								// Port to run the app on \n
								
									port: '".$_SESSION['protocal']."', //5008, \n
								    express: { \n
										serverOptions: { \n
									   		ca: fs.readFileSync(__dirname + '/../ssl/gd_bundle.crt'), \n
									   		key: fs.readFileSync(__dirname + '/../ssl/olympus.key'), \n
									   		cert: fs.readFileSync(__dirname + '/../ssl/olympus.crt') \n
										} \n
									}, \n

								// Development or production environment \n
									environment: 'development', \n
								
								// Path to the static web root for serving images, css, etc. \n
									staticPath: './public', \n
								
								// Rigging configuration (automatic asset compilation) \n
									rigging: { \n
										outputPath: './.compiled', \n
										sequence: ['./public/dependencies', './public/js/blueimp/vendor', './public/js/blueimp/cors', './public/js/blueimp/main', './mast'] \n
									}, \n
									
								// Prune the session before returning it to the client over socket.io \n
									sessionPruneFn: function(session) { \n
										var avatar = (session.Account && session.Account.id === 1) ? '/images/' + session.Account.id + '.png' : '/images/avatar_anonymous.png'; \n
										var prunedSession = { \n
											Account: _.extend(session.Account || {}, { \n
												avatar: avatar \n
											}) \n
										}; \n
										return prunedSession; \n
									}, \n
								// API token \n
									apiToken: 'Xw46nGv1Nrearden', \n
								// Information about your organization \n
									organization: { \n
										name: 'Olympus', \n
										copyright: '&copy; Olympus.io Inc.', \n
										squareLogoSrc: '/images/logo_square.png', \n
								// Configurable footer link endpoints \n
										links: { \n
											termsOfUse: 'http://www.olympus.io/terms-and-privacy/', \n
											privacyPolicy: 'http://www.olympus.io/privacy/', \n
											help: 'http://www.olympus.io/contact-us/' \n
										} \n
									}, \n
									publicLinksEnabledByDefault: true, \n
								// NOTE: This is just to test for privateDevelopment feature. Need to figure out \n
								// what determines this config options and implement that. \n
	    							privateDeployment: false, \n
	    							trash_setting: 'manual', \n
            						trash_setting_days: '', \n
								};\n";

		}



		$apiBootstrapConfig  ="module.exports.bootstrap = function (bootstrap_cb) { \n
								async.parallel([ \n
									function (cb) { \n
// If default administrator already exists, get out \n
										Account.find({ \n
											where: {email: '".$_SESSION['login_email']."'} \n
										}).done(function (err, account) { \n
											if (err) throw err;
											console.log('ACCOUNT FOUND:', account); \n
											if (account.length !== 0) return cb && cb(); \n
// Otherwise create a new administrator account \n
												Account.create({ \n
													name: 'Administrator', \n
													title: 'Administrator', \n 
													email: '".$_SESSION['login_email']."', \n
													password: '".$_SESSION['login_password']."', \n
													isAdmin: true, \n
													isSuperAdmin: true, \n
													verified: true, \n
													verificationCode: null, \n
													avatar_fname: null, \n
													avatar_mimetype: null, \n
													enterprise_fsname: null \n
												}).done(function done (err, account) { \n
													if (err) throw err;
													console.log('ACCOUNT CREATE:', account); \n
 // Now create a workgroup, assigning the new account as an admin \n
													Subscription.create({ \n
														features 	: 'Default Plan',\n
														price 		: '0',\n
														duration 	: '1200',\n
														users_limit : '5',\n
														is_default 	: true,\n
														is_active	: true,\n
														quota		: '100000000000'\n
													}).done(function done(err, subscription){ \n
														if (err) throw err; \n
														cb && cb(); \n
													}); \n
											}); \n
										}); \n
									}, \n
									function (cb) { \n
										// Also create a default API app developer \n
										Developer.find({ \n
											where: {api_key: '3y6gp1hz9de7cgvkn7xqjb3285p8udf2'} \n
										}).done(function (err, developer) { \n
											if (err) throw err; \n
											if (developer.length > 0) { return cb && cb(); } \n
											// Otherwise create a new administrator account \n
											Developer.create({ \n
												api_key: '3y6gp1hz9de7cgvkn7xqjb3285p8udf2', \n
												api_secret: 'ctDv8bIUmdJtChHP357xJ1ZspKh32rwq', \n
												app_name: 'Test API App', \n
												redirect_url: 'http://www.pigandcow.com/olympus_test_api_app' \n
											}).done(function done (err, developer) { \n
												if (err) throw err; \n
												AccountDeveloper.create({ \n
													api_key: '3y6gp1hz9de7cgvkn7xqjb3285p8udf2', \n
													account_id: 1, \n
													code: '', \n
													access_token: 'baudzVitCraHCB1', \n
													refresh_token: 'abcdefg', \n
													code_expires: '2020-01-01', \n
													access_expires: '2020-01-01', \n
													refresh_expires: '2020-01-01', \n
													scope: 3 \n
												}).done(function done(err, accountdeveloper){ \n
													if (err) throw err; \n
													else return cb && cb(); \n
												}); \n
											}); \n
										}); \n
									} \n
 								], function(err, results) {bootstrap_cb && bootstrap_cb();});\n
							};";

	$apiConfigApplicationJs = "module.exports = { \n
  // Port this Sails application will live on\n
  port: process.env.PORT || 1337,\n
  // The environment the app is deployed in\n
  // (`development` or `production`)\n
  // In `production` mode, all css and js are bundled up and minified\n
  // And your views and templates are cached in-memory.  Gzip is also used.\n
  // The downside?  Harder to debug, and the server takes longer to start.\n
  environment: process.env.NODE_ENV || 'development',\n
  // Used for sending emails\n
  hostName: '".$_SESSION['domain_name']."',\n
  protocol: 'https://',\n
  // TODO: make this an adapter config\n
  mailService: '".$_SESSION['mail_service']."',
  mandrill: {\n
    token: '".$_SESSION['mandrill_api_key']."'\n
  }, \n
  smtpDetails: { \n
	host: '".$_SESSION['smtp_host']."', \n
	port: '".$_SESSION['smtp_port']."', \n
	user: '".$_SESSION['smtp_user']."', \n
	pass: '".$_SESSION['smtp_pass']."' \n
  },\n
};";



		exec("sudo chmod 777 $path/olympus/master/config/localConfig.ex.js");
		exec("sudo scp $path/olympus/master/config/localConfig.ex.js $path/olympus/master/config/localConfig.js");
		exec("sudo chmod 777 $path/olympus/master/config/localConfig.js");

		exec("sudo scp $path/olympus/api/config/bootstrap.js /var/www/olympus/master/config/bootstrap.ex.js");


//  API ADAPTERS FILE 
		exec("sudo chmod 777 $path/olympus/api/config/bootstrap.js");
		$bootstrapFile = fopen("$path/olympus/api/config/bootstrap.js", "w");
		fwrite($bootstrapFile, $apiBootstrapConfig);
		fclose($bootstrapFile);	

//  API CONFIG local JS FILE 
		// exec("sudo chmod 777 $path/olympus/api/config/local.js");
		// $applicationFile = fopen("$path/olympus/api/config/local.js", "w");
		// echo 'Writing local.js<br>';
		// echo fwrite($applicationFile, $apiConfigLocalJs);
		// fclose($applicationFile);

//  API CONFIG APPLICATION JS FILE 
		exec("sudo chmod 777 $path/olympus/api/config/application.js");
		$applicationFile = fopen("$path/olympus/api/config/application.js", "w");
		fwrite($applicationFile, $apiConfigApplicationJs);
		fclose($applicationFile);	

//  Database config
		exec("sudo chmod 777 $path/olympus/api/config/localConfig.js");
		$myfile = fopen("$path/olympus/master/config/localConfig.js", "w");
		fwrite($myfile, $dataBaseConfiguration);
		fclose($myfile);			

//  Append fileAdaptor Database config
		// $myfile = fopen("$path/olympus/master/config/localConfig.js", "a");
		// fwrite($myfile, $localConfigFileAdaptor);
		// fclose($myfile);			

//Update Config File 
		exec("sudo scp $path/olympus/master/config/config.js $path/olympus/master/config/config.ex.js");
		exec("sudo chmod 777 $path/olympus/master/config/config.js");

//  Database config
		$configFile = fopen("$path/olympus/master/config/config.js", "w");
		fwrite($configFile, $masterConfigFile);
		fclose($configFile);	

		$apiLocalConfig = "module.exports = {
								s3: {
    								API_KEY   : '".$selectedStorage['api_key']."', \n
    								API_SECRET: '".$selectedStorage['api_secret_key']."', \n
    								BUCKET    : '".$selectedStorage['bucket']."', \n
  								}, \n
								MYSQL: { \n
									HOST : '".$_SESSION['hostname']."', \n
                                    USER : '".$_SESSION['username']."', \n
    								PASS : '".$_SESSION['password']."', \n
    								DB   : '".$_SESSION['databaseName']."' \n
								}, \n
								receiver: '".$selectedStorage['storage']."' \n
							};\n";

		$filename = '$path/olympus/api/config/local.js';
		exec("sudo chmod 777 -R $path/olympus/api/config/");

//Update Local File at api
		if (file_exists($filename)) {
			exec("sudo scp $path/olympus/api/config/local.js $path/olympus/api/config/local.ex.js");
		}else{
			exec("echo >> '$path/olympus/api/config/local.js'");
		}

//  Local config
		exec("sudo chmod 777 $path/olympus/api/config/local.js");
		$apiLocal = fopen("$path/olympus/api/config/local.js", "w");
		// echo 'Writin api local.js<br>';
		// echo fwrite($apiLocal, $apiLocalConfig);
		fwrite($apiLocal, $apiLocalConfig);
		fclose($apiLocal);	
		header("Location:ssl.php");
		// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/ssl.php";
		// echo '<script>window.location.href="'.$url.'"</script>';

	}


	function sslConfiguration($files){

		$distribution_version 	=  exec("lsb_release -r | cut -f2"); 
		if($distribution_version == '12.04'){
			$path = "/var/www";
		}else if ($distribution_version == '14.04'){
			$path = "/var/www/html";
		}else{
			$path = "/var/www/html";
		}

		if($files['ssl_cert']['name']['0']!='') {
			foreach($files['ssl_cert']['name'] as $key => $val){
				if($files['ssl_cert']['name']['0'] != 'gd_bundle.crt'){
					$_SESSION['msg'] = "Please upload valid gd_bundle crt file.";
					header("Location:ssl.php");
					// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/ssl.php";
					// echo '<script>window.location.href="'.$url.'"</script>';
					return;
				}

				if($files['ssl_cert']['name']['1'] != 'olympus.crt'){
					$_SESSION['msg'] = "Please upload valid crt file.";
					header("Location:ssl.php");
					// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/ssl.php";
					// echo '<script>window.location.href="'.$url.'"</script>';
					return;
				}

				if($files['ssl_cert']['name']['2'] != 'olympus.key'){

					$_SESSION['msg'] = "Please upload valid olympus key file.";
					header("Location:ssl.php");
					// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/ssl.php";
					// echo '<script>window.location.href="'.$url.'"</script>';

					return;

				}

				$originalImagePath = "olympus/master/ssl/" ;
	            $orgImg            = $originalImagePath.basename($val);
	            $originalImg       = move_uploaded_file($files['ssl_cert']['tmp_name'][$key], $orgImg);
			}
		}



		/*Fix Redirect with meta refresh*/
		// exec("sudo chmod 755 -R /var/www/html/olympusdev123feb/olympus/index.html");
		// exec("sudo chmod 777 -R /var/www/html/olympusdev123feb/olympus/../index.html");
		// //Rename old file
		// exec("sudo mv /var/www/html/olympusdev123feb/olympus/../index.html /var/www/html/olympusdev123feb/olympus/../index_bkup.html");
		//Move olympus index to root
		// echo exec("sudo scp /var/www/html/olympusdev123feb/olympus/index.html /var/www/html/olympusdev123feb/index.html 2> error.txt");

		//read the entire string
		$str=file_get_contents("$path/index.html");
		//replace something in the file string
		//$str=str_replace("app.olympus.io", $_SESSION['serverName'], $str);
		$str=str_replace("app.olympus.io", $_SESSION['domain_name'], $str);//pick domain name instead ip
		//write the entire string
		file_put_contents("$path/index.html", $str);





		echo exec('$path/olympus/installer/lift_olympus.sh');
		header("Location:theme_setup.php");
		// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/theme_setup.php";
		// echo '<script>window.location.href="'.$url.'"</script>';

	}


	function launch(){
		
		$distribution_version 	=  exec("lsb_release -r | cut -f2"); 
		if($distribution_version == '12.04'){
			$path = "/var/www";
		}else if ($distribution_version == '14.04'){
			$path = "/var/www/html";
		}else{
			$path = "/var/www/html";
		}

		exec("sudo forever stopall");
		exec('$path/olympus/installer/lift_olympus.sh');	
		header("Location:".$_SESSION['serverName']);
		// echo "<script>window.location = 'https://"+$_SESSION['serverName']+"'</script>";
	}


	function themesetup($postData){
		
		$con = mysql_connect($_SESSION['hostname'], $_SESSION['username'], $_SESSION["password"]);
			// Check connection
		if($con === FALSE){

			$_SESSION['msg'] = "Unable to connect database.";
			header("Location:index.php");

		}else{
			error_reporting(0);//turn off any error if arising from line chmod() or copy() function
        	$logo=str_replace("uploads/", "", $postData['logoimg']);
			$db_selected = mysql_select_db($_SESSION['databaseName'], $con);
			$SQL_CREATE_TABLE="CREATE TABLE IF NOT EXISTS `theme` ( `id` int(11) NOT NULL AUTO_INCREMENT, `header_background` varchar(10) NOT NULL, `footer_background` varchar(10) NOT NULL,
				`body_background` varchar(10) NOT NULL,`navigation_color` varchar(10) NOT NULL, `font_family` varchar(100) NOT NULL, `font_color` varchar(10) NOT NULL,
				`createdAt` datetime DEFAULT NULL, `updatedAt` datetime DEFAULT NULL, `account_id` varchar(255) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;";
			$RESULT_CREATE_TABLE= mysql_query($SQL_CREATE_TABLE);
			
			if(mysql_num_rows(mysql_query("SHOW TABLES LIKE 'theme'"))!=1) {
                $_SESSION['msg'] =  "Table does not exist";
                header("Location:theme_setup.php");
			}
            
           	$logo=str_replace("uploads/", "", $postData['logoimg']);
           	$date=  date("Y-m-d H:i:s");
			$query="INSERT INTO theme SET header_background='#$postData[HeaderColor]',footer_background='#$postData[FooterColor]' ,body_background='#$postData[BodyColor]',navigation_color='#$postData[NavigationBarColor]',font_color='#$postData[FontColor]' ,font_family='$postData[FontFamily]',createdAt='$date',updatedAt='$date',account_id='1' ";
			
			if (mysql_query($query)) {
            	chmod ("installer/logo_crop/uploads/$logo", 0777);
                $source= 'logo_crop/uploads/'.$logo;
                $destination= '../master/public/images/enterprises/'.$logo;
                copy($source, $destination);
			}
            
            $query_logo="UPDATE account SET enterprise_fsname='$logo' WHERE isSuperAdmin='1'";
            $result_logo= mysql_query($query_logo);
                                
	        if($result_logo){
	//                                   
	            $files = glob('logo_crop/uploads/*'); // get all file names
	            foreach($files as $file){ // iterate files
	              if(is_file($file))
	                unlink($file); // delete file
	            }
	            
	            $files = glob('logo_crop/uploads/big/*'); // get all file names
	            foreach($files as $file){ // iterate files
	              if(is_file($file))
	                unlink($file); // delete file
	            }
	        }
	        
	        header("Location:preview.php");
			// $url = "http://".$_SESSION['serverName'] . $this->url_base . "/preview.php";
			// echo '<script>window.location.href="'.$url.'"</script>';
		}
	}

}
?>

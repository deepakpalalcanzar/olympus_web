<?php

// curl -i -X POST \
//    -H "Content-Type:application/json" \
//    -d \
// '{
//   "api_key":"3y6gp1hz9de7cgvkn7xqjb3285p8udf2",
//   "email":"meg@cloud411.com",
//   "password":"abc123"
// }' \
//  'https://dev1.olympus.io/authlogin'

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "https://nov.olympus.io/authlogin");
curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
curl_setopt($curl, CURLOPT_POST, TRUE);
curl_setopt($curl, CURLOPT_POSTFIELDS, '{"api_key":"3y6gp1hz9de7cgvkn7xqjb3285p8udf2","email":"rc11@olympus.io","password":"123456"}');
// curl_setopt($curl, CURLOPT_POSTFIELDS, array('api_key'=>'3y6gp1hz9de7cgvkn7xqjb3285p8udf2','email'=>'meg@cloud411.com','password'=>'abc123'));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
$result = curl_exec($curl);
curl_close($curl);
echo 'TEST';
echo $result;
$login_response = json_decode($result);//return amazone autocomplete suggestion

if(!empty($login_response) && isset($login_response->access_token)){
	echo ($login_response->access_token);
	// die('test');

	// curl -i -X POST \
	//    -H "Content-Type:text/plain" \
	//    -H "Authorization:Bearer 5bdJfwkgHXThp7N" \
	//    -d \
	// '{}' \
	//  'https://dev1.olympus.io/theme/getThemeConfiguration/5bdJfwkgHXThp7N'

	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, "https://nov.olympus.io/theme/getThemeConfiguration/".$login_response->access_token);
	curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: text/plain","Authorization:Bearer ".$login_response->access_token));
	curl_setopt($curl, CURLOPT_POST, TRUE);
	curl_setopt($curl, CURLOPT_POSTFIELDS, '{"api_key":"3y6gp1hz9de7cgvkn7xqjb3285p8udf2","email":"rc11@olympus.io","password":"123456"}');
	// curl_setopt($curl, CURLOPT_POSTFIELDS, array('api_key'=>'3y6gp1hz9de7cgvkn7xqjb3285p8udf2','email'=>'meg@cloud411.com','password'=>'abc123'));
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	$result_theme = curl_exec($curl);
	curl_close($curl);
	$theme_response = json_decode($result_theme);//return amazone autocomplete suggestion

	echo '<br><br>';
	echo $result_theme;
	echo "<pre>";
	echo "Checking Ubuntu Distribution:";
	$output = shell_exec('lsb_release -r | cut -f2');
	echo "$output";

	if(!empty($theme_response) && isset($theme_response->code) && ( $theme_response->code == 'ETIMEDOUT' || $theme_response->code == 'ECONNREFUSED') ){
		$path = "var/www/html";
		if($output == '12.04'){
			$path = "/var/www";
		}else if ($output == '14.04'){
			$path = "/var/www/html";
		}else{
			$path = "/var/www/html";
		}

		// echo "<br>-Stopping previous running forevers if any";
		// $output = shell_exec('sudo forever stopall');
		// echo "$output";
		// echo "<br>-Stopping app.js<br>";
		// $output = shell_exec('sudo pm2 stop app');
		// echo "$output";
		echo "<br>-Lifting app.js<br>";
		$output = shell_exec('cd '.$path.'/olympus/api/
			sudo pm2 restart app');
		echo "$output";

		echo "<br>-Lifting olympus.js<br>";
		$output = shell_exec('cd '.$path.'/olympus/master/
			sudo pm2 restart olympus');
		echo "$output";

		$output = shell_exec('sudo pm2 list');
		echo "$output</pre>";
	}

}


/*$query = urlencode('where={"steps":9243}');
$ch = curl_init('https://api.parse.com/1/classes/Steps?'.$query);

curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    array(
        'X-Parse-Application-Id: myApplicationID',
        'X-Parse-REST-API-Key: myRestAPIKey',
        'Content-Type: application/json'
    )
);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

curl_exec($ch);
curl_close($ch);*/
// echo "<pre>";
// echo "Checking Ubuntu Distribution:";
// $output = shell_exec('lsb_release -r | cut -f2');
// echo "$output";

// $path = "var/www/html";
// if($output == '12.04'){
// 	$path = "/var/www";
// }else if ($output == '14.04'){
// 	$path = "/var/www/html";
// }else{
// 	$path = "/var/www/html";
// }

// echo "<br>-Stopping previous running forevers if any";
// $output = shell_exec('sudo forever stopall');
// echo "$output";
// echo "<br>-Lifting app.js<br>";
// $output = shell_exec('cd '.$path.'/olympus/api/
// 	sudo forever start app.js');
// echo "$output";

// echo "<br>-Lifting olympus.js<br>";
// $output = shell_exec('cd '.$path.'/olympus/master/
// 	sudo forever start olympus.js');
// echo "$output";

// $output = shell_exec('sudo forever list');
// echo "$output</pre>"; ?>

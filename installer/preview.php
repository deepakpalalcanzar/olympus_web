<?php session_start(); ?>
<!DOCTYPE html>
<html>
	<?php include "header.php"; ?>
<body>

	<header>&nbsp;</header>
	<div class="container center_div">
		<div class="col-lg-12">&nbsp;</div>
		<div class="col-lg-12">&nbsp;</div>
		<img src="img/installer.png" alt="Olympus Installer" class="img img-responsive"/>
		<div class="col-lg-12">&nbsp;</div>
		<div class="col-lg-12">&nbsp;</div>		
	</div>

	<div class="container">
	  	<div class="row">
		  	<div class="login-template">
				<div class="login-box-head"> Login Credentials </div>
	<!-- form section -->
				<form id="databaseForm" method="post" action="post.php?action=database" class="login-box-body">
					<table>
						<tr>
							<th>  Email </th>
							<td>&nbsp;</td>
							<td><?php echo $_SESSION['login_email']; ?></td>
						</tr>

						<tr>
							<th>&nbsp;</th>
							<td>&nbsp;</td>
						</tr>
						
						<tr>
							<th>  Password </th>
							<td>&nbsp;</td>
							<td> <?php echo $_SESSION['login_password']; ?> </td>
						</tr>

						<tr>
							<th>&nbsp;</th>
							<td>&nbsp;</td>
						</tr>

						<tr>
							
							<th>  URL </th>
							<td>&nbsp;</td>
							<td> 
								<a href='<?php echo "https://".$_SESSION['domain_name'] ?>' target="_blank"> <?php echo "https://".$_SESSION['domain_name'] ?> </a>  
							</td>

						</tr>
					</table>
					<?php
						echo "<pre>";
						echo "Checking Ubuntu Distribution:";
						$output = shell_exec('lsb_release -r | cut -f2');
						echo "$output";

						$path = "var/www/html";
						if($output == '12.04'){
							$path = "/var/www";
						}else if ($output == '14.04'){
							$path = "/var/www/html";
						}else{
							$path = "/var/www/html";
						}

						echo "<br>-Stopping previous running forevers if any";
						$output = shell_exec('sudo forever stopall');
						echo "$output";
						echo "<br>-Lifting app.js<br>";
						$output = shell_exec('cd '.$path.'/olympus/api/
							sudo forever start app.js');
						echo "$output";

						echo "<br>-Lifting olympus.js<br>";
						$output = shell_exec('cd '.$path.'/olympus/master/
							sudo forever start olympus.js');
						echo "$output";

						$output = shell_exec('sudo forever list');
						echo "$output</pre>"; ?>
				</form>
	<!-- footer section -->
				 <div class="login-box-footer clearfix">
					<!--<a href='<?php //echo "https://".$_SESSION['serverName']."/post.php?action=launch" ?>' class="signinbutton">
						Jump to olympus 
					</a>-->
				</div> 
				
			</div>
	  	</div>
	</div>

	<div class="col-lg-12">&nbsp;</div>
	<div class="col-lg-12">&nbsp;</div>		


</body>
	<?php include "footer.php"; ?>
	<?php unset($_SESSION['msg']); ?>
</html>
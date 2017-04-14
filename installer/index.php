<?php  session_start(); ?>
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
				<div class="login-box-head">Database Configuration File</div>
	<!-- form section -->
				<form id="databaseForm" method="post" action="post.php?action=database" class="login-box-body">
					<div class="message">
						<?php 	
							if(isset($_SESSION['msg'])){
								echo "<p style='color:red;text-align:center;'>". $_SESSION['msg'] ."</p>";
							}
						?>
					</div>

					<label for="protocal">
						Configure Protocol: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Server protocol" data-content="If you have SSL certificate ready to upload use https other wise use http" style="cursor:pointer;">
					</label>

					<div class="radio">
				  		<label>
							<input <?php echo (isset($_SESSION['protocal']) && $_SESSION['protocal'] == '443')?'checked':''; ?> type="radio" name="protocal" value="443" style="padding-left:10px;padding-right:10px;"> HTTPS
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<input disabled="disabled" title="HTTP installer is not supported yet." <?php echo (isset($_SESSION['protocal']) && $_SESSION['protocal'] == '80')?'checked':''; ?> type="radio" name="protocal" value="80" style="padding-left:10px;padding-right:10px"> <span  title="HTTP installer is not supported yet.">HTTP</span>
					  	</label>
					</div>

					<label for="email">
						Application Server Hostname: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Application Server Hostname" data-content="IP address of hostname of the server hosting the Olympus application." style="cursor:pointer;">
					</label>
					<input type="text" class="login-input-field server-hostname" placeholder="Please enter your application server hostname" name="server_hostname" value="<?php echo isset($_SESSION['serverName'])?$_SESSION['serverName']:''; ?>">
					

					<label for="email">
						Application Server Domain Name: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Application Server Hostname" data-content="Domain name of hostname of the server hosting the Olympus application." style="cursor:pointer;">
					</label>
					<input type="text" class="login-input-field domain-hostname" placeholder="Please enter your application server domain name" name="domain_hostname" value="<?php echo isset($_SESSION['domain_name'])?$_SESSION['domain_name']:''; ?>">


					<label for="database_hostname">
						Database Server Hostname: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Database Server Hostname" data-content="This is the hostname or IP address of the server hosting the database. It can be the same as the application server hostname or different if your database is running on a separate server." style="cursor:pointer;">
					</label>
					<input type="text" class="login-input-field database-hostname" placeholder="Please enter your database server hostname" name="database_hostname" value="<?php echo isset($_SESSION['hostname'])?$_SESSION['hostname']:''; ?>">
					
					<label for="database_name">
						Database Name: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Database Name" data-content="This is the name for the Olympus database. Use olympus  as default." style="cursor:pointer;">
					</label>
					<input type="text" class="login-input-field database-name" placeholder="Please enter your database name" name="database_name" value="<?php echo isset($_SESSION['databaseName'])?$_SESSION['databaseName']:''; ?>">
					
					<label for="username">
						Database Username: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Database Username" data-content="Username to create and access the application database." style="cursor:pointer;">
					</label>
					<input type="text" class="login-input-field username" placeholder="Please neter your username" name="username" value="<?php echo isset($_SESSION['username'])?$_SESSION['username']:''; ?>">

					<label for="username">
						Database Password: 
						<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Database Password" data-content="Password used to create and access the application database." style="cursor:pointer;">
					</label>
					<input type="password" class="login-input-field password" placeholder="Confirm Password" name="password" value="<?php echo isset($_SESSION['password'])?$_SESSION['password']:''; ?>">
					
				</form>
	<!-- footer section -->
				<div class="login-box-footer clearfix">
					<a class="signinbutton">
						<input type="image" class="signin-button" src="img/next_btn.png">
					</a>
				</div>
			</div>
	  	</div>
	</div>

	<div class="col-lg-12">&nbsp;</div>
	<div class="col-lg-12">&nbsp;</div>		


</body>
	<?php include "footer.php"; ?>
	<script>
		$(document).ready(function(){

			$('.signin-button').click(function(){

				var serverHostname 	= $("input[name='server_hostname']").val();
				var domainHostname 	= $("input[name='domain_hostname']").val();
				var databaseName  	= $("input[name='database_name']").val();
				var databaseHostname= $("input[name='database_hostname']").val();
				var username 		= $("input[name='username']").val();
				var no_error		= true;

				regexip   = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
				regexdomainwithoutprotocol 	= /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/;
				regexdomaincrosscloud 		= /^(?!\-)(?:[a-zA-Z\d\-]{0,62}[a-zA-Z\d]\.){1,126}(?!\d+)[a-zA-Z\d]{1,63}$/;//to support amazon db hosts like: olympusdb.ccpnqglhw2ck.us-east-1.rds.amazonaws.com

				//revert all fields to have no red border
				$( ".login-input-field" ).css({'border': '1px solid #d7dbdc'});

				if (!$('input[name=protocal]:checked').val() ) {

					no_error = false;
					$( ".message" ).html( " <p style='color:red;text-align:center;'> No Protocol Selected. </p> " );
				}

				if(no_error && serverHostname.trim() === ''){

					no_error = false;
					$( ".server-hostname" ).css({'border': '1px solid red'});
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter server hostname. </p> " );
				}else if(no_error){//if not empty check if it is a valid IP address

					ipaddress = serverHostname.trim();

					if ((ipaddress == 'localhost') || regexip.test(ipaddress))  
					{  
						//valid IP address
					}else{
						no_error = false;
						$( ".server-hostname" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter the valid IP address of Host Server. </p> " );
					}
				}

				if(no_error && domainHostname.trim() === ''){

					no_error = false;
					$( ".domain-hostname" ).css({'border': '1px solid red'});
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter server hostname. </p> " );
				}else if(no_error){//if not empty check if it is a valid IP address OR domain name

					ipaddress = domainHostname.trim();

					if ((ipaddress == 'localhost') || regexdomaincrosscloud.test(ipaddress) || regexip.test(ipaddress))  
					{  
						//valid
					}else{
						no_error = false;
						$( ".domain-hostname" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter the valid IP address/Domain of Host Server. </p> " );
					}
				}

				if(no_error && databaseHostname.trim() === ''){

					no_error = false;
					$( ".database-hostname" ).css({'border': '1px solid red'});
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter database hostname. </p> " );
				}else if(no_error){//if not empty check if it is a valid IP address OR domain name

					ipaddress = databaseHostname.trim();

					if ((ipaddress == 'localhost') || regexdomaincrosscloud.test(ipaddress) || regexip.test(ipaddress))  
					{  
						//valid
					}else{
						no_error = false;
						$( ".database-hostname" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter the valid IP address of Host Server. </p> " );
					}
				}

				if(no_error && databaseName.trim() === ''){

					no_error = false;
					$( ".database-name" ).css({'border': '1px solid red'});
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter name of your database. </p> " );
				}

				if(no_error && username.trim() === ''){

					no_error = false;
					$( ".username" ).css({'border': '1px solid red'});
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter your database username </p> " );
				}

				if(no_error){
					$("#databaseForm").submit();
				}else{
					$('html,body').animate({
				        scrollTop: $(".message").offset().top
				    },'fast');
					return false;
				}
			});
		});
		
		$(function () {
  			$('[data-toggle="popover"]').popover()
		});

	</script>
<?php unset($_SESSION['msg']); ?>
</html>
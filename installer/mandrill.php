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
				<div class="login-box-head"> Email Configuration File </div>
<!-- form section -->
				<form id="mandrillForm" method="post" action="post.php?action=mandrill" class="login-box-body">
					<div class="message">
						<?php 	
							if(isset($_SESSION['msg'])){
								echo "<p style='color:red;text-align:center;'>". $_SESSION['msg'] ."</p>";
							}
						?>
					</div>
					<div>
						<span>
							<input type="radio" name="mail_service" value="mandrill" <?php echo (isset($_SESSION['mail_service']) && $_SESSION['mail_service'] != 'internal')?'checked':''; ?> /> Use Mandrill
						</span>
						<span>
							<input type="radio" name="mail_service" value="internal" <?php echo (isset($_SESSION['mail_service']) && $_SESSION['mail_service'] == 'internal')?'checked':''; ?>/> Use Internal Email Setup
						</span>
					</div><br>
					<div id="mandrill_details" style="<?php echo (isset($_SESSION['mail_service']) && $_SESSION['mail_service'] == 'internal')?'display:none;':''; ?>" >
						<label for=""> Mandrill Api Key: 
							<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Mandrill Api Key" data-content="Olympus uses Mandrill for email operations to send email notifications. If you do not already have a key go to www.mandrill.com for your free account." style="cursor:pointer;">
						</label>
						<input type="text" class="login-input-field mandrill-key" placeholder="" value="<?php echo isset($_SESSION['mandrill_api_key'])?$_SESSION['mandrill_api_key']:''; ?>" name="mandrill_key">
					</div>
					<div id="inernal_email_details"  style="<?php echo (isset($_SESSION['mail_service']) && $_SESSION['mail_service'] == 'internal')?'':'display:none;'; ?>">
						<label for=""> SMTP Server(Host) :
							<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="SMTP Server Host Name" data-content="Enter SMTP Outgoing server host name here such as smtp.gmail.com" style="cursor:pointer;">
						</label>
						<input type="text" class="login-input-field smtp-host" placeholder="" value="<?php echo isset($_SESSION['smtp_host'])?$_SESSION['smtp_host']:''; ?>" name="smtp_host">
						<label for=""> Port :
							<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="SMTP Port" data-content="SMTP Port to be used such as SSL Port 465 is recommended for smtp.gmail.com." style="cursor:pointer;">
						</label>
						<input type="text" class="login-input-field smtp-port" placeholder="" value="<?php echo isset($_SESSION['smtp_port'])?$_SESSION['smtp_port']:''; ?>" name="smtp_port">
						<label for=""> Username :
							<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Username" data-content="Username for the SMTP account." style="cursor:pointer;">
						</label>
						<input type="text" class="login-input-field smtp-user" placeholder="" value="<?php echo isset($_SESSION['smtp_user'])?$_SESSION['smtp_user']:''; ?>" name="smtp_user">
						<label for=""> Password :
							<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Password" data-content="Password for the SMTP account." style="cursor:pointer;">
						</label>
						<input type="password" class="login-input-field smtp-pass" placeholder="" value="<?php echo isset($_SESSION['smtp_pass'])?$_SESSION['smtp_pass']:''; ?>" name="smtp_pass">
					</div>
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

			//console.log($("input[name='mail_service']:checked").val());
			change_mail_service();

			$('input[name="mail_service"]').on('change', function(){
				change_mail_service();
			});

			$('.signin-button').click(function(){

				var no_error = true;

				regexip   = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
				regexdomainwithoutprotocol = /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/;

				//revert all fields to have no red border
				$( ".login-input-field" ).css({'border': '1px solid #d7dbdc'});

				if( $('input[name="mail_service"]:checked').val() == 'mandrill' ){
					var mandrillKey = $("input[name='mandrill_key']").val();
					if(mandrillKey.trim() === ''){
						$( ".mandrill-key" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter your mandrill api key. </p> " );
						no_error = false;
					}
				}else{
					var smtpHost = $("input[name='smtp_host']").val();
					var smtpPort = $("input[name='smtp_port']").val();
					var smtpUser = $("input[name='smtp_user']").val();
					var smtpPass = $("input[name='smtp_pass']").val();

					if(smtpHost.trim() === ''){
						$( ".smtp-host" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter Smtp details. </p> " );
						no_error = false;
					}else if(no_error){//if not empty check if it is a valid IP address OR domain name

						ipaddress = smtpHost.trim();

						if (regexdomainwithoutprotocol.test(ipaddress) || regexip.test(ipaddress))  
						{  
							//valid
						}else{
							no_error = false;
							$( ".smtp-host" ).css({'border': '1px solid red'});
							$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter the valid IP address/Domain of Host Server. </p> " );
						}
					}

					if(no_error && ( smtpPort.trim() === '') || isNaN( smtpPort.trim() ) ){
						$( ".smtp-port" ).css({'border': '1px solid red'});
						if(no_error){
							if(smtpPort.trim() === ''){
								$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter Smtp details. </p> " );
							}else if(isNaN( smtpPort.trim() )) {
								$( ".message" ).html( " <p style='color:red;text-align:center;'> SMTP port should be a number. </p> " );
							}
							no_error = false;
						}
					}
					if(no_error && smtpUser.trim() === ''){
						$( ".smtp-user" ).css({'border': '1px solid red'});
						if(no_error){
							$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter Smtp details. </p> " );
							no_error = false;
						}
					}
					if(no_error && smtpPass.trim() === ''){
						$( ".smtp-pass" ).css({'border': '1px solid red'});
						if(no_error){
							$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter Smtp details. </p> " );
							no_error = false;
						}
					}
				}

				if(no_error){
					$("#mandrillForm").submit();
				}else{
					$('html,body').animate({
				        scrollTop: $(".message").offset().top
				    },'fast');
					return false;
				}
			});
		});

		function change_mail_service(){
			console.log($('input[name="mail_service"]:checked').val());
			if( $('input[name="mail_service"]:checked').val() == 'mandrill' ){
				$('#mandrill_details').show();
				$('#inernal_email_details').hide();
			}else{
				$('#mandrill_details').hide();
				$('#inernal_email_details').show();
			}
		}

		$(function () {
  			$('[data-toggle="popover"]').popover()
		});

	</script>
<?php unset($_SESSION['msg']); ?>
</html>
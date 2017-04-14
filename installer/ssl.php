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
				<div class="login-box-head"> SSL Configuration File </div>
<!-- form section -->
				<form id="sslForm" method="post" action="post.php?action=ssl" class="login-box-body" enctype="multipart/form-data">
					<div class="message">
						<?php 	
							if(isset($_SESSION['msg'])){
								echo "<p style='color:red;text-align:center;'>". $_SESSION['msg'] ."</p>";
							}
						?>
					</div>

					<p style="color:#848484;"><small><i>Please rename your security credentials as noted in the directions below for uploading into the application</i></small></p>
					
					<label for=""> GD Bundle crt: </label>
					<input type="file" class="login-input-field ssl-files" placeholder="" value="" name="ssl_cert[]">
					<p style="margin-top:-20px"><small><i>Upload your gd bundle crt file as <strong>gd_bundle.crt</strong></i></small></p>

					<label for=""> Olympus crt: </label>
					<input type="file" class="login-input-field ssl-files" placeholder="" value="" name="ssl_cert[]">
					<p style="margin-top:-20px"><small><i>Upload your olympus crt file as <strong>olympus.crt</strong></i></small></p>

					<label for=""> Olympus Key: </label>
					<input type="file" class="login-input-field ssl-files" placeholder="" value="" name="ssl_cert[]">
					<p style="margin-top:-20px"><small><i>Upload your olympus key file as <strong>olympus.key</strong></i></small></p>

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
/*				var mandrillKey 		= $("input[name='mandrill_key']").val();
				if(mandrillKey.trim() === ''){
					$( ".mandrill-key" ).css({'border': '1px solid red'});
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter your mandrill api key. </p> " );
					return false;					
				}
*/				$("#sslForm").submit();
			});
		});

	</script>
<?php unset($_SESSION['msg']); ?>
</html>
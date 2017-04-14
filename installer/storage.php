<?php ?>
<?php  session_start(); ?>
<!DOCTYPE html>
<html>
	<?php include "header.php"; ?>
<body>

	<header>&nbsp;</header>
	<style>
	.error{
		border: 1px solid red !important;
	}
	</style>
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
				<div class="login-box-head"> Storage Adapter Configuration </div>
	<!-- form section -->
				<form id="databaseForm" method="post" action="post.php?action=storage" class="login-box-body">
					<div class="message">
						<?php 	
							if(isset($_SESSION['msg'])){
								echo "<p style='color:red;text-align:center;'>". $_SESSION['msg'] ."</p>";
							}
						?>
					</div>

					<div class="radio">
				  		<label>
					    	<input type="radio" name="storage" <?php echo (isset($_SESSION['storage']) && $_SESSION['storage'] == 'S3' ) ? 'checked="checked"' : ''; ?> value="S3"> Amazon S3
					  	</label>
					</div>
					
					<div class="radio" style="display:none;">
						<label>
					    	<input type="radio" name="storage" <?php echo (isset($_SESSION['storage']) && $_SESSION['storage'] == 'swift' ) ? 'checked="checked"' : ''; ?> value="swift"> Swift
					  	</label>
					</div>

					<div class="radio">
						<label>
					    	<input type="radio" name="storage" <?php echo (isset($_SESSION['storage']) && $_SESSION['storage'] == 'Ormuco' ) ? 'checked="checked"' : ''; ?> value="Ormuco"> Ormuco Object Storage
					  	</label>
					</div>

					<div class="radio">
						<label>
					    	<input type="radio" name="storage" <?php echo !isset($_SESSION['storage']) || ( isset($_SESSION['storage']) && !in_array($_SESSION['storage'], array('S3', 'swift', 'Ormuco')) ) ? 'checked="checked"' : ''; ?> value="Disk"> Disk
					  	</label>
					</div>

					<div style="<?php echo (isset($_SESSION['storage']) && $_SESSION['storage'] == 'S3' ) ? '' : 'display:none'; ?>" id="s3Detail">

						<hr style="border:2px solid #CCC;">
						<div class="login-box-head">
							Amazon S3 Credentials <?php print_r($__SESSION); ?>
							<img src="img/help.png" tabindex="0" data-toggle="popover" data-html="true" data-trigger="hover" data-original-title="Amazon S3 Credentials" data-content="Please create the bucket and region in your amazon web services portal. After your bucket has been created enter the credentials here." style="cursor:pointer;">
						</div>
						<label for="api_key"> Access Key: </label>
						<input type="text" class="login-input-field api_key <?php echo $_SESSION['storage'] == 'S3' && ( !$_SESSION['S3']['api_key'] || trim( $_SESSION['S3']['api_key'] ) == '' )?'error':''; ?>" placeholder="Please enter your access key" name="api_key" value="<?php echo $_SESSION['storage'] == 'S3' && isset($_SESSION['S3']['api_key'])?$_SESSION['S3']['api_key']:''; ?>">
						
						<label for="api_secret_key"> Access Secret Key: </label>
						<input type="text" class="login-input-field api_secret_key <?php echo $_SESSION['storage'] == 'S3' && ( !$_SESSION['S3']['api_secret_key'] || trim( $_SESSION['S3']['api_secret_key'] ) == '' )?'error':''; ?>" placeholder="Please enter your access secret key" name="api_secret_key" value="<?php echo $_SESSION['storage'] == 'S3' && isset($_SESSION['S3']['api_secret_key'])?$_SESSION['S3']['api_secret_key']:''; ?>">
						
						<label for="bucket"> Bucket: </label>
						<input type="text" class="login-input-field bucket <?php echo $_SESSION['storage'] == 'S3' && ( !$_SESSION['S3']['bucket'] || trim( $_SESSION['S3']['bucket'] ) == '' )?'error':''; ?>" placeholder="Please enter your bucket name" name="bucket" value="<?php echo $_SESSION['storage'] == 'S3' && isset($_SESSION['S3']['bucket'])?$_SESSION['S3']['bucket']:''; ?>">
						
						<label for="region"> Region: </label>
						<input type="text" class="login-input-field region <?php echo $_SESSION['storage'] == 'S3' && ( !$_SESSION['S3']['region'] || trim( $_SESSION['S3']['region'] ) == '' )?'not_required':''; ?>" placeholder="Please enter your region name. (such as 'US_EAST_1' OR 'EU_WEST_1' OR 'AP_NORTHEAST_1' etc. )" name="region" value="<?php echo $_SESSION['storage'] == 'S3' && isset($_SESSION['S3']['region'])?$_SESSION['S3']['region']:''; ?>">

					</div>

					<div style="<?php echo (isset($_SESSION['storage']) && $_SESSION['storage'] == 'swift' ) ? '' : 'display:none'; ?>" id="swiftDetail">

						<hr style="border:2px solid #CCC;">
						<div class="login-box-head">Swift Credentials</div>
						<label for="host"> Swift Host: </label>
						<input type="text" class="login-input-field host <?php echo $_SESSION['storage'] == 'swift' && ( !$_SESSION['swift']['host'] || trim( $_SESSION['swift']['host'] ) == '' )?'error':''; ?>" placeholder="Please enter your login email" name="host" value="<?php echo isset($_SESSION['swift']['host'])?$_SESSION['swift']['host']:''; ?>">
						
						<label for="port"> Swift Port: </label>
						<input type="text" class="login-input-field port <?php echo $_SESSION['storage'] == 'swift' && ( !$_SESSION['swift']['port'] || trim( $_SESSION['swift']['port'] ) == '' )?'error':''; ?>" placeholder="Confirm email" name="port" value="<?php echo isset($_SESSION['swift']['port'])?$_SESSION['swift']['port']:''; ?>">
						
						<label for="serviceHash"> Swift Hash: </label>
						<input type="text" class="login-input-field serviceHash <?php echo $_SESSION['storage'] == 'swift' && ( !$_SESSION['swift']['serviceHash'] || trim( $_SESSION['swift']['serviceHash'] ) == '' )?'error':''; ?>" placeholder="Please enter your login password" name="serviceHash" value="<?php echo isset($_SESSION['swift']['serviceHash'])?$_SESSION['swift']['serviceHash']:''; ?>">
						
						<label for="container"> Swift Container: </label>
						<input type="text" class="login-input-field container <?php echo $_SESSION['swift'] == 'swift' && ( !$_SESSION['swift']['container'] || trim( $_SESSION['swift']['container'] ) == '' )?'error':''; ?>" placeholder="Please enter your username" name="container" value="<?php echo isset($_SESSION['swift']['container'])?$_SESSION['swift']['container']:''; ?>">
					</div>

					<div style="<?php echo (isset($_SESSION['storage']) && $_SESSION['storage'] == 'Ormuco' ) ? '' : 'display:none'; ?>" id="ormucoDetail">

						<hr style="border:2px solid #CCC;">
						<div class="login-box-head">Ormuco Credentials: </div>
						<label for="ormuco_user"> Ormuco Username: </label>
						<input type="text" class="login-input-field ormuco_user <?php echo $_SESSION['storage'] == 'Ormuco' && ( !$_SESSION['Ormuco']['ormuco_user'] || trim( $_SESSION['Ormuco']['ormuco_user'] ) == '' )?'error':''; ?>" placeholder="Please enter your Ormuco Username." name="ormuco_user" value="<?php echo isset($_SESSION['Ormuco']['ormuco_user'])?$_SESSION['Ormuco']['ormuco_user']:''; ?>">
						
						<!-- <label for="database_name"> Swift Port: </label>
						<input type="text" class="login-input-field database-name <?php echo $_SESSION['storage'] == 'Ormuco' && ( !$_SESSION['Ormuco']['ormuco_user'] || trim( $_SESSION['Ormuco']['ormuco_user'] ) == '' )?'error':''; ?>" placeholder="Confirm email" name="port" value="<?php echo isset($_SESSION['Ormuco']['port'])?$_SESSION['Ormuco']['port']:''; ?>"> -->
						
						<label for="ormuco_pass"> Ormuco Password: </label>
						<input type="text" class="login-input-field ormuco_pass <?php echo $_SESSION['storage'] == 'Ormuco' && ( !$_SESSION['Ormuco']['ormuco_pass'] || trim( $_SESSION['Ormuco']['ormuco_pass'] ) == '' )?'error':''; ?>" placeholder="Please enter your Ormuco password" name="ormuco_pass" value="<?php echo isset($_SESSION['Ormuco']['ormuco_pass'])?$_SESSION['Ormuco']['ormuco_pass']:''; ?>">
						
						<label for="ormuco_container"> Ormuco Container: </label>
						<input type="text" class="login-input-field ormuco_container <?php echo $_SESSION['storage'] == 'Ormuco' && ( !$_SESSION['Ormuco']['ormuco_container'] || trim( $_SESSION['Ormuco']['ormuco_container'] ) == '' )?'error':''; ?>" placeholder="Please enter the container name" name="ormuco_container" value="<?php echo isset($_SESSION['Ormuco']['ormuco_container'])?$_SESSION['Ormuco']['ormuco_container']:''; ?>">
					</div>

					<div style="display:none" id="diskInfo">

						<hr style="border:2px solid #CCC;">
						<div class="login-box-head">Disk Path</div>
						<input type="file" id="fileURL" webkitdirectory directory multiple/>

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

			$(document).on('change', 'input[name="storage"]:radio', function(){
    			var selectedButton = $(this).val();
    			if(selectedButton === 'S3'){
    				document.getElementById('s3Detail').style.display = "block";
    				document.getElementById('swiftDetail').style.display = "none";
    				document.getElementById('ormucoDetail').style.display = "none";
    			}

    			if(selectedButton === 'swift'){
    				document.getElementById('s3Detail').style.display = "none";
    				document.getElementById('swiftDetail').style.display = "block";
    				document.getElementById('ormucoDetail').style.display = "none";
    			}

    			if(selectedButton === 'Ormuco'){
    				document.getElementById('s3Detail').style.display = "none";
    				document.getElementById('swiftDetail').style.display = "none";
    				document.getElementById('ormucoDetail').style.display = "block";
    			}

    			if(selectedButton === 'Disk'){
    				document.getElementById('s3Detail').style.display = "none";
    				document.getElementById('swiftDetail').style.display = "none";
    				document.getElementById('ormucoDetail').style.display = "none";
    			}
			});


			$('.signin-button').click(function(){
				// $("#databaseForm").submit();

				//Amazon S3
				var api_key 			= $("input[name='api_key']").val();
				var api_secret_key 		= $("input[name='api_secret_key']").val();
				var bucket  			= $("input[name='bucket']").val();
				var region 				= $("input[name='region']").val();

				//Swift
				var host 				= $("input[name='host']").val();
				var port 				= $("input[name='port']").val();
				var serviceHash 		= $("input[name='serviceHash']").val();
				var container 			= $("input[name='container']").val();

				//Ormuco
				var ormuco_user 		= $("input[name='ormuco_user']").val();
				var ormuco_pass 		= $("input[name='ormuco_pass']").val();
				var ormuco_container 	= $("input[name='ormuco_container']").val();

				var no_error		= true;

				regexip   = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
				regexdomainwithoutprotocol = /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/;

				//revert all fields to have no red border
				$( ".login-input-field" ).css({'border': '1px solid #d7dbdc'});

				if( $('input[name="storage"]:checked').val() == 'S3' ){

					if(no_error && api_key.trim() === ''){

						no_error = false;
						$( ".api_key" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter S3 Access key. </p> " );
					}
					if(no_error && api_secret_key.trim() === ''){

						no_error = false;
						$( ".api_secret_key" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter S3 Access Secret key. </p> " );
					}
					if(no_error && bucket.trim() === ''){

						no_error = false;
						$( ".bucket" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter the bucket name. </p> " );
					}

				}else if( $('input[name="storage"]:checked').val() == 'swift' ){

				}else if( $('input[name="storage"]:checked').val() == 'Ormuco' ){

					if(no_error && ormuco_user.trim() === ''){

						no_error = false;
						$( ".ormuco_user" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter Ormuco username/email. </p> " );
					}
					if(no_error && ormuco_pass.trim() === ''){

						no_error = false;
						$( ".ormuco_pass" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter Ormuco password. </p> " );
					}
					if(no_error && ormuco_container.trim() === ''){

						no_error = false;
						$( ".ormuco_container" ).css({'border': '1px solid red'});
						$( ".message" ).html( " <p style='color:red;text-align:center;'> Please enter the name of container. </p> " );
					}
				}else if( $('input[name="storage"]:checked').val() == 'Disk' ){

				}else{
					no_error = false;
					$( ".message" ).html( " <p style='color:red;text-align:center;'> Please select a storage adapter. </p> " );
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

			$(function () {
				$('[data-toggle="popover"]').popover()
			});
		});

		(function(){
            var files, 
                file, 
                extension,
                input = document.getElementById("fileURL"); 
                // output = document.getElementById("fileOutput");
            
            input.addEventListener("change", function(e) {
            	// alert(e);
            	console.log(document.getElementById("fileURL").value);
            	console.log($('input[type=file]').path);
                // files = e.target.files;
                // output.innerHTML = "";
                
                // for (var i = 0, len = files.length; i < len; i++) {
                //     file = files[i];
                //     extension = file.name.split(".").pop();
                //     output.innerHTML += "<li class='type-" + extension + "'>" + file.name + "</li>";
                // }
            }, false);
		})();

	</script>
<?php unset($_SESSION['msg']); ?>
</html>
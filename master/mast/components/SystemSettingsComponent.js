Mast.components.SystemSettingsComponent  = Mast.Component.extend({

	template: '.system-settings-template',
	outlet: '#content',
	events: {
		// 'click .setting-save-button' : 'saveCompanyInfo',
		'click #saveDomain' 					: 'saveDomainInfo',
		'click #saveDatabase' 					: 'saveDatabase',
		'click #uploadSSL' 						: 'uploadSSL',
		'click #saveAdapter'					: 'saveAdapterInfo',
		//ldap
		'change input[name="service_type"]' 	: 'toggleLdapSettings',
		'change input[name="adapter_type"]' 	: 'toggleAdapter',
		'click #saveldapsettings' 				: 'saveLdapSettings',
		'click #testldapsettings' 				: 'testLdapSettings',
		// 'click input[name="mail_service"]' 		: 'toggleMailService',
		'change input[name="mail_service"]' 	: 'toggleMailService',
		'click #saveEmail'  					: 'saveEmailInfo',
		'change input[name="trash_setting"]' 	: 'toggleTrashSetting',
		'click #saveTrashSetting' 				: 'saveTrashSetting',
		'change input[name="disk_path"]' 		: 'checkdiskpath',
		//Database export
		'click #db_export_setting'  			: 'toggleDatabaseExportDetails',
		'click #export_db_test' 				: 'testDatabaseExportDetails',
		'click #export_db_save' 				: 'saveDatabaseExportDetails',
		'click #import_db' 						: 'importDatabase',
		'click #export_db'		  				: 'exportDatabase',
		//CIFS share
		'click #mount_cifs'						: 'toggleCIFSshare',
		'click #cifsmount'						: 'CIFSmount',
		'click #cifsunmount'					: 'CIFSunmount',
		'click .restart-server'					: 'restartServer',
		//google Drive
		'click #gdrive_setting' 				: 'toggleGoogleDriveSettings',
		'click #drive_secret_file' 				: 'resetFileInput',
		'change #drive_secret_file'				: 'fillUptheSecrets',
		'click #saveDrive'						: 'uploadGoogleDriveSecret',
		//dropbox
		'click #dropbox_setting' 				: 'toggleDropboxSettings',
		'click #saveDropbox'					: 'saveDropbox',
		//box
		'click #box_setting' 					: 'toggleBoxSettings',
		'click #saveBox'						: 'saveBox',
		//other
		'click #saveOtherSettings' 				: 'saveOtherSettings',
		'click .update-code'					: 'updateCode',
		'click #checkforupdates' : 'checkForUpdates',
	},

	// saveCompanyInfo : function(){
	// 	alert("aaaaaaaaaaaaaaa");
	// }

	checkdiskpath: function(){
		console.log($('input[name="disk_adapter_path"]').val());
	},

	toggleAdapter : function(){
		console.log($('input[name="adapter_type"]:checked').val());
		var adapter = $('input[name="adapter_type"]:checked').val();

		$('.adapter_details').hide();
		switch(adapter){
			case 'S3':
				$('#S3_adapter_details').show();
				break;
			case 'Ormuco':
				$('#Ormuco_adapter_details').show();
				break;
			default://Disk
				$('#Disk_adapter_details').show();
		}
	},

	toggleMailService : function(){
		console.log($('input[name="mail_service"]:checked').val());
		if( $('input[name="mail_service"]:checked').val() == 'mandrill' ){
			$('#mandrill_details').show();
			$('#inernal_email_details').hide();
		}else{
			$('#mandrill_details').hide();
			$('#inernal_email_details').show();
		}
	},

	toggleLdapSettings : function(){
		console.log($('input[name="service_type"]:checked').val());
		if( $('input[name="service_type"]:checked').val() == '1' ){
			$('#ldap_details').show();
			$('#ad_details').hide();
		}else{
			$('#ldap_details').hide();
			$('#ad_details').show();
		}
	},

	toggleGoogleDriveSettings : function(){
		console.log($('input[name="gdrive_setting"]:checked').val());
		if( $('input[name="gdrive_setting"]:checked').val() == 'enabled' ){
			$('#google_drive_details').show();
		}else{
			$('#google_drive_details').hide();
		}
	},
	toggleDropboxSettings : function(){
		console.log($('input[name="dropbox_setting"]:checked').val());
		if( $('input[name="dropbox_setting"]:checked').val() == 'enabled' ){
			$('#dropbox_details').show();
		}else{
			$('#dropbox_details').hide();
		}
	},
	toggleBoxSettings : function(){
		console.log($('input[name="box_setting"]:checked').val());
		if( $('input[name="box_setting"]:checked').val() == 'enabled' ){
			$('#box_details').show();
		}else{
			$('#box_details').hide();
		}
	},
	toggleTrashSetting : function(){
		console.log($('input[name="trash_setting"]:checked').val());
		if( $('input[name="trash_setting"]:checked').val() == 'auto' ){
			$('#trash_auto_setting').show();
		}else{
			$('#trash_auto_setting').hide();
		}
	},
	uploadSSL : function(){
		//console.log($('#ssl_gd').prop('files')[0]);
		//alert('hi'+$('#ssl_gd').prop('files')[0]);

		if(!$('#ssl_gd').prop('files')[0])
		{
			alert('Select GD Bundle Crt file');
		}
		else if($('#ssl_gd').prop('files')[0].name != 'gd_bundle.crt')
		{
			alert('GD Bundle File Crt is invalid');
		}
		else if(!$('#ssl_olympus').prop('files')[0])
		{
			alert('Select Olympus Crt file');
		}
		else if($('#ssl_olympus').prop('files')[0].name != 'olympus.crt')
		{
			alert('Olympus Crt File is invalid');
		}
		else if(!$('#ssl_key').prop('files')[0])
		{
			alert('Select Olympus Key file');
		}
		else if($('#ssl_key').prop('files')[0].name != 'olympus.key')
		{
			alert('Olympus Key file is invalid');
		}
		else
		{
			var reader = new FileReader();
			var fileData;

			reader.onload = function(e) {
		    	Mast.Socket.request('/account/uploadSSL', {
					'formaction'		: 'uploadSSL',
					'uploadfile'		: 'uploadSSLGD',
					'ssl_gd'     : reader.result

				} , function(res, err){
					 if(err) alert(err);
					 else
					 {
					 	var reader1 = new FileReader();
						var fileData1;
						 reader1.onload = function(e) {
					    	Mast.Socket.request('/account/uploadSSL', {
								'formaction'		: 'uploadSSL',
								'uploadfile'		: 'uploadSSLOLYMPUS',
								'ssl_olympus'     : reader1.result

							} , function(res, err){
								 if(err) alert(err);
								 else
								 {
								 	var reader2 = new FileReader();
									var fileData2;

									 reader2.onload = function(e) {
									 	//console.log(reader2);
								    	Mast.Socket.request('/account/uploadSSL', {
											'formaction'		: 'uploadSSL',
											'uploadfile'		: 'uploadSSLKEY',
											'ssl_key'     : reader2.result

										} , function(res, err){
											 if(err) alert(err);
											 else
											 {
											 	alert('Successfully Uploaded');
											 }



								        });
								    }

								    reader2.readAsDataURL($('#ssl_key').prop('files')[0]);
								 }



					        });
					    }

					    reader1.readAsDataURL($('#ssl_olympus').prop('files')[0]);
					 }


		        });
		    }

		    reader.readAsDataURL($('#ssl_gd').prop('files')[0]);



		}






	},

	saveDatabase : function(){
		//console.log('hi');
		//alert('hi');
		$('.database-mod .test-loader').css('display','inline-block');
		Mast.Socket.request('/account/checkDatabase', {
				'formaction'		: 'checkDatabase',
				'host'     : $('#database_host').val(),
				'user'     : $('#database_user').val(),
				'password' : $('#database_pass').val(),
				'database' : $('#database_name').val()

			} , function(res, err){
				$('.database-mod .test-loader').css('display','none');
				 console.log(res);
				 if(err) alert(err);
				 //else
				 // $('#saveDatabase').hide();
				 if(res.error)
				 	alert('Connection Not ready. Error : '+res.error);
				 else if(res == 200)
				 {
				 	alert('Database Settings Successfully changed');
				 	//$('#saveDatabase').show();
				 }
				 else
				 	alert('Some Error');
				// if((typeof res.status != 'undefined') && res.status == 'ok'){
				// 	$('#adapter_type').html($('#adapter_type').val());
				// 	alert('Ldap/AD Settings Updated.')
				// }else if(typeof res.error != 'undefined'){
				// 	alert(res.error);
				// }else{
				// 	alert('Some error occurred.');
				// }
	        });



	},
	toggleCIFSshare : function(){
		var mount_enabled 		= $('input[name="mount_cifs"]').is(':checked');
		if( mount_enabled ){
			$('#cifs_details').show();
		}else{
			$('#cifs_details').hide();
		}
	},
	CIFSmount : function(){
		var mount_enabled 		= $('input[name="mount_cifs"]').is(':checked');
		var mountpoint 			= $("input[name='mountpoint']").val();
		var mount_username 		= $("input[name='mount_username']").val();
		var mount_password 		= $("input[name='mount_password']").val();
		Mast.Socket.request('/account/testCIFSmount', {
			'formaction'	: 'mount',
			// 'adapter_type': adapter_type,
			'mount_enabled': mount_enabled,
			'mountpoint': mountpoint,
			'mount_username': mount_username,
			'mount_password': mount_password
		} , function(res, err){
			console.log(res);
			if( (typeof res.status != 'undefined') ){
				if( res.status == 'ok'){
					alert('Device Mounted successfully.');
				}else if (res.status == 'mounterror'){
					alert(res.message);
				}else{
					alert(' Operation now in progress.');
				}
			}else if(typeof res.error != 'undefined'){
				alert(res.error);
			}else{
				alert('Some error occurred.');
			}
        });
	},
	CIFSunmount : function(){
		var mount_enabled 		= $('input[name="mount_cifs"]').is(':checked');
		var mountpoint 			= $("input[name='mountpoint']").val();
		var mount_username 		= $("input[name='mount_username']").val();
		var mount_password 		= $("input[name='mount_password']").val();
		Mast.Socket.request('/account/testCIFSmount', {
			'formaction'	: 'unmount',
			// 'adapter_type': adapter_type,
			'mount_enabled': mount_enabled,
			'mountpoint': mountpoint,
			'mount_username': mount_username,
			'mount_password': mount_password
		} , function(res, err){
			console.log(res);
			if( (typeof res.status != 'undefined') ){
				if( res.status == 'ok'){
					alert('Device Unmounted successfully.');
				}else if (res.status == 'mountexist'){
					alert('Device Already Mounted.');
				}
			}else if(typeof res.error != 'undefined'){
				alert(res.error);
			}else{
				alert('Some error occurred.');
			}
        });
	},

	saveDomainInfo : function(){

		//Regex for domain without any protocol(http:// or https://)
		var patt = new RegExp(/^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i);
		// var is_valid_domain = patt.test($('#domainname').val());
		
		if( ( $('#domainname').val() == 'localhost' ) || patt.test($('#domainname').val()) ){

			if(confirm('Olympus configuration will be mapped to given domain. You will be required to restart server after the process. Are you sure you want to continue?')){
				Mast.Socket.request('/account/changeDomainname', {
					'formaction'	: 'save_domain_info',
					'newdomain' 	: $('#domainname').val(),
				} , function(res, err){
					// console.log(res);
					if((typeof res.status != 'undefined') && res.status == 'ok'){
						$('#domaininfo').html($('#domainname').val());
						alert('Saved. Now restart server.');
					}else if(typeof res.error != 'undefined'){
						alert(res.error);
					}else{
						alert('Some error occurred.');
					}
		        });
		    }
	    }else{
	    	alert('Domain should be like www.domain.com or \'localhost\'.');
	    }
	},
	restartServer: function(){
		if(confirm('Are you sure you want to restart the olympus server?')){
			console.log('sending request to restart the server.');
			Mast.Socket.request('/account/restartServer', {
				'formaction'		: 'restart-server'
			} , function(res, err){
				// console.log(res);
				if( (typeof res.status != 'undefined') ){
					if( res.status == 'ok'){
						//Server would have restarted successfully
					}else if (res.status == 'restarterror'){
						console.log(res.message);
						alert('Some error occurred in restarting the server.');
					}
				}else if(typeof res.error != 'undefined'){
					console.log(res.error);
					alert('Some error occurred in restarting the server.');
				}else{
					alert('Some error occurred in restarting the server.');
				}
	        });
	        setTimeout(function(){
	         window.location.href = "https://"+$('#domaininfo').html(); }, 6000);
	    }
	},

	updateCode: function(){
		if(confirm('Are you sure you want to update the olympus code?')){
			console.log('sending request to update the code.');
			Mast.Socket.request('/account/updateCode', {
				'formaction'		: 'update-code'
			} , function(res, err){
				alert(err);
				// console.log(res);
				if( (typeof res.status != 'undefined') ){
					if( res.status == 'ok'){
						//Server would have restarted successfully
					}else if (res.status == 'githuberror'){
						console.log(res.message);
						alert('Some error occurred in updating the code.');
					}
				}else if(typeof res.error != 'undefined'){
					console.log(res.error);
					alert('Some error occurred in updating the code.');
				}else{
					alert('Some error occurred in updating the code.');
				}
	        });
	        // setTimeout(function(){
	        //  window.location.href = "https://"+$('#domaininfo').html(); }, 6000);
	    }
	},

	checkForUpdates: function(){

		function replaceAll(strng, search, replacement) {
		    return strng.replace(new RegExp(search, 'g'), replacement);
		}

		var organization 	= $('#git-organization').val();
		var username 	= $('#git-username').val();
		var password 	= $('#git-password').val();
		var repo 	= $('#git-repo').val();

		function replaceChars(organization){
			organization = replaceAll(organization,'@','%40');
			organization = replaceAll(organization,"'","%27");
			organization = replaceAll(organization,'/','%2F');
			organization = replaceAll(organization,':','%3A');
			return organization;
		}

		organization = replaceChars(organization);
		username = replaceChars(username);
		password = replaceChars(password);
		repo = replaceChars(repo);

		
		$('body').append('<div id="loader" style="background:rgba(0,0,0,0.7);width:100%;height:100%;position:fixed;top:0;left:0;z-index:9999;color:#fff;font-size:25px;padding-top:'+($(window).height()-15)/2+'px;"><center>Please Wait...</center></div>');
		Mast.Socket.request('/account/checkForUpdates', {
			'formaction'		: 'check-for-updates',
			'organization' 	: organization,
			'username' 	: username,
			'password' 	: password,
			'repo' 	: repo,
		} , function(res, err){
			$('#loader').remove();
			//alert(err);
			// console.log(res);
			if( (typeof res.status != 'undefined') ){
				if( res.status == 'ok'){
					//alert(res.currcommit.trim()+'hi'+res.avcommit.trim()+'hi1');
					if(res.currcommit.trim() == res.avcommit.trim())
	                {
	                    alert('No updates Available1.');
	                    //alert('I have updated some text to check updates');
	                    //return res.json({ status: 'noupdates'}, 200);
	                }
	                else
	                {
	                    //alert('I have updated some text to check updates. ');
	                    //return res.json({ status: 'updatesavailable'}, 200);
	                    if(confirm('Updates available1. Do you want to update the source code?')){
							console.log('sending request to update the code.');
							$('body').append('<div id="loader" style="background:rgba(0,0,0,0.7);width:100%;height:100%;position:fixed;top:0;left:0;z-index:9999;color:#fff;font-size:25px;padding-top:'+($(window).height()-15)/2+'px;"><center>Please Wait...</center></div>');
							Mast.Socket.request('/account/updateCode', {
								'formaction'		: 'update-code',
								'organization' 	: organization,
								'username' 	: username,
								'password' 	: password,
								'repo' 	: repo,
							} , function(res, err){
								$('#loader').remove();
								//alert(err);
								// console.log(res);
								if( (typeof res.status != 'undefined') ){
									if( res.status == 'ok'){
										//Server would have restarted successfully
										alert('Code Updated Successfully. Please restart the server to apply changes');
									}else if (res.status == 'githuberror'){
										console.log(res.message);
										alert('Some error occurred in updating the code.');
									}
								}else if(typeof res.error != 'undefined'){
									console.log(res.error);
									alert('Some error occurred in updating the code.');
								}else{
									alert('Some error occurred in updating the code.');
								}
					        });
					        // setTimeout(function(){
					        //  window.location.href = "https://"+$('#domaininfo').html(); }, 6000);
					    }
	                }
					//Server would have restarted successfully
				}else if (res.status == 'githuberror'){
					console.log(res.message);
					alert('Some error occurred.');
				}
			}else if(typeof res.error != 'undefined'){
				console.log(res.error);
				alert('Some error occurred.');
			}else{
				alert('Some error occurred.');
			}
        });
		
	},

	saveLdapSettings: function(){

		var server_ip = org_unit = basedn = ldap_admin = ldap_pass = ldap_create_user = '';
		var ldap_enabled 		= $('input[name="ldap_enbled"]').is(':checked');
		var service_type 		= $('input[name="service_type"]:checked').val();

		console.log(service_type);

		if(service_type == '1'){
			server_ip 			= $("input[name='server_ip']").val();
			org_unit 			= $("input[name='org_unit']").val();
			basedn 				= $("input[name='basedn']").val();
			ldap_admin 			= $("input[name='ldap_admin']").val();
			ldap_pass 			= $("input[name='ldap_pass']").val();
			ldap_create_user 	= $("input[name='ldap_create_user']").is(':checked');
		}else{
			server_ip 			= $("input[name='server_ip_ad']").val();
			org_unit 			= $("input[name='memberof']").val();
			basedn 				= $("input[name='basedn_ad']").val();
			ldap_admin 			= $("input[name='ldap_admin_ad']").val();
			ldap_pass 			= $("input[name='ldap_pass_ad']").val();
			// ldap_create_user 	= $("input[name='ldap_create_user']").is(':checked');
		}

		if( ldap_enabled && (service_type == '1') && (server_ip.trim() == '' || org_unit.trim() == '' || basedn.trim() == '' || ldap_admin.trim() == '' || ldap_pass.trim() == '' )){
			alert('Please enter LDAP details.');
			return false;
		}else if( ldap_enabled && (service_type == '2') && (server_ip.trim() == '' || basedn.trim() == '' || ldap_admin.trim() == '' || ldap_pass.trim() == '' )){
			alert('Please enter AD details.');
			return false;
		}
		console.log('proceeding...');

			Mast.Socket.request('/account/changeLdapSetting', {
				'formaction'		: 'save_ldap_info',
				'ldap_enabled'		: ldap_enabled,
				'service_type'		: service_type,
				'server_ip'			: server_ip,
				'org_unit'			: org_unit,
				'basedn'			: basedn,
				'ldap_admin'		: ldap_admin,
				'ldap_pass'			: ldap_pass,
				'ldap_create_user'	: ldap_create_user,
			} , function(res, err){
				// console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#adapter_type').html($('#adapter_type').val());
					alert('Ldap/AD Settings Updated.')
				}else if(typeof res.error != 'undefined'){
					alert(res.error);
				}else{
					alert('Some error occurred.');
				}
	        });
	},

	testLdapSettings: function(){

		var server_ip = org_unit = basedn = ldap_admin = ldap_pass = ldap_create_user = '';
		var ldap_enabled 		= $('input[name="ldap_enbled"]').is(':checked');
		var service_type 		= $('input[name="service_type"]:checked').val();

		console.log(service_type);//since "test connection" button is in AD only, should be 2 always

		if(service_type == '1'){
			server_ip 			= $("input[name='server_ip']").val();
			org_unit 			= $("input[name='org_unit']").val();
			basedn 				= $("input[name='basedn']").val();
			ldap_admin 			= $("input[name='ldap_admin']").val();
			ldap_pass 			= $("input[name='ldap_pass']").val();
			ldap_create_user 	= $("input[name='ldap_create_user']").is(':checked');
		}else{
			server_ip 			= $("input[name='server_ip_ad']").val();
			org_unit 			= $("input[name='memberof']").val();
			basedn 				= $("input[name='basedn_ad']").val();
			ldap_admin 			= $("input[name='ldap_admin_ad']").val();
			ldap_pass 			= $("input[name='ldap_pass_ad']").val();
			// ldap_create_user 	= $("input[name='ldap_create_user']").is(':checked');
		}

		if( (service_type == '1') && (server_ip.trim() == '' || org_unit.trim() == '' || basedn.trim() == '' || ldap_admin.trim() == '' || ldap_pass.trim() == '' )){
			alert('Please enter LDAP details.');
			return false;
		}else if( (service_type == '2') && (server_ip.trim() == '' || basedn.trim() == '' || ldap_admin.trim() == '' || ldap_pass.trim() == '' )){
			alert('Please enter AD details.');
			return false;
		}
		console.log('proceeding...',$('.ldap-mod .test-loader').length);
		$('.ldap-mod .test-loader').css('display','inline-block');

			Mast.Socket.request('/account/testLdapSetting', {
				'formaction'		: 'test_ldap_info',
				'ldap_enabled'		: ldap_enabled,
				'service_type'		: service_type,
				'server_ip'			: server_ip,
				'org_unit'			: org_unit,
				'basedn'			: basedn,
				'ldap_admin'		: ldap_admin,
				'ldap_pass'			: ldap_pass,
				'ldap_create_user'	: ldap_create_user,
			} , function(res, err){

				$('.ldap-mod .test-loader').css('display','none');
				// console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#adapter_type').html($('#adapter_type').val());
					alert('Ldap/AD Settings are correct.')
				}else if(typeof res.error != 'undefined'){
					console.log(res.error);
					alert('Active Directory says: '+res.error.name);
				}else{
					alert('Some error occurred.');
				}
	        });
	},

	saveAdapterInfo : function(){

		var adapter_type 		= $('input[name="adapter_type"]:checked').val();
		var diskpath 			= $("input[name='disk_path']").val();
		var S3access 			= $("input[name='S3_access']").val();
		var S3secret 			= $("input[name='S3_secret']").val();
		var S3bucket 			= $("input[name='S3_bucket']").val();
		var S3region 			= $("input[name='S3_region']").val();

		var Ormucoaccess 		= $("input[name='Ormuco_access']").val();
		var Ormucosecret 		= $("input[name='Ormuco_secret']").val();
		var Ormucobucket 		= $("input[name='Ormuco_bucket']").val();

		var mount_enabled 		= $('input[name="mount_cifs"]').is(':checked');
		var mountpoint 			= $("input[name='mountpoint']").val();
		var mount_username 		= $("input[name='mount_username']").val();
		var mount_password 		= $("input[name='mount_password']").val();

		if( adapter_type == 'Disk' ){

			if( diskpath.trim() == ''){
				alert('Please enter valid disk path.');
				return false;
			}

		}else if( adapter_type == 'S3' ){

			if( S3access.trim() == '' || S3secret.trim() == '' || S3bucket.trim() == '' || S3region.trim() == '' ){
				alert('Please enter S3 details.');
				return false;
			}

		}else if( adapter_type == 'Ormuco' ){

			if( Ormucoaccess.trim() == '' || Ormucosecret.trim() == '' || Ormucobucket.trim() == '' ){
				alert('Please enter Ormuco details.');
				return false;
			}

		}else{
			alert('please select adapter type.');
			return false;
		}
		console.log('proceeding...');

			Mast.Socket.request('/account/changeAdapterSetting', {
				'formaction'	: 'save_adapter_info',
				'adapter_type': adapter_type,
				'diskpath': diskpath,
				'S3access': S3access,
				'S3secret': S3secret,
				'S3bucket': S3bucket,
				'S3region': S3region,
				'Ormucoaccess': Ormucoaccess,
				'Ormucosecret': Ormucosecret,
				'Ormucobucket': Ormucobucket,
				'mount_enabled': mount_enabled,
				'mountpoint': mountpoint,
				'mount_username': mount_username,
				'mount_password': mount_password
			} , function(res, err){
				// console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#adapter_type').html($('#adapter_type').val());
					alert('Adapter Settings Updated.')
				}else if(typeof res.error != 'undefined'){
					alert(res.error);
				}else{
					alert('Some error occurred.');
				}
	        });
	},

	saveEmailInfo : function(){

		var emailService = $('input[name="mail_service"]:checked').val();
		var mandrillKey  = $("input[name='mandrill_key']").val();
		var smtpHost = $("input[name='smtp_host']").val();
		var smtpPort = $("input[name='smtp_port']").val();
		var smtpUser = $("input[name='smtp_user']").val();
		var smtpPass = $("input[name='smtp_pass']").val();

		if( emailService == 'mandrill' ){

			if( mandrillKey.trim() == ''){
				alert('Please enter your mandrill api key.');
				return false;
			}

		}else if( emailService == 'internal' ){

			if( smtpHost.trim() == '' || smtpPort.trim() == '' || smtpUser.trim() == '' || smtpPass.trim() == '' ){
				alert('Please enter Smtp details.');
				return false;
			}

			if(isNaN( smtpPort.trim())){
				alert('Please enter Smtp details.');
				return false;
			}

		}else{
			alert('please select a mail service.');
			return false;
		}
		console.log('proceeding...');

			Mast.Socket.request('/account/changeDomainname', {
				'formaction'	: 'save_email_info',
				'mail_service': emailService,
				'mandrill_key': mandrillKey,
				'smtp_host': smtpHost,
				'smtp_port': smtpPort,
				'smtp_user': smtpUser,
				'smtp_pass': smtpPass,
			} , function(res, err){
				// console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#domaininfo').html($('#domainname').val());
					alert('Email Settings Updated.')
				}else if(typeof res.error != 'undefined'){
					alert(res.error);
				}else{
					alert('Some error occurred.');
				}
	        });
	},

	saveTrashSetting : function(){

		var trash_setting 		= $('input[name="trash_setting"]:checked').val();
		var days  				= $('select[name="trash_setting_days"]').val();
console.log(trash_setting);
console.log(days);
		/*if( trash_setting == 'auto' ){

			if( !isNaN(days) && parseInt(Number(days)) == days && !isNaN(parseInt(days, 10)) ){
				//is Int
			}else{
				alert('Please enter number only.');
				return false;
			}

		}*/
		if(confirm('New Settings will apply on next restart of server. Are you sure you want to continue?')){
		console.log('proceeding...');

			Mast.Socket.request('/account/changeDomainname', {
				'formaction'		: 'save_trash_setting',
				'trash_setting'		: trash_setting,
				'trash_setting_days': days
			} , function(res, err){
				console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#domaininfo').html($('#domainname').val());
					alert('Saved. Now restart server.');
				}else if(typeof res.error != 'undefined'){
					alert(res.error);
				}else{
					alert('Some error occurred.');
				}
	        });
	    }
	},

	saveOtherSettings : function(){

		var msignup_setting 		= $('input[name="msignup_setting"]:checked').val();

		console.log(msignup_setting);
		console.log('proceeding...');

			Mast.Socket.request('/account/changeOtherSettings', {
				'formaction'			: 'save_other_settings',
				'msignup_setting'		: (msignup_setting == 'allow')?true:false
			} , function(res, err){
				console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#domaininfo').html($('#domainname').val());
					alert('Mobile Signup Settings Updated.')
				}else if(typeof res.error != 'undefined'){
					alert(res.error);
				}else{
					alert('Some error occurred.');
				}
	        });
	},

	exportDatabase : function(){
		var url = "/file/exportDatabase/";//+this.get('id');
		var iframe;
		iframe = document.getElementById("hiddenDownloader");
		if (iframe === null)
		{
			iframe = document.createElement('iframe');
			iframe.id = "hiddenDownloader";
			iframe.style.visibility = 'hidden';
			iframe.onerror = iframe.onError = function(e){
				console.log('some error occured');
				console.log(e);
			};
			document.body.appendChild(iframe);
		}
		iframe.src = url;
	},

	toggleDatabaseExportDetails : function(){

		var db_export_setting 		= $('input[name="db_export_setting"]:checked').val();

		if( db_export_setting == 'export' ){
			$('#export_db_server_cont').show();
		}else{
			$('#export_db_server_cont').hide();

			Mast.Socket.request('/file/saveDatabaseExportDetails', {
				'formaction'			: 'disable_db_export',
			} , function(res, err){
				//DISABLED
	        });
		}
	},
	
	testDatabaseExportDetails : function(){

		if( $('#export_db_host').val() && $('#export_db_user').val() && $('#export_db_path').val()){

			$('#export_db_server_cont .test-db-loader').css('display','inline-block');

			// var self = this;
	        // var userData = this.getFormData();

	        file = $('input[name="private_key"]')[0].files[0];
	        if(file){
		        // console.log(file);
		        // console.log(file.value);
		        // console.log($('input[name="private_key"]')[0]);
		        // console.log($('input[name="private_key"]')[0].files[0]);
		        console.log('SystemSettingsComponent::testDatabaseExportDetails');

		        var formData = new FormData();
				formData.append('file', $('input[name="private_key"]')[0].files[0]);

		        var ext = $('input[name="private_key"]').val().split(".").pop().toLowerCase();

		        if($.inArray(ext, ["pem"]) == -1) {
		            alert("Please upload only [.pem] files.");
		            return false;
		        }

		        var reader = new FileReader();
		        reader.readAsDataURL($('input[name="private_key"]')[0].files[0]);
		        reader.onload = function(e) {
			    	// fileData = input.files;
			        imgSrc 	= e.target.result;
			        // cropper 		= $('.imageBox').cropbox(options);
			        // $('.main-logo').attr('src', e.target.result);
			        Mast.Socket.post('/file/testDatabaseExportDetails', {
						'formaction'			: 'test_db_export',
						'export_db_host'		: $('#export_db_host').val(),
						'export_db_user'		: $('#export_db_user').val(),
						'export_db_pass'		: $('#export_db_pass').val(),
						'export_db_path'		: $('#export_db_path').val(),
						'export_db_port'		: $('#export_db_port').val(),
						'name'					: file.name,
						'type' 					: file.type,
						'size'					: file.size,
						'filepath'				: reader.result,//$('input[name="private_key"]')[0].files[0],
					} , function(res, err){

						$('#export_db_server_cont .test-db-loader').css('display','none');

						if(res.status == 'ok'){
							alert('Connection was successfull.')
						}else{
							alert('Could not Connect.')
						}				
			        });
			    }
			}else{
				Mast.Socket.post('/file/testDatabaseExportDetails', {
					'formaction'			: 'test_db_export',
					'export_db_host'		: $('#export_db_host').val(),
					'export_db_user'		: $('#export_db_user').val(),
					'export_db_pass'		: $('#export_db_pass').val(),
					'export_db_path'		: $('#export_db_path').val(),
					'export_db_port'		: $('#export_db_port').val()
				} , function(res, err){

					$('#export_db_server_cont .test-db-loader').css('display','none');

					if(res.status == 'ok'){
						alert('Connection was successfull.')
					}else{
						alert('Could not Connect.')
					}				
		        });
			}
	    }else{
	    	alert('Please fill in all the details required.');
	    }
	},

	saveDatabaseExportDetails : function(){

		if( $('#export_db_host').val() && $('#export_db_user').val() && $('#export_db_path').val()){

			$('#export_db_server_cont .test-db-loader').css('display','inline-block');

			// var self = this;
	        // var userData = this.getFormData();

	        file = $('input[name="private_key"]')[0].files[0];
	        if(file){
		        console.log(file);
		        console.log(file.value);
		        console.log($('input[name="private_key"]')[0]);
		        console.log($('input[name="private_key"]')[0].files[0]);
		        console.log('file.typefile.typefile.typefile.typefile.type');

		        var formData = new FormData();
				formData.append('file', $('input[name="private_key"]')[0].files[0]);

		        var ext = $('input[name="private_key"]').val().split(".").pop().toLowerCase();

		        if($.inArray(ext, ["pem"]) == -1) {
		            alert("Please upload only [.pem] files.");
		            return false;
		        }

		        var reader = new FileReader();
		        reader.readAsDataURL($('input[name="private_key"]')[0].files[0]);
		        reader.onload = function(e) {
			    	// fileData = input.files;
			        imgSrc 	= e.target.result;
			        // cropper 		= $('.imageBox').cropbox(options);
			        // $('.main-logo').attr('src', e.target.result);
			        Mast.Socket.post('/file/saveDatabaseExportDetails', {
						'formaction'			: 'save_db_export',
						'export_db_host'		: $('#export_db_host').val(),
						'export_db_user'		: $('#export_db_user').val(),
						'export_db_pass'		: $('#export_db_pass').val(),
						'export_db_path'		: $('#export_db_path').val(),
						'export_db_port'		: $('#export_db_port').val(),
						'export_db_days'		: $('#export_db_days').val(),
						'name'					: file.name,
						'type' 					: file.type,
						'size'					: file.size,
						'filepath'				: reader.result,//$('input[name="private_key"]')[0].files[0],
					} , function(res, err){

						console.log(res);
						console.log(err);
						$('#export_db_server_cont .test-db-loader').css('display','none');

						if(res.status == 'ok'){
							alert('Backup settings saved successfully.');
						}else{
							alert('Could not Connect.');
						}
			        });
			    }
			}else{
				Mast.Socket.post('/file/saveDatabaseExportDetails', {
					'formaction'			: 'save_db_export',
					'export_db_host'		: $('#export_db_host').val(),
					'export_db_user'		: $('#export_db_user').val(),
					'export_db_pass'		: $('#export_db_pass').val(),
					'export_db_path'		: $('#export_db_path').val(),
					'export_db_port'		: $('#export_db_port').val(),
					'export_db_days'		: $('#export_db_days').val(),
				} , function(res, err){

					console.log(res);
					console.log(err);
					$('#export_db_server_cont .test-db-loader').css('display','none');

					if(res.status == 'ok'){
						alert('Backup settings saved successfully.');
					}else{
						alert('Could not Connect.');
					}				
		        });
			}
	    }else{
	    	alert('Please fill in all the details required.');
	    }
	},

	importDatabase : function(){

        file = $('input[name="import_db_file"]')[0].files[0];

        if(file){
	        // console.log(file);
	        // console.log(file.value);
	        // console.log($('input[name="import_db_file"]')[0]);
	        // console.log($('input[name="import_db_file"]')[0].files[0]);
	        console.log('SystemSettingsComponent::importDatabase');

	        var formData = new FormData();
			formData.append('file', $('input[name="import_db_file"]')[0].files[0]);

	        var ext = $('input[name="import_db_file"]').val().split(".").pop().toLowerCase();

	        if($.inArray(ext, ["sql"]) == -1) {
	            alert('Please select a sql file to upload.');
	            return false;
	        }

	        if(!confirm('Importing a database will overwrite all current user account information. We suggest you make a backup of the current database. Are you sure you want to proceed?')){
	        	return false;
	        }

	        $('#import_db_cont .import-db-loader').css('display','inline-block');

	        var reader = new FileReader();
	        reader.readAsDataURL($('input[name="import_db_file"]')[0].files[0]);
	        reader.onload = function(e) {
		    	// fileData = input.files;
		        imgSrc 	= e.target.result;
		        // cropper 		= $('.imageBox').cropbox(options);
		        // $('.main-logo').attr('src', e.target.result);
		        Mast.Socket.post('/file/importDatabase', {
					'formaction'			: 'import_db',
					'name'					: file.name,
					'type' 					: file.type,
					'size'					: file.size,
					'filepath'				: reader.result,//$('input[name="private_key"]')[0].files[0],
				} , function(res, err){

					console.log(res);
					console.log(err);
					$('#import_db_cont .import-db-loader').css('display','none');

					if(res.status == 'ok'){
						alert('Database imported successfully. Please restart the server to lift the application with imported Databse.');
					}else{
						alert('Something went wrong. Database couldn\'t be imported.');
					}
		        });
		    }
		}else{
			alert('Please select a sql file to upload.');
		}
	},

	resetFileInput : function(){
		$('#drive_secret_file').val(null);
	},

	fillUptheSecrets : function () {
		if($('input[name="gdrive_setting"]:checked').val() == 'enabled'){

	        file = $('input[name="drive_secret_file"]')[0].files[0];

	        if(file){

		        var formData = new FormData();
				formData.append('file', $('input[name="drive_secret_file"]')[0].files[0]);

		        var ext = $('input[name="drive_secret_file"]').val().split(".").pop().toLowerCase();

		        if($.inArray(ext, ["json"]) == -1) {
		            alert('Please upload a json token file.');
		            return false;
		        }

				// $('#drive_secret_file').val(null);
				var reader = new FileReader();
		        //If want to read file as JSON
		        reader.readAsText($('input[name="drive_secret_file"]')[0].files[0]);
		        reader.onload = function(e) {
		        	console.log(reader.result);
		        	var client_secret = JSON.parse(reader.result);
			        console.log('reader.result:reader.result:reader.result:reader.result:', client_secret);
			        console.log(client_secret.installed);
			        $('#google_drive_details #gdrive_client_id').val(client_secret.installed.client_id);
			        $('#google_drive_details #gdrive_project_id').val(client_secret.installed.project_id);
			        $('#google_drive_details #gdrive_auth_uri').val(client_secret.installed.auth_uri);
			        $('#google_drive_details #gdrive_token_uri').val(client_secret.installed.token_uri);
			        $('#google_drive_details #gdrive_auth_x509').val(client_secret.installed.auth_provider_x509_cert_url);
			        $('#google_drive_details #gdrive_client_secret').val(client_secret.installed.client_secret);
			        $('#google_drive_details #gdrive_redirect_uri').val(client_secret.installed.redirect_uris[0]);
			    };
			}
		}
	},

	uploadGoogleDriveSecret : function(){

		$('#gdrive_cont .gdrive-loader').css('display','inline-block');

        if($('input[name="gdrive_setting"]:checked').val() == 'enabled'){

	        var client_id 		= $('#google_drive_details #gdrive_client_id').val();
	        var client_secret 	= $('#google_drive_details #gdrive_client_secret').val();
	        var redirect_uri 	= $('#google_drive_details #gdrive_redirect_uri').val();

	        if(client_id || client_secret || redirect_uri){

		        Mast.Socket.post('/file/importDriveToken', {
					'formaction'			: 'gdrive_enable',
					'client_id'				: $('#google_drive_details #gdrive_client_id').val(),
					'client_secret'			: $('#google_drive_details #gdrive_client_secret').val(),
					'redirect_uri'			: $('#google_drive_details #gdrive_redirect_uri').val(),
				} , function(res, err){

					console.log(res);
					console.log(err);
						$('#gdrive_cont .gdrive-loader').css('display','none');

					if(res.status == 'ok'){
						alert('Google Drive Tokens saved successfully.');
					}else{
						alert('Something went wrong. Tokens couldn\'t be saved.');
					}
				});
			}else{
				alert('Please select a json token file OR fill all the details.');
			}

			/* var file 			= $('input[name="drive_secret_file"]')[0].files[0];
	        if(file){
				// console.log(file);
		        // console.log(file.value);
		        // console.log($('input[name="drive_secret_file"]')[0]);
		        // console.log($('input[name="drive_secret_file"]')[0].files[0]);
		        // console.log('SystemSettingsComponent::importDatabase');

		        var formData = new FormData();
				formData.append('file', $('input[name="drive_secret_file"]')[0].files[0]);

		        var ext = $('input[name="drive_secret_file"]').val().split(".").pop().toLowerCase();

		        if($.inArray(ext, ["json"]) == -1) {
		            alert('Please upload a json token file.');
		            return false;
		        }

			    $('#gdrive_cont .import-db-loader').css('display','inline-block');

			    // SEE fillUptheSecrets() above
				reader.readAsDataURL($('input[name="drive_secret_file"]')[0].files[0]);
				reader.onload = function(e) {
					imgSrc 	= e.target.result;
					Mast.Socket.post('/file/importDriveToken', {
						'formaction'			: 'gdrive_enable',
						'name'					: file.name,
						'type' 					: file.type,
						'size'					: file.size,
						'filepath'				: reader.result,//$('input[name="private_key"]')[0].files[0],
					} , function(res, err){

						console.log(res);
						console.log(err);
							$('#gdrive_cont .import-db-loader').css('display','none');

						if(res.status == 'ok'){
							alert('Drive Token File uploaded successfully.');
						}else{
							alert('Something went wrong. Token File couldn\'t be imported.');
						}
					});
				}
		        // SEE fillUptheSecrets() above

			}else{
				alert('Please select a token file to upload.');
			}*/
		}else{
			console.log('Disabling Google Drive Syncing');
			Mast.Socket.post('/file/importDriveToken', {
				'formaction'			: 'gdrive_disable'
			} , function(res, err){
				console.log(res);
				console.log(err);
				$('#gdrive_cont .gdrive-loader').css('display','none');
				if(res.status == 'ok'){
					alert('Google Drive Syncing disabled.');
				}else{
					alert('Something went wrong. Please try again');
				}
	        });
		}
	},

	saveDropbox : function() {

		$('#dropbox_cont .dropbox-loader').css('display','inline-block');

		if($('input[name="dropbox_setting"]:checked').val() == 'enabled'){

	        var client_id 		= $('#dropbox_details #dropbox_client_id').val();

	        if(client_id){
		        Mast.Socket.post('/file/saveDropboxDetails', {
					'formaction'			: 'dropbox_enable',
					'client_id'				: $('#dropbox_details #dropbox_client_id').val(),
					'client_secret'			: $('#dropbox_details #dropbox_client_secret').val()
				} , function(res, err){

					console.log(res);
					console.log(err);
					$('#dropbox_cont .dropbox-loader').css('display','none');

					if(res.status == 'ok'){
						alert('Dropbox client details saved successfully.');
					}else{
						alert('Something went wrong. Please try again.');
					}
				});
			}else{
				alert('Please provide the dropbox client ID.');
				$('#dropbox_cont .dropbox-loader').css('display','none');
			}
		}else{
			console.log('Disabling Dropbox Syncing');
			Mast.Socket.post('/file/saveDropboxDetails', {
				'formaction'			: 'dropbox_disable'
			} , function(res, err){
				console.log(res);
				console.log(err);
				$('#dropbox_cont .dropbox-loader').css('display','none');
				if(res.status == 'ok'){
					alert('Dropbox Syncing disabled.');
				}else{
					alert('Something went wrong. Please try again');
				}
	        });
		}
	},

	saveBox : function() {

		$('#box_cont .box-loader').css('display','inline-block');

		if($('input[name="box_setting"]:checked').val() == 'enabled'){

	        var client_id 		= $('#box_details #box_client_id').val();

	        if(client_id){
		        Mast.Socket.post('/file/saveBoxDetails', {
					'formaction'			: 'box_enable',
					'client_id'				: $('#box_details #box_client_id').val(),
					'client_secret'			: $('#box_details #box_client_secret').val()
				} , function(res, err){

					console.log(res);
					console.log(err);
					$('#box_cont .box-loader').css('display','none');

					if(res.status == 'ok'){
						alert('Box client details saved successfully.');
					}else{
						alert('Something went wrong. Please try again.');
					}
				});
			}else{
				alert('Please provide the box client ID.');
				$('#box_cont .box-loader').css('display','none');
			}
		}else{
			console.log('Disabling Box Syncing');
			Mast.Socket.post('/file/saveBoxDetails', {
				'formaction'			: 'box_disable'
			} , function(res, err){
				console.log(res);
				console.log(err);
				$('#box_cont .box-loader').css('display','none');
				if(res.status == 'ok'){
					alert('Box Syncing disabled.');
				}else{
					alert('Something went wrong. Please try again');
				}
	        });
		}
	}
});
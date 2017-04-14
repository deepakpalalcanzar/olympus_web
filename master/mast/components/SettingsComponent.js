Mast.components.SettingsComponent  = Mast.Component.extend({
	
	template: '.settings-template',
	outlet: '#content',
	events: {
		// 'click .setting-save-button' : 'saveCompanyInfo',
		'click #saveDomain' : 'saveDomainInfo',
		'click #saveEmail'  : 'saveEmailInfo',
		'click #saveTrashSetting' : 'saveTrashSetting',
		// 'click input[name="mail_service"]' : 'toggleMailService',
		'change input[name="mail_service"]' : 'toggleMailService',
		'change input[name="trash_setting"]' : 'toggleTrashSetting',
	},

	// saveCompanyInfo : function(){
	// 	alert("aaaaaaaaaaaaaaa");
	// }

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

	toggleTrashSetting : function(){
		console.log($('input[name="trash_setting"]:checked').val());
		if( $('input[name="trash_setting"]:checked').val() == 'auto' ){
			$('#trash_auto_setting').show();
		}else{
			$('#trash_auto_setting').hide();
		}
	},

	saveDomainInfo : function(){

		//Regex for domain without any protocol(http:// or https://)
		var patt = new RegExp(/^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i);
		// var is_valid_domain = patt.test($('#domainname').val());
		
		if( ( $('#domainname').val() == 'localhost' ) || patt.test($('#domainname').val()) ){

			if(confirm('Olympus configuration will be mapped to given domain. You will be required to restart forevers(app.js and olympus.js) on your server after the process. Are you sure you want to continue?')){
				Mast.Socket.request('/account/changeDomainname', {
					'formaction'	: 'save_domain_info',
					'newdomain' : $('#domainname').val(),
				} , function(res, err){
					// console.log(res);
					if((typeof res.status != 'undefined') && res.status == 'ok'){
						$('#domaininfo').html($('#domainname').val());
						alert('Domain updated successfully. Now restart forevers.')
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
		console.log('proceeding...');

			Mast.Socket.request('/account/changeDomainname', {
				'formaction'		: 'save_trash_setting',
				'trash_setting'		: trash_setting,
				'trash_setting_days': days
			} , function(res, err){
				console.log(res);
				if((typeof res.status != 'undefined') && res.status == 'ok'){
					$('#domaininfo').html($('#domainname').val());
					alert('Trash Settings Updated.')
				}else if(typeof res.error != 'undefined'){
					alert(res.error);
				}else{
					alert('Some error occurred.');
				}
	        });
	}

});
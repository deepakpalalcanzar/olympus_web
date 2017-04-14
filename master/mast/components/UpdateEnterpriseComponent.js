Mast.registerComponent('UpdateEnterprise', {

	template: '.update-enterprise-template',
	outlet: '#content',
	model: {

		name : 'ent',
		sub_id : '1',
		is_active	: '1',
		account_id	: '2',
		is_impersonate:'1',
		acc_name : 'afzal',
		acc_email	: 'a@gmail.com',
		subscription:1,

	},
	
	events:{
		'click .update-enterprises': 'updateEnterprise',
		'click .delete-enterprise': 'deleteEnterprise',
	},

	init: function(){
		this.set(Mast.Session.enterprises);
	},

	afterConnect: function() {
		myData = Mast.Session.enterprises;
		Mast.Socket.request('/subscription/getSubscription', null, function(res, err){
			if(res){
				var options;
				$.each( res, function( i, val ) {
					options = options + '<option value="'+ val.id +'">' + val.features + '</option>'; 
				});
				$('#subscription-drop').html(options);
				$('#subscription-drop option[value='+myData.sub_id+']').attr('selected','selected');
 			}

		});
	},

	getFormData:function(){
		var name, email,subscription,ent_id;
		return {
			name 	 		: this.$('input[name="enterprises_name"]').val(),
			owner_name 	 	: this.$('input[name="owner_name"]').val(),
			email	 		: this.$('input[name="email"]').val(),
			subscription 	: this.$('select[name="subscription"]').val(),
			ent_id	 		: this.$('input[name="ent_id"]').val(),
		};

	},

	updateEnterprise: function(){
		
		myData = Mast.Session.enterprises;
		var self = this;
		var entData = this.getFormData();
		entData.id = myData.account_id;
		// console.log(entData);
		// return; 
		
                /*Mast.Socket.request('/enterprises/updateEnterprise', entData, function(res, err){
			if(res.type==="error"){
				alert(res.error);
			}
			Mast.navigate('#enterprises');			
		});*/

                  /*$.get("https://ipinfo.io", function(response) {
                  entData.ipadd = response.ip;*/
                  Mast.Socket.request('/enterprises/updateEnterprise', entData, function(res, err){
			if(res.type==="error"){
				alert(res.error);
			}
			Mast.navigate('#enterprises');			
		});	
               /* }, "jsonp");*/

	},

	deleteEnterprise: function(){
		var self = Mast.Session.enterprises;
		if(confirm('Are you sure ?')){
			
                       /*Mast.Socket.request('/enterprises/deleteEnterprises', { id: self.id}, function(res, err){
				console.log(res);			
				if(res){
					Mast.navigate('#enterprises');
				}
			});*/

                    /* $.get("https://ipinfo.io", function(response) {
                     var ipadd = response.ip;*/
                     Mast.Socket.request('/enterprises/deleteEnterprises', { id: self.id }, function(res, err){
				console.log(res);			
				if(res){
					Mast.navigate('#enterprises');
				}
			});
                     /* }, "jsonp"); */

		}
	},

});

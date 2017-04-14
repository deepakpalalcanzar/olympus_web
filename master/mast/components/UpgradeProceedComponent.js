Mast.registerComponent('UpgradeProceedComponent', {

	template: '.upgrade-proceed-template',
	outlet: '#content',
	
	model: {
		f_name : 'Demo',
		l_name : 'Demo',
		address : 'Demo',
		city : 'Demo',
		customer_zip : 'Demo',
		state : 'Demo',
		country_code : 'Demo',
		card_type : 'Demo',
		customer_credit_card_number : 'Demo',
		cc_cvv2_number : 'Demo',
		amount : 'Demo',
		cc_expiration_month : 'Demo',
		cc_expiration_year : 'Demo',

	},

	events: {
		'click .upgrade-pay'	: 'pay',
	},

	init: function() {
		console.log('*dataaa**');
		console.log(Mast.Session.upgradeData);
		this.set(Mast.Session.upgradeData);
	},

//Set the value of Form
	afterRender : function(){

	},

	pay:function(){
		this.$('.upgrade-proceed-loader').html('<span>Proceeding...</span>');
		this.$('#cancel_pay').hide();
		var planData =	Mast.Session.subscription;
		var upgradeData = Mast.Session.upgradeData;
		console.log('**this is upgrade**');
		console.log(upgradeData);
		Mast.Socket.request('/subscription/upgradePayment', upgradeData, function(res, err){
			// alert('Subscription has been updated.');
			if(res){
				console.log(res);
				var d = new Date();
				var n = new Date(new Date(d).setMonth(d.getMonth()+parseInt(res.transaction.duration)));
				var data = {
					id 				: res.transaction.id,
					plan_name   	: res.transaction.plan_name,
					paypal_status   : res.transaction.paypal_status,
					price   		: res.transaction.price,
					transaction_id  : res.transaction.transaction_id,
					duration_from   : d.toLocaleDateString(),
					duration_to   	: n.toLocaleDateString(),
					created_date   	: res.transaction.created_date,

				}
				Mast.Session.transactionData = data;
				Mast.navigate('#subscription/confirm');
			}
		});
		
	},

});

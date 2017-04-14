Mast.registerComponent('UpgradeConfirmComponent', {

	template: '.upgrade-confirm-template',
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
		console.log(Mast.Session.transactionData);
		this.set(Mast.Session.transactionData);
	},

//Set the value of Form
	afterRender : function(){

	},

});
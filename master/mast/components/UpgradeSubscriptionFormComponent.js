Mast.registerComponent('UpgradeSubscriptionFormComponent', {

	template: '.upgrade-subscription-form-template',
	outlet: '#content',
	
	model: {
		f_name : 'Demo',
		l_name : 'Demo',

	},

	events: {
		'click .upgrade-proceed'	: 'proceed',
	},

	init: function() {
		this.set(Mast.Session.subscription);
	},

//Set the value of Form
	afterRender : function(){

	},

	proceed:function(){

		var self = this;
		var planData =	Mast.Session.subscription;
		console.log(planData);
		var upgradeData = this.getFormData();
		Mast.Session.upgradeData = this.getFormData();
		if(self.validateForm()){
			Mast.navigate('#subscription/proceed');
		}
	},

	getFormData:function(){
		var planData =	Mast.Session.subscription;
		var f_name, l_name, address, city, customer_zip, state,country_code,card_type,customer_credit_card_number,cc_cvv2_number,amount,cc_expiration_month,cc_expiration_year;
		return {
			id 	 			: planData.id,
			f_name 	 		: this.$('input[name="first_name"]').val(),
			l_name	 		: this.$('input[name="last_name"]').val(),
			address	 		: this.$('input[name="address"]').val(),
			city	 		: this.$('input[name="city"]').val(),
			customer_zip	: this.$('input[name="customer_zip"]').val(),
			state	 		: this.$('input[name="state"]').val(),
			country_code	: this.$('select[name="country_code"]').val(),
			card_type		: this.$('select[name="card_type"]').val(),
			customer_credit_card_number		: this.$('input[name="customer_credit_card_number"]').val(),
			cc_cvv2_number		: this.$('input[name="cc_cvv2_number"]').val(),
			amount			: this.$('input[name="amount"]').val(),
			cc_expiration_month			: this.$('select[name="cc_expiration_month"]').val(),
			cc_expiration_year			: this.$('select[name="cc_expiration_year"]').val(),
					
		};
	},

	validateForm: function(){
		if (this.$('input[name="first_name"]').val() === '') {
			alert('Please enter first name !');
			return false;
		}else if(this.$('input[name="last_name"]').val() === ''){
			alert('Please enter last name !');
			return false;
		}else if(this.$('input[name="address"]').val() === ''){
			alert('Please enter address !');
			return false;
		}else if(this.$('input[name="city"]').val() === ''){
			alert('Please enter city !');
			return false;
		}else if(this.$('input[name="customer_zip"]').val() === ''){
			alert('Please enter zip !');
			return false;
		}else if(this.$('input[name="state"]').val() === ''){
			alert('Please enter state !');
			return false;
		}else if(this.$('select[name="country_code"]').val() === ''){
			alert('Please select country !');
			return false;
		}else if(this.$('select[name="card_type"]').val() === ''){
			alert('Please select card type !');
			return false;
		}else if(this.$('input[name="customer_credit_card_number"]').val() === ''){
			alert('Please enter card number !');
			return false;
		}else if(this.$('input[name="cc_cvv2_number"]').val() === ''){
			alert('Please enter cvv number !');
			return false;
		}else if(this.$('select[name="cc_expiration_month"]').val() === ''){
			alert('Please select a month !');
			return false;
		}else if(this.$('select[name="cc_expiration_year"]').val() === ''){
			alert('Please select a year !');
			return false;
		}else{
			return true;
		}
	},

});
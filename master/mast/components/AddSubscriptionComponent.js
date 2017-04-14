/*Mast.components.AddUserComponent  = Mast.Component.extend({*/

Mast.registerComponent('AddSubscriptionComponent',{

	template: '.add-subscription-template',
	outlet: '#content',
	events:{
		'click .submit-subscription'	: 'addSubscription',
		'change #unlimited-user'		: 'checkUnlimitedUsers',
		'change #unlimited-space'		: 'checkUnlimitedSpace',
		'change #is_free'				: 'isFree',
	},

	addSubscription:function(){

		var self = this;
		var subscriptionData = this.getFormData();
		if(self.validateForm()){
        	Mast.Socket.request('/subscription/register', subscriptionData, function(res, err){
				if(res){
					self.clearForm();
			    }
				alert('Subscription has been saved.');
				Mast.navigate('#subscription');
			});
		}
	},

	getFormData:function(){

		var features, price, users_limit, duration, quota;
		
		return {

			features 		: this.$('input[name="features"]').val(),
			price	 		: $('input[name="is_free"]').is(':checked') === true ? '0' : this.$('input[name="price"]').val(),
			users_limit 	: this.checkUnlimitedUsers() ? 'Unlimited':this.$('input[name="user_limit"]').val(),
			duration 		: this.$('select[name="duration"]').val(),
			quota	 		: $('input[name="unlimited_space"]').is(':checked') === true ? '1000' : this.$('input[name="quota"]').val(),		
			is_default	 	: this.isDefault(),

		};

	},

	clearForm: function(){

		this.$('input[name="features"]').val('');
		this.$('input[name="price"]').val('');
		this.$('input[name="user_limit"]').val('');
		this.$('input[name="work_group_limit"]').val('');
		this.$('select[name="duration"]').val('');
		this.$('input[name="quota"]').val('');
		this.$('input[name="unlimited_user"]').attr('checked',false);
		this.$('input[name="unlimited_workgroup"]').attr('checked',false);
		this.$('input[name="is_default"]').attr('checked',false);

	},

	validateForm: function(){
		if (this.$('input[name="features"]').val() === '') {
			alert('Please enter subscription name!');
			return false;
		}else if (!this.isFree() && this.$('input[name="price"]').val() === '') {
			alert('Please enter price!');
			return false;
		}else if (!this.isFree() && isNaN(this.$('input[name="price"]').val())) {
			alert('Price must be digits!');
			return false;
		}else if (this.$('select[name="duration"]').val() === '') {
			alert('Please select a duration!');
			return false;
		}else if (!this.checkUnlimitedUsers() && this.$('input[name="user_limit"]').val() === '') {
			alert('Please enter users limit!');
			return false;
		}else if (!this.checkUnlimitedUsers() && isNaN(this.$('input[name="user_limit"]').val())) {
			alert('Users limit must be digits!');
			return false;
		}else if (!this.checkUnlimitedSpace() && this.$('input[name="quota"]').val() === '') {
			alert('Please enter quota!');
			return false;
		}else if (!this.checkUnlimitedSpace() && isNaN(this.$('input[name="quota"]').val())) {
			alert('Quota must be digits!');
			return false;
		}else{
			return true;
		}
	},

	checkUnlimitedUsers: function(){
		var obj = this.$('input[name="unlimited_user"]');
		if(obj.is(':checked')){
			this.$('input[name="user_limit"]').attr('disabled',true);
			return true;
		}else{
			this.$('input[name="user_limit"]').attr('disabled',false);
			return false;
		}
	},

	checkUnlimitedSpace: function(){
		var obj = this.$('input[name="unlimited_space"]');
		if(obj.is(':checked')){
			this.$('input[name="quota"]').attr('disabled',true);
			return true;
		}else{
			this.$('input[name="quota"]').attr('disabled',false);
			return false;
		}
	},

	isFree: function(){
		var obj = this.$('input[name="is_free"]');
		if(obj.is(':checked')){
			this.$('input[name="price"]').attr('disabled',true);
			return true;
		}else{
			this.$('input[name="price"]').attr('disabled',false);
			return false;
		}
	},

	isDefault: function(){
		var obj = this.$('input[name="is_default"]');
		if(obj.is(':checked')){
			return '1';
		}else{
			return null;
		}
	},
});

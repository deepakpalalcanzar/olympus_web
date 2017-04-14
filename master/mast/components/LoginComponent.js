Mast.registerComponent('LoginComponent',{

	model: {
		loginError: false,
		email: ''
	},

	template: '.login-template',

	outlet	: '.login-outlet',

	events: {
		'click .signin-button': 'submitLogin',
		'pressEnter'          : 'submitLogin'
	},

	afterCreate: function() {
		this.set('loginError', this.get('loginError'));
		this.set('email', this.get('email'));
	},

	// Submits the login form.
	submitLogin: function(e) {
		this.$('form').submit();
		e.preventDefault();
		e.stopPropagation();
	}
});
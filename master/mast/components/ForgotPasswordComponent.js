Mast.registerComponent('ForgotPasswordComponent',{
	template: '.forgot-password-template',
	outlet	: '.forgot-password-outlet',

	events: {
        'click .submit-button': 'submit'
	},
    submit: function() {
        this.$('form').submit();
    }

});

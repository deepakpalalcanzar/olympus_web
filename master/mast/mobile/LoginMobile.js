Mast.registerComponent('LoginMobile', {

	template: '.app-mobile-template',

	outlet: 'body',

	// On short screens you can't get to the proper content, so check the height first
	afterCreate: function() {

		OlympusHelper.touchEnhance(this.$('input[type="submit"]'));

		var $el = this.$el;
		$el.bind('orientationchange',disableScrolling);
		disableScrolling();

		// Prevent touchstart on anything that doen't stopPropagation
		// (this makes things feel more native)
		function disableScrolling() {
			$el.unbind('touchmove');
			if ($(window).height() >= 300) {
				$el.bind('touchmove', function(e) { e.preventDefault(); });
			}
		}
	},

	// TODO: put this in Mast, like this:
	disableScrollingAt: 300,

	regions: {
		'.page-region': {

			template: '.page-mobile-template',
			regions: {
				'.topbar-region': {
					template: '.topbar-header-mobile-template',
					model: {
						pageTitle: "Login"
					}
				},
				'.main-ui-region': {
					template: '.login-mobile-template'
				}
			},

			events: {
				'pressEnter'	: 'submitLogin'
			},

			submitLogin: function(e) {
				this.$('form').submit();
				e.preventDefault();
				e.stopPropagation();
			}
		}
	}	
});
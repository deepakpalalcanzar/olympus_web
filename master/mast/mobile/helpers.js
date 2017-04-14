//
// Extrapolate to the Mast framework level
//
OlympusHelper = {

	touchEnhance: function($el) {

		// For development purposes, and just in case this mobile-optimized experience 
		// is ever being consumed on a P&C (point and click) device, 
		// use click instead of touch when necessary
		if(!Mast.isTouch) {
			$el.click(function() {
				$el.trigger('touch');
			});
		}

		// When the user touches
		$el.on('touchstart', function(e) {
			window.clearTimeout($el.data('countdownToTapped'));
			$el.data('countdownToTapped', window.setTimeout(function() {
				$el.addClass('tapped');
			}, 5));

			// Always stop propagation on touch events
			// Sorry :(
			e.stopPropagation();

			// TODO: Prevent default scroll behavior (in certain situations)
			// e.preventDefault();
		});

		// When the user lets go
		// Touchend cancels the tapCountdown timer
		// It also fires the event we're interested in if the tapped state is already set
		$el.on('touchend', function(e) {

			if($el.hasClass('tapped')) {
				$el.trigger('touch',e);
			} else {
				window.clearTimeout($el.data('countdownToTapped'));
			}
		});

		// Touchcancel cancels the tapCountdown timer
		// If the user's finger wanders into browser UI, or the touch otherwise needs to be canceled, the touchcancel event is sent
		$el.on('touchcancel', function() {

			if($el.hasClass('tapped')) {
				$el.removeClass('tapped');
			} else {
				window.clearTimeout($el.data('countdownToTapped'));
			}
		});

		// Touchmove cancels the countdownToTapped timer, as well as cancelling the tapped state if it is set
		$el.on('touchmove', function(e) {

			if($el.hasClass('tapped')) {
				$el.removeClass('tapped');
			} else {
				window.clearTimeout($el.data('countdownToTapped'));
			}

			// Prevent propagation of scrolling
			// e.stopPropagation();
			// TODO: Prevent default scroll behavior (in certain situations)
			// e.preventDefault();
		});

}
};
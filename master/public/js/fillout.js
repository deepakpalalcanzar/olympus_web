
/*
$(function() {

	setWindowHeight = function() {

		var contentHeight = $('body').height() - $('#topbar').height() - $('#footer').height() - 60;
		if (contentHeight < 200) {
			$('#content').css({height:200});
			return;
		}
		$('#content').stop().clearQueue().animate({height:contentHeight},100);
	};

	setWindowHeight();

	$(window).resize(_.debounce(setWindowHeight,5));
});
*/
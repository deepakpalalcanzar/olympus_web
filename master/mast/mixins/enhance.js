$(function(){
	var blurTimer;
	
	var blurEffect = function(){
		$(".wrapper").stop().fadeTo(350,0.75);
	};
	
	var unblurEffect = function(){
		window.clearTimeout(blurTimer);
		$(".wrapper").stop().fadeTo(100,1);
	};
	
	$(window).bind('blur',function(){
		window.clearTimeout(blurTimer);
		blurTimer = window.setTimeout(blurEffect,250);
	});
	$(window).bind('focus',unblurEffect);
});
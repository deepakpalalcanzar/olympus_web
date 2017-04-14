Mast.registerComponent('AppearanceComponent',{

	template: '.account-appearance-template',

	events: {
		'change .fontfamily' : 'fontChange',
		'click .submit-appearance' : 'saveConfiguration',
		'click .reset-appearance' : 'resetConfiguration'
	},

	model : {
		header_background 	: '#ffffff',
		navigation_color	: '#4f7ba9',
		body_background		: '#f9f9f9',
		footer_background	: '#f9f9f9',
		font_color			: '#585858',
		font_family			: 'ProzimanovaRegular, Helvetica, Ariel, sans-serif'
	},

	afterRender: function() {

		Mast.Socket.request('/theme/getCurrentTheme', null, function(res, err, next) {

			$('.olympusHeader').colpick({
				color: (typeof res.theme != 'undefined')?res.theme.header:'#ffffff',
	            flat: true,
	            layout: 'hex',
	            submit: 0,
	            onChange: function (hsb, hex, rgb, el, bySetColor) {
	                $("#topbar").css({'background-color': "#" + hex});
	                $("#main-nav li a").css({
	                    background: "#" + hex,
	                    border: "#" + hex
	                });
	            }
	        });
	        $('.olympusBody').colpick({
	        	color: (typeof res.theme != 'undefined')?res.theme.body:'#f9f9f9',
	            flat: true,
	            layout: 'hex',
	            submit: 0,
	            onChange: function (hsb, hex, rgb, el, bySetColor) {
	                $("#content").css({'background-color': "#" + hex});
	                $("#content > div").css({'background': "#" + hex});
	                $(".wrapper").css({'background-color': "#" + hex});
	                // $('.listusers-outlet, .log-outlet, .dropdownActions-outlet').css({'background': "#" + hex});
	                //Commented other outlets to avoid admin panel table listing color conflicts
	                $('.dropdownActions-outlet').css({'background': "#" + hex});
	                $('#body_bg_color').html("#" + hex);
	            }
	        });
	        $('.olympusFooter').colpick({
	        	color: (typeof res.theme != 'undefined')?res.theme.footer:'#f9f9f9',
	            flat: true,
	            layout: 'hex',
	            submit: 0,
	            onChange: function (hsb, hex, rgb, el, bySetColor) {

	                $("#footer").css({'background-color': "#" + hex});
	            }
	        });
	        $('.olympusNav').colpick({
	        	color: (typeof res.theme != 'undefined')?res.theme.navcolor:'#4f7ba9',
	            flat: true,
	            layout: 'hex',
	            submit: 0,
	            onChange: function (hsb, hex, rgb, el, bySetColor) {
	                $(".upload-search-template").css({'background': "#" + hex});
	            }
	        });
	        $('.olympusFont').colpick({
	        	color: (typeof res.theme != 'undefined')?res.theme.font_color:'#585858',
	            flat: true,
	            layout: 'hex',
	            submit: 0,
	            onChange: function (hsb, hex, rgb, el, bySetColor) {

	                $(".inode-name").removeAttr("style");

	                $('body').css({'color': "#" + hex});
	                $('a').css({'color': "#" + hex});
	                $('p, label').css({'color': "#" + hex});
	                $('h1, h2, h3, h4, h5, h6').css({'color': "#" + hex});
	                $('.files-text, .upload-path-name').css({'color': "#636c78"});//Rishabh: upload/Drive dialog labels
	            }
	        });

	        // console.log(res.theme.font_family);
	        // console.log($('select[name="fontFamily"]').length);
	        // console.log($('select[name="fontFamily"] option[value="'+res.theme.font_family+'"]').length);
	        if((typeof res.theme != 'undefined')){
	        	this.$('select[name="fontFamily"] option[value="'+((res.theme.font_family == "Arial, Helvetica, sans-serif")?'ProzimanovaRegular, Helvetica, Ariel, sans-serif':res.theme.font_family)+'"]').prop('selected', true);
	        	$("body, p, a, h1, h2, h3, h4, h5, h6, label").css({ 'font-family' : res.theme.font_family });
	        	$("body, p, a, h1, h2, h3, h4, h5, h6, label").css({ 'color' : res.theme.font_color });
	        	$("p.ajax-loader,p.ajax-loader b,.inode-name,.modified-date").css({ 'color' : '#EFEFEF' });//exception
	        	$('.dropdownActions-outlet').css({'background': "#" + res.theme.body});
	        	$('.files-text, .upload-path-name').css({'color': "#636c78"});//Rishabh: upload/Drive dialog labels
	        }else{
	        	this.$('select[name="fontFamily"] option[value="Arial, Helvetica, sans-serif"]').prop('selected', true);
	        	$("body, p, a, h1, h2, h3, h4, h5, h6, label").css({ 'font-family' : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif' });
	        	$("body, p, a, h1, h2, h3, h4, h5, h6, label").css({ 'color' : '#585858' });
	        	$("p.ajax-loader,p.ajax-loader b,.selected .inode-name,.selected .modified-date").css({ 'color' : '#EFEFEF' });//exception
	        	// $('.dropdownActions-outlet').css({'background': "#f9f9f9"});
	        }
		});
	}, 

	finalizeHeaderColor: function(){
		var workArea = $('.colpick_submit').parent().parent().attr('class');
		var x = $('.colpick_hex_field > input').val();
		if(workArea == 'olympusHeader'){
			$("#top-nav").css({ 'background-color' : "#"+x });
		}else if (workArea == 'olympusBody'){
			$("#content").css({ 'background-color' : "#"+x });
		}else if (workArea == 'olympusFooter'){
			$("#footer").css({ 'background-color' : "#"+x });
		}
	},

	fontChange: function(){
		$("body, p, a, h1, h2, h3, h4, h5, h6, label").css({ 'font-family' : this.$('select[name="fontFamily"]').val() });
	},

	saveConfiguration: function(){
		var themeChanges = this.getThemeColors();

		Mast.Socket.request('/theme/updateColor', themeChanges, function(req, err){
			if(req.type === 'success'){
				alert("Theme updated successfully.");
			}
		});
	},

	resetConfiguration: function(){

		//Reset Header color
		$('.olympusHeader').colpickSetColor('#ffffff');
        $('.olympusBody').colpickSetColor('#f9f9f9');
        $('.olympusFooter').colpickSetColor('#f9f9f9');
        $('.olympusNav').colpickSetColor('#4f7ba9');
        $('.olympusFont').colpickSetColor('#585858');
       
        this.$('select[name="fontFamily"] option[value="Arial, Helvetica, sans-serif"]').prop('selected', true);
        $("body, p, a, h1, h2, h3, h4, h5, h6, label").css({ 'font-family' : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif' });
		//save the reset theme permanently
		var themeChanges = {
			header 		: '#ffffff',
			nav 		: '#4f7ba9',
			body 		: '#f9f9f9',
			footer 		: '#f9f9f9',
			fontColor 	: '#585858',
			fontFamily 	: 'ProzimanovaRegular, Helvetica, Ariel, sans-serif'
		};

		Mast.Socket.request('/theme/updateColor', themeChanges, function(req, err){
			if(req.type === 'success'){
				alert("Theme has been reset successfully.");
			}
		});
	},

	// get theme changes 
	getThemeColors: function() {
		var header, nav, body, footer, fontColor, fontFamily;
		return {
			header 		: $('.olympusHeader .colpick_hex_field input').val(),
			nav 		: $('.olympusNav .colpick_hex_field input').val(),
			body 		: $('.olympusBody .colpick_hex_field input').val(),
			footer 		: $('.olympusFooter .colpick_hex_field input').val(),
			fontColor 	: $('.olympusFont .colpick_hex_field input').val(),
			fontFamily 	: $('select[name="fontFamily"]').val()
		};
	},


});


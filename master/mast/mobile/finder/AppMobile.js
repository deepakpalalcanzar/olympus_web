// AppComponent.m
Mast.registerComponent('AppMobile', {

	template: '.app-mobile-template',

	outlet: 'body',

	init: function() {
		// Hide mobile interface until body is loaded
		var veil = $('<div/>');
		veil.css({
			"background-color":"#fff",
			'background-position': '150px',
			'background-repeat':'no-repeat',
			// 'background-attachment':'fixed',
			// 'background-image': "url('/images/loading-spinner.gif')",
			// USED THE converter here: http://websemantics.co.uk/online_tools/image_to_data_uri_convertor/result/
			'background-image': 'url("data:image/gif;base64,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")',
			position:'fixed',
			top: 0, left: 0,
			width: '100%', height: '130%',
			'z-index': 1000000
		});
		veil.appendTo($('html'));

		// NOTE: This may need to move into $(window).load()
		utils.hideAddressbar();


		$(window).load(function() {
			window.setTimeout(function () {
				veil.fadeOut(700);
			},100);
		});
	},

	subscriptions: {

		// listening for these routes
		'#finder': 'topLevel',
		'#directory/:id': 'directory',
		'#specifics/:type/:id': 'inodeSpecifics',
		'#addPermission/:type/:id': 'addPermission',
		'#addComment/:type/:id': 'addComment',
		'#accountSettings': 'accountSettings'
	},

	topLevel: function() {
		this.attach('.page-region', 'FinderPageMobile');
	},

	directory: function(id) {
		this.attach('.page-region', 'FinderPageMobile', {
			id: id,
			type: 'directory'
		});
	},

	inodeSpecifics: function(type, id) {
		this.attach('.page-region', 'InodeSpecificsMobile', {
			type: type,
			id: id
		});
	},

	addPermission: function(type, id) {
		this.attach('.page-region', 'AddPermissionMobile', {
			type: type,
			id: id
		});
	},

	addComment: function(type, id) {
		this.attach('.page-region', 'AddCommentMobile', {
			type: type,
			id: id
		});
	},

	accountSettings: function() {
		this.attach('.page-region', 'AccountSettingsMobile');
	}

});

/*
 * utils
 * FROM: http://stackoverflow.com/questions/9798158/how-does-jquery-mobile-hide-mobile-safaris-addressbar
 */
var utils = {

	supportTouchOverflow: function() {
		return !!utils.propExists("overflowScrolling");
	},

	supportOrientation: function() {
		return("orientation" in window && "onorientationchange" in window);
	},

	//simply set the active page's minimum height to screen height, depending on orientation
	getScreenHeight: function() {
		var orientation = utils.getOrientation(),
			port = orientation === "portrait",
			winMin = port ? 480 : 320,
			screenHeight = port ? screen.availHeight : screen.availWidth,
			winHeight = Math.max(winMin, $(window).height()),
			pageMin = Math.min(screenHeight, winHeight);

		return pageMin;
	},

	// Get the current page orientation. This method is exposed publicly, should it
	// be needed, as jQuery.event.special.orientationchange.orientation()
	getOrientation: function() {
		var isPortrait = true,
			elem = document.documentElement,
			portrait_map = {
				"0": true,
				"180": true
			};
		// prefer window orientation to the calculation based on screensize as
		// the actual screen resize takes place before or after the orientation change event
		// has been fired depending on implementation (eg android 2.3 is before, iphone after).
		// More testing is required to determine if a more reliable method of determining the new screensize
		// is possible when orientationchange is fired. (eg, use media queries + element + opacity)
		if(utils.supportOrientation()) {
			// if the window orientation registers as 0 or 180 degrees report
			// portrait, otherwise landscape
			isPortrait = portrait_map[window.orientation];
		} else {
			isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
		}

		return isPortrait ? "portrait" : "landscape";
	},

	silentScroll: function(ypos) {
		setTimeout(function() {
			window.scrollTo(0, ypos);
		}, 20);
	},

	propExists: function(prop) {
		var fakeBody = $("<body>").prependTo("html"),
			fbCSS = fakeBody[0].style,
			vendors = ["Webkit", "Moz", "O"],
			uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1),
			props = (prop + " " + vendors.join(uc_prop + " ") + uc_prop).split(" ");

		for(var v in props) {
			if(fbCSS[props[v]] !== undefined) {
				fakeBody.remove();
				return true;
			}
		}
	},

	hideAddressbar: function() {
		if(utils.supportTouchOverflow()) {
			$('body').height(utils.getScreenHeight());
			// $('.mobile-touch-overflow').height(utils.getScreenHeight());
		}
		utils.silentScroll(1);
	}

}; //utils end
Mast.registerComponent('EnterprisesSidebar', {

	template: '.enterprises-sidebar-template',
	outlet: '#content',

	events: {
		'click .close-sidebar'   : 'closeUserSidebar',
	},

	// close the sidebar
	closeUserSidebar: function() {
		// this.parent.set({sidebarDisplayed: false});
		this.$el.animate({
			right: '-500px'
		},200);
		$('.enterprises-row-template').removeClass('highlighted');
		
		//this.close();
	},

// Show the sidebar with an animation
	animateSidebarShow: function() {
		this.parent.set({sidebarDisplayed: true});
	},

// Hide the sidbar with an animation
	animateSidebarHide: function() {
		this.parent.set({sidebarDisplayed: true});
	},

});
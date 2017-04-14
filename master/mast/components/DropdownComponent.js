Mast.registerComponent('DropdownActionRow',{

	template: '.dropdownAction-template',
    
    events: {
        'click'	: 'triggerCallerAction'
    },

    afterCreate: function() {
        //this.$el.disableSelection();
    },



// Using the reference to the `caller` in the parent,
// trigger the appropriate method in the `caller`
// (caller = the component which generated the DropdownComponent)
	triggerCallerAction: function(e) {
        e.stopPropagation();
        this.parent.caller[this.get('method')](e);
        this.parent.hide();
	}

});

Mast.registerTree('DropdownComponent', {

	// will use this to keep track in out generator if the component
	// is being displayed for a particular user
	model: 'DropdownAction',

	template: '.dropdown-template',
	outlet	: 'body',

	emptyHTML		: '',
	branchOutlet	: '.dropdownActions-outlet',
	branchComponent	: 'DropdownActionRow',
	collection		: 'DropdownActions',

	events: {
		'clickoutside': 'hideDropdown',
		'gPressEscape': 'hideDropdown',
		'click'		  : 'hideDropdown'
	},
	
	init: function() {
		if (this.actions) {
			this.collection.reset(this.actions);
		}
	},

	// set the dropdown offset in relation to the
	// dom element that created thedropdown
	setOffset: function(position) {
		this.$el.offset({
			top: position.yPos,
			left: position.xPos
			});																	// Change offset
	},

	// hides dropdown component and sets expanded attribute to false
	hideDropdown: function(e) {
		// close and set global dropdown variable to null
		Olympus.ui.dropdown.close();
		Olympus.ui.dropdown = null;
	},

	hide: function(){
		this.hideDropdown();
	}
});



Mast.registerComponent('UserDropdownComponent', {

	extendsFrom : 'DropdownGeneratorComponent',
	model		: 'UserButton',
	template 	: '#userDropdown-template',
	outlet		: 'body',
	events: {
		// 'clickoutside'			: 'hideDropdown',
		'click li.view-profile': 'viewProfile',
		'click li.password': 'password',
		'click li.email-notification': 'emailNotification',
		'click li.upgrade'     : 'upgrade',
		'click li.settings'    : 'settings',
		'click li.signout'     : 'signout'
	},

	// click event is outside component template so we have to bind this event
	init: function() {
		$('div.name-container div.dropdown-button').on('click', this.showUserDropdown);
	},

	viewProfile: function() {
	},

	upgrade: function() {

	},

	settings: function(){

	},
	
	signout: function() {

	},

	// shows the dropdown menu for inode button
	showUserDropdown: function(e) {
		this.generateUserDropdown();
		this.setUserDropdownOffset();
		this.$el.show();
	},
	
	// generate dropdown where the inode button is
	generateUserDropdown: function() {
		this.setUserDropdownOffset(Olympus.ui.dropdown);
	},

	// find where on the page the inode button is positioned
	// we will need this to tell the action dropdown menu where to be placed
	// when the inode's dropdown button is clicked
	setUserDropdownOffset: function() {
		var buttonOffset = $('div.name-container div.dropdown-button').offset();
	// change offset of dropdown to fit with button
		this.$el.offset({
			top: buttonOffset.top + 30,
			left: buttonOffset.left - 120
		});
	}

});

Mast.registerComponent('DropdownGeneratorComponent', {
	
	events: {
		'clickoutside': 'hideDropdown',
		'gPressEscape': 'hideDropdown',
		'click'		  : 'hideDropdown'
	},

	// set the dropdown offset in relation to the
	// dom element that created thedropdown
	setDropdownOffset: function(eventButton) {
		var buttonOffset = eventButton.$('.dropdown-button').offset();
		Olympus.ui.dropdowns.$el.offset({
			top: buttonOffset.top + 30,
			left: buttonOffset.left - 120
		});

	},
	
	// shows dropdown component and changes expanded attribute to true
	showDropdown: function () {
		this.setDropdownOffset();
	},

	// hides dropdown component and sets expanded attribute to false
	hideDropdown: function() {
		// close and set global dropdown variable to null
		Olympus.ui.dropdown.close();
		Olympus.ui.dropdown = null;
	}
});
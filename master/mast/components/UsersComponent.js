Mast.registerTree('UsersTable', {
	extendsFrom: 'UITableComponent',
	model: {
		column1: {
			name: 'User',
			className: 'user-column'
		},
		selectedModel: null
	},
	
	template: '.users-template',
// branch properties
	emptyHTML      : '',
	branchComponent: 'UserRow',
	branchOutlet   : '.users-outlet',

	collection     : {
		url: '/account/listMembers',
		model: Mast.Model.extend({
			defaults: {
				highlighted : false,
				name        : typeof this.name !== 'undefined' ? this.name : '' ,
				avatarSrc   : typeof this.avatarSrc !== 'undefined' ? 'images'+this.avatarSrc : 'images/icon_profilePicture_default@2x.png' ,
				job_title   : typeof this.title !== 'undefined' ? this.title : '' ,
				email       : typeof this.email !== 'undefined' ? this.email : '',
				phone: typeof this.phone !== 'undefined' ? this.phone : ''
			},
			selectedModel: null
		})

	},

	bindings: {
// set highlight to false except for newly selected user
		selectedModel: function(newModel) {
			this.collection.invoke('set', 'highlighted', false);
			newModel.set({highlighted: true});
		}
	},

	openSidebar: function() {
		this.parent.set({sidebarDisplayed: true});
	},

	closeSidebar: function() {
		this.parent.set({sidebarDisplayed: false});
	}
	
});


// user row component
Mast.registerComponent('UserRow', {

	template: '.user-row-template',

	bindings: {
		highlighted: function(newVal) {
			if (newVal) {
				this.addHighlight();
			} else {
				this.removeHighlight();
			}
		}
	},

	events: {
		'click'   : 'selectUser',
		'dblclick': 'openSidebar',
	},

// Selects the user that was clicked on. gives the parent the current users model
	selectUser: function() {
		this.parent.set({selectedModel: this.model});
	},

// Creates an instance of the sidebar with the data of this current users
	openSidebar: function() {
		Mast.Session.User = this.model.attributes;
		Mast.navigate('user/details');
	},

// Add highlight to the User row
	addHighlight: function() {
		this.$el.addClass('highlighted');
	},

// Remove highlight from the User row
	removeHighlight: function() {
		this.$el.removeClass('highlighted');
	},
});
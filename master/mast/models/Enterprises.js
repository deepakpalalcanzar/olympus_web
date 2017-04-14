Mast.registerModel('Enterprises', {
	defaults: function() {
		return {
			name: 'Loading...',
			avatar: '/images/avatar_anonymous.png',
			dropdownItems	: [
				{
					method	: 'lockUser',
					name	: 'Lock User',
				},
				{
					method	: 'updateInfo',
					name	: 'Update User',
				},
				{
					method	: 'changePassword',
					name	: 'Change Password',
				},
				{
					method	: 'deleteUser',
					name	: 'Delete',
				}
			]
		};
	}
});
Mast.registerComponent('QuotasComponent', {

	model: {
		sizeString: 3.8,
		quotaString: 5,
		editing: false,
		percentageFull: 0
	},

	template: '.quotas-template',

	events: {
		// 'click .quota-editing': 'editQuota',
		// 'pressEnter': function () {
		// 	if (this.get('editing')) {
		// 		this.set('editing',false);
		// 		this.setQuota();
		// 	}
		// }
	},

	bindings: {

		quota: function () {},

		editing: function (editing) {},

		quotaString: function (newVal) {
			this.$('.set-quota').val(newVal);
			this.$('.quota-string').text(newVal);
		},

		sizeString: function (newVal) {
			this.$('.size-string').text(newVal);
		},

		percentageFull: function(newVal) {
			this.$('.quota-percentage').animate({width: newVal + '%'});
		}
	},

	afterRender: function () {
		// this.$('.quota-percentage').css({width: this.get('percentageFull') + '%'});
		var editing = this.get('editing');
		this.$('.quota-editing.done-button')[editing ? 'show' : 'hide']();
		this.$('.quota-editing.edit-button')[editing ? 'hide' : 'show']();
		this.$('.set-quota')[editing ? 'show' : 'hide']();
		this.$('.quota-string')[editing ? 'hide' : 'show']();
	},

	afterCreate: function() {

		var self = this;

		this.set('id', this.parent.get('id'), {
			silent: true
		});
		this.model.urlRoot = '/directory';


		this.model.fetch({
			success: function() {

				self.set({
					//'quotaString': self.get('quota') / Math.pow(10, 9),

                                        'quotaString':(self.get('quota')  > 9000000000000006000) ?'Unlimited':self.get('quota') / Math.pow(10, 9)  + ' GB',
					'sizeString': self.marshalSize(self.get('size'))
				});
				self.set('percentageFull', self.calculatePercentFull());
			}
		}, {silent:true});
	},

	// We will first set the quota if we are in editing mode. We then change editing modes
    // which will change the template for us as needed.
    //
    // NOTE: Disable this functionalty for now.
    //
	// editQuota: function() {
	// 	if(this.get('editing')) {
	// 		this.setQuota();
	// 	}
	// 	this.set('editing', !this.get('editing'));
	// },

	// set the quota based on the input given.
	// setQuota: function() {

	// 	var self = this;
	// 	var newQuota = this.convertQuota(this.$('.set-quota').val());

	// 	// If this is not a valid quota pop up an alert.
	// 	// TODO: replace this with an input error class instead of an annoying alert/
	// 	if(!this.isValidQuota(newQuota)) {
	// 		alert('Please enter a valid Quota');

	// 	// The quota is valid so we will now set the quota to the new value and save it to the DB
	// 	// Finally calculate and set the percentage of the quoata used up.
	// 	} else {
 //      Mast.Socket._socket.emit('message', JSON.stringify({ url: '/folders/quota', data: {folderId:this.model.get('id'), quota: newQuota}, method:'post' }), function(msg){})
	// 		this.set('quota', newQuota);
	// 		self.set('quotaString', self.get('quota') / Math.pow(10, 9));
	// 		this.save();
	// 		self.set('percentageFull', self.calculatePercentFull());
	// 	}
	// },

	// // checks that the quota entered in valid
	// isValidQuota: function(value) {
	// 	var posNumRegex = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;

	// 	// Make sure that the value is a positive int or floating number.
	// 	// Also Make sure that the value entered is larger then the current size
	// 	// of the directory.
	// 	return posNumRegex.test(value) && value > this.get('size');
	// },

	// Convert the quota given to bytes. Return the result.
	// convertQuota: function(value) {
	// 	return value * Math.pow(10, 9);
	// },

	// calculate the percentage full by dividing the size * 100 by the quota.
	calculatePercentFull: function() {
		var percentage = (this.get('size') * 100) / this.get('quota');
		return percentage;
	},

	// marshal given value into presentable format
	marshalSize: function(size) {
		var modelSize = size;

		// format the byte size of the stored size into a string that we can use to display.
		var formatedSize = modelSize > 1000000000 ? (Math.round((modelSize / 10000000)) / 100) + " GB" :
											 modelSize > 1000000 ? (Math.round((modelSize / 10000)) / 100) + " MB" :
											 modelSize > 1000 ? (Math.round((modelSize / 10)) / 100) + " KB" :
											 modelSize + " bytes";

		return formatedSize;
	}

});

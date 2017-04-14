Mast.registerComponent('SubscriptionNotifications', {

	model: {
		features 			: 'None',
		user_limit			: 'None',
		price				: '0.00',
		duration_from		: 'None',
		duration_to 	    : 'None',
	},

	template: '.subscription-notifications-template',

	afterConnect: function() {
		
		var self = this;
		var account = {'acc_id':Mast.Session.Account.id}

		Mast.Socket.request('/subscription/subscribedPlan', account, function(res, err){
			if(res){
				console.log(res);
				var duration_from;
				var duration_to;
				if(res[0].duration == '1200'){//Unlimited
					duration_from 	= '';
					duration_to 	= 'Unlimited';
				}else{
					duration_from 	= res[0].acc_created;
					duration_to 	= res[0].expiryDate;
				}


				var data = {

					features 		: res[0].plan_name,
					user_limit		: res[0].users_limit,
					price			: res[0].price,
					duration_from   : duration_from,
					duration_to     : duration_to,
					quota     		: res[0].quota === '1000000000000' ? 'Unlimited' : ((res[0].quota)/1000000000)+" GB",
				}

				self.set(data);
 			}
		});

	},

	events: {
		'click .upgrade-subscription': 'upgrade',
	},

	upgrade:function(){
		Mast.Session.subscription = this.model.attributes;
		Mast.navigate('subscription/upgrade');
	},

});

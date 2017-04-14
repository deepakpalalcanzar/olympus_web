/**
 * This service converts post-logic output from controllers
 * into a standardized API format.
 *
 * Separating the logic here allows for more streamlined development
 * of additional compatibility wrappers down the road.
 *
 * This service MUST NOT TALK TO THE DATABASE WHATSOEVER!
 * It exists as an api view preprocesse rand should provide instantaneous output.
 */

var mime = require('mime');

var API = function(model) { // Smart detection of model type, returns appropriate API object
		model = (model && model.getModelName) ? model : {};
		var APIObject = _.capitalize(model.getModelName());
		return exports[APIObject](model);
	};

exports.API = apiTransform(API);
exports.API.mini = exports.API;


var Directory = function(model) { // Directory
	return _.extend(File(model), {
		// num_children: (+model.num_dir_children + +model.num_file_children) || 0,
		num_children: 10,
		type: 'directory',
		mimetype: null,
		size: model.size,
		sizeString: model.size &&
					model.size > 1000000000 ? (Math.round((model.size/10000000))/100) + " GB" :
					model.size > 1000000 ? (Math.round((model.size/10000))/100)  + " MB":
					model.size > 1000 ? (Math.round((model.size/10))/100) + " KB":
					model.size + " bytes",
		quota: model.quota,
		public_sublinks_enabled: model.public_sublinks_enabled
	});
};
exports.Directory = apiTransform(Directory);
exports.Directory.mini = exports.Directory;



var File = function(model) { // File
		return {
			id: model.id,
			name: model.name,
			num_comments: model.num_comments || 0,
			num_active: (model.getNumActiveUsers && model.getNumActiveUsers()) || 0,
			modified_at: model.updatedAt,
			modified_by: {
				id: model.AccountId,
				name: model.AccountName,
				login: model.AccountLogin,
				// avatar: '/images/' + model.AccountId + '.png',
				avatar: getAvatarImage(model.AccountId),
				type: 'account'
			},
			created_at: model.createdAt,
			created_by: {
				id: model.AccountId,
				name: model.AccountName,
				login: model.AccountLogin,
				// avatar: '/images/' + model.AccountId + '.png',
				avatar: getAvatarImage(model.AccountId),
				type: 'account'
			},
			parent: {
				id: model.directoryId,
				name: null,
				// TODO: in Box.net api, but not necessary for our 1.0 client
				type: 'directory'
			},
			public_link_enabled: model.public_link_enabled,
			fsName: model.fsName,
			permission: model.permission,
			// the type of permission the current account has on the inode
			mimetype: model.mimetype !== null ? model.mimetype : mime.lookup(model.name),
			size: model.size,
			sizeString: model.size &&
						model.size > 1000000000 ? (Math.round((model.size/10000000))/100) + " GB" :
						model.size > 1000000 ? (Math.round((model.size/10000))/100)  + " MB":
						model.size > 1000 ? (Math.round((model.size/10))/100) + " KB":
						model.size + " bytes",
			type: 'file'
		};
	};
exports.File = apiTransform(File);
exports.File.mini = exports.File;

// Account
var Account = function(model) {

	return {
		id 		: model.id,
		name 	: model.name,
		email 	: model.email,
		login 	: model.login,
		phone 	: model.phone || '',
		title 	: model.title || '',
		avatar 	: getAvatarImage(model.id),
		isAdmin : model.isAdmin,
		type 	: 'account',
		isSuperAdmin : model.isSuperAdmin, // check for superadmin
		isEnterprise : model.is_enterprise, 
		avatar_image : model.avatar_image, 
	};
};
exports.Account = apiTransform(Account);
exports.Account.mini = exports.Account;


var Permission = function(model) { // Permission
	return {
		owned_by: {
			id 		: model.AccountId,
			name 	: model.name,
			email 	: model.email,
			login 	: model.login,
			profile_image 	: model.avatar_image,
			//avatar: getAvatarImage(model.AccountId),
			type: 'account'
		},
		permission: model.permission,
		type: 'permission'
	};
};
exports.Permission = apiTransform(Permission);
exports.Permission.mini = exports.Permission;


var Activity = function(model) { // Activity


	return {
		id: model.id,
		is_reply_comment: false,
		message: model.payload,
		item: {
			id: model.ItemId,
			type: (model.directoryId) ? 'directory' : 'file'
		},
		modified_at: model.updatedAt,
                
		modified_by: {
			id: model.accountId,
			name: model.AccountName,
			login: model.AccountLogin,
			avatar: '/images/profile/'+model.avatar_image !== null ? '/images/profile/'+model.avatar_image : 'images/avatar_anonymous.png',
			// avatar: '/images/' + model.AccountId + '.png',
			// avatar: getAvatarImage(model.AccountId),
			type: 'account'
		},
                
		created_at: model.createdAt,
		created_by: {
			id: model.accountId,
			name: model.AccountName,
			login: model.AccountLogin,
			// avatar: '/images/' + model.AccountId + '.png',
			//avatar: '/images/profile/'+model.avatar_image,
			avatar: model.avatar_image !== null ? '/images/profile/'+model.avatar_image : 'images/avatar_anonymous.png',
			// avatar: getAvatarImage(model.AccountId),
			type: 'account'
		},
		type: 'comment'
                
                
	};
        // console.log(model.avatar);
};



exports.Activity = apiTransform(Activity);
exports.Activity.mini = exports.Activity;
exports.Comment = apiTransform(Activity); // Comment (synonym for Activity)
exports.Comment.mini = exports.Comment;

var Version= function (model){
	return {
		id: model.id,
		is_reply_comment: false,
		message: model.name,
		item: {
			id: model.version,
			type: (model.directoryId) ? 'directory' : 'file'
		},
		modified_at: model.updatedAt,
		modified_by: {
			id: '1',
			name: 'admin',
//			login: model.AccountLogin,
			// avatar: '/images/' + model.AccountId + '.png',
			avatar: getAvatarImage('1'),
			type: 'account'
		},
		created_at: model.createdAt,
		created_by: {
			id: '1',
			name: model.acc_name,
//			login: model.AccountLogin,
			avatar: getAvatarImage('1'),
			type: 'account'
		},
	};
};
exports.Version = apiTransform(Version);
exports.Version.mini = exports.Version;

var Event = function(event_type, created_at, source) { // Event
		return {
			type: 'event',
			created_at: created_at,
			event_type: event_type,
			//		session_id	: "1512069634f84626d8b",
			source: source
		};
	};
exports.Event = eventApiTransform(Event);
exports.Event.mini = exports.Event;


// Error
exports.Error = function(error) {
	return {
		error: error,
		type: 'error'
	};
};
exports.Error = apiTransform(exports.Error);


/**
 * Map the collection using the specified transformer function
 * Note: collection may be a list of models -OR- a single model
 */
function apiTransform(transformerFn) {
	return function(collection) {
		if(_.isArray(collection)) {
			return _.map(collection, transformerFn);
		} else {
			return transformerFn(collection);
		}
	};
}

function eventApiTransform(transformerFn) {
	return function(event_type, created_at, collection) {
		if(_.isArray(collection)) {
			return _.map(collection, function() {
				return transformerFn(event_type, created_at, collection);
			});
		} else {
			return transformerFn(event_type, created_at, collection);
		}
	};
}

function getAvatarImage(modelID) {
	return (modelID === 1) ? '/images/' + modelID + '.png' : '/images/avatar_anonymous.png';
}

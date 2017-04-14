/**
 * Abstract parent class for Files and Directories
 */
Mast.models.INode = Mast.Model.extend({

	_class: 'INode',

	initialize: function () {
		_.bindAll(this);
	},

	defaults: function() {
		return {
			type        : 'directory',
			id        	: '',
			name        : 'New Folder',
			mimetype    : '',
			mimeClass   : '',
			modifiedAt  : null,
			modifiedBy  : '',
			numUsers    : 0,
			numActive   : 0,
			numComments : 0,
			size        : 1024,
			sizeString  : "",
			fsName		: "",
			depth       : 0,
			state       : '',
			num_children: 0,
			selected    : false,
			editing     : false,
			workgroup   : false,
			public_link_enabled	: true,
			link_password_enabled : false,
			link_password : '',			
			url	: null,
			isOnDrive	: false,
			isOnDropbox	: false,
			isOnBox				: false,
			isOlympusDriveDir	: false,
			isOlympusDropboxDir	: false,
			iconLink	: '',

			dropdownItems: [{
				method : 'comment',
				name   : 'Comment'
				// iconSrc: '/images/icon_dropdown_comment.png'
			}, {
				method : 'share',
				name   : 'Share'
				// iconSrc: '/images/icon_dropdown_sharing.png'
			},  {
				method : 'dropdownRename',
				name   : 'Rename'
				// iconSrc: '/images/icon_dropdown_update.png'
			}, {
				method : 'setVersion',
				name   : 'Manage Workgroup'
				// iconSrc: '/images/icon_dropdown_delete.png'
			}, {
				method : 'delete',
				name   : 'Delete'
				// iconSrc: '/images/icon_dropdown_delete.png'
			}

			]
		};
	},

	// Marshal server-side model into presentable format
	marshal: function(i) {
		return _.extend(i, {
			
			// test	   : this.link_password_enabled,
			// testin		: this.link_password,
			// test2		:i['link_password'],
			// testin2		:i['link_password_enabled'],
			urlRoot    : "/" + i['type'] + "/",
			numActive  : i['num_active'],
			numComments: i['num_comments'],
			//modifiedBy : i['modified_by']['name'],
			modifiedAt : moment(new Date(i['modified_at'])).fromNow(),
			mimeClass  : i['mimetype'] ? i['mimetype'].replace(/[\/.]/g, '-') : '',
			//link       : Mast.Socket.baseurl+"/file/public/"+i['fsName']+'/'+encodeURIComponent(i['name']),
			link       : Mast.Socket.baseurl+"/file/publicDownload/"+i['fsName']+'/'+encodeURIComponent(i['name']),
			//link       : Mast.Socket.baseurl+"/file/download/"+i['id'],
			//link : Mast.Socket.baseurl+"/file/open/"+i['id']+"/"+i['name'],
			
			// Determine whether or not to show the option for enabling a public link in the UI
			showPublicLinkOption: function() {
				return (this.allowPublicDownloads() && this.type=='file' &&
						this.permission == 'admin');
			},

			// Determine whether or not to show the option for enabling a public links for a folder's contents in the UI
			showPublicSublinksOption: function() {
				return (this.allowPublicDownloads() && this.type=='directory' &&
						this.permission == 'admin');
			},
			
			// Determine whether a file / folder is allowed to have a public link, by checking all of its
			// ancestors.
			allowPublicDownloads: function(){

				// If this is a file on the top level (orphaned) then don't allow public links
				if (this.type=='file' && (this.parent === null || this.parent.id === null)) {
					return false;
				}

				// Otherwise if the parent says no, it's a no.  Bit hacky here--we don't know id the "parent"
				// property will be a full model or a just an object with a public_sublinks_enabled property,
				// so we'll test for "get".
				else if ((!_.isUndefined(this.parent.get) && this.parent.get('public_sublinks_enabled') == false) || (!_.isUndefined(this.parent.public_sublinks_enabled) && this.parent.public_sublinks_enabled == false)) {
					return false;
				}

				// Otherwise if the parent has an "allowPublicDownloads" function, call it to recursively
				// check up the tree.  Every ancestor must allow public links for us to ultimately return "true"
				else if (!_.isUndefined(this.parent.model) && !_.isUndefined(this.parent.model.attributes.allowPublicDownloads)) {
					return this.parent.model.attributes.allowPublicDownloads();
				}

				// Otherwise we're in the top level of a workgroup with public_link_enabled=true,
				// so public sharing is a go!
				else {
					return true;
				}
			},

// Determine whether to show the public link for a file / folder in the UI
			showPublicLink: function() {
				return (this.allowPublicDownloads() && this.type=='file' && (this.public_link_enabled || this.permission == 'admin'));
			},
			
			showLinkPassword: function() {
				return (this.allowPublicDownloads() && this.type=='file' && this.link_password_enabled && (this.permission == 'admin'));
			},

			showLinkPasswordOption: function() {
				return (this.allowPublicDownloads() && this.type=='file' && (this.permission == 'admin'));
			}
		});
	}
});

// Virtual models
Mast.models.File = Mast.models.INode.extend({
	_class: 'file'
});

Mast.models.Directory = Mast.models.INode.extend({
	_class: 'directory'
});

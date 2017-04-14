/*---------------------
  :: Theme
  -> model
---------------------*/

var bcrypt = require('bcrypt'),
    lockUtils = require('../services/lib/account/lock'),
    deleteUtils = require('../services/lib/account/destroy'),
    crypto = require('crypto'),
    Q = require('q');

module.exports = {
	attributes: {

		account_id : 'string',

		header_background   : {
			type: 'string',
			defaultsTo: '#ffffff'
		},
		navigation_color   	: {
			type: 'string',
			defaultsTo: '#4f7ba9'
		},
		body_background 	: {
			type: 'string',
			defaultsTo: '#f9f9f9'
		},
		footer_background 	: {
			type: 'string',
			defaultsTo: '#f9f9f9'
		},
		font_color : {
			type: 'string',
			defaultsTo: '#585858'
		},
		font_family : {
			type: 'string',
			defaultsTo: 'ProzimanovaRegular, Helvetica, Ariel, sans-serif'
		},
	},

	
	saveColors: function(options, cb){

		Theme.findOne({
			account_id: options.account_id
    		}).exec(function (err, themeOne) {

        		if (err) return cb && cb(err);   
	    		if(themeOne){
	 	           	Theme.update({ id : themeOne.id }, {
	 	           		header_background : options.headerColor !== "#undefined" ? options.headerColor 	: themeOne.header_background,
	 	           		navigation_color  : options.navColor 	!== "#undefined" ? options.navColor 	: themeOne.navigation_color,
	 	           		body_background	  : options.bodyColor 	!== "#undefined" ? options.bodyColor 	: themeOne.body_background,
					footer_background : options.footerColor !== "#undefined" ? options.footerColor 	: themeOne.footer_background,
					font_color	  : options.fontColor 	!== "#undefined" ? options.fontColor 	: themeOne.font_color,  
					font_family	  : options.fontFamily 	!== '' 		 ? options.fontFamily 	: themeOne.font_family
				}).then(function (theme){
			    	    return cb && cb(null, theme);  
				});
			}else{
				Theme.create({
					header_background : options.headerColor,
					navigation_color  : options.navColor,
					body_background	  : options.bodyColor,
					footer_background : options.footerColor,
					font_color	  : options.fontColor,
					font_family	  : options.fontFamily,
					account_id	  : options.account_id
				}).exec(function foundAccount (err, theme) {
				    if (err) return cb && cb(err);   
				    return cb && cb(null, theme);  
				});
	    		}
		});
	}	
};

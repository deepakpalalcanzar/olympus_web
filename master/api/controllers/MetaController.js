var MetaController = {
	
	// Optionally identify the controller here
	// Otherwise name will be based off of filename
	// CASE-INSENSITIVE
	id: 'meta',
	
	home: function (req,res) {

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		req.session.Account.ip = ip;
		var enterpriseLogo, hideSetting=0; 

		Account.find({
			where: { id: req.session.Account.id }
		}).done(function(err, account) {

			if (err) return res.send(500,err);
			
			Account.find({
				where: { id : account.created_by }
			}).done(function(errs, createdBy){
				
				if(createdBy){
					if(createdBy.enterprise_fsname !== null && createdBy.enterprise_fsname !== '' ){
						if(createdBy.isSuperAdmin !== 1){
							enterpriseLogo = createdBy.enterprise_fsname;
						}else{
							enterpriseLogo = account.enterprise_fsname;
						}

					}else{

						if(account.enterprise_fsname !== null && account.enterprise_fsname !== ''){
							enterpriseLogo = account.enterprise_fsname;
						}else{
							enterpriseLogo = '';
						}
					}
					hideSetting= 1;
				}else{

					enterpriseLogo = account.enterprise_fsname;

				}

				if(account.isSuperAdmin){

					Theme.find({
						where : { account_id: req.session.Account.id  }
					}).done(function(err, theme){
						if(theme === null){

							res.view('meta/superadmin',{
								is_super_admin	: '1',
								apps 			: account.created_by,
								email 			: account.email,
								enterprise_logo : enterpriseLogo,
								avatar 			: account.avatar_image,
								setting 		: hideSetting,
								header_color 	 : '#FFFFFF',
								navigation_color : '#4f7ba9',
								body_background  : '#f9f9f9',
								footer_background: '#f9f9f9',
								font_family 	 : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
								font_color 	 	 : '#547aa4'
 
							});

						}else{

							res.view('meta/superadmin',{
								is_super_admin	: '1',
								apps 			: account.created_by,
								email 			: account.email,
								enterprise_logo : enterpriseLogo,
								avatar 			: account.avatar_image,
								setting 		: hideSetting,
								header_color 	 : theme.header_background 	!== '' ? theme.header_background : '#FFFFFF',
								navigation_color : theme.navigation_color 	!== '' ? theme.navigation_color : '#4f7ba9',
								body_background  : theme.body_background 	!== '' ? theme.body_background : '#f9f9f9',
								footer_background: theme.footer_background 	!== '' ? theme.footer_background : '#f9f9f9',
								font_family 	 : theme.font_family 		!== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
								font_color 	 	 : theme.font_color 		!== '' ? theme.font_color : '#547aa4'
 
							});

						}
					});

				}else{

					if(req.session.Account.isAdmin === true){

						Theme.find({
							where : { account_id: req.session.Account.id  }
						}).done(function(err, theme){

							if(theme === null){

							res.view('meta/workgroupadmin',{
								is_super_admin	: '0',
								apps 			 : account.created_by,
								email 			 : account.email,
								enterprise_logo  : enterpriseLogo,
								avatar 			 : account.avatar_image,
								setting 		 : hideSetting, 
								header_color 	 : '#FFFFFF',
								navigation_color : '#4f7ba9',
								body_background  : '#f9f9f9',
								footer_background: '#f9f9f9',
								font_family 	 : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
								font_color 	 	 : '#547aa4'
							});
	
							}else{
								res.view('meta/workgroupadmin',{
									is_super_admin	: '0',
									apps 			 : account.created_by,
									email 			 : account.email,
									enterprise_logo  : enterpriseLogo,
									avatar 			 : account.avatar_image,
									setting 		 : hideSetting, 
									header_color 	 : theme.header_background 	!== '' ? theme.header_background : '#FFFFFF',
									navigation_color : theme.navigation_color 	!== '' ? theme.navigation_color : '#4f7ba9',
									body_background  : theme.body_background 	!== '' ? theme.body_background : '#f9f9f9',
									footer_background: theme.footer_background 	!== '' ? theme.footer_background : '#f9f9f9',
									font_family 	 : theme.font_family 		!== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
									font_color 	 	 : theme.font_color 		!== '' ? theme.font_color : '#547aa4'
								});
							}
						});


					}else{
/******profile condition******/
						var sql = "SELECT au.*,p.* FROM adminuser au JOIN profile p on "+
						"au.admin_profile_id=p.id WHERE user_id=?";
						sql = Sequelize.Utils.format([sql, account.id]);
						sequelize.query(sql, null, {
							raw: true
						}).success(function(adminuser) {


							Theme.find({
								where : { account_id: account.created_by  }
							}).done(function(err, theme){
								
								if(theme === null){

									res.view('meta/home',{
										is_super_admin	: '0',
										apps 			 : account.created_by,
										email 			 : account.email,
										enterprise_logo  : enterpriseLogo,
										avatar 			 : account.avatar_image,
										profile			 : adminuser,		
										setting 		 : hideSetting, 
										header_color 	 : '#FFFFFF',
										navigation_color : '#4f7ba9',
										body_background  : '#f9f9f9',
										footer_background: '#f9f9f9',
										font_family 	 : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
										font_color 	 	 : '#547aa4'
									});
	
								}else{
									
									res.view('meta/home',{
										is_super_admin	: '0',
										apps 			 : account.created_by,
										email 			 : account.email,
										enterprise_logo  : enterpriseLogo,
										avatar 			 : account.avatar_image,
										profile			 : adminuser,
										setting 		 : hideSetting, 
										header_color 	 : theme.header_background 	!== '' ? theme.header_background : '#FFFFFF',
										navigation_color : theme.navigation_color 	!== '' ? theme.navigation_color : '#4f7ba9',
										body_background  : theme.body_background 	!== '' ? theme.body_background : '#f9f9f9',
										footer_background: theme.footer_background 	!== '' ? theme.footer_background : '#f9f9f9',
										font_family 	 : theme.font_family 		!== '' ? theme.font_family : 'ProzimanovaRegular, Helvetica, Ariel, sans-serif',
										font_color 	 	 : theme.font_color 		!== '' ? theme.font_color : '#547aa4'
									});
								}
							});
	
							// res.view('meta/home',{
							// 	apps			: account.created_by,
							// 	email			: account.email,
							// 	profile			: adminuser,
							// 	enterprise_logo: enterpriseLogo,
							// 	avatar: account.avatar_image,
							// 	setting: hideSetting 

							// });
	
						}).error(function(e) {
							throw new Error(e);
						});
/******end profile condition******/
					}
				}	
			});
		});
	},

	error: function (req,res) {
		res.view('500', {
			title: 'Error (500)'
		});
	},

	notfound: function (req,res) {
		res.view('404', {
			title: 'Not Found (404)'
		});
	},

	denied: function (req,res) {
		res.view('403', {
			title: 'Access Denied (403)'
		});
	}
};
_.extend(exports,MetaController);
module.exports = {

									specialAdminCode: 'ad8h4FJADSLJah34ajsdajchALz2494gasdasdhjasdhj23bn',

									mandrillApiKey: 'MANDRILL_API_KEY',

									bootstrap: function(bootstrap_cb) {

										if(bootstrap_cb) bootstrap_cb();

									},


									fileAdapter: {
 // Which adapter to use

										adapter: 'disk',

										// Amazon S3 API credentials

											s3: {

												accessKeyId		: 'AWS_ACCESS_KEY_ID',

												secretAccessKey	: 'AWS_SECRET_ACCESS_KEY',

												bucket			: 'AWS_BUCKET',

												region			: 'US_EAST_1'

											},

										// OpenStack Swift API credentials

											swift: {

												host  		: 'SWIFT_HOST',

												port 		: 'SWIFT_PORT',

												serviceHash : 'SWIFT_HASH',

												container 	: 'SWIFT_CONTAINER',

											},

										// Keystone API credentials

											keystone: {

												host    : '',

												port    : '',

												tenant  : '', // tenant === 'project' in Horizon dashboard

												username: '',

												password: ''

											}

										},



								// Default title for layout

									appName: 'Olympus | Sharing the Cloud',


								// App hostname

									host: 'localhost',


								// App root path

									appPath: __dirname + '/..',


								// Port to run the app on


									port: '443', //5008,

								    express: {

										serverOptions: {

									   		ca: fs.readFileSync(__dirname + '/../ssl/gd_bundle.crt'),

									   		key: fs.readFileSync(__dirname + '/../ssl/olympus.key'),

									   		cert: fs.readFileSync(__dirname + '/../ssl/olympus.crt')

										}

									},


								// Development or production environment

									environment: 'development',


								// Path to the static web root for serving images, css, etc.

									staticPath: './public',


								// Rigging configuration (automatic asset compilation)

									rigging: {

										outputPath: './.compiled',

										sequence: ['./public/dependencies', './public/js/blueimp/vendor', './public/js/blueimp/cors', './public/js/blueimp/main', './mast']

									},


								// Prune the session before returning it to the client over socket.io

									sessionPruneFn: function(session) {

										var avatar = (session.Account && session.Account.id === 1) ? '/images/' + session.Account.id + '.png' : '/images/avatar_anonymous.png';

										var prunedSession = {

											Account: _.extend(session.Account || {}, {

												avatar: avatar

											})

										};

										return prunedSession;

									},

								// API token

									apiToken: 'Xw46nGv1Nrearden',

								// Information about your organization

									organization: {

										name: 'Olympus',

										copyright: '&copy; Olympus.io Inc.',

										squareLogoSrc: '/images/logo_square.png',

								// Configurable footer link endpoints

										links: {

											termsOfUse: 'http://www.olympus.io/terms-and-privacy/',

											privacyPolicy: 'http://www.olympus.io/privacy/',

											help: 'http://www.olympus.io/contact-us/'

										}

									},

									publicLinksEnabledByDefault: true,

								// NOTE: This is just to test for privateDevelopment feature. Need to figure out

								// what determines this config options and implement that.

	    							privateDeployment: false,

	    							trash_setting: 'manual',

            						trash_setting_days: '',

								};

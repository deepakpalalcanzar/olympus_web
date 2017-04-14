module.exports = {

	// (Note: global blueprint config may be overridden on a per-controller basis
	//			by setting the 'blueprint' property in a controller)
	blueprints: {

		// Optional mount path prefix for blueprint routes
		// e.g. '/api/v2'
		prefix: '',


		// Routes to automatically inject
		routes: {

			// Automatically create routes for every action in the controller
			// (also maps `index` to /:controller)
			'get /:controller/:action?': false,
			'post /:controller/:action?': false,
			'put /:controller/:action?': false,
			'delete /:controller/:action?': false,


			// REST shortcuts
			//
			// ** NOTE **
			// These REST shortcuts exist for your convenience during development,
			// but you'll want to disable them in production.
			'/:controller/find/:id?': false,
			'/:controller/create': false,
			'/:controller/update/:id': false,
			'/:controller/destroy/:id': false,


			// REST methods
			'get /:controller/:id?': false,
			'post /:controller': false,
			'put /:controller/:id': false,
			'delete /:controller/:id': false

		},


		// If a blueprint REST route catches a request,
		// only match an `id` if it's an integer
		//
		// e.g.	only fire route if requests look like:
		//		get /user/8
		// instead of:
		//		get /user/a8j4g9jsd9ga4ghjasdha
		expectIntegerId: true

	},


	// CSRF middleware protection, all non-GET requests must send '_csrf' parmeter
	// _csrf is a parameter for views, and is also available via GET at /csrfToken
	csrf: false

};

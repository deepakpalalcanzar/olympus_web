## INSTALLATION AND CONFIGURATION

> + make sure node is installed
> + make sure mysql is installed

```bash
ssh geoff@54.225.128.178
# Password = 3brc7d

cd /opt
mkdir olympus
cd olympus

# Now get the code
# Use your github username and password when prompted
git clone -b master https://github.com/balderdashy/olympus-blackops.git master
git clone -b api https://github.com/balderdashy/olympus-blackops.git api


################################################
################################################
################ API ################
################################################

# Go in to `api`
cd api

# Install dependencies for `api`
# (note: sudo is probably not necessary, but just to be safe-- npm is finicky about permissions)
sudo npm install


# Make sure database exists
# This will kill your old database if it's named olympus
mysql -u root -ptruvan1x < dropAndRecreateDb.sql


# Configure `api` (copy the example local.ex.js file into config/local.js)
cp local.ex.js config/local.js

```

##### Change these things in `config/local.js`:

```
s3: {
	API_KEY: 'AKIAIUPRTVZFV3GJR6DA',
	API_SECRET: 'oe1yot2eKCrxZ4IbB/gSPZPtq9NCrmZvDvxaWZ//',
	BUCKET: 'app.olympus.io'
},
MYSQL: { PASS: 'truvan1x', DB: 'olympus' }
```


##### You may want to change these things in `config/application.js`:

```
// ...
hostName: 'app.olympus.io',

// doesn't need to be https-- the other master app resolves the SSL
protocol: 'http://'
mandrill: { token: '...mandrill_account_api_token..' }
// ...
```



```bash
# Start the server (in `api`)
# We need to Sails to auto-migrate (create our tables)
sudo node app.js

#####
# You can ignore any errors from Grunt for now-
# The API branch doesn't actually use it.
#####


# Then kill the server (hit CTRL+C)--
# you just needed to run it to create the tables


# Set the auto-increment ID for the Directory table
# This gives us breathing room and makes sure directory ids don't collide with file ids
mysql -u root -ptruvan1x < setDirectoryAI.sql

```

## master (old app)

```
################################################
################################################
################ MASTER ################
################################################

# Now go into `master`
cd ../master


# Install (the rest of the) dependencies for `master` (a lot of them are checked in)
# (note: sudo is probably not necessary, but just to be safe-- npm is finicky about permissions)
sudo npm install


# Copy config example 
cp config/localConfig.ex.js config/localConfig.js

```


##### Change/add these things in `config/localConfig.js`:

```
datasource: {
	database: 'olympus',
	username: 'root',
	password: 'truvan1x'
},
host: 'app.olympus.io',
mandrillApiKey: 'f137c8a3-296a-463b-b4b1-d5652b646942',
fileAdapter: {
	s3: {
		accessKeyId: 'AKIAIUPRTVZFV3GJR6DA',
		secretAccessKey: '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',

		// Remove the `awsAccountId` if it exists

		bucket: 'app.olympus.io',
		region: 'US_EAST_1'
	},

	adapter: 's3',

	// Must be specified as an empty object
	keystone: {},
	swift: {}
},

 // this should be taken care of in the built in config file, but if the server isn't starting, give it a go
 express: {
 	serverOptions: {
	   ca: fs.readFileSync(__dirname + '/../ssl/gd_bundle.crt'),
	   key: fs.readFileSync(__dirname + '/../ssl/olympus.key'),
	   cert: fs.readFileSync(__dirname + '/../ssl/olympus.crt')
	}
 },
```


##### Change these things in `config/local.js`

> NOTE: I'm 99% sure this isn't being used anymore, but putting it here just in case (I believe Thom added this)
> It's not actually a "local" file, since it's checked into the repo.

```
module.exports = {
  hostName: 'app.olympus.io',
  s3: {
    API_KEY: 'AKIAIUPRTVZFV3GJR6DA',
    API_SECRET: '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'
  },
  MYSQL: {
    PASS: 'truvan1x',
    DB: 'olympus'
  },

  // Set it up to use amazon
  adapter: 's3',

  // Must be specified as an empty object
  keystone: {},
  swift: {}
}
```


###### Other things we talked about

+ Maybe environment variables for all the customer-specific configuration (mandrill key, AWS secret, AWS api key, S3 bucket, hostname, SSL)
+ For ssl, you need the gd_bundle.crt (the CA cert), olympus.key (), and the other olympus.crt file (the cert)
	these could probably be environment variables as well (instead of files)




## RUNNING OLYMPUS

```bash
ssh geoff@54.225.128.178
# Password = 3brc7d

# Grab `forever` which is the deployment tool for Node
sudo npm install -g forever

cd /opt
mkdir olympus
cd olympus

# Forever has a distinction between `su` and `sudo`
# so we'll go ahed and become `su` so we can always see all of the forever processes
# (be careful!)
sudo su

##### Start up API (this will run on :1337)
# (using `sudo` to make sure you can `forever stop` both of these from the same place)
cd api
forever start app.js


##### Start up master (this will run on :443)
# (using `sudo` so that you're allowed to run it on port 80 and/or 443)
cd ../master
forever start olympus.js

```


## KILLING / RESTARTING OLYMPUS (OR GETTING TO THE LOGS)

```bash

# Forever has a distinction between `su` and `sudo`
# so we'll go ahed and become `su` so we can always see all of the forever processes
# (be careful!)
sudo su

# See what's running-- (or to see the location of the log files)
forever list

# Stop both servers
forever stop app.js
forever stop olympus.js

# To restart original olympus (master branch)
forever restart olympus.js

# To restart the new olympus (API branch)
forever restart app.js

```



## HOW TO CHECK OUT SERVER LOGS
```bash

# Become super user
sudo su

# Check out the running processes and see where the logs are
forever list

# It'll look something like this:
# info:    Forever processes running
# data:        uid  command         script     forever pid  logfile                 uptime       
# data:    [0] WjxY /usr/bin/nodejs app.js     1332    3050 /root/.forever/WjxY.log 0:0:1:32.963 
# data:    [1] 39VX /usr/bin/nodejs olympus.js 1364    3076 /root/.forever/39VX.log 0:0:1:23.332 


# Tail the logfile for whichever server you're interested in:
#    `olympus.js` ==> old app aka master
#    `app.js`     ==> new api

tail -f /root/.forever/39VX.log

# -or-

tail -f /root/.forever/WjxY.log

# Keep in mind the location of these log files may change, so you'll need to check each time.
# (there may be a better way to look this up in a newer version of `forever`-- check https://github.com/nodejitsu/forever)

```



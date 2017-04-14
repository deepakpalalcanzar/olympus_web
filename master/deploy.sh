ssh root@olympus.io "cd /code/olympus && git checkout production && git pull && forever stop olympus.js && npm install && forever start olympus.js"

#!/bin/bash
sudo forever stopall

cd /var/www/olympus/api/
sudo forever start app.js

cd /var/www/olympus/master/
sudo forever start olympus.js

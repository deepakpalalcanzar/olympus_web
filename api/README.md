![Branding_12.png](http://i.imgur.com/5o0da.png) 

Enterprise collaboration and content management in the hybrid cloud.

# API Branch

## Summary

### API branch
New OAuth REST APi calls are on the API branch.  
Documentation: [api.md](api.md)

### Master branch
App snapshot taken at most recent QA that was feature-complete
(contains the rest of the API & the front-end)


## Install

> TODO: Instructions to come...


^[v^Croot@domU-12-31-39-0F-34-66:/opt/olympus# sudo forever list
^Croot@domU-12-31-39-0F-34-66:/opt/olympus# ps aux | grep node
root      9186  0.0  1.1 678480 18936 ?        Ssl  Feb20   0:01 /usr/bin/nodejs /usr/lib/node_modules/forever/bin/monitor olympus.js
root      9188  0.0  5.6 1015200 95804 ?       Sl   Feb20   3:41 /usr/bin/nodejs /opt/olympus/master/olympus.js
root      9198  0.0  1.3 662684 23564 ?        Ssl  Feb20   0:00 /root/.nvm/v0.10.18/bin/node /usr/lib/node_modules/forever/bin/monitor app.js
root     10904  0.5  4.1 983968 70660 ?        Sl   21:09   0:02 /root/.nvm/v0.10.18/bin/node /opt/olympus/api/app.js
root     11480  0.0  0.0   8104   928 pts/1    S+   21:16   0:00 grep --color=auto node


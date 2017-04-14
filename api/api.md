``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X POST http://54.235.161.148/files/:id/copy -d'{"name":"<optional filename>", "dest": "<optional directory Id>"}'
```
``` json
{
  "name": "name",
  "size": 10,
  "fsName": "fsname",
  "deleted": false,
  "mimetype": "text",
  "public_link_enabled": true,
  "deleteDate": null,
  "replaceFileId": null,
  "DirectoryId": 1,
  "createdAt": "2013-07-03T18:30:07.914Z",
  "updatedAt": "2013-07-03T18:30:07.914Z",
  "isLocked": false,
  "id": 6
}
```

``` bash
# workgroup and file must have share flag enabled
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X GET http://54.235.161.148/files/:id/shareurl
```
``` json
{
  "link": "http://54.235.161.148/file/public/203b7590-e80e-11e2-90bb-6f5a59babaab.ico/favicon.ico"
} 
```
``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X GET http://54.235.161.148/files/:id/thumbnail

curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X POST http://54.235.161.148/folders/:id/copy -d'{"name":"<optional folder name>", "dest":"<directory Id>"}'

curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X PUT http://54.235.161.148/folders/:id -d'{<updated values>}'
```
``` json
{
    "name": "dirname",
    "size": 0,
    "quota": 1000000000,
    "public_link_enabled": 0,
    "public_sublinks_enabled": 1,
    "isWorkgroup": 0,
    "isLocked": 0,
    "deleted": 0,
    "deleteDate": null,
    "DirectoryId": 2,
    "OwnerId": null,
    "id": 3,
    "createdAt": "2013-07-05T00:00:00.000Z",
    "updatedAt": "2013-07-05T00:00:00.000Z"
}
```
``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X PUT http://54.235.161.148/folders/:id/quota -d'{"quota": <new quota value>}'

curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X GET http://54.235.161.148/folders/:id/quota
```
``` json
{
  "quota": 100000
}
```
``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X POST http://54.235.161.148/share/folder/:id -d'{"type":"comment", "emails":[<list of emails>]}'

curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X POST http://54.235.161.148/share/file/:id -d'{"type":"comment", "emails":[<list of emails>]}'
```
``` json
{
  "status": "ok"
}
```
``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X PUT http://54.235.161.148/account/:id -d'{<updated values>}'
```
``` json
{
  "email": "test@test.com",
  "name": "testname",
  "phone": "1111",
  "title": "King",
  "avatar_fname": "stringfname",
  "avatar_mimetype": "mime",
  "isAdmin": 1,
  "id": 1,
  "createdAt": "2013-07-02T00:00:00.000Z",
  "updatedAt": "2013-07-03T00:00:00.000Z",
  "deleteDate": null,
  "isLocked": null
}
```
``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X DELETE http://54.235.161.148/account/:id -d'{}'
```
``` json
{
  "status": "ok"
}
```
``` bash
curl -H'Content-Type: application/json' -H'Authorization: Bearer baudzVitCraHCB1' -X PUT http://54.235.161.148/account/:id/lock -d'{"lock": true}'
```
``` json
{
  "email": "test@test.com",
  "name": "testname",
  "phone": "1111",
  "title": "King",
  "avatar_fname": "stringfname",
  "avatar_mimetype": "mime",
  "isAdmin": 1,
  "id": 1,
  "createdAt": "2013-07-02T00:00:00.000Z",
  "updatedAt": "2013-07-03T00:00:00.000Z",
  "deleteDate": null,
  "isLocked": 1
}  
```

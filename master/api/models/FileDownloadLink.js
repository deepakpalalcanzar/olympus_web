 FileDownloadLink = Model.extend({

  tableName: 'filedownloadlink',

	file_id: INTEGER,
	link_key: STRING,
	key_expires: DATE,
	access_token: STRING
});

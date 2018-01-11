var mysql = require('mysql'),
//mysql connection
connection = mysql.createConnection(
{ 
	host: 'localhost', 
	user: 'root',  
	password: '', 
	database: 'mysql'
 }
);
 
//create objet to get domain
var domainModel = {};
 
//obtenemos todos los usuarios
domainModel.getDomains = function(callback)
{
	if (connection) 
	{
		connection.query('SELECT * FROM domain ORDER BY id', function(error, rows) {
			if(error)
			{
				throw error;
			}
			else
			{
				callback(null, rows);
			}
		});
	}
}
var mysql   = require("mysql");

function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/domains",function(req,res){
        var query = "SELECT ID, NAME, DESCRIPTION FROM ??";
        var table = ["domain"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Code" : 200, "Message" : "Success", "Data" : rows});
            }
        });
    });

    router.get("/domains/:id",function(req,res){
	    var data = {};
	    var query = "SELECT A.ID, A.NAME, A.DESCRIPTION, A.CREATED_AT, B.USERNAME, B.ID, C.LANG_ID FROM ?? = A, USERS = B, DOMAIN_TO_LANG = C WHERE A.??=? AND A.USER_ID = B.ID AND A.ID = C.DOMAIN_ID";
	    var table = ["domain","id",req.params.id];
	    query = mysql.format(query,table);
	    connection.query(query,function(err,rows){
	        if(err) {
	            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
	        } else {
	        	data["id"] = rows[0].ID;
	        	data["name"] = rows[0].NAME;
	        	data["description"] = rows[0].DESCRIPTION;
	        	data["created_at"] = rows[0].CREATED_AT;
	    		data["createur"] = {};
	        	data.createur["username"] = rows[0].USERNAME;
	        	data.createur["id"] = rows[0].ID;
	    		data["lang"]={};
	    		for (i = 0; i < rows.length; i++)
	    			data.lang[i] = rows[i].LANG_ID;
	            res.json({"Code" : 200, "Message" : "Success", "Data" : data});
	        }
	    });
    });

    router.get("/domains/:id/translation",function(req,res){
    	var data = [];
	    var query = "SELECT B.ID, B.KEY, C.LANG_ID, C.VALUE FROM ?? = A, TRANSLATION = B, TRANSLATION_TO_LANG = C WHERE A.??=? AND A.ID = B.DOMAIN_ID AND C.TRANSLATION_ID = B.ID";
	    var table = ["domain","id",req.params.id];
	    query = mysql.format(query,table);
	    connection.query(query,function(err,rows){
	        if(err) {
	            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
	        } else {
	        	for (i = 0; i < rows.length; i++){
	        		data[i] = {};
	        		data[i]["id"] = rows[i].ID;
	        		data[i]["key"] = rows[i].KEY;
	        		data[i]["trans"] = {};
	        		data[i].trans[rows[i].LANG_ID] = rows[i].VALUE;
	        		while (rows[i].ID == rows[i + 1].ID && rows[i].KEY == rows[i + 1].KEY){
	        			data[i].trans[rows[i + 1].LANG_ID] = rows[i + 1].VALUE;
	        			i++;
	        		}
	        	}
	            res.json({"Code" : 200, "Message" : "Success", "Data" : rows});
	        }
	    });
    });

    router.post("/domains/:id/translation",function(req,res){
        var query = "INSERT INTO ??(??,??) VALUES (?,?)";
        var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Translation Added !"});
            }
        });
    });
}

module.exports = REST_ROUTER;
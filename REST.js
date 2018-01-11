var mysql   = require("mysql");

const Joi = require('joi');
const validator = require('express-joi-validation')({
	passError: true
});

const schema = Joi.object({
    id: Joi.number().integer().min(1).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    // key: Joi.string().regex(/^[_]{2}\S*[_]{2}$/).min(5).max(190).error((errors) => {
    key: Joi.string().max(190).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    lang_id: Joi.string().regex(/^[a-zA-Z]+$/).min(2).max(5).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    value : Joi.string().min(1).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    }),
    authorization : Joi.string().min(1).max(255).error((errors) => {

        return {
            template: 'contains {{errors}} errors, here is the list : {{codes}}',
            context: {
                errors: errors.length,
                codes: errors.map((err) => err.type)
            }
        };
    })
})

function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/domains.json",function(req,res){
        var query = "SELECT ID, NAME, DESCRIPTION FROM DOMAIN";
        query = mysql.format(query);
        connection.query(query,function(err,rows){
            
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else if (rows.length == 0){
	        	res.json({"Error" : true, "Message" : "MysSQL query empty"});
	        }else {
                res.json({"Code" : 200, "Message" : "Success", "Data" : rows});
            }
        });
    });

    router.get("/domains/:id.json", validator.params(schema), validator.headers(schema), function(req,res){
		    var permission = 0;
		    var data = {};
		    var validation = "SELECT * FROM USERS WHERE API_KEY = ?";
		    var auth = [req.headers.authorization];
		    validation = mysql.format(validation, auth);
		    connection.query(validation, function(err, val){
		    	if (val[0] != null){
		    		permission = 1;
		    	}
		    });
		    var query = "SELECT A.ID, A.NAME, A.DESCRIPTION, A.CREATED_AT, B.USERNAME, B.ID, B.EMAIL, C.LANG_ID FROM DOMAIN = A, USERS = B, DOMAIN_TO_LANG = C WHERE A.ID=? AND A.USER_ID = B.ID AND A.ID = C.DOMAIN_ID";
		    var table = [req.params.id];
		    query = mysql.format(query,table);
		    connection.query(query,function(err,rows){
		        if(err) {
		            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
		        } 
		        else if (rows.length == 0){
		        	res.json({"Error" : true, "Message" : "MysSQL query empty, check parameters"});
		        }
		        else{
			        data["id"] = rows[0].ID;
			        data["name"] = rows[0].NAME;
			        data["description"] = rows[0].DESCRIPTION;
			        data["created_at"] = rows[0].CREATED_AT;
			    	data["createur"] = {};
			        data.createur["username"] = rows[0].USERNAME;
			        data.createur["id"] = rows[0].ID;
			        if (permission != 0)
			        	data.createur["email"] = rows[0].EMAIL;
			    	data["lang"]={};
			    	for (i = 0; i < rows.length; i++)
			    		data.lang[i] = rows[i].LANG_ID;
			        res.json({"Code" : 200, "Message" : "Success", "Data" : data});
		        }
		    });
    });

    router.get("/domains/:id/translations.json",validator.params(schema), validator.query(schema), function(req,res){
    	var data = [];
	    var query = "SELECT B.ID, B.KEY, C.LANG_ID, C.VALUE FROM DOMAIN = A, TRANSLATION = B, TRANSLATION_TO_LANG = C WHERE A.ID=? AND A.ID = B.DOMAIN_ID AND C.TRANSLATION_ID = B.ID";	    
	    var table = [req.params.id, req.query.key];
	    if (req.query.key)
	    	query = query + " AND B.KEY LIKE ?"
	    query = query +  " ORDER BY B.ID";
	    query = mysql.format(query,table);
	    connection.query(query,function(err,rows){
	        if(err) {
	            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
	        } else if (rows.length == 0){
	        	res.json({"Error" : true, "Message" : "MysSQL query empty, check parameters"});
	        } else {
	        	var k = 0;
	        	for (i = 0; i < rows.length; i++){
		        		data[k] = {};
		        		// data[k]["valeur key"] = req.query.key;
		        		// data[k]["valeur id"] = req.params.id;
		        		// data[k]["valeur i"] = i;
		        		// data[k]["valeur k"] = k;
		        		// data[k]["data length"] = data.length;
		        		// data[k]["rows length"] = rows.length;
		        		data[k]["id"] = rows[i].ID;
		        		data[k]["key"] = rows[i].KEY;
		        		data[k]["trans"] = {};
		        		data[k].trans[rows[i].LANG_ID] = rows[i].VALUE;
		        		while (i < rows.length && data[k]["id"] == rows[i].ID){
		        			i++;
		        			if (i < rows.length && data[k]["id"] == rows[i].ID){
		        				data[k].trans[rows[i].LANG_ID] = rows[i].VALUE;
		        			}
		        		}
		        		i--;
		        		k++;
	        	}
	            res.json({"Code" : 200, "Message" : "Success", "Data" : data});
	        }
	    });
    });

    router.post("/domains/:id/translation.json", validator.params(schema), validator.body(schema), function(req,res){
        var data = {};
        var query = "INSERT INTO TRANSLATION_TO_LANG(VALUE, LANG_ID, TRANSLATION_ID) VALUES (?,?, (SELECT ID FROM TRANSLATION WHERE TRANSLATION.KEY = ? AND TRANSLATION.DOMAIN_ID = ?))";
        var table = [req.body.value, req.body.lang_id, req.body.key, req.params.id];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "There are no elements to delete. Error executing MySQL query"});
            } 
        	else {
		        query = "SELECT B.ID, B.KEY, C.LANG_ID, C.VALUE FROM DOMAIN = A, TRANSLATION = B, TRANSLATION_TO_LANG = C WHERE A.ID=? AND A.ID = B.DOMAIN_ID AND C.TRANSLATION_ID = B.ID AND B.KEY LIKE ? ORDER BY B.ID";	    
			    table = [req.params.id, req.body.key];
			    query = mysql.format(query,table);
			    connection.query(query,function(err,rows){
			        if(err) {
			            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
			        } else if (rows.length == 0){
			        	res.json({"Error" : true, "Message" : "MysSQL query empty, check parameters"});
			        } else {
				        data["id"] = rows[0].ID;
				        data["key"] = rows[0].KEY;		        
				    	data["trans"]={};
				    	for (i = 0; i < rows.length; i++)
				    		data.trans[rows[i].LANG_ID] = rows[i].VALUE;
				        res.json({"Code" : 201, "Message" : "Translation added", "Data" : data});
			        }
	        	})
	    	};
	    });
    });

    router.put("/domains/:id/translation/:key.json", validator.params(schema), validator.body(schema), function(req,res){
        var data = {};
        var query = "UPDATE TRANSLATION_TO_LANG, TRANSLATION SET VALUE = ? WHERE TRANSLATION_TO_LANG.LANG_ID = ? AND TRANSLATION_TO_LANG.TRANSLATION_ID = (SELECT ID FROM TRANSLATION WHERE TRANSLATION.KEY = ? AND TRANSLATION.DOMAIN_ID = ?)";
        var table = [req.body.value, req.body.lang_id, req.params.key, req.params.id];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        	};
    	});
    	query = "SELECT B.ID, B.KEY, C.LANG_ID, C.VALUE FROM DOMAIN = A, TRANSLATION = B, TRANSLATION_TO_LANG = C WHERE A.ID=? AND A.ID = B.DOMAIN_ID AND C.TRANSLATION_ID = B.ID AND B.KEY LIKE ? ORDER BY B.ID";	    
	    table = [req.params.id, req.params.key];
	    query = mysql.format(query,table);
	    connection.query(query,function(err,rows){
	        if(err) {
	            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
	        } else if (rows.length == 0){
	        	res.json({"Error" : true, "Message" : "NO modifications where made. MysSQL query empty, verify parameters"});
	        } else {
		        data["id"] = rows[0].ID;
		        data["key"] = rows[0].KEY;		        
		    	data["trans"]={};
		    	for (i = 0; i < rows.length; i++)
		    		data.trans[rows[i].LANG_ID] = rows[i].VALUE;
		        res.json({"Code" : 200, "Message" : "Modifications made!", "Data" : data});
	        }
	    });
    });

    router.delete("/domains/:id/translation/:key.json",validator.params(schema), function(req,res){
        var data = {};
        var val;
        var query = "DELETE from TRANSLATION_TO_LANG WHERE TRANSLATION_TO_LANG.TRANSLATION_ID = (SELECT ID FROM TRANSLATION WHERE TRANSLATION.KEY = ? AND TRANSLATION.DOMAIN_ID = ?)";
        var table = [req.params.key, req.params.id];
        query = mysql.format(query,table);
        connection.query(query,function(err, rows){
        	val = rows;
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            }
        });
        query = "SELECT B.ID, B.KEY FROM DOMAIN = A, TRANSLATION = B, TRANSLATION_TO_LANG = C WHERE A.ID=? AND A.ID = B.DOMAIN_ID AND C.TRANSLATION_ID = B.ID";	    
	    table = [req.params.id];
	    query = mysql.format(query,table);
	    connection.query(query,function(err,rows){
	        if(err) {
	            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
	        } else {
		        data["id"] = rows[0].ID;
		        // data["key"] = rows[0].KEY;		        
		    	// data["trans"]={};
		    	// for (i = 0; i < rows.length; i++)
		    	// 	data.trans[rows[i].LANG_ID] = rows[i].VALUE;
		    	if (val.affectedRows == 0)
		        	res.json({"Code" : 200, "Message" : "No translations were deleted", "Data" : data});
		        else
		        	res.json({"Code" : 200, "Message" : "Translations deleted", "Data" : data});
	        }
	    });
    });


    router.use((err, req, res, next) => {
		if (err.error.isJoi) {
		    // we had a joi error, let's return a custom 400 json response
		    res.status(400).json({
			    "Error": "true",
			    type: err.type, // will be "query" here, but could be "headers", "body", or "params"
			    message: err.error.toString()
		    });
		} else {
		    // pass on to another error handler
		    next(err);
  		}
	});

    router.use("*",function(req,res){
		res.status(404).send({"error" : 404, "Message" : "The url you requested does not exist"});
	});

}

module.exports = REST_ROUTER;

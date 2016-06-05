var jwt = require('jsonwebtoken');
var config = require("../config/jwt.json");
var secret = config.secret;

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/aws.json');
var db = new AWS.DynamoDB();
var table = "AuthUsers";

var shortid = require('shortid');

// TERMINAL COMMANDS:

// LOGIN: curl -H "Content-Type: application/json" -X POST -d '{"username":"ShivamHacks","password":"lololol"}' http://localhost:3000/api/auth/login
// VALIDATE: curl -H "Content-Type: application/json" -X POST -d '{"token":"token"}' http://localhost:3000/api/auth/validate

var auth = {

	login: function(req, res) {

		var username = req.body.username || '';
		var password = req.body.password || '';

		if (username != '' && password != '') {

			var _id = shortid.generate();
			
			var token = jwt.sign({ id: _id }, secret);
			
			var params = {
				TableName: table,
				Item: {
					id: { S: _id },
					username: { S: username },
					password: { S: password },
					token: { S: token }
				}
			};

			db.putItem(params, function(err, data) {
				if (err) console.log(err);
				else console.log(data);
			});

		}

		res.json({
			status: "testing"
		});
	},

	validate: function(req, res) {

		var token = req.body.token || '';
		
		jwt.verify(token, secret, function(err, decoded) {
			if (err) console.log(err);
			else {

				var _id = decoded.id;
				var params = {
					TableName: table,
					Key: {
						id: { S: _id }
					}
				};

				db.getItem(params, function(err, data) {
					if (err) console.log(err);
					else console.log(data);
				});

				// now we have a user, so can pass it onto the next handler

			}
		});

		res.json({
			status: "testing"
		});
	}

};

module.exports = auth;
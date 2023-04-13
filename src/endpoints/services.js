const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js');

const servicesRouter = express.Router();
module.exports = servicesRouter;

servicesRouter.post("/create", async(req, res) => {
	if(!auth.verifySession(req, res, "permissions.services.create")) {
		return;
	}

	db.Services.load();
	let highest;
	for(let i in db.Services.table) {
		highest = i;
	}
	highest = (parseInt(highest) + 1).toString();

	db.Services.create(highest, req.body.JSON);
	db.Services.save();

	res.status(200);
	res.send({"response": "Service Created"});
});

servicesRouter.patch("/modify", async(req, res) => {
	if(!auth.verifySession(req, res, "permissions.services.modify")) {
		return;
	}

	db.Services.load();
	db.Services.set(req.body.id, req.body.newJSON);
	db.Services.save();

	res.status(200);
	res.send({"response": "Service Modified"});
});

servicesRouter.post("/delete", async(req, res) => {
	if(!auth.verifySession(req, res, "permissions.services.delete")) {
		return;
	}

	db.Services.load()
	db.Services.delete(req.body.id);
	db.Services.save();

	res.status(200);
	res.send({"response": "Service Deleted"});
});

servicesRouter.get("/getAll", async(req, res) => {
	db.Services.load();

	let services = [];
	for(let i in db.Services.table) {
		services.push({
			...db.Services.table[i], id: i
		})
	}

	res.status(200);
	res.send({"response": services});
})

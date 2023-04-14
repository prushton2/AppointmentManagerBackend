const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js');

const slotsRouter = express.Router();
module.exports = slotsRouter;

slotsRouter.post("/create", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.slots.create")) {
        return;
    }


    db.Slots.load();
	let highest = "-1";
	for(let i in db.Slots.table) {
		highest = i;
	}
	highest = (parseInt(highest) + 1).toString();


    db.Slots.create(highest, {
        "name": req.body.name,
        "services": req.body.services,
        "users": req.body.people,
        "padding": req.body.padding,
        "availability": req.body.availability
    })
    db.Slots.save();

    res.status(200);
    res.send({"response":"Service Created"});
});

slotsRouter.post("/delete", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.slots.delete")) {
        return;
    }
});

slotsRouter.post("/modify", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.slots.modify")) {
        return;
    }
});

slotsRouter.get("/getAll", async(req, res) => {
    let slots = []
    db.Slots.load();
    for(let i in db.slots.table) {
        slots.push({...db.slots.table[i], id: i})
    }

    res.status(200);
    res.send({"response":slots});
});
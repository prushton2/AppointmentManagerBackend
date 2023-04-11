const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js');

const servicesRouter = express.Router();
module.exports = servicesRouter;

servicesRouter.post("/create", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.services.create")) {
        return;
    }

    db.Accounts.load();
    let highest;
    for(let i in db.Accounts.table) {
        highest = i;
    }
    highest = (parseInt(highest) + 1).toString();

    db.Services.load()
    db.Services.table[highest] = {
        name: req.body.name,
        price: req.body.price, 
        description: req.body.description
    };
    db.Services.save();

    res.status(200);
    res.send({"response": "Service Created"});
});

servicesRouter.patch("/modify", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.services.modify")) {
        return;
    }


    if(!req.body.prop in ["price", "description"]) {
        res.status(405);
        res.send({"response": "Change Prop not allowed on given resource"});
        return;
    }


    db.Services.load()
    db.Services.table[req.body.name][req.body.prop] = req.body.value;
    db.Services.save();

    res.status(200);
    res.send({"response": "Service Modified"});
});

servicesRouter.post("/delete", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.services.delete")) {
        return;
    }

    db.Services.load()
    db.Services.delete[req.body.name];
    db.Services.save();

    res.status(200);
    res.send({"response": "Service Deleted"});
});
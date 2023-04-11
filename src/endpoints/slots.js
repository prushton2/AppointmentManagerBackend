const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js');

const slotsRouter = express.Router();
module.exports = slotsRouter;

slotsRouter.post("/create", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.slots.create")) {
        return;
    }

    newSlot = {
        "name": [],
        "services": [],
        "people": [],
        "availability": [],
        "padding": []
    }

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
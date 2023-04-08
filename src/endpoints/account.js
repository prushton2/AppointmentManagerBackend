const express = require("express");
const db = require("../database.js");


const AccountRouter = express.Router()
module.exports = AccountRouter

AccountRouter.post("/login", async(req, res) => {
    db.Accounts.load();
    if(JSON.stringify(db.Accounts.table) === "{}" &&
        req.body.name === "admin" &&
        req.body.pass === "password") {
        res.status(200);
        res.send({"response": "logged in"})
        return;
    }
    res.status(401);
    res.send({"response": "Invalid Account Information"})
    return;
})

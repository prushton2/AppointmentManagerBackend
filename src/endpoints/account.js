const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js')

const AccountRouter = express.Router()
module.exports = AccountRouter

AccountRouter.post("/login", async(req, res) => {
    db.Accounts.load();
    
    if(JSON.stringify(db.Accounts.table) === "{}" &&
        req.body.name === "admin" &&
        req.body.pass === "password") {

        auth.createUser("0", "admin", "password", true);
        let SID = auth.createSession("0");

        res.status(200);
        res.cookie("auth", SID, {"httpOnly": true, "path": "/"});
        res.send({"response": "logged in", "sessionID": SID});
        return;
    }

    let ID = db.Accounts.findOne({name: req.body.name});

    if(auth.checkPassword(req.body.pass, ID)) {
        let SID = auth.createSession(ID);
        res.status(200);
        res.cookie("auth", SID, {"httpOnly": true, "path": "/"});
        res.send({"response": "Logged In", "session": SID});
        return;
    }



    res.status(401);
    res.send({"response": "Invalid Account Information"});
    return;
})

AccountRouter.get("/myInfo", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.self.view")) {
        return;
    }
    
    db.Accounts.load();

    res.status(200);
    res.send({"response":db.Accounts.table[req.cookies.auth.split(".")[0]]});
    return;
})

AccountRouter.get("/logout", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.self.view")) {
        return;
    }
    
    auth.destroySession(req.cookies.auth);

    res.status(200);
    res.cookie("auth", "", {"httpOnly": true, "path": "/"})
    res.send({"response": "Logged Out"});
    return;
})

AccountRouter.post("/changePassword", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.self.changePassword")) {
        return;
    }

    let id = req.cookies.auth.split(".")[0];

    if(!auth.checkPassword(req.body.oldPassword, id)) {
        res.status(401);
        res.send({"response": "Invalid Password"});
        return;
    }

    db.Accounts.table[id].password = auth.hash(req.body.newPassword, `${id}8492${req.body.newPassword}`);
    db.Accounts.save();

    res.status(200);
    res.send({"response": "Password Changed"});
})

AccountRouter.patch("/changeProp", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.self.modify")) {
        return;
    }

    if(!req.body.prop in ["name", "email"]) {
        res.status(405);
        res.send({"response": "Change Prop not allowed on given resource"});
        return;
    }

    let id = req.cookies.auth.split(".")[0];

    db.Accounts.load();
    console.log(id, {[req.body.prop]: req.body.value});
    db.Accounts.set(id, {[req.body.prop]: req.body.value});
    db.Accounts.save();

    res.status(200);
    res.send({"response": "Prop changed"});
})


AccountRouter.post("/delete", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.self.delete")) {
        return;
    }


    let id = req.cookies.auth.split(".")[0];
    let pw = db.Accounts.table[id].password;

    if(auth.hash(req.body.password, `${id}8492${req.body.password}`) !== pw) {
        res.status(401);
        res.send({"response": "Invalid Password"});
        return;
    }

    db.Accounts.load();
    db.Accounts.delete(id);
    db.Accounts.save();

    res.status(200);
    res.send({"response": "account deleted"});
})
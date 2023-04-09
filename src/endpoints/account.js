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

        createUser("admin", "password", true);
        let SID = createSession("admin");

        res.status(200);
        res.cookie("auth", SID, {"httpOnly": true, "path": "/"});
        res.send({"response": "logged in", "sessionID": SID});
        return;
    }

    let Account = db.Accounts.table;
    Account = Account[req.body.name];

    if(Account["password"] === auth.hash(req.body.pass, `${req.body.name}8492${req.body.pass}`)) {
        let SID = createSession(req.body.name);
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
    
    destroySession(req.cookies.auth);

    res.status(200);
    res.cookie("auth", "", {"httpOnly": true, "path": "/"})
    res.send({"response": "Logged Out"});
    return;
})

function createUser(name, pass, isAdmin) {
    db.Accounts.load();
    let basePerms = isAdmin ? ["permissions.*"] : ["permissions.self.*"]
    db.Accounts.create(name, {"password": auth.hash(pass, `${name}8492${pass}`), "sessions": [], "permissions": basePerms});
    db.Accounts.save();
}


function createSession(name) {
    db.Accounts.load();
    let SID = auth.RNG(1024);
    let account = db.Accounts.table[name];
    db.Accounts.set(name, {"sessions": [...account.sessions, `${auth.hash(name, SID)}.${auth.hash(SID, name)}`]});
    db.Accounts.save();
    return `${name}.${SID}`;
}

function destroySession(FSID) {
    db.Accounts.load();

    let name = FSID.split(".")[0];
    let SID  = FSID.split(".")[1];

    let account = db.Accounts.table[name];
    
    let newSessions = account.sessions.filter((id) => {return id !== `${auth.hash(name, SID)}.${auth.hash(SID, name)}` })   

    db.Accounts.set(name, {"sessions": newSessions});
    db.Accounts.save();
    return;
}
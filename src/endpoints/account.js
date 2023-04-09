const express = require("express");
const db = require("../database.js");
const crypto = require("crypto");
var CSPRNG = require('csprng');

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
        res.send({"response": "logged in", "sessionID": SID});
        return;
    }

    let Account = db.Accounts.table;
    console.log(Account);
    if(Account["password"] === hash(req.pass, `${req.name}8492${req.pass}`)) {
        let SID = createSession(req.name);
        res.status(200);
        res.send({"response": "Logged In", "session": SID});
        return;
    }



    res.status(401);
    res.send({"response": "Invalid Account Information"});
    return;
})

function createUser(name, pass, isAdmin) {
    db.Accounts.load();
    let basePerms = isAdmin ? ["permissions.*"] : ["permissions.self.*"]
    db.Accounts.create(name, {"password": hash(pass, `${name}8492${pass}`), "sessions": [], "permissions": basePerms});
    db.Accounts.save();
}


function createSession(name) {
    db.Accounts.load();
    let SID = RNG(1024);
    let account = db.Accounts.table[name];
    db.Accounts.set(name, {"sessions": [...account.sessions, `${hash(name, SID)}.${hash(SID, name)}`]});
    db.Accounts.save();
    return `${SID}`;
}


function hash(string, salt) {
    return crypto.createHash('sha256').update(salt).update(string).digest('base64');
}

function RNG(size) {
    return CSPRNG(size, 36);
}
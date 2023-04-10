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

        createUser("0", "admin", "password", true);
        let SID = createSession("0");

        res.status(200);
        res.cookie("auth", SID, {"httpOnly": true, "path": "/"});
        res.send({"response": "logged in", "sessionID": SID});
        return;
    }

    let ID = db.Accounts.findOne({name: req.body.name});
    let Account = db.Accounts.table[ID];

    console.log(Account)

    if(Account["password"] === auth.hash(req.body.pass, `${ID}8492${req.body.pass}`)) {
        let SID = createSession(ID);
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

AccountRouter.post("/createUser", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.users.create")) {
        return;
    }

    db.Accounts.load();
    let highest;
    for(let i in db.Accounts.table) {
        highest = i;
    }
    highest = (parseInt(highest) + 1).toString();


    createUser(highest, req.body.name, req.body.password, false);
    db.Accounts.load();
    db.Accounts.set(highest, {"permissions": req.body.permissions, "email": req.body.email});
    db.Accounts.save();

    res.status(200);
    res.send({"response": "User Created"});
})

function createUser(id, name, pass, isAdmin) {
    db.Accounts.load();
    let basePerms = isAdmin ? ["permissions.*"] : ["permissions.self.*"]
    db.Accounts.create(id, {"name": name, "password": auth.hash(pass, `${id}8492${pass}`), "sessions": [], "permissions": basePerms});
    db.Accounts.save();
}


function createSession(id) {
    db.Accounts.load();
    let SID = auth.RNG(1024);
    let account = db.Accounts.table[id];
    db.Accounts.set(id, {"sessions": [...account.sessions, `${auth.hash(id, SID)}.${auth.hash(SID, id)}`]});
    db.Accounts.save();
    return `${id}.${SID}`;
}

function destroySession(FSID) {
    db.Accounts.load();

    let id   = FSID.split(".")[0];
    let SID  = FSID.split(".")[1];

    let account = db.Accounts.table[id];
    
    let newSessions = account.sessions.filter((i) => {return i !== `${auth.hash(id, SID)}.${auth.hash(SID, id)}` })   

    db.Accounts.set(id, {"sessions": newSessions});
    db.Accounts.save();
    return;
}
const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js')

const UsersRouter = express.Router()
module.exports = UsersRouter


UsersRouter.get("/get", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.users.get")) {
        return;
    }

    db.Accounts.load();
    let allUsers = [];

    for(let i in db.Accounts.table) {
        allUsers.push({
            "id": i,
            "name": db.Accounts.table[i].name,
            "permissions": db.Accounts.table[i].permissions,
            "email": db.Accounts.table[i].email,
            "sessions": db.Accounts.table[i].sessions
        })
    }

    res.status(200);
    res.send({response: allUsers});
    
})

UsersRouter.patch("/setUser", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.users.set")) {
        return;
    }

    console.log(req.body.newProps);
    db.Accounts.load();
    db.Accounts.set(req.body.id, req.body.newProps);
    db.Accounts.save();

    res.status(200);
    res.send({"response": "user updated"});
})

UsersRouter.patch("/resetPassword", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.users.resetPassword")) {
        return;
    }

    db.Accounts.set(req.body.id, {"password": auth.hash("password", `${req.body.id}8492password`)});
    db.Accounts.save();

    res.status(200);
    res.send({"response": "reset password"});
})

UsersRouter.post("/createUser", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.users.create")) {
        return;
    }

    db.Accounts.load();
    let highest;
    for(let i in db.Accounts.table) {
        highest = i;
    }
    highest = (parseInt(highest) + 1).toString();


    auth.createUser(highest, req.body.name, req.body.password, false);
    db.Accounts.load();
    db.Accounts.set(highest, {"permissions": req.body.permissions, "email": req.body.email});
    db.Accounts.save();

    res.status(200);
    res.send({"response": "User Created"});
})

UsersRouter.post("/delete", async(req, res) => {
    if(!auth.verifySession(req, res, "permissions.users.delete")) {
        return;
    }

    db.Accounts.load();
    db.Accounts.delete(req.body.id);
    db.Accounts.save();

    res.status(200);
    res.send({"response": "User Deleted"});
})
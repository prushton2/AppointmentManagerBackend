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
            "email": db.Accounts.table[i].email
        })
    }

    res.status(200);
    res.send({response: allUsers});
    
})
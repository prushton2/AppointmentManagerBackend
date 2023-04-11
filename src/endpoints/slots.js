const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js');

const slotssRouter = express.Router();
module.exports = slotssRouter;


// appointmentsRouter.post("/create", async(req, res) => {})
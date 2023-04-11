const express = require("express");
const db = require("../database.js");
const auth = require('../authenticator.js');

const appointmentsRouter = express.Router();
module.exports = appointmentsRouter;


appointmentsRouter.post("/create", async(req, res) => {})
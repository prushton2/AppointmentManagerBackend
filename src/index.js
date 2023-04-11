const cookieParser       = require('cookie-parser');
const cors               = require("cors");
const express            = require("express");
const bodyParser         = require('body-parser');
const app                = express();
const port               = 3010;

const AccountRoute = require("./endpoints/account.js")
const UsersRoute = require("./endpoints/users.js")
const AppointmentsRouter = require("./endpoints/appointments.js")
const SlotsRouter = require("./endpoints/slots.js")

app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());

app.use( cors({
    origin: true,
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    credentials: true
}));


process.on('uncaughtException', (err) => {
    console.log(err)
})


onStart = async() => {
    app.listen(port,() => {
        console.log(`App listening on port ${port}`)
    })
}

onStart()

//Routing for endpoints
app.use("/account", AccountRoute);
app.use("/users", UsersRoute);
app.use("/appointments", AppointmentsRouter);
app.use("/slots", SlotsRouter);

app.all("*", async(req, res) => {
    res.status(404);
    res.send({"response": "Endpoint does not exist"});
})
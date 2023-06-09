const crypto = require("crypto");
const CSPRNG = require('csprng');
const db = require("./database.js");

module.exports.verifySession = (req, res, requiredPermission, respondIfInvalid=false) => {
    
    db.Accounts.load();

    //if they have a auth cookie
    if(!req.cookies.auth) {
        if(respondIfInvalid) {
            res.status(400);
            res.send({"response": "No Authentication Found"});
        }
        return false;
    }

    //split the cookie
    let name;
    let SID;
    try {
        name = req.cookies.auth.split(".")[0];
        SID  = req.cookies.auth.split(".")[1];
    } catch {
        if(respondIfInvalid) {
            res.status(400);
            res.send({"response": "Authentication Invalid"});
        }
        return false;
    }

    //hash the cookie
    let hashSID = `${module.exports.hash(name, SID)}.${module.exports.hash(SID, name)}`

    //if the user exists
    let account = db.Accounts.table[name];
    if(!account) {
        if(respondIfInvalid) {
            res.status(400);
            res.send({"response": "Invalid User"});
        }
        return false;
    }

    //if the cookie is valid
    if(account.sessions.indexOf(hashSID) === -1) {
        if(respondIfInvalid) {
            res.status(401);
            res.send({"response": "Access Denied"});
        }
        return false;
    }


    //if they have the proper permissions
    if(!verifyPermissions(account.permissions, requiredPermission)) {
        if(respondIfInvalid) {
            res.status(401);
            res.send({"response": "Access Denied"});
        }
        return false;
    }

    return true;
}

function verifyPermissions(userPermissions, requiredPermission) {	
	for (let i in userPermissions) { //iterate over each of the user's permissions
		let heldPerm = userPermissions[i].toString(); //get the perm

		if(heldPerm === requiredPermission) { //if the held permission is the required permission, continue
			return true;
		}

		if(heldPerm.endsWith("*")) { //if we have to deal with a *
			// Deal with permissions.* allowing permissions.orders.create
			if(heldPerm.substr(0, heldPerm.length-1) === requiredPermission.substr(0, heldPerm.length-1)) {
				return true;
			}
			// Deal with permissions.* allowing permissions.orders
			if(heldPerm.split(".").pop() === requiredPermission.split(".")) {
				return true;
			}
		}
	}
	//if none match, exit
	return false;
}

module.exports.hash = (string, salt) => {
    return crypto.createHash('sha256').update(salt).update(string).digest('base64');
}

module.exports.RNG = (size) => {
    return CSPRNG(size, 36);
}

module.exports.createUser = (id, name, pass, isAdmin) => {
    db.Accounts.load();
    let basePerms = isAdmin ? ["permissions.*"] : ["permissions.self.*"]
    db.Accounts.create(id, {"name": name, "password": module.exports.hash(pass, `${id}8492${pass}`), "sessions": [], "permissions": basePerms});
    db.Accounts.save();
}


module.exports.createSession = (id) => {
    db.Accounts.load();
    let SID = module.exports.RNG(1024);
    let account = db.Accounts.table[id];
    db.Accounts.set(id, {"sessions": [...account.sessions, `${module.exports.hash(id, SID)}.${module.exports.hash(SID, id)}`]});
    db.Accounts.save();
    return `${id}.${SID}`;
}

module.exports.destroySession = (FSID) => {
    db.Accounts.load();

    let id   = FSID.split(".")[0];
    let SID  = FSID.split(".")[1];

    let account = db.Accounts.table[id];
    
    let newSessions = account.sessions.filter((i) => {return i !== `${module.exports.hash(id, SID)}.${module.exports.hash(SID, id)}` })   

    db.Accounts.set(id, {"sessions": newSessions});
    db.Accounts.save();
    return;
}

module.exports.checkPassword = (givenPassword, ID) => {
    db.Accounts.load();
    let storedPassword = db.Accounts.table[ID].password;
    return (storedPassword === module.exports.hash(givenPassword, `${ID}8492${givenPassword}`))
}
const jwt = require('jsonwebtoken');
const fs = require('fs');
const readline = require('readline');

const JWTPRIVATEKEY = 'FASTSPEED';

const checkjwt = (req, res, next) => {
    try {
        let user = jwt.verify(req.headers.authorization.split(' ')[1], JWTPRIVATEKEY);
        req.userinfo = user;
        next();
    } catch {
        res.status(401).send('Invalid');
    }
}

const authorized = (req, res, next) => {
    if (req.params.uuid == req.userinfo.auth) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}

const authorizedForProfileId = (req, res, next) => {
    if (req.params.profileId == req.userinfo._sa) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}

const authorizedForProfileUUID = (req, res, next) => {
    if (req.params.profileUUID == req.userinfo.auth2) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}

const addProfileId = (req, res, next) => {
    req.body.profileId = req.userinfo._sa;
    next();
}

const checkActiveUUID = (req, res, next) => {
    const myuuid = req.params.uuid;

    const fileStream = fs.createReadStream(`${__dirname}/uuids.txt`);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        if (line.includes(myuuid)) {
            rl.removeAllListeners();
            next();
        }
    });

    rl.on('close', () => {
        res.status(403).send('Access denied');
    });
}

module.exports = {
    checkjwt: checkjwt,
    authorized: authorized,
    addProfileId: addProfileId,
    authorizedForProfileId: authorizedForProfileId,
    checkActiveUUID: checkActiveUUID,
    authorizedForProfileUUID: authorizedForProfileUUID,
};
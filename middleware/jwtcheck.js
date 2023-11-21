const jwt = require('jsonwebtoken');
const { fetchHTTPCookies } = require('./fetchhttpcookies');
const { getUserState } = require('./../redis/profileOp');

const checkjwt = (req, res, next) => {
    let jwtToken;
    try {
        if (req.headers.authorization === undefined) {
            const cookieStr = req.headers.cookie;

            const cookies = fetchHTTPCookies(cookieStr);

            jwtToken = cookies.jwt;
        }
        else {
            jwtToken = req.headers.authorization.split(' ')[1];
        }

        if (jwtToken === undefined) {
            return res.status(403).send({ error: true, res: 'Access denied' });
        }
        let user = jwt.verify(jwtToken, process.env.JWT);
        req.userinfo = user;
        next();
    } catch {
        res.status(401).send({ error: true, res: 'Invalid' });
    }
};

const authorized = (req, res, next) => {
    if (req.params.uuid == req.userinfo.auth) {
        next();
    } else {
        res.status(403).send({ error: true, res: 'Access denied' });
    }
};

const authorizedForProfileId = (req, res, next) => {
    if (req.params.profileId == req.userinfo._sa) {
        next();
    } else {
        res.status(403).send({ error: true, res: 'Access denied' });
    }
};

const authorizedForProfileUUID = (req, res, next) => {
    if (req.params.profileUUID == req.userinfo.auth2) {
        next();
    } else {
        res.status(403).send({ error: true, res: 'Access denied' });
    }
};

const addProfileId = (req, res, next) => {
    req.body.profileId = req.userinfo._sa;
    next();
};

const checkActiveUUID = (req, res, next) => {
    const myuuid = req.userinfo.auth;

    const isActive = getUserState(myuuid);

    if (isActive != 1) {
        res.status(403).send("Access denied");
        next();
    }
};

module.exports = {
    checkjwt: checkjwt,
    authorized: authorized,
    addProfileId: addProfileId,
    authorizedForProfileId: authorizedForProfileId,
    checkActiveUUID: checkActiveUUID,
    authorizedForProfileUUID: authorizedForProfileUUID,
};
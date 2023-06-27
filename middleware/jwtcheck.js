const jwt = require('jsonwebtoken');

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

const checkActiveUUID = (req, res, next) => {
    next();
}

module.exports = { checkjwt: checkjwt, authorized: authorized, authorizedForProfileId: authorizedForProfileId, checkActiveUUID: checkActiveUUID };
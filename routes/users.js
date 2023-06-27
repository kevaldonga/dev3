const app = require('express').Router();
const bodyParser = require('body-parser');
const { users } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');
const { validatePassword } = require('./validations/user');
const JWTPRIVATEKEY = 'FASTSPEED';

app.use(bodyParser.json());

/*
* /:uuid - GET - get a user
*/
app.get('/:uuid', checkjwt, async (req, res) => {
    const uuid = req.params.uuid;
    let result = await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    });
    res.send(result);
});

/* 
* / - POST - create a user
*/
app.post('/', async (req, res) => {
    result = await users.create(req.body);
    res.send(result ? "created successfully!!" : "error occured");
});

/*
* /login - POST - login user
*/
app.post('/login', async (req, res) => {
    result = await users.findOne({
        where: {
            "username": {
                [Op.eq]: req.body.username,
            },
        },
        include: 'profiles',
    });
    checked = await bcrypt.compare(req.body.password, result.password);
    if (checked) {
        let userObj = { auth: result.uuid, auth2: result.profiles.uuid, _sa: result.profiles.id };
        let jt = jwt.sign(userObj, JWTPRIVATEKEY, { 'expiresIn': '30D' });
        res.send(jt);
    } else {
        res.status(403).send('Invalid');
    }
});

/*
* /:uuid - PUT - update a user
* @check check active jwt, check if jwt matches request uri
*/
app.put('/:uuid', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    const uuid = req.params.uuid;
    if (req.body.password !== undefined) {
        res.status(401).send('Cannot change password from this endpoint');
    }
    result = await users.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    });
    res.send(result ? "updated successfully!!" : "error occured");
});


/* 
* /:uuid/changePassword - PUT - change password
*/
app.put('/:uuid/changePassword', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    if (!validatePassword(req.body.password)) {
        res.status(400).end("invalid format of password");
        return;
    }
    userdetails = await users.updatePassword(req.body.password, req.params.uuid);
    userinfo = {
        'auth': userdetails.uuid,
        'auth2': req.userinfo.auth2,
        '_sa': req.userinfo._sa,
    };
    res.send(jwt.sign(userinfo, JWTPRIVATEKEY, { 'expiresIn': '30D' }));
});

/*
* /:uuid - DELETE - delete a user by given uuid
*/
app.delete('/:uuid', checkjwt, authorized, async (req, res) => {
    const uuid = req.params.uuid;
    result = await users.destroy({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    });
    res.send(result ? "deleted successfully!!" : "error occured");
});

module.exports = app;
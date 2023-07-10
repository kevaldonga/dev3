const app = require('express').Router();
const bodyParser = require('body-parser');
const { users } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');
const { validatePassword } = require('./validations/user');
const { addUUID, removeUUID } = require('../middleware/uuidfileop');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const JWTPRIVATEKEY = 'FASTSPEED';

app.use(bodyParser.json());

/*
* /:uuid - GET - get a user
*/
app.get('/:uuid', checkjwt, async (req, res) => {
    const uuid = req.params.uuid;
    await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* / - POST - create a user
*/
app.post('/', async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['username', 'password'], mustBeNullFields: [...defaultNullFields, 'token'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    await users.create(req.body)
        .then((result) => {
            res.send("user created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/*
* /login - POST - login user
*/
app.post('/login', async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['username', 'password'] });
    if (typeof (value) == 'string') return res.status(409).send(value);
    let error = false;

    result = await users.findOne({
        where: {
            "username": {
                [Op.eq]: req.body.username,
            },
        },
        include: 'profiles',
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    checked = await bcrypt.compare(req.body.password, result.password);
    if (checked) {
        let userObj = { auth: result.uuid, auth2: result.profiles.uuid, _sa: result.profiles.id };
        let jt = jwt.sign(userObj, JWTPRIVATEKEY, { 'expiresIn': '30D' });
        addUUID(result.uuid);
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
    value = nullCheck(body, { nonNullableFields: ['username', 'token'], mustBeNullFields: [...defaultNullFields, 'password'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    const token = req.body.token;
    await users.update(req.body, {
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
    })
        .then((result) => {
            res.send("user updated successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});


/* 
* /:uuid/changePassword - PUT - change password
*/
app.put('/:uuid/changePassword', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['password', 'token'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    if (!validatePassword(req.body.password, res)) {
        return;
    }

    const token = req.body.token;
    const uuid = req.params.uuid;

    userdetails = await users.updatePassword(req.body.password, uuid);
    userinfo = {
        'auth': userdetails.uuid,
        'auth2': req.userinfo.auth2,
        '_sa': req.userinfo._sa,
    };
    addUUID(userdetails.uuid);
    removeUUID(uuid);
    jwttoken = jwt.sign(userinfo, JWTPRIVATEKEY, { 'expiresIn': '30D' });
    res.send(token);
});

/*
* /:uuid/:token - DELETE - delete a user by given uuid
*/
app.delete('/:uuid/:token', checkjwt, async (req, res) => {
    const token = req.params.token;
    const uuid = req.params.uuid;
    await users.destroy({
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
    })
        .then((result) => {
            removeUUID(uuid);
            res.send("user deleted successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;
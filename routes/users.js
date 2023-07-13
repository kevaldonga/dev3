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
const { roleCheck } = require('../middleware/rolecheck');
const JWTPRIVATEKEY = 'FASTSPEED';

app.use(bodyParser.json());

/*
* /:uuid - GET - get a user
* @check check jwt signature
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
            res.status(403).send(err);
        });
});

/* 
* / - POST - create a user
*/
app.post('/', async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['username', 'password'], mustBeNullFields: [...defaultNullFields, 'token', 'role'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    await users.create(req.body)
        .then((result) => {
            res.send("user created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /moderator/:moderatorUUID - PUT - promote user to moderator
* @check check jwt signature, check uuid from txt file 
*/
app.put("/moderator/:moderatorUUID", checkjwt, checkActiveUUID, async (req, res) => {
    const moderatorUUID = req.params.moderatorUUID;
    const uuid = req.userinfo.auth;

    const result = roleCheck(uuid, 'admin');
    if (typeof (result) == 'string') return res.status(403).send(result);

    await users.update({ "role": 'moderator' }, {
        where: {
            "uuid": {
                [Op.eq]: moderatorUUID,
            },
        },
    })
        .then((result) => {
            res.send("user promoted to moderator successfully!!");
        })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });
});

/* 
* /moderator/:moderatorUUID - PUT - demote user from moderator
* @check check jwt signature, check uuid from txt file 
*/
app.delete("/moderator/:moderatorUUID", checkjwt, checkActiveUUID, async (req, res) => {
    const moderatorUUID = req.params.moderatorUUID;
    const uuid = req.userinfo.auth;

    const result = roleCheck(uuid, 'admin');
    if (typeof (result) == 'string') return res.status(403).send(result);

    await users.update({ "role": 'user' }, {
        where: {
            "uuid": {
                [Op.eq]: moderatorUUID,
            },
        },
    })
        .then((result) => {
            res.send("user demoted from moderator successfully!!");
        })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });
});

/*
* /login - POST - login user
*/
app.post('/login', async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['username', 'password'] });
    if (typeof (value) == 'string') return res.status(409).send(value);
    let error = false;
    const role = req.body.role;

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
            res.status(403).send(err);
        });

    if (error) return;

    checked = await bcrypt.compare(req.body.password, result.password);
    if (checked) {
        let userObj = { auth: result.uuid, auth2: result.profiles.uuid, _sa: result.profiles.id };
        if (role !== 'user' && role !== undefined) {
            userObj['role'] = role;
        }
        let jt = jwt.sign(userObj, JWTPRIVATEKEY, { 'expiresIn': '30D' });
        addUUID(result.uuid);
        res.send(jt);
    } else {
        res.status(403).send('Invalid');
    }
});

/*
* /:uuid - PUT - update a user
* @check check jwt signature, match uuid of url with payload, check uuid from txt file
*/
app.put('/:uuid', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['username', 'token'], mustBeNullFields: [...defaultNullFields, 'password', 'role'] });
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
            res.status(403).send(err);
        });
});


/* 
* /:token/changePassword - PUT - change password
* @check check jwt signature, match uuid of url with payload, check uuid from txt file
*/
app.put('/:token/changePassword', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['password', 'token'] });
    if (typeof (value) == 'string') return res.status(409).send(value);
    let error = false;

    if (!validatePassword(req.body.password, res)) {
        return;
    }

    const token = req.body.token;

    result = await users.findOne({
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
        attributes: ['uuid'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

    const uuid = result.uuid;

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
* /:token - DELETE - delete a user by given uuid
* @check check jwt signature
*/
app.delete('/:token', checkjwt, async (req, res) => {
    const token = req.params.token;
    let error = false;

    result = await users.findOne({
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
        attributes: ['uuid'],
    })
        .catch((err) => {
            error = false;
            res.status(403).send(err);
        });

    if (error) return;

    const uuid = result.uuid;

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
            res.status(403).send(err);
        });
});

module.exports = app;
const app = require('express').Router();
const bodyParser = require('body-parser');
const { users } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');
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

/*
* /resource - POST - create
* /resource - GET - List
* /parent-resource/:parentresourceId/:childresource - POST - Create - params
* /resource/:reference - GET - findOne - single collection
* /resource/:reference - PUT - update
* /resource/:reference - DELETE - delete
* /resource/:reference - POST - Nothing

* PATCH - PUT
*/

module.exports = app;
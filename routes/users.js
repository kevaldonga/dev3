const app = require('express').Router();
const bodyParser = require('body-parser');
const { users, reactionModerators, hashtagModerators } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');
const { validatePassword } = require('./validations/user');
const { updateUserState } = require('../middleware/uuidfileop');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const { roleCheck } = require('../middleware/rolecheck');
const { v4: uuidv4, v1: uuidv1 } = require('uuid');
const send = require('../utils/mailer');
const generatePassword = require('../utils/generatePassword');
const nullcheck = require('./validations/nullcheck');

const JWTPRIVATEKEY = process.env.JWT;

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
            if (result == 0) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: result });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /verify  - PUT - get verify email address link
*/
app.put("/verify", async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['username', 'password'], mustBeNullFields: [...defaultNullFields, 'token', 'role'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });
    let error = false;

    result = await users.findOne({
        where: {
            "username": {
                [Op.eq]: req.body.username,
            },
        },
    })
        .catch((err) => {
            error = true;
        });

    if (result == null || error) {
        return res.status(409).send({ res: "incorrect email or password" });
    }

    const password = result.password;

    const check = bcrypt.compareSync(req.body.password, password);

    if (check) {
        const link = `http://localhost:5000/users/verify/${result.token}`;
        let htmlText = '<h1> <b> email verificatio link </b> </h1><br>';
        htmlText += '<p> to verify your email please click <a href="';
        htmlText += link;
        htmlText += '" > </a> </p>';
        await send({
            to: result.email,
            subject: "verify link",
            html: htmlText,
        })
            .then((result) => {
                res.send({ res: "check your email" });
            })
            .catch((err) => {
                res.status(403).send({ error: true, res: err.message });
            });
    }
    else {
        res.status(403).send({ error: true, res: "incorrect email or password" });
    }

});

/* 
* /verify/:token - GET - verify email link
*/
app.get("/verify/:token", async (req, res) => {
    const token = req.params.token;
    let error = false;

    result = await users.findOne({
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
    })
        .catch((err) => {
            error = true;
        });

    if (result == null || error) {
        return res.status(409).send({ error: true, res: "token is invalid or expired" });
    }

    if (result.isActive == 1) {
        return res.status(409).send({ res: "email is already verified" });
    }

    await users.update({
        "token": uuidv1(),
        "uuid": uuidv4(),
        "isActive": 1,
    }, {
        where: {
            "id": {
                [Op.eq]: result.id,
            },
        },
    })
        .then((result) => {
            res.send({ res: "SUCCESS" });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: "token is invalid or expired" });
        });
});

/* 
* / - POST - create a user
*/
app.post('/', async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['username', 'email', 'password'], mustBeNullFields: [...defaultNullFields, 'token', 'role'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    await users.create(req.body)
        .then((result) => {
            res.send({ res: result });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
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
            if (result == 0) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
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
            if (result == 0) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
        });
});

/*
* /login - POST - login user
*/
app.post('/login', async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['email', 'password'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });
    let error = false;
    const role = req.body.role;

    result = await users.findOne({
        where: {
            "email": {
                [Op.eq]: req.body.email,
            },
        },
        include: "profiles",
    })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
        });

    if (error) return;

    if (result == null) {
        res.status(409).send({ error: true, res: "Invalid resource" });
        return;
    }

    checked = await bcrypt.compare(req.body.password, result.password);
    if (checked) {
        let userObj = { auth: result.uuid, auth2: result.profiles.uuid, _sa: result.profiles.id };
        if (role !== 'user' && role !== undefined) {
            userObj['role'] = role;
        }
        let jt = jwt.sign(userObj, JWTPRIVATEKEY, { 'expiresIn': '30D' });
        updateUserState(result.uuid, 1);
        res.cookie('jwt', jt, { path: '/', httpOnly: true, secure: true });
        res.send(jt);
    } else {
        res.status(403).send({ error: true, res: 'Invalid' });
    }
});

/*
* /:uuid - PUT - update a user
* @check check jwt signature, match uuid of url with payload, check uuid from txt file
*/
app.put('/:uuid', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['username', 'token'], mustBeNullFields: [...defaultNullFields, 'password', 'role'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    const token = req.body.token;
    await users.update(req.body, {
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
    })
        .then((result) => {
            if (result == 0) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});


/* 
* /:uuid/changePassword - PUT - change password
* @check check jwt signature, match uuid of url with payload, check uuid from txt file
*/
app.put('/:uuid/changePassword', checkjwt, authorized, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['newPassword', 'oldPassword', 'token'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });
    let error = false;

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const token = req.body.token;

    result = await users.findOne({
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
        attributes: ['uuid', 'password'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
        });

    if (error) return;

    if (result == null) {
        res.status(409).send({ error: true, res: "Invalid resource" });
        return;
    }

    const uuid = result.uuid;

    checked = await bcrypt.compare(oldPassword, result.password);

    if (!checked || !validatePassword(oldPassword)) {
        return res.status(403).send({ error: true, res: "Invalid password!!" });
    }

    userdetails = await users.updatePassword(newPassword, uuid);
    userinfo = {
        'auth': userdetails.uuid,
        'auth2': req.userinfo.auth2,
        '_sa': req.userinfo._sa,
    };
    updateUserState(userdetails.uuid, 1);
    updateUserState(uuid, 0);
    jwttoken = jwt.sign(userinfo, JWTPRIVATEKEY, { 'expiresIn': '30D' });
    res.cookie("accessToken", jwttoken, { secure: true, httpOnly: true });
    res.send(jwttoken);
});

/* 
* /forgotPassword/:token - PUT - send new generated password to user email
*/
app.put("/forgotPassword/:token", async (req, res) => {
    const token = req.params.token;
    let error = false;

    result = await users.findOne({
        where: {
            'token': {
                [Op.eq]: token,
            },
        },
    })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send({ error: true, res: "Invalid resource" });
    }

    await users.update({
        token: uuidv1(),
    })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });

    const newPassword = generatePassword();

    let htmlText = '<h1>your new password</h1><br>your new generated password is - ';
    htmlText = `<b>${newPassword}</b>`;

    const newHashedPassword = bcrypt.hashSync(newPassword, 15);

    await users.update({
        "password": newHashedPassword,
    }, {
        where: {
            "id": {
                [Op.eq]: result.id,
            },
        },
    })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
        });

    if (error) return;

    await send({
        email: result.email,
        title: "Generated password",
        html: htmlText
    })
        .then((result) => {
            res.send({ res: "SUCCESS" });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/*
* /:token - DELETE - delete a account by given uuid
* @check check jwt signature
*/
app.delete('/deleteAccount/:token', checkjwt, async (req, res) => {
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
            res.status(403).send({ error: true, res: err.message });
        });

    if (error) return;

    if (result == null) {
        res.status(409).send({ error: true, res: "Invalid resource" });
        return;
    }

    const uuid = result.uuid;

    await profiles.destroy({
        where: {
            "userId": {
                [Op.eq]: result.id,
            },
        },
    })
        .catch((err) => {
            error = true;
            res.status(403).send({ error: true, res: err.message });
        });

    if (error) return;

    updateUserState(uuid, -1);

    await users.update({
        "isActive": -1,
    }, {
        where: {
            "token": {
                [Op.eq]: token,
            },
        },
    })
        .then((result) => {
            if (result == 0) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                updateUserState(uuid, 0);
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:uuid//moderator/hashtags - GET - get all hashtags which user has been moderating
* @check check jwt signature, match uuid from payload, check uuid from txt file
*/
app.get("/:uuid/moderator/hashtags", checkjwt, authorized, checkActiveUUID, async (req, res) => {
    const uuid = req.params.uuid;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

    result = await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(409).send({ error: true, res: err.message });
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send({ error: true, res: "Invalid resource" });
    }

    const userId = result.id;

    await hashtagModerators.findAll({
        where: {
            "userId": {
                [Op.eq]: userId,
            },
        },
        include: "hashtags",
        limit: limit,
        offset: offset,
    })
        .then((result) => {
            res.send(get(result, "hashtags"));
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:uuid/moderator/hashtags - GET - get all reactions which user has been moderating
* @check check jwt signature, match uuid from payload, check uuid from txt file
*/
app.get("/:uuid/moderator/reactions", checkjwt, authorized, checkActiveUUID, async (req, res) => {
    const uuid = req.params.uuid;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

    result = await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(409).send({ error: true, res: err.message });
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send({ error: true, res: "Invalid resource" });
    }

    const userId = result.id;

    await reactionModerators.findAll({
        where: {
            "userId": {
                [Op.eq]: userId,
            },
        },
        include: "reactions",
        limit: limit,
        offset: offset,
    })
        .then((result) => {
            res.send(get(result, "reactions"));
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /search - GET - search user by username
*/
app.get('/search', async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['query'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 0 : parseInt(req.query.limit);

    const query = req.body.query;

    await users.findAll({
        where: {
            [Op.or]: [
                {
                    'username': {
                        [Op.startsWith]: query,
                    },
                },
                {
                    'username': {
                        [Op.endsWith]: query,
                    },
                },
                {
                    'username': {
                        [Op.like]: `%${query}%`,
                    },
                },
            ]
        },
        offset: offset,
        limit: limit,
    })
        .then((result) => {
            res.send({ res: result });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

module.exports = app;
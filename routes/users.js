const app = require('express').Router();
const bodyParser = require('body-parser');
const { users, reactionModerators, hashtagModerators } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');
const { validatePassword } = require('./validations/user');
const { updateUserState, getUserState, updateUUID } = require('../redis/profileOp');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const { roleCheck } = require('../middleware/rolecheck');
const { v4: uuidv4, v1: uuidv1 } = require('uuid');
const send = require('../utils/mailer');
const generatePassword = require('../utils/generatePassword');

app.use(bodyParser.json());

/*
* /:uuid - GET - get a user
* @check check jwt signature
*/
app.get('/:uuid', checkjwt, async (req, res) => {
    const uuid = req.params.uuid;
    result = await getUserState(uuid, 'id');
    if (result != 0) {
        return res.send({ res: result });
    }

    await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
    })
        .then(async (result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                await updateUserState(uuid, result);
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

    try {
        result = await users.findOne({
            where: {
                "username": {
                    [Op.eq]: req.body.username,
                },
            },
        });
        if (result == null) {
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
                });
        }
        else {
            res.status(403).send({ error: true, res: "incorrect email or password" });
        }
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }

});

/* 
* /verify/:token - GET - verify email link
*/
app.get("/verify/:token", async (req, res) => {
    const token = req.params.token;

    try {
        result = await users.findOne({
            where: {
                "token": {
                    [Op.eq]: token,
                },
            },
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "token is invalid or expired" });
        }

        if (result.isActive == 1) {
            return res.status(409).send({ res: "email is already verified" });
        }
        const newuuid = uuidv4();
        const newtoken = uuidv1();

        await users.update({
            "token": newtoken,
            "uuid": newuuid,
            "isActive": 1,
        }, {
            where: {
                "id": {
                    [Op.eq]: result.id,
                },
            },
        })
            .then(async (result) => {
                updateUUID(result.uuid, newuuid);
                await updateUserState(newuuid, { ...result, 'uuid': newuuid, 'isActive': 1, 'token': newtoken });
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
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
        .then(async (result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                await updateUserState(moderatorUUID, { 'role': 'moderator' });
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
        .then(async (result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                await updateUserState(moderatorUUID, { 'role': 'user' });
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
    value = nullCheck(req.body, { nonNullableFields: ['email', 'password', 'cloudfareToken'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    if (req.body.cloudfareToken == null) return res.status(403).send({ error: true, res: "captcha token is null" });

    try {
        const formData = new FormData();
        formData.append("secret", process.env.CAPTCHASECRETKEY);
        formData.append("response", req.body.cloudfareToken);

        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        result = await fetch(url, {
            body: formData,
            method: 'POST',
        });

        const response = await result.json();

        if (!response.success) {
            return res.status(403).send({ error: true, errorObject: response['error-codes'], res: "Invalid Token" });
        }

        result = await users.findOne({
            where: {
                "email": {
                    [Op.eq]: req.body.email,
                },
            },
            include: "profiles",
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const role = result.role;

        checked = await bcrypt.compare(req.body.password, result.password);
        if (checked) {
            let userObj = { auth: result.uuid, auth2: result.profiles.uuid, _sa: result.profiles.id };
            if (role !== 'user' && role !== undefined) {
                userObj['role'] = role;
            }
            let jt = jwt.sign(userObj, process.env.JWT, { 'expiresIn': '30D' });
            await updateUserState(result.uuid, { 'isActive': 1 });
            res.cookie('jwt', jt, { path: '/', httpOnly: true, secure: true });
            res.send(jt);
        } else {
            res.status(403).send({ error: true, res: 'Email or password is Incorrect' });
        }
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
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
        .then(async (result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                await updateUserState(req.params.uuid, result);
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

    try {
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
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const oldUUID = result.uuid;
        const newUUID = uuidv4();

        checked = await bcrypt.compare(oldPassword, result.password);

        if (!checked || !validatePassword(oldPassword)) {
            return res.status(403).send({ error: true, res: "Invalid password!!" });
        }

        userdetails = await users.updatePassword(newPassword, newUUID);
        userinfo = {
            'auth': newUUID,
            'auth2': req.userinfo.auth2,
            '_sa': req.userinfo._sa,
        };

        updateUUID(oldUUID, newUUID);
        await updateUserState(newUUID, { 'uuid': newUUID });
        jwttoken = jwt.sign(userinfo, process.env.JWT, { 'expiresIn': '30D' });
        res.cookie("accessToken", jwttoken, { secure: true, httpOnly: true });
        res.send(jwttoken);
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /forgotPassword/:token - PUT - send new generated password to user email
*/
app.put("/forgotPassword/:token", async (req, res) => {
    const token = req.params.token;

    try {
        result = await users.findOne({
            where: {
                'token': {
                    [Op.eq]: token,
                },
            },
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        await users.update({
            token: uuidv1(),
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
        });

        await send({
            email: result.email,
            title: "Generated password",
            html: htmlText
        })
            .then((result) => {
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/*
* /:token - DELETE - delete a account by given uuid
* @check check jwt signature
*/
app.delete('/deleteAccount/:token', checkjwt, async (req, res) => {
    const token = req.params.token;

    try {
        result = await users.findOne({
            where: {
                "token": {
                    [Op.eq]: token,
                },
            },
            attributes: ['uuid'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const uuid = result.uuid;

        await profiles.destroy({
            where: {
                "userId": {
                    [Op.eq]: result.id,
                },
            },
        });

        await updateUserState(uuid, { 'isActive': -1 });

        await users.update({
            "isActive": -1,
        }, {
            where: {
                "token": {
                    [Op.eq]: token,
                },
            },
        })
            .then(async (result) => {
                if (result == undefined) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    await updateUserState(uuid, { 'isActive': -1 });
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:uuid//moderator/hashtags - GET - get all hashtags which user has been moderating
* @check check jwt signature, match uuid from payload, check uuid from txt file
*/
app.get("/:uuid/moderator/hashtags", checkjwt, authorized, checkActiveUUID, async (req, res) => {
    const uuid = req.params.uuid;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        let result = await getUserState(uuid, 'id');

        if (result == undefined) {
            result = await users.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: uuid,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(uuid, result);
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
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:uuid/moderator/hashtags - GET - get all reactions which user has been moderating
* @check check jwt signature, match uuid from payload, check uuid from txt file
*/
app.get("/:uuid/moderator/reactions", checkjwt, authorized, checkActiveUUID, async (req, res) => {
    const uuid = req.params.uuid;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        let result = await getUserState(uuid, 'id');

        if (result == undefined) {
            result = await users.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: uuid,
                    },
                },
            });
            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(uuid, result);
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
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
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

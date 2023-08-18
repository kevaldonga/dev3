const app = require('express').Router();
const bodyParser = require('body-parser');
const { reactions, users, reactionModerators } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, checkActiveUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const { authorizedAsModerator } = require('../middleware/rolecheck');

app.use(bodyParser.json())

/*
* / - POST - create a reaction
* @check check active jwt, check if jwt matches request uri
*/
app.post("/", checkjwt, checkActiveUUID, authorizedAsModerator, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['reaction', 'label'], mustBeNullFields: [...defaultNullFields] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    const result = roleCheck(uuid, 'moderator');
    if (typeof (result) == 'string') return res.status(403).send(result);

    await reactions.create(req.body)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:reactionUUID - GET - get a reaction by UUID
*/
app.get("/:reactionUUID", async (req, res) => {
    const reactionUUID = req.params.reactionUUID;

    await reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
    })
        .then((result) => {
            if (result == null) {
                res.status(409).send("invalid resource");
            }
            else {
                res.send(result);
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/*
* /:reactionUUID - DELETE - delete a reaction
* @check check active jwt
*/
app.delete("/:reactionUUID", checkjwt, checkActiveUUID, authorizedAsModerator, async (req, res) => {
    const reactionUUID = req.params.reactionUUID;

    const result = roleCheck(uuid, 'moderator');
    if (typeof (result) == 'string') return res.status(403).send(result);

    await reactions.destroy({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
    })
        .then((result) => {
            if (result == 0) {
                res.status(409).send("invalid resource");
            }
            else {
                res.send("reaction removed successfully!!");
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:reactionUUID/moderator/:uuid - POST - add moderator in reactions
* @check check jwt signature, match payload uuid with user uuid, authroize user as moderator, check active uuid i txt file
*/
app.post("/:reactionUUID/moderator/:uuid", async (req, res) => {
    const reactionUUID = req.params.reactionUUID;
    const uuid = req.params.uuid;

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
            res.status(409).send(err.message);
        });

    if (error) return;

    if (result == null) {
        res.status(409).send("invalid resource");
        return;
    }

    const userId = result.id;

    result = await reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(409).send(err.message);
        });

    if (error) return;

    if (result == null) {
        res.status(409).send("invalid resource");
        return;
    }

    const reactionId = result.id;

    await reactionModerators.create({
        "reactionId": reactionId,
        "userId": userId,
    })
        .then((result) => {
            res.send("moderator added successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:reactionUUID/moderator/:uuid - DELETE - remove moderator in reactions
* @check check jwt signature, match payload uuid with user uuid, authroize user as moderator, check active uuid i txt file
*/
app.delete("/:reactionUUID/moderator/:uuid", async (req, res) => {
    const reactionUUID = req.params.reactionUUID;
    const uuid = req.params.uuid;

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
            res.status(409).send(err.message);
        });

    if (error) return;

    if (result == null) {
        res.status(409).send("invalid resource");
        return;
    }

    const userId = result.id;

    result = await reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(409).send(err.message);
        });

    if (error) return;

    if (result == null) {
        res.status(409).send("invalid resource");
        return;
    }

    const reactionId = result.id;

    await reactionModerators.destroy({
        where: {
            "userId": {
                [Op.eq]: userId,
            },
            "reactionId": {
                [Op.eq]: reactionId,
            },
        },
    })
        .then((result) => {
            if (result == 0) {
                res.status(409).send("invalid resource");
            }
            else {
                res.send("moderator removed successfully!!");
            }
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/*
* /:reactionUUID/moderators - GET - get all moderators of reaction
*/
app.get("/:reactionUUID/moderators", async (req, res) => {
    const reactionUUID = req.params.reactionUUID;
    let error = false;

    result = await reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
        id: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(409).send(err.message);
        });

    if (error) return;

    if (result == null) {
        res.status(409).send("invalid resource");
        return;
    }

    const reactionId = result.id;

    await reactionModerators.findAll({
        where: {
            "reactionId": {
                [Op.eq]: reactionId,
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

module.exports = app;
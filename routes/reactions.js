const app = require('express').Router();
const bodyParser = require('body-parser');
const { reactions } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');

app.use(bodyParser.json())

/*
* / - POST - create a reaction
* @check check active jwt, check if jwt matches request uri
*/
app.post("/", checkjwt, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['reaction'], mustBeNullFields: [...defaultNullFields] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    await reactions.create(req.body)
        .then((result) => {
            res.send("reaction created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:reactionUUID - GET - get a reaction by id
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
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/*
* /:reactionUUID - DELETE - delete a reaction
* @check check active jwt
*/
app.delete("/:reactionUUID", checkjwt, checkActiveUUID, async (req, res) => {
    const reactionUUID = req.params.reactionUUID;

    await reactions.destroy({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
    })
        .then((result) => {
            res.send("reaction removed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

module.exports = app;
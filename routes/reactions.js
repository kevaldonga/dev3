const app = require('express').Router();
const bodyParser = require('body-parser');
const { reactions } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized } = require('../middleware/jwtcheck');

app.use(bodyParser.json())

/*
* /:uuid - POST - create a reaction
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    result = await reactions.create(req.body);

    res.send(result ? "reaction created successfully!!" : "error occurred")
});

/* 
* /:reactionUUID - GET - get a reaction by id
*/
app.get("/:reactionUUID", async (req, res) => {
    const reactionUUID = req.params.reactionUUID;

    result = await reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
    });
    res.send(result)
});

/*
* /:reactionUUID - DELETE - delete a reaction
* @check check active jwt
*/
app.delete("/:reactionUUID", checkjwt, async (req, res) => {
    const reactionUUID = req.params.reactionUUID;

    let result = await reactions.destroy({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured")
});

module.exports = app;
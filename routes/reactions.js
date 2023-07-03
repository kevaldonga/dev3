const app = require('express').Router();
const bodyParser = require('body-parser');
const { reactions } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json())

/* 
* /:uuid - POST - create a reaction
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    let result = await reactions.create(req.body)

    res.send(result ? "reaction created successfully!!" : "error occurred")
});

/* 
* /:id - GET - get a reaction by id
* @check check active jwt
*/
app.get("/:reactionId", checkjwt, async (req, res) => {
    const reactionId = req.params.reactionId;

    let result = await reactions.findOne({
        where: {
            "id": {
                [Op.eq]: reactionId,
            },
        },
    });
    res.send(result)
});

/*
* /:reactionId/profile/:profileId - DELETE - delete a reaction
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
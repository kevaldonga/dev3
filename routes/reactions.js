const app = require('express').Router();
const bodyParser = require('body-parser');
const { reactions } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json())

/* 
* /:uuid - POST - create reaction
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    let result = await reactions.create(req.body)

    res.send(result ? "reaction created successfully!!" : "error occurred")
});

/* 
* /:id - GET - get reaction by id
* @check check active jwt
*/
app.get("/:id", checkjwt, async (req, res) => {
    const id = req.params.id;

    let result = await reactions.findOne({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result)
});

/*
* /:id/:uuid - DELETE - delete reaction
* @check check active jwt
*/
app.delete("/:id/:uuid", checkjwt, authorized, async (req, res) => {
    const id = req.params.id;

    let result = await reactions.destroy({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured")
});

module.exports = app;
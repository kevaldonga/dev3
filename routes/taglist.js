const app = require('express').Router();
const bodyParser = require('body-parser');
const { tagList } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, checkActiveUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json())

/* 
* /:uuid - POST - create tag
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    let result = await tagList.create(req.body)

    res.send(result ? "tag is created successfully!!" : "error occurred")
});

/* 
* /:id - DELETE - delete tag
* @check check active jwt
*/
app.delete("/:id/:uuid", checkjwt, authorized, async (req, res) => {
    const id = req.params.id;
    let result = await tagList.destroy(req.body, {
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "tag is deleted successfully!!" : "error occurred")
});

/* 
* /:id - GET - get tag by id
* @check check active jwt
*/
app.get("/:id", checkjwt, async (req, res) => {
    const id = req.params.id;
    let result = await tagList.findOne({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result)
});

module.exports = app
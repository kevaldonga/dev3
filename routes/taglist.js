const app = require('express').Router();
const bodyParser = require('body-parser');
const { tagList } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json())

/* 
* /:uuid - POST - create a tag
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    let result = await tagList.create(req.body)

    res.send(result ? "tag is created successfully!!" : "error occurred")
});

/* 
* /:tagId/profile/profileId - DELETE - delete a tag
* @check check active jwt
*/
app.delete("/:tagId/profile/profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const tagId = req.params.tagId;
    let result = await tagList.destroy(req.body, {
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        },
    });

    res.send(result ? "tag is deleted successfully!!" : "error occurred")
});

/* 
* /:id - GET - get a tag by id
* @check check active jwt
*/
app.get("/:tagId", checkjwt, async (req, res) => {
    const tagId = req.params.tagId;
    let result = await tagList.findOne({
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        },
    });

    res.send(result)
});

module.exports = app
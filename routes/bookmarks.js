const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - add post to bookmark
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {

    let result = await bookmarkPostsRelation.create(req.body);

    res.send(result ? "post bookmarked!!" : "error occured");
});

/*
* /:profileId - GET - get all bookmarked posts
* @check check active jwt, check if jwt matches request uri
*/
app.get("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const profileId = req.params.profileId;
    let result = await bookmarkPostsRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:id/:uuid - DELETE - remove bookmark on post by given id
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:id/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const id = req.params.id;
    let result = await bookmarkPostsRelation.destroy({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "bookmark removed successfully !!" : "error occured");
});

module.exports = app;
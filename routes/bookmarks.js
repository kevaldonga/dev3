const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - add a post to bookmark
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {

    result = await bookmarkPostsRelation.create(req.body);

    res.send(result ? "post bookmarked!!" : "error occured");
});

/*
* /:profileId - GET - get all bookmarked posts
* @check check active jwt, check if jwt matches request uri
*/
app.get("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const profileId = req.params.profileId;
    result = await bookmarkPostsRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
    });

    res.send(result);
});

/* 
* /:bookmarkId/profile/:profileId - DELETE - remove a bookmark on a post by given id
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:bookmarkId/profile/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const id = req.params.id;
    result = await bookmarkPostsRelation.destroy({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "bookmark removed successfully !!" : "error occured");
});

module.exports = app;
const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId, addProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - add a post to bookmark
* @check check active jwt, check if jwt matches request uri, get profileId from payload and add it req.nody
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, addProfileId, async (req, res) => {

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
* /:bookmarkId - DELETE - remove a bookmark on a post by given id
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:bookmarkUUID", checkjwt, async (req, res) => {
    const bookmarkUUID = req.params.bookmarkUUID;
    result = await bookmarkPostsRelation.destroy({
        where: {
            "uuid": {
                [Op.eq]: bookmarkUUID,
            },
        },
    });

    res.send(result ? "bookmark removed successfully !!" : "error occured");
});

module.exports = app;
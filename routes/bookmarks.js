const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId, addProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');

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
* /:profileUUID - GET -  bookmarked posts
* @check check active jwt, check if profile uuid matches
*/
app.get("/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = result.id;

    result = await bookmarkPostsRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
        limit: 10,
        offset: offset,
        include: "posts",
    });

    res.send(result);
});

/* 
* /:bookmarkId - DELETE - remove a bookmark on a post by given uuid
* @check check active jwt
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
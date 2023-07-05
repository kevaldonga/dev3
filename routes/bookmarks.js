const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId, addProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck } = require('./validations/nullcheck');

app.use(bodyParser.json());

/*
* /:postUUID - POST - add a post to bookmark
* @check check active jwt, get profileId from payload and add it req.nody
*/
app.post("/:postUUID", checkjwt, addProfileId, async (req, res) => {
    value = nullCheck(res, body, { nonNullableFields: ['profileId'] });
    if (value) return;

    const profileId = req.body.profileId;
    const postUUID = req.params.postUUID;

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = await bookmarkPostsRelation.create({ "postId": postId, "profileId": profileId });

    res.send(result ? "post bookmarked!!" : "error occured");
});

/*
* /posts - GET -  bookmarked posts
* @check check active jwt, check if profile uuid matches
*/
app.get("/posts", checkjwt, async (req, res) => {
    const profileUUID = req.userinfo.auth2;
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
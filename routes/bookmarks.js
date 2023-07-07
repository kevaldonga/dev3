const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId } = require('../middleware/jwtcheck');
const { nullCheck } = require('./validations/nullcheck');

app.use(bodyParser.json());

/*
* /:postUUID - POST - add a post to bookmark
* @check check active jwt, get profileId from payload and add it req.nody
*/
app.post("/:postUUID", checkjwt, addProfileId, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['profileId'] });
    if (typeof (value) == 'string') return res.status(409).send(value);
    let error = false;

    const profileId = req.body.profileId;
    const postUUID = req.params.postUUID;

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const postId = result.id;

    await bookmarkPostsRelation.create({ "postId": postId, "profileId": profileId })
        .then((result) => {
            res.send("added post to bookmark!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/*
* /posts - GET -  bookmarked posts
* @check check active jwt, check if profile uuid matches
*/
app.get("/posts", checkjwt, async (req, res) => {
    const profileUUID = req.userinfo.auth2;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        include: "tagLists",
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const profileId = result.id;

    result = await bookmarkPostsRelation.findAll({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
        },
        limit: limit,
        offset: offset,
        include: "posts",
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:bookmarkId - DELETE - remove a bookmark on a post by given uuid
* @check check active jwt
*/
app.delete("/:bookmarkUUID", checkjwt, async (req, res) => {
    const bookmarkUUID = req.params.bookmarkUUID;
    await bookmarkPostsRelation.destroy({
        where: {
            "uuid": {
                [Op.eq]: bookmarkUUID,
            },
        },
    })
        .then((result) => {
            res.send("bookmark removed successfully !!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;
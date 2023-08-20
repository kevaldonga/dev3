const app = require('express').Router();
const bodyParser = require('body-parser');
const { bookmarkPostsRelation, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck } = require('./validations/nullcheck');
const getObj = require('./functions/include');

app.use(bodyParser.json());

/*
* /:postUUID - POST - add a post to bookmark
* @check check jwt signature, get profileId from payload and add it req.body
*/
app.post("/:postUUID", checkjwt, addProfileId, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['profileId'] });
    if (typeof (value) == 'string') return res.status(400).send(value);
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
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("invalid resource");
    }

    const postId = result.id;

    await bookmarkPostsRelation.create({ "postId": postId, "profileId": profileId })
        .then((result) => {
            res.send("SUCCESS");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/*
* /posts/:profileUUID - GET -  bookmarked posts
* @check check jwt signature, match profile uuid from url with payload
*/
app.get("/posts/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

    if (result == null) {
        return res.status(409).send("invalid resource");
    }

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
            res.send(getObj(result, "posts"));
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:bookmarkId - DELETE - remove a bookmark on a post by given uuid
* @check check jwt signature
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
            if (result == 0) {
                res.status(409).send("invalid resource");
            }
            else {
                res.send("SUCCESS");
            }
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

module.exports = app;
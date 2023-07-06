const app = require('express').Router();
const bodyParser = require('body-parser');
const { tagList, hashtagFollowers, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - create a tag
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['tag', 'image', 'color', 'description'], mustBeNullFields: [...defaultNullFields, 'count', 'followerCount'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    result = await tagList.create(req.body);

    res.send(result ? "tag is created successfully!!" : "error occurred");
});

/* 
* /:tagUUID - DELETE - delete a tag
* @check check active jwt
*/
app.delete("/:tagUUID", checkjwt, async (req, res) => {
    const tagUUID = req.params.tagUUID;
    result = await tagList.destroy({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    });

    res.send(result ? "tag is deleted successfully!!" : "error occurred");
});

/* 
* /:tagUUID - GET - get a tag by id
*/
app.get("/:tagUUID", async (req, res) => {
    const tagUUID = req.params.tagUUID;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
        attributes: ['id'],
    });

    const tagId = result.id;

    result = await tagList.findOne({
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        },
    });

    res.send(result);
});

/* 
* /:tagUUID/followers - GET - get all followers of tag
*/
app.get("/:tagUUID/followers", async (req, res) => {
    const tagUUID = req.params.tagUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
        attributes: ['id'],
    });

    const tagId = result.id;

    result = await hashtagFollowers.findAll({
        where: {
            "tagId": {
                [Op.eq]: tagId,
            },
        },
        limit: 10,
        offset: offset,
        include: "profiles"
    });

    res.send(result);
});

/* 
* /:profileUUID/follows/:tagUUID - POST - user follows tag
* @check check jwt token, check if profile uuid matches
*/
app.post("/:profileUUID/follows/:tagUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagUUID = req.params.tagUUID;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = result.id;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    });

    const tagId = result.id;

    result = await hashtagFollowers.create({
        "profileId": profileId,
        "hashtagId": tagId,
    });

    // increment following count in a tagList
    await tagList.increment("followerCount", {
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        }
    });

    res.send(result ? "hashtag followed successfully!!" : "error occured");
});

/* 
* /:profileUUID/unfollows/:tagUUID - DELETE - user unfollows tag
* @check check jwt token, check if profile uuid matches
*/
app.delete("/:profileUUID/unfollows/:tagUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagUUID = req.params.hashtagUUID;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = result.id;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    });

    const tagId = result.id;

    result = await hashtagFollowers.destroy({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
            "hashtagId": {
                [Op.eq]: tagId,
            },
        },
    });

    // decrement following count in a tagList
    await tagList.decrement("followerCount", {
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        }
    });

    res.send(result ? "hashtag unfollowed successfully!!" : "error occured");
});

module.exports = app;
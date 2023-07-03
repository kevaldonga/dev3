const app = require('express').Router();
const bodyParser = require('body-parser');
const { tagList, hashtagFollowers, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - create a tag
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    result = await tagList.create(req.body);

    res.send(result ? "tag is created successfully!!" : "error occurred");
});

/* 
* /:tagUUID - DELETE - delete a tag
* @check check active jwt
*/
app.delete("/:tagUUID", checkjwt, async (req, res) => {
    const tagUUID = req.params.tagUUID;
    result = await tagList.destroy(req.body, {
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    });

    res.send(result ? "tag is deleted successfully!!" : "error occurred");
});

/* 
* /:tagId - GET - get a tag by id
*/
app.get("/:tagId", async (req, res) => {
    const tagId = req.params.tagId;
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
* /:tagId/followers - GET - get all folllowers of tag
*/
app.get("/:tagId/followers", async (req, res) => {
    const tagId = req.params.tagId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await hashtagFollowers.findAll({
        where: {
            "tagId": {
                [Op.eq]: tagId,
            },
        },
        limit: 10,
        offset: offset,
    });

    res.send(result);
});

/* 
* /:profileUUID/follows/:tagId - POST - user follows tag
* @check check jwt token, check if profile uuid matches
*/
app.post("/:profileUUID/follows/:hashtagId", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const hashtagId = req.params.hashtagId;

    p = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = p.id;

    result = await hashtagFollowers.create({
        "profileId": profileId,
        "hashtagId": hashtagId,
    });

    res.send(result ? "hashtag followed successfully!!" : "error occured");
});

/* 
* /:profileUUID/unfollows/:tagId - POST - user follows tag
* @check check jwt token, check if profile uuid matches
*/
app.delete("/:profileUUID/unfollows/:hashtagId", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const hashtagId = req.params.hashtagId;

    p = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = p.id;

    result = await hashtagFollowers.destroy({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
            "hashtagId": {
                [Op.eq]: hashtagId,
            },
        },
    });

    res.send(result ? "hashtag unfollowed successfully!!" : "error occured");
});

module.exports = app;
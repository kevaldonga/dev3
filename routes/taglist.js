const app = require('express').Router();
const bodyParser = require('body-parser');
const { tagList, hashtagFollowers, profiles } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileUUID, checkActiveUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - create a tag
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, checkActiveUUID, async (req, res) => {
    value = nullCheck(body, {
        nonNullableFields: ['tag', 'image', 'color', 'description'],
        mustBeNullFields: [...defaultNullFields, 'count', 'followerCount']
    });
    if (typeof (value) == 'string') return res.status(409).send(value);

    await tagList.create(req.body)
        .then((result) => {
            res.send("tag created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:tagUUID - DELETE - delete a tag
* @check check active jwt
*/
app.delete("/:tagUUID", checkjwt, async (req, res) => {
    const tagUUID = req.params.tagUUID;
    await tagList.destroy({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    })
        .then((result) => {
            res.send("tag deleted successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:tagUUID - GET - get a tag by id
*/
app.get("/:tagUUID", async (req, res) => {
    const tagUUID = req.params.tagUUID;
    let error = false;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const tagId = result.id;

    await tagList.findOne({
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        },
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:tagUUID/followers - GET - get all followers of tag
*/
app.get("/:tagUUID/followers", async (req, res) => {
    const tagUUID = req.params.tagUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    let error = false;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const tagId = result.id;

    await hashtagFollowers.findAll({
        where: {
            "tagId": {
                [Op.eq]: tagId,
            },
        },
        limit: 10,
        offset: offset,
        include: "profiles"
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID/follows/:tagUUID - POST - user follows tag
* @check check jwt token, check if profile uuid matches
*/
app.post("/:profileUUID/follows/:tagUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagUUID = req.params.tagUUID;
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
            res.status(403).send(err.message);
        });

    if (error) return;

    const profileId = result.id;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const tagId = result.id;

    // increment following count in a tagList
    await tagList.increment("followerCount", {
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    await hashtagFollowers.create({
        "profileId": profileId,
        "hashtagId": tagId,
    })
        .then((result) => {
            res.send("hashtag followed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID/unfollows/:tagUUID - DELETE - user unfollows tag
* @check check jwt token, check if profile uuid matches
*/
app.delete("/:profileUUID/unfollows/:tagUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const tagUUID = req.params.hashtagUUID;
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
            res.status(403).send(err.message);
        });

    if (error) return;

    const profileId = result.id;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    const tagId = result.id;

    // decrement following count in a tagList
    await tagList.decrement("followerCount", {
        where: {
            "id": {
                [Op.eq]: tagId,
            },
        }
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

    await hashtagFollowers.destroy({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
            "hashtagId": {
                [Op.eq]: tagId,
            },
        },
    })
        .then((result) => {
            res.send("hashtag unfollowed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;
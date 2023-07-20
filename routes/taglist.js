const app = require('express').Router();
const bodyParser = require('body-parser');
const { tagList, hashtagFollowers, profiles, hashtagModerators } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, checkActiveUUID, authorizedForProfileUUID, authorized } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const { authorizedAsModerator } = require('./../middleware/rolecheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - create a tag
* @check check jwt signature, match uuid of url with payload, check uuid from txt file
*/
app.post("/:uuid", checkjwt, authorizedAsModerator, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, {
        nonNullableFields: ['tag', 'image', 'color', 'description'],
        mustBeNullFields: [...defaultNullFields, 'count', 'followerCount']
    });
    if (typeof (value) == 'string') return res.status(409).send(value);

    const result = roleCheck(uuid, 'moderator');
    if (typeof (result) == 'string') return res.status(403).send(result);

    await tagList.create(req.body)
        .then((result) => {
            res.send("tag created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:uuid - PUT - update a tag
* @check check jwt signature, match uuid of url with payload, check uuid from txt file
*/
app.put("/:uuid", checkjwt, authorizedAsModerator, checkActiveUUID, async (req, res) => {
    value = nullCheck(req.body, {
        nonNullableFields: ['image', 'color', 'description'],
        mustBeNullFields: [...defaultNullFields, 'count', 'followerCount', 'tag']
    });
    if (typeof (value) == 'string') return res.status(409).send(value);

    const result = roleCheck(uuid, 'moderator');
    if (typeof (result) == 'string') return res.status(403).send(result);

    await tagList.update(req.body)
        .then((result) => {
            res.send("tag updated successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:tagUUID - DELETE - delete a tag
* @check check jwt signature
*/
app.delete("/:tagUUID", checkjwt, authorizedAsModerator, async (req, res) => {
    const tagUUID = req.params.tagUUID;

    const result = roleCheck(req.auth.uuid, 'admin');
    if (typeof (result) == 'string') return res.status(403).send(result);

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
            res.status(403).send(err);
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
            res.status(403).send(err);
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
            res.status(403).send(err);
        });
});

/* 
* /:tagUUID/followers - GET - get all followers of tag
*/
app.get("/:tagUUID/followers", async (req, res) => {
    const tagUUID = req.params.tagUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
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
            res.status(403).send(err);
        });

    if (error) return;

    const tagId = result.id;

    await hashtagFollowers.findAll({
        where: {
            "tagId": {
                [Op.eq]: tagId,
            },
        },
        limit: limit,
        offset: offset,
        include: "profiles"
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:profileUUID/follows/:tagUUID - POST - user follows tag
* @check check jwt signature, match profile uuid of url with payload
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
            res.status(403).send(err);
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
            res.status(403).send(err);
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
            res.status(403).send(err);
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
            res.status(403).send(err);
        });
});

/* 
* /:profileUUID/unfollows/:tagUUID - DELETE - user unfollows tag
* @check check jwt signature, match profile uuid of url with payload
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
            res.status(403).send(err);
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
            res.status(403).send(err);
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
            res.status(403).send(err);
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
            res.status(403).send(err);
        });
});

/* 
* /:tagUUID/moderator/:uuid - POST - add moderator in hashtag
* @check check jwt signature, match uuid from url with payload, check uuid in txt file
*/
app.post("/:tagUUID/moderator/:uuid", checkjwt, authorized, authorizedAsModerator, checkActiveUUID, async (req, res) => {
    const tagUUID = req.params.tagUUID;
    const uuid = req.params.uuid;
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
            res.status(403).send(err);
        });

    if (error) return;

    const hashtagId = result.id;

    result = await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

    const userId = result.id;

    await hashtagModerators.create({
        "hashtagId": hashtagId,
        "userId": userId,
    })
        .then((result) => {
            res.send("moderator added successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

/* 
* /:tagUUID/moderator/:uuid - DELETE - remove moderator in hashtag
* @check check jwt signature, match uuid from url with payload, check uuid in txt file
*/
app.delete("/:tagUUID/moderator/:uuid", checkjwt, authorized, authorizedAsModerator, checkActiveUUID, async (req, res) => {
    const tagUUID = req.params.tagUUID;
    const uuid = req.params.uuid;
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
            res.status(403).send(err);
        });

    if (error) return;

    const hashtagId = result.id;

    result = await users.findOne({
        where: {
            "uuid": {
                [Op.eq]: uuid,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err);
        });

    if (error) return;

    const userId = result.id;

    await hashtagModerators.destroy({
        "hashtagId": {
            [Op.eq]: hashtagId
        },
        "userId": {
            [Op.eq]: userId
        },
    })
        .then((result) => {
            res.send("moderator added successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err);
        });
});

module.exports = app;
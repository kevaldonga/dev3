const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation, tagList, profiles, pinnedPosts } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const getObj = require('./functions/include');
const nullcheck = require('./validations/nullcheck');
const { getUserState, updateUserState } = require('../redis/profileOp');

app.use(bodyParser.json());

/* 
* / - POST - create post
* @check check jwt signature, get profileId from payload and add it req.body
*/
app.post("/", checkjwt, addProfileId, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['profileId', 'title', 'media', 'readDuration', 'reactionLimit'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });
    await posts.create(req.body)
        .then((result) => {
            res.send({ res: result });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:postUUID - GET - get post
*/
app.get("/:postUUID", async (req, res) => {
    const postUUID = req.params.postUUID;
    await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    })
        .then((result) => {
            if (result == null) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: result });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/*
* /:postUUID - PUT - update the post
* @check check jwt signature
*/
app.put("/:postUUID", checkjwt, async (req, res) => {
    value = nullCheck(req.body, { mustBeNullFields: [...defaultNullFields, 'profileId', 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    const postUUID = req.params.postUUID;
    await posts.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    })
        .then((result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/*
* /:postUUID - DELETE - delete the post
* @check check jwt signature
*/
app.delete("/:postUUID", checkjwt, async (req, res) => {
    const postUUID = req.params.postUUID;
    await posts.destroy({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    })
        .then((result) => {
            if (result == undefined) {
                res.status(409).send({ error: true, res: "Invalid resource" });
            }
            else {
                res.send({ res: "SUCCESS" });
            }
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

/* 
* /:postUUID/reactions - GET - get all reactions on post
*/
app.get("/:postUUID/reactions", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        await reactionOnPosts.findAll({
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
            },
            limit: limit,
            offset: offset,
            include: "reactions",
        })
            .then((result) => {
                res.send({ res: result });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/comments - GET - get all comments on post
*/
app.get("/:postUUID/comments", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        await comments.findAll({
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
            },
            order: [["reactionCount", "DESC"]],
            limit: limit,
            offset: offset,
        })
            .then((result) => {
                res.send({ res: result });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/reaction/:reactionUUID/profile/:profileUUID - DELETE - delete reaction on post
* @check check jwt signature, match profileuuid of url with payload
*/
app.delete("/:postUUID/reaction/:reactionUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const reactionUUID = req.params.reactionUUID;

    try {
        postResult = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
        });

        if (postResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = postResult.id;

        result = await reactions.findOne({
            where: {
                "uuid": {
                    [Op.eq]: reactionUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const reactionId = result.id;

        result = await reactionOnPosts.destroy({
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
                "reactionId": {
                    [Op.eq]: reactionId,
                },
            }
        });

        if (result == undefined) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        await posts.decrement("reactionCount", {
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
            },
        });

        if (global.socket != null) {
            global.socket.emit(`post:${postUUID}`, { "reactionCount": postResult.reactionCount - 1, "operation": "DECR" });
        }
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/reaction/:profileUUID - POST - add reaction on post
* @check check jwt signature, match profileuuid of url with payload
*/
app.post("/:postUUID/reaction/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ["reactionId"] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });

    const postUUID = req.params.postUUID;
    const profileUUID = req.params.profileUUID;

    try {
        postResult = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (postResult == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = postResult.id;

        let result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        result = await reactionOnPosts.create({ "postId": postId, "profileId": profileId, "reactionId": req.body.reactionId });

        await posts.increment("reactionCount", {
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
            },
        });

        if (global.socket != null) {
            global.socket.emit(`post:${postUUID}`, { "reactionCount": postResult.reactionCount + 1, "operation": "INCR", "id": result.id });
        }
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/tags - GET - get all tags in post
*/
app.get("/:postUUID/tags", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        await tagPostRelation.findAll({
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
            },
            limit: limit,
            offset: offset,
            include: "tags",
        })
            .then((result) => {
                res.send(getObj(result, "tags"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/tags - GET - get all posts of tag
*/
app.get("/:tagUUID/posts", async (req, res) => {
    const tagUUID = req.params.tagUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await tagList.findOne({
            where: {
                "uuid": {
                    [Op.eq]: tagUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const tagId = result.id;

        await posts.findAll({
            include: {
                model: "tagList",
                as: "tags",
                where: {
                    "id": {
                        [Op.eq]: tagId,
                    },
                },
            },
            order: [["likeCount", "DESC"]],
            limit: limit,
            offset: offset,
        })
            .then((result) => {
                res.send(getObj(result, "posts"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/tag/:tagUUID/profile/:profileUUID - DELETE - delete tag in post
* @check check jwt signature, match profile uuid of url with payload
*/
app.delete("/:postUUID/tag/:tagUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const tagUUID = req.params.tagUUID;

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        result = await tagList.findOne({
            where: {
                "uuid": {
                    [Op.eq]: tagUUID,
                },
            },
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const tagId = result.id;

        // increase tag used count
        await tagList.decrement("count", {
            where: {
                "id": {
                    [Op.eq]: tagId,
                },
            }
        });

        await tagPostRelation.destroy({
            where: {
                "postId": {
                    [Op.eq]: postId,
                },
                "tagId": {
                    [Op.eq]: tagId,
                },
            },
        })
            .then((result) => {
                if (result == undefined) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/tag/:tagUUID/profile/:profileUUID - POST - add tag in post
* @check check jwt signaure, match profile uuid of url with payload
*/
app.post("/:postUUID/tag/:tagUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const tagUUID = req.params.tagUUID;

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        result = await tagList.findOne({
            where: {
                "uuid": {
                    [Op.eq]: tagUUID,
                },
            },
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const tagId = result.id;

        // increase tag used count
        await tagList.increment("count", {
            where: {
                "id": {
                    [Op.eq]: tagId,
                },
            }
        });

        await tagPostRelation.create({
            "tagId": tagId,
            "postId": postId,
        })
            .then((result) => {
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/bookmarks/count - GET - get bookmark count of post
*/
app.get("/:postUUID/bookmarks/count", async (req, res) => {
    const postUUID = req.params.postUUID;

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        await bookmarkPostRelation.count({
            where: {
                "postId": postId,
            },
            attributes: ['id'],
        })
            .then((result) => {
                res.send({ length: result });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/bookmarks - GET - get profiles of ones who bookmarked post
*/
app.get("/:postUUID/bookmarks", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        await bookmarkPostRelation.findAll({
            where: {
                "postId": postId,
            },
            include: "profiles",
            offset: offset,
            limit: limit,
        })
            .then((result) => {
                res.send(getObj(result, "profiles"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/isBookmarked/:postUUID - check if post is bookmarked or not
* @check check jwt signature, match profile uuid of url with payload
*/
app.get("/:profileUUID/isBookmarked/:postUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const postUUID = req.params.postUUID;

    try {
        let result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        await bookmarkPostRelation.findOne({
            where: {
                "profileId": {
                    [Op.eq]: profileId,
                },
                "postId": {
                    [Op.eq]: postId,
                },
            },
        })
            .then((result) => {
                res.send({ "isBookmarked": !result.isEmpty });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/pinned/:profileUUID - POST - pin the post of user profile
* @check check jwt signature, match profileuuid from payload
*/
app.post("/:postUUID/pinned/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const profileUUID = req.params.profileUUID;

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        await pinnedPosts.create({
            "profileId": profileId,
            "postId": postId,
        })
            .then((result) => {
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:postUUID/pinned/:profileUUID - DELETE - unpin the post of user profile
* @check check jwt signature, match profileuuid from payload
*/
app.delete("/:postUUID/pinned/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const profileUUID = req.params.profileUUID;

    try {
        result = await posts.findOne({
            where: {
                "uuid": {
                    [Op.eq]: postUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const postId = result.id;

        result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        await pinnedPosts.destroy({
            where: {
                "profileId": {
                    [Op.eq]: profileId,
                },
                "postId": {
                    [Op.eq]: postId,
                },
            }
        })
            .then((result) => {
                if (result == undefined) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /:profileUUID/pinned/all - GET - get all pinned post of user profile
*/
app.get("/:profileUUID/pinned/all", async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);

    try {
        let result = await getUserState(profileUUID, 'id');

        if (result == undefined) {
            result = await profiles.findOne({
                where: {
                    "uuid": {
                        [Op.eq]: profileUUID,
                    },
                },
            });

            if (result == null) {
                return res.status(409).send({ error: true, res: "Invalid resource" });
            }

            await updateUserState(profileUUID, result);
        }

        const profileId = result.id;

        await pinnedPosts.findAll({
            where: {
                "profileId": {
                    [Op.eq]: profileId,
                },
            },
            order: [["createdAt", "DESC"]],
            include: "pinnedposts",
            limit: limit,
            offset: offset,
        })
            .then((result) => {
                res.send(getObj(result, "pinnedposts"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: JSON.stringify(err) });
    }
});

/* 
* /search - GET - search in post title / description
*/
app.get('/search', async (req, res) => {
    const value = nullCheck(req.body, { nonNullableFields: ['query'] });
    if (typeof (value) == 'string') return res.status(400).send({ error: true, res: value });
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    const query = req.body.query;

    await posts.findAll({
        where: {
            [Op.or]: [
                {
                    "title": {
                        [Op.startsWith]: query,
                    }
                },
                {
                    "title": {
                        [Op.endsWith]: query,
                    }
                },
                {
                    "title": {
                        [Op.like]: `%${query}%`,
                    }
                },
                {
                    "description": {
                        [Op.startsWith]: query,
                    }
                },
                {
                    "description": {
                        [Op.endsWith]: query,
                    }
                },
                {
                    "description": {
                        [Op.like]: `%${query}%`,
                    }
                },
            ]
        },
        order: [["reactionCount", "DESC"]],
        offset: offset,
        limit: limit,
    })
        .then((result) => {
            res.send({ res: result });
        })
        .catch((err) => {
            res.status(403).send({ error: true, res: err.message });
        });
});

module.exports = app;

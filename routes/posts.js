const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation, tagList, profiles, pinnedPosts } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');
const getObj = require('./functions/include');
const nullcheck = require('./validations/nullcheck');

app.use(bodyParser.json());
/*
/ resource GET / POST - GET thi list, POST thi create
/ resource / uuid - GET, PUT, DELETE


/* 
* / - POST - create post
* @check check jwt signature, get profileId from payload and add it req.body
*/
app.post("/", checkjwt, addProfileId, async (req, res) => {
    value = nullCheck(req.body, { nonNullableFields: ['profileId', 'title', 'media', 'readDuration'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
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
            if (result == 0) {
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
            if (result == 0) {
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
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
            limit: limit,
            offset: offset,
        })
            .then((result) => {
                res.send({ res: result });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
    }
});

/* 
* /:postUUID/reaction/:reactionId/profile/:profileUUID - DELETE - delete reaction on post
* @check check jwt signature, match profileuuid of url with payload
*/
app.delete("/:postUUID/reaction/:reactionUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const reactionUUID = req.params.reactionUUID;

    try {
        result = posts.findOne({
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

        result = reactions.findOne({
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
        })
            .then((result) => {
                res.send({ res: "SUCCESS" });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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

        await tagPostRelation.findAll({
            where: {
                "tagId": {
                    [Op.eq]: tagId,
                },
            },
            limit: limit,
            offset: offset,
            include: "posts",
        })
            .then((result) => {
                res.send(getObj(result, "posts"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
                if (result == 0) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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

        await bookmarkPostRelation.findAll({
            where: {
                "postId": postId,
            },
            attributes: ['id'],
        })
            .then((result) => {
                res.send({ length: result.length });
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
        result = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
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
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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

        result = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
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
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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

        result = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
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
                if (result == 0) {
                    res.status(409).send({ error: true, res: "Invalid resource" });
                }
                else {
                    res.send({ res: "SUCCESS" });
                }
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
        result = await profiles.findOne({
            where: {
                "uuid": {
                    [Op.eq]: profileUUID,
                },
            },
            attributes: ['id'],
        });

        if (result == null) {
            return res.status(409).send({ error: true, res: "Invalid resource" });
        }

        const profileId = result.id;

        await pinnedPosts.findAll({
            where: {
                "profileId": {
                    [Op.eq]: profileId,
                },
            },
            include: "pinnedposts",
            limit: limit,
            offset: offset,
        })
            .then((result) => {
                res.send(getObj(result, "pinnedposts"));
            });
    }
    catch (err) {
        res.status(403).send({ error: true, res: err.message, errorObject: err });
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
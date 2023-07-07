const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation, tagList } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId, authorizedForProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');
const { nullCheck, defaultNullFields } = require('./validations/nullcheck');

app.use(bodyParser.json());
/*
/ resource GET / POST - GET thi list, POST thi create
/ resource / uuid - GET, PUT, DELETE


/* 
* / - POST - create post
* @check check active jwt, get profileId from payload and add it req.nody
*/
app.post("/", checkjwt, addProfileId, async (req, res) => {
    value = nullCheck(body, { nonNullableFields: ['profileId', 'title', 'media'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(409).send(value);
    await posts.create(req.body)
        .then((result) => {
            res.send("post created successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID - GET - get post by its id
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
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/*
* /:postUUID - PUT - update the post
* @check check active jwt
*/
app.put("/:postUUID", checkjwt, async (req, res) => {
    value = nullCheck(req.body, { mustBeNullFields: [...defaultNullFields, 'profileId', 'reactionCount'] });
    if (typeof (value) == 'string') return res.status(409).send(value);

    const postUUID = req.params.postUUID;
    await posts.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    })
        .then((result) => {
            res.send("post updated successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/*
* /:postUUID - DELETE - delete the post
* @check check active jwt
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
            res.send("post deleted successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/reactions - GET - get all reactions on post
*/
app.get("/:postUUID/reactions", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

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

    await reactionOnPosts.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
        limit: limit,
        offset: offset,
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/comments - GET - get all comments on post
*/
app.get("/:postUUID/comments", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

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
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/reaction/:reactionId/profile/:profileUUID - DELETE - delete reaction on post
* @check check active jwt
*/
app.delete("/:postUUID/reaction/:reactionUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const reactionUUID = req.params.reactionUUID;
    let error = false;

    result = posts.findOne({
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

    result = reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
        attributes: ['id'],
    })
        .catch((err) => {
            error = true;
            res.status(403).send(err.message);
        });

    if (error) return;

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
            res.send("reaction removed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/tags - GET - get all tags in post
*/
app.get("/:postUUID/tags", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
    const limit = req.query.page === undefined ? 10 : parseInt(req.query.limit);
    let error = false;

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

    if (error) return false;

    const postId = result.id;

    await tagPostRelation.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
        limit: limit,
        offset: offset,
        include: "tagList",
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/tags - GET - get all posts of tag
*/
app.get("/:tagUUID/posts", async (req, res) => {
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
            res.status(403).send(err.message);
        });

    if (error) return false;

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
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/tag/:tagUUID/profile/:profileUUID - DELETE - delete tag in post
* @check check active jwt
*/
app.delete("/:postUUID/tag/:tagUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const tagUUID = req.params.tagUUID;
    let error = false;

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

    if (error) return false;

    const postId = result.id;

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

    if (error) return false;

    const tagId = result.id;

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
            res.send("tag removed successfully!!");
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/bookmarks/count - GET - get bookmark count of post
*/
app.get("/:postUUID/bookmarks/count", async (req, res) => {
    const postUUID = req.params.postUUID;
    let error = false;

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

    if (error) return false;

    const postId = result.id;

    await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
        attributes: ['id'],
    })
        .then((result) => {
            res.send({ length: result.length });
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:postUUID/bookmarks - GET - get profiles of ones who bookmarked post
*/
app.get("/:postUUID/bookmarks", async (req, res) => {
    const postUUID = req.params.postUUID;
    let error = false;

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

    if (error) return false;

    const postId = result.id;

    await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
        include: "profiles",
    })
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

/* 
* /:profileUUID/isBookmarked/:postUUID - check if post is bookmarked or not
* @check check active jwt
*/
app.get("/:profileUUID/isBookmarked/:postUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const postUUID = req.params.postUUID;
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

    if (error) return false;

    const profileId = result.id;

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

    if (error) return false;

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
        })
        .catch((err) => {
            res.status(403).send(err.message);
        });
});

module.exports = app;
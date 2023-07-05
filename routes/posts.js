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
    value = nullCheck(res, body, { nonNullableFields: ['profileId', 'title', 'media'], mustBeNullFields: [...defaultNullFields, 'reactionCount'] });
    if (value) return;

    result = await posts.create(req.body);

    res.send(result ? "post created successfully!!" : "error occurred");
});

/* 
* /:postUUID - GET - get post by its id
*/
app.get("/:postUUID", async (req, res) => {
    const postUUID = req.params.postUUID;
    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    });
    res.send(result);
});

/*
* /:postUUID - PUT - update the post
* @check check active jwt
*/
app.put("/:postUUID", checkjwt, async (req, res) => {
    value = nullCheck(res, body, { mustBeNullFields: [...defaultNullFields, 'profileId', 'reactionCount'] });
    if (value) return;

    const postUUID = req.params.postUUID;
    result = await posts.update(req.body, {
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    });

    res.send(result ? "post updated successfully!!" : "error occured");
});

/*
* /:postUUID - DELETE - delete the post
* @check check active jwt
*/
app.delete("/:postUUID", checkjwt, async (req, res) => {
    const postUUID = req.params.postUUID;
    result = await posts.destroy({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
    });

    res.send(result ? "post deleted successfully!!" : "error occured");
});

/* 
* /:postUUID/reactions - GET - get all reactions on post
*/
app.get("/:postUUID/reactions", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = await reactionOnPosts.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
        limit: 10,
        offset: offset,
    });

    res.send(result);
});

/* 
* /:postUUID/comments - GET - get all comments on post
*/
app.get("/:postUUID/comments", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = await comments.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
        limit: 10,
        offset: offset,
    });

    res.send(result);
});

/* 
* /:postUUID/reaction/:reactionId/profile/:profileUUID - DELETE - delete reaction on post
* @check check active jwt
*/
app.delete("/:postUUID/reaction/:reactionUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const reactionUUID = req.params.reactionUUID;

    result = posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = reactions.findOne({
        where: {
            "uuid": {
                [Op.eq]: reactionUUID,
            },
        },
        attributes: ['id'],
    });

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

    res.send(result ? "reaction deleted successfully!!" : "error occured");
});

/* 
* /:postUUID/tags - GET - get all tags in post
*/
app.get("/:postUUID/tags", async (req, res) => {
    const postUUID = req.params.postUUID;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = await tagPostRelation.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
        limit: 10,
        offset: offset,
        include: "tagList",
    });

    res.send(result);
});

/* 
* /:postUUID/tags - GET - get all posts of tag
*/
app.get("/:tagUUID/posts", async (req, res) => {
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

    result = await tagPostRelation.findAll({
        where: {
            "tagId": {
                [Op.eq]: tagId,
            },
        },
        limit: 10,
        offset: offset,
        include: "posts",
    });

    res.send(result);
});

/* 
* /:postUUID/tag/:tagUUID/profile/:profileUUID - DELETE - delete tag in post
* @check check active jwt
*/
app.delete("/:postUUID/tag/:tagUUID/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postUUID = req.params.postUUID;
    const tagUUID = req.params.tagUUID;

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = await tagList.findOne({
        where: {
            "uuid": {
                [Op.eq]: tagUUID,
            },
        },
    });

    const tagId = result.id;

    result = await tagPostRelation.destroy({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
            "tagId": {
                [Op.eq]: tagId,
            },
        },
    });

    res.send(result ? "tag removed succesfully!!" : "error occured");
});

/* 
* /:postUUID/bookmarks/count - GET - get bookmark count of post
*/
app.get("/:postUUID/bookmarks/count", async (req, res) => {
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

    result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
        attributes: ['id'],
    });
    res.send({ length: result.length });
});

/* 
* /:postUUID/bookmarks - GET - get profiles of ones who bookmarked post
*/
app.get("/:postUUID/bookmarks", async (req, res) => {
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

    result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
        include: "profiles",
    });
    res.send(result);
});

/* 
* /:profileUUID/isBookmarked/:postUUID - check if post is bookmarked or not
* @check check active jwt
*/
app.get("/:profileUUID/isBookmarked/:postUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const postUUID = req.params.postUUID;

    result = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = result.id;

    result = await posts.findOne({
        where: {
            "uuid": {
                [Op.eq]: postUUID,
            },
        },
        attributes: ['id'],
    });

    const postId = result.id;

    result = await bookmarkPostRelation.findOne({
        where: {
            "profileId": {
                [Op.eq]: profileId,
            },
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send({ "isBookmarked": !result.isEmpty });
});

module.exports = app;
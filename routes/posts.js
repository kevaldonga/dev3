const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId, authorizedForProfileId, authorizedForProfileUUID } = require('../middleware/jwtcheck');

app.use(bodyParser.json());
/*
/ resource GET / POST - GET thi list, POST thi create
/ resource / uuid - GET, PUT, DELETE


/* 
* / - POST - create post
* @check check active jwt, get profileId from payload and add it req.nody
*/
app.post("/", checkjwt, addProfileId, async (req, res) => {
    result = await posts.create(req.body)

    res.send(result ? "post created successfully!!" : "error occurred");
});

/* 
* /:id - GET - get post by its id
*/
app.get("/:postId", async (req, res) => {
    const postId = req.params.postId;
    result = await posts.findOne({
        where: {
            "id": {
                [Op.eq]: postId,
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
* /:postId/reactions - GET - get all reactions on post
*/
app.get("/:postId/reactions", async (req, res) => {
    const postId = req.params.postId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

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
* /:postId/comments - GET - get all comments on post
*/
app.get("/:postId/comments", async (req, res) => {
    const postId = req.params.postId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);
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
* /:postId/:reactionId/profile/:profileUUID - DELETE - delete reaction on post
* @check check active jwt
*/
app.delete("/:postId/reaction/:reactionId/profile/:profileUUID", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const postId = req.params.postId;
    const reactionId = req.params.reactionId;

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
* /:postId/tags - GET - get all tags in post
*/
app.get("/:postId/tags", async (req, res) => {
    const postId = req.params.postId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

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
* /:postId/tags - GET - get all posts of tag
*/
app.get("/:tagId/posts", async (req, res) => {
    const tagId = req.params.tagId;
    const offset = req.query.page === undefined ? 0 : parseInt(req.query.page);

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
* /:postId/tag/:tagId/profile/profileId - DELETE - delete tag in post
* @check check active jwt
*/
app.delete("/:postId/tag/:tagId/profile/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const postId = req.params.postId;
    const tagId = req.params.tagId;

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
* /:postId/bookmarks/count - GET - get bookmark count of post
*/
app.get("/:postId/bookmarks/count", async (req, res) => {
    const postId = req.params.postId;

    result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
    });
    res.send({ length: result.length });
});

/* 
* /:postId/bookmarks - GET - get profiles of ones who bookmarked post
*/
app.get("/:postId/bookmarks", async (req, res) => {
    const postId = req.params.postId;

    result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
        include: "profiles",
    });
    res.send(result);
});

/* 
* /:profileId/isBookmarked/:postId - check if post is bookmarked or not
* @check check active jwt
*/
app.get("/:profileUUID/isBookmarked/:postId", checkjwt, authorizedForProfileUUID, async (req, res) => {
    const profileUUID = req.params.profileUUID;
    const postId = req.params.postId;

    p = await profiles.findOne({
        where: {
            "uuid": {
                [Op.eq]: profileUUID,
            },
        },
        attributes: ['id'],
    });

    const profileId = p.id;

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
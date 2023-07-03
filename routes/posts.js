const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, addProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());
/*
/ resource GET / POST - GET thi list, POST thi create
/ resource / uuid - GET, PUT, DELETE


/* 
* / - POST - create post
* @check check active jwt, get profileId from payload and add it req.nody
*/
app.post("/", checkjwt, addProfileId, async (req, res) => {
    let result = await posts.create(req.body)

    res.send(result ? "post created successfully!!" : "error occurred");
});

/* 
* /:id - GET - get post by its id
* @check check active jwt
*/
app.get("/:postId", checkjwt, async (req, res) => {
    const postId = req.params.postId;
    let result = await posts.findOne({
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
    let result = await posts.update(req.body, {
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
    let result = await posts.destroy({
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
* @check check active jwt
*/
app.get("/:postId/reactions", checkjwt, async (req, res) => {
    const postId = req.params.postId;
    let result = await reactionOnPosts.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/comments - GET - get all comments on post
* @check check active jwt
*/
app.get("/:postId/comments", checkjwt, async (req, res) => {
    const postId = req.params.postId;
    let result = await comments.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/:reactionId/profile/:profileId - DELETE - delete reaction on post
* @check check active jwt
*/
app.delete("/:postId/reaction/:reactionId/profile/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    const postId = req.params.postId;
    const reactionId = req.params.reactionId;

    let result = await reactionOnPosts.destroy({
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
* @check check active jwt
*/
app.get("/:postId/tags", checkjwt, async (req, res) => {
    const postId = req.params.postId;

    let result = await tagPostRelation.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/tags - GET - get all posts of tag
* @check check active jwt
*/
app.get("/:tagId/posts", checkjwt, async (req, res) => {
    const tagId = req.params.tagId;

    let result = await tagPostRelation.findAll({
        where: {
            "tagId": {
                [Op.eq]: tagId,
            },
        },
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

    let result = await tagPostRelation.destroy({
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
* @check check active jwt
*/
app.get("/:postId/bookmarks/count", checkjwt, async (req, res) => {
    const postId = req.params.postId;

    let result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
    });
    res.send({ length: result.length });
});

/* 
* /:postId/bookmarks - GET - get profiles of ones who bookmarked post
* @check check active jwt
*/
app.get("/:postId/bookmarks", checkjwt, async (req, res) => {
    const postId = req.params.postId;

    let result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
    });
    res.send(result);
});

/* 
* /:profileId/isBookmarked/:postId - check if post is bookmarked or not
* @check check active jwt
*/
app.get("/:profileId/isBookmarked/:postId", checkjwt, authorizedForProfileId, async (req, res) => {
    const profileId = req.params.profileId;
    const postId = req.params.postId;

    let result = await bookmarkPostRelation.findOne({
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
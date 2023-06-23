const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorized, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/* 
* /:uuid - POST - create post
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:uuid", checkjwt, authorized, async (req, res) => {
    let result = await posts.create(req.body)

    res.send(result ? "post created successfully!!" : "error occurred");
});

/* 
* /:id - GET - get post by its id
* @check check active jwt
*/
app.get("/:id", checkjwt, async (req, res) => {
    const id = req.params.id;
    let result = await posts.findOne({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result);
});

/*
* /:id/:uuid - POST - update the post
* @check check active jwt
*/
app.post("/:id/:uuid", checkjwt, authorized, async (req, res) => {
    const id = req.params.id;
    let result = await posts.update(req.body, {
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "post updated successfully!!" : "error occured");
});

/*
* /:id/:uuid - DELETE - delete the post
* @check check active jwt
*/
app.delete("/:id/:uuid", checkjwt, authorized, async (req, res) => {
    const id = req.params.id;
    let result = await posts.destroy({
        where: {
            "id": {
                [Op.eq]: id,
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
* /:postId/:reactionId/:uuid - DELETE - delete reaction on post
* @check check active jwt
*/
app.delete("/:postId/:reactionId/:uuid", checkjwt, authorized, async (req, res) => {
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
* /:postId/:tagId/:uuid - DELETE - delete tag in post
* @check check active jwt
*/
app.delete("/:postId/:tagId/:uuid", checkjwt, authorized, async (req, res) => {
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
* /:postId/bookmarks/All
* @check check active jwt
*/
app.get("/:postId/bookmarks/count", checkjwt, async (req, res) => {
    const postId = req.params.postId;

    let result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
    });
    res.send(result);
});

/* 
* /:profileId/:postId/:isBookmarked - check if post is bookmarked or not
* @check check active jwt
*/
app.get("/:profileId/:postId/isBookmarked", checkjwt, authorizedForProfileId, async (req, res) => {
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
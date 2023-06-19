const app = require('express').Router();
const bodyParser = require('body-parser');
const { posts, reactionOnPosts, tagPostRelation, comments, bookmarkPostRelation } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/* 
* / - POST - create post
*/
app.post("/", async (req, res) => {
    let result = await posts.create(req.body)

    res.send(result ? "post created successfully!!" : "error occurred");
});

/* 
* /:id - GET - get post by its id
*/
app.get("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await posts.findOne({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });
    res.send(result);
});

/*
* /:id - POST - update the post
*/
app.post("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await posts.update(req.body, {
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.send(result ? "post updated successfully!!" : "error occured");
});

/*
* /:id - DELETE - delete the post
*/
app.delete("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await posts.destroy({
        where: {
            "id": {
                [Ops.eq]: id,
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
    let result = await reactionOnPosts.findAll({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/comments - GET - get all comments on post
*/
app.get("/:postId/comments", async (req, res) => {
    const postId = req.params.postId;
    let result = await comments.findAll({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/:reactionId - DELETE - delete reaction on post
*/
app.delete("/:postId/:reactionId", async (req, res) => {
    const postId = req.params.postId;
    const reactionId = req.params.reactionId;

    let result = await reactionOnPosts.destroy({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
            "reactionId": {
                [Ops.eq]: reactionId,
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

    let result = await tagPostRelation.findAll({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/tags - GET - get all posts of tag
*/
app.get("/:tagId/posts", async (req, res) => {
    const tagId = req.params.tagId;

    let result = await tagPostRelation.findAll({
        where: {
            "tagId": {
                [Ops.eq]: tagId,
            },
        },
    });

    res.send(result);
});

/* 
* /:postId/:tagId - DELETE - delete tag in post
*/
app.delete("/:postId/:tagId", async (req, res) => {
    const postId = req.params.postId;
    const tagId = req.params.tagId;

    let result = await tagPostRelation.destroy({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
            "tagId": {
                [Ops.eq]: tagId,
            },
        },
    });

    res.send(result ? "tag removed succesfully!!" : "error occured");
});

/* 
* /:postId/bookmarks/count
*/
app.get("/:postId/bookmarks/count", async (req, res) => {
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
*/
app.get("/:postId/bookmarks/count", async (req, res) => {
    const postId = req.params.postId;

    let result = await bookmarkPostRelation.findAll({
        where: {
            "postId": postId,
        },
    });
    res.send(result);
});

app.get("/:profileId/:postId/isBookmarked", async (req, res) => {
    const profileId = req.params.profileId;
    const postId = req.params.postId;

    let result = await bookmarkPostRelation.findOne({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.send({ "isBookmarked": !result.isEmpty });
});

module.exports = app;
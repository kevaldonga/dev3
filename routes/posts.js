const app = require('express').Router();
const { posts, reactionOnPosts, tagPostRelation } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/* 
* / - POST - create post
*/
app.post("/", (req, res) => {
    let result = posts.create(req.body)

    res.send(result ? "post created successfully!!" : "error occurred");
});

/* 
* /:id - GET - get post by its id
*/
app.get("/:id", (req, res) => {
    const id = req.params.id;
    let result = posts.findOne({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });
    res.json(result);
});

/*
* /:id - POST - update the post
*/
app.post("/:id", (req, res) => {
    const id = req.params.id;
    let result = posts.update(req.body, {
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
app.delete("/:id", (req, res) => {
    const id = req.params.id;
    let result = posts.destroy({
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
app.get("/:postId/reactions", (req, res) => {
    const postId = req.params.postId;
    let result = reactionOnPosts.findAll({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.json(result);
});

/* 
* /:postId/:reactionId - DELETE - delete reaction on post
*/
app.delete("/:postId/:reactionId", (req, res) => {
    const postId = req.params.postId;
    const reactionId = req.params.reactionId;

    let result = reactionOnPosts.destroy({
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
app.get("/:postId/tags", (req, res) => {
    const postId = req.params.postId;

    let result = tagPostRelation.findAll({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.json(result);
});

/* 
* /:postId/:tagId - DELETE - delete tag in post
*/
app.delete("/:postId/:tagId", (req, res) => {
    const postId = req.params.postId;
    const tagId = req.params.tagId;

    let result = tagPostRelation.destroy({
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

module.exports = app
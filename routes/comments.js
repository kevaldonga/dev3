const app = require('express').Router();
const { comments, reactionOnComments } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/* 
* / - CREATE - create comment
*/
app.post("/", (req, res) => {
    let result = comments.create(req.body);

    res.send(result ? "comment created successfully!!" : "error occured");
});

/* 
* /:id - GET - get comment by id
*/
app.get("/:id", (req, res) => {
    const id = req.params.id;
    let result = comments.findOne({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });
    res.json(result);
});

/* 
* /:id - POST - update comment by id
*/
app.post("/:id", (req, res) => {
    const id = req.params.id;
    let result = comments.update(req.body, {
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });
    res.send(result ? "comment updated successfully!!" : "error occured");
});

/* 
* /:id - DELETE - delete comment by id
*/
app.post("/:id", (req, res) => {
    const id = req.params.id;
    let result = comments.destroy({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });
    res.send(result ? "comment deleted successfully!!" : "error occured");
});


/*
* /:commentId/reactions - GET - get all reactions of comment
*/
app.get("/:commentId/reactions", (req, res) => {
    const commentId = req.params.commentId;
    let result = reactionOnComments.findAll({
        where: {
            "commentId": {
                [Ops.eq]: commentId,
            },
        },
    });

    res.json(result);
});

/*
* /:commentId/:reactionId - DELETE - delete reaction on comment
*/
app.delete("/:commentId/:reactionId", (req, res) => {
    const commentId = req.params.commentId;
    const reactionId = req.params.reactionId;
    let result = reactionOnComments.findAll({
        where: {
            "commentId": {
                [Ops.eq]: commentId,
            },
            "reactionId": {
                [Ops.eq]: reactionId,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured");
});

module.exports = app;
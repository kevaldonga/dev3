const app = require('express').Router();
const bodyParser = require('body-parser');
const { comments, reactionOnComments } = require('../models');
const { Op } = require('sequelize');

app.use(bodyParser.json());

/* 
* / - CREATE - create comment
*/
app.post("/", async (req, res) => {
    let result = comments.create(req.body);

    res.send(result ? "comment created successfully!!" : "error occured");
});

/* 
* /:id - GET - get comment by id
*/
app.get("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await comments.findOne({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result);
});

/* 
* /:id - POST - update comment by id
*/
app.post("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await comments.update(req.body, {
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result ? "comment updated successfully!!" : "error occured");
});

/* 
* /:id - DELETE - delete comment by id
*/
app.post("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await comments.destroy({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result ? "comment deleted successfully!!" : "error occured");
});


/*
* /:commentId/reactions - GET - get all reactions of comment
*/
app.get("/:commentId/reactions", async (req, res) => {
    const commentId = req.params.commentId;
    let result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
        },
    });

    res.send(result);
});

/*
* /:commentId/:reactionId - DELETE - delete reaction on comment
*/
app.delete("/:commentId/:reactionId", async (req, res) => {
    const commentId = req.params.commentId;
    const reactionId = req.params.reactionId;
    let result = await reactionOnComments.findAll({
        where: {
            "commentId": {
                [Op.eq]: commentId,
            },
            "reactionId": {
                [Op.eq]: reactionId,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured");
});

module.exports = app;
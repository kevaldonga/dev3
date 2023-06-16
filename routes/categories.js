const app = require('express').Router();
const { categorOfPost } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/*
* /:postId - GET - get category(s) of post by postId 
*/
app.get("/:postId", (req, res) => {
    const postId = req.params.postId;

    let result = categorOfPost.findAll({
        where: {
            "postId": {
                [Ops.eq]: postId,
            },
        },
    });

    res.json(result);
});

/* 
* /:id - DELETE - remove category of post by id
*/
app.delete("/:id", (req, res) => {
    const id = req.params.id;

    let result = categorOfPost.destroy({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.send(result ? "category removed !!" : "error occured")
});

/* 
* / - POST - create bookmark
*/
app.post("/", (req, res) => {
    let result = categorOfPost.create(req.body);

    res.send(result ? "bookmark created successfully !!" : "error occured")
});

module.exports = app;
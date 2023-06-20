const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost } = require('../models');
const { Op } = require('sequelize');

app.use(bodyParser.json());

/*
* /:postId - GET - get category(s) of post by postId 
*/
app.get("/:postId", async (req, res) => {
    const postId = req.params.postId;

    let result = await categorOfPost.findAll({
        where: {
            "postId": {
                [Op.eq]: postId,
            },
        },
    });

    res.send(result);
});

/* 
* /:id - DELETE - remove category of post by id
*/
app.delete("/:id", async (req, res) => {
    const id = req.params.id;

    let result = await categorOfPost.destroy({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "category removed !!" : "error occured");
});

/* 
* / - POST - create category
*/
app.post("/", async (req, res) => {
    let result = await categorOfPost.create(req.body);

    res.send(result ? "category created successfully !!" : "error occured");
});

/* 
* /:id/all - GET - get all post of category
*/
app.post("/:id/all", async (req, res) => {
    const id = req.params.id;

    let result = await categorOfPost.findAll({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result);
});

module.exports = app;
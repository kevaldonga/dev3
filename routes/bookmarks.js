const app = require('express').Router();
const { bookmarkPostsRelation } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/* 
* / - POST - add post to bookmark
*/
app.post("/", async (req, res) => {
    let result = await bookmarkPostsRelation.create(req.body);

    res.send(result ? "post bookmarked!!" : "error occured");
});

/*
* /:profileId - GET - get all bookmarked posts
*/
app.get("/:profileId", async (req, res) => {
    const profileId = req.params.profileId;
    let result = await bookmarkPostsRelation.findAll({
        where: {
            "profileId": {
                [Ops.eq]: profileId,
            },
        },
    });

    res.json(result);
});

/* 
* /:id - DELETE - remove bookmark on post by given id
*/
app.delete("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await bookmarkPostsRelation.destroy({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.send(result ? "bookmark removed successfully !!" : "error occured");
});

module.exports = app;
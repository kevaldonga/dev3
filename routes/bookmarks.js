const app = require('express').Router();
const { bookmarkPostsRelation } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json());

/* 
* / - POST - add post to bookmark
*/
app.post("/", (req, res) => {
    bookmarkPostsRelation.create(req.body);

    res.send(result ? "post bookmarked!!" : "error occured");
});

/*
* /:profileId - GET - get all bookmarked posts
*/
app.get("/:profileId", (req, res) => {
    const profileId = req.params.profileId;
    let result = bookmarkPostsRelation.findAll({
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
app.delete("/:id", (req, res) => {
    const id = req.params.id;
    let result = bookmarkPostsRelation.destroy({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.send(result ? "bookmark removed successfully !!" : "error occured");
});

module.exports = app;
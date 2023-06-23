const app = require('express').Router();
const bodyParser = require('body-parser');
const { categorOfPost } = require('../models');
const { Op } = require('sequelize');
const { checkjwt, authorizedForProfileId } = require('../middleware/jwtcheck');

app.use(bodyParser.json());

/*
* /:postId - GET - get category(s) of post by postId 
* @check check active jwt
*/
app.get("/:postId", checkjwt, async (req, res) => {
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
* /:id/:uuid - DELETE - remove category of post by id
* @check check active jwt, check if jwt matches request uri
*/
app.delete("/:id/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
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
* /:uuid - POST - create category
* @check check active jwt, check if jwt matches request uri
*/
app.post("/:profileId", checkjwt, authorizedForProfileId, async (req, res) => {
    let result = await categorOfPost.create(req.body);

    res.send(result ? "category created successfully !!" : "error occured");
});

/* 
* /:id/all - GET - get all post of category
* @check check active jwt
*/
app.post("/:id/all", checkjwt, async (req, res) => {
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
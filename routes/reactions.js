const app = require('express').Router();
const bodyParser = require('body-parser');
const { reactions } = require('../models');
const { Op } = require('sequelize');

app.use(bodyParser.json())

/* 
* / - POST - create reaction
*/
app.post("/", async (req, res) => {
    let result = await reactions.create(req.body)

    res.send(result ? "reaction created successfully!!" : "error occurred")
});

/* 
* /:id - GET - get reaction by id 
*/
app.get("/:id", async (req, res) => {
    const id = req.params.id;

    let result = await reactions.findOne({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });
    res.send(result)
});

/*
* /:id - DELETE - delete reaction
*/
app.delete("/:id", async (req, res) => {
    const id = req.params.id;

    let result = await reactions.destroy({
        where: {
            "id": {
                [Op.eq]: id,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured")
});

module.exports = app;
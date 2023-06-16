const app = require('express').Router();
const { reactions } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json())

/* 
* / - POST - create reaction
*/
app.post("/", (req, res) => {
    let result = reactions.create(req.body)

    res.send(result ? "reaction created successfully!!" : "error occurred")
});

/* 
* /:id - GET - get reaction by id 
*/
app.get("/:id", (req, res) => {
    const id = req.params.id;

    let result = reactions.findOne({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });
    res.json(result)
});

/*
* /:id - DELETE - delete reaction
*/
app.delete("/:id", (req, res) => {
    const id = req.params.id;

    let result = reactions.destroy({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.send(result ? "reaction deleted successfully!!" : "error occured")
});

module.exports = app;
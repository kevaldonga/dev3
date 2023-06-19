const app = require('express').Router();
const { tagList } = require('../models');
const { Ops } = require('sequelize');

app.use(bodyParser.json())

/* 
* / - POST - create tag
*/
app.post("/", async (req, res) => {
    let result = await tagList.create(req.body)

    res.send(result ? "tag is created successfully!!" : "error occurred")
});

/* 
* /:id - DELETE - delete tag
*/
app.delete("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await tagList.destroy(req.body, {
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.send(result ? "tag is deleted successfully!!" : "error occurred")
});

/* 
* /:id - GET - get tag by id
*/
app.get("/:id", async (req, res) => {
    const id = req.params.id;
    let result = await tagList.findOne({
        where: {
            "id": {
                [Ops.eq]: id,
            },
        },
    });

    res.json(result)
});

module.exports = app
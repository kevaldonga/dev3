const app = require('express').Router()
const { posts } = require('../models')

app.use(bodyParser.json());

/* 
* / - POST - create post
*/
app.post("/", (req, res) => {
    let result = posts.create(req.body)

    res.send(result ? "post created successfully!!" : "error occurred")
})

/* 
* /:id - GET - get post by its id
*/
app.get("/:id", (req, res) => {
    const id = req.params.id;
    let result = posts.findOne({
        where: {
            "id": id,
        },
    })
    res.json(result);
})

/*
* /:id - POST - update the post
*/
app.post("/:id", (req, res) => {
    const id = req.params.id;
    let result = posts.update(req.body, {
        where: {
            "id": id,
        }
    });

    res.send(result ? "post updated successfully!!" : "error occured")
})

/*
* /:id - DELETE - delete the post
*/
app.delete("/:id", (req, res) => {
    const id = req.params.id;
    let result = posts.destroy({
        where: {
            "id": id,
        }
    });

    res.send(result ? "post deleted successfully!!" : "error occured")
})

module.exports = app
const app = require('express').Router();
const { comments } = require('../models');

app.use(bodyParser.json());

/* 
* / - CREATE - create comment
*/
app.post("/", (req, res) => {
    let result = comments.create(req.body)

    res.send(result ? "comment created successfully!!" : "error occured")
})

/* 
* /:id - GET - get comment by id
*/
app.get("/:id", (req, res) => {
    const id = req.params.id;
    let result = comments.findOne({
        where: {
            "id": id,
        }
    })
    res.json(result);
})

/* 
* /:id - POST - update comment by id
*/
app.post("/:id", (req, res) => {
    const id = req.params.id;
    let result = comments.update(req.body, {
        where: {
            "id": id,
        }
    })
    res.json(result ? "comment updated successfully!!" : "error occured");
})

/* 
* /:id - DELETE - delete comment by id
*/
app.post("/:id", (req, res) => {
    const id = req.params.id;
    let result = comments.destroy({
        where: {
            "id": id,
        }
    })
    res.json(result ? "comment deleted successfully!!" : "error occured");
})


module.exports = app;
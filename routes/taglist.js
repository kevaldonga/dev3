const app = require('express').Router()
const { tagList } = require('../models')

app.use(bodyParser.json())

/* 
* / - POST - create tag
*/
app.post("/", (req, res) => {
    let result = tagList.create(req.body)

    res.send(result ? "tag is created successfully!!" : "error occurred")
})

/* 
* /:id - DELETE - delete tag
*/
app.delete("/:id", (req, res) => {
    const id = req.params.id;
    let result = tagList.destroy(req.body, {
        where: {
            "id": id,
        }
    })

    res.send(result ? "tag is deleted successfully!!" : "error occurred")
})

/* 
* /:id - GET - get tag by id
*/
app.get("/:id", (req, res) => {
    const id = req.params.id;
    let result = tagList.findOne({
        where: {
            "id": id,
        }
    })

    res.json(result)
})

module.exports = app
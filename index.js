const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users');

const { users, profiles } = require('./models');

const PORT = 4000;

let app = express();

app.use(bodyParser.json());

app.get('/', async (req, res) => {
    result = await users.findAll({
        include: "profiles"
    });
    res.send(result);
});

app.use('/users', userRouter);


app.listen(PORT, () => { console.log('server is running...') });
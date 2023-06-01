const express = require('express');

const PORT = 3000;

let app = express()

app.get('/admin', (req, res) => {
    return res.status(403).send('403 forbidden');
});

app.listen(PORT)
app.get('/api', (req, res) => {
    return res.status(401).send('401 unauthorized');
});

app.get('/products', (req, res) => {
    return res.send('list of products');
});

app.post('/', (req, res) => {
    return res.send('post request for /')
});

app.listen(PORT)
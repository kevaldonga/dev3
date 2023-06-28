const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let data = "";
for (let i = 0; i < 200; i++) {
    let uuid = uuidv4();
    data += `${uuid}\n`;
}

fs.writeFile(`${__dirname}/uuids.txt`, data, (err) => {
    if (err) throw err;
});
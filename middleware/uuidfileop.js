const fs = require('fs');

const addUUID = (uuid) => {
    fs.appendFile(`${__dirname}/uuids.txt`, `${uuid}\n`, (err) => {
        if (err) throw err;
    });
}

const removeUUID = (uuid) => {
    const filename = `${__dirname}/uuids.txt`;
    fs.readFile(filename, "utf8", (err, data) => {
        if (err) throw err;
        fs.writeFile(filename, removeLines(data, uuid), "utf8", (err) => {
            if (err) throw err;
        });
    });
}

const removeLines = (data, uuid) => {
    return data
        .split('\n')
        .filter((val, _) => !val.includes(uuid))
        .join('\n');
}

module.exports = { addUUID: addUUID, removeUUID: removeUUID };
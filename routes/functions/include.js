const getObj = (object, as) => {
    const obj = [];

    for (let i = 0; i < object.length; i++) {
        obj.push(object[i][as]);
    }

    return obj;
}

module.exports = getObj;
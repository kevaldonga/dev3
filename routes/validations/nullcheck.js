const nullCheck = (res, body, { nonNullableFields, mustBeNullFields }) => {
    if (emptyCheck(res, body)) {
        return true;
    }
    if (nonNullableFields !== undefined) {
        for (let i = 0; i < nonNullableFields.length; i++) {
            let field = nonNullableFields[i];
            if (body[field] === undefined) {
                res.status(403).send(`${field} is null - can't proceed!!`);
                return true;
            }
        }
    }
    if (mustBeNullFields !== undefined) {
        for (let i = 0; i < mustBeNullFields.length; i++) {
            let field = mustBeNullFields[i];
            if (body[field] !== undefined) {
                res.status(403).send(`${field} is not changable from here - can't proceed!!`);
                return true;
            }
        }
    }
    return false;
}

const emptyCheck = (res, body) => {
    if (body.length == 0) {
        res.send(403).send("empty json object !!");
        return true;
    }
    return false;
}

const defaultNullFields = ['id', 'uuid', 'createdAt', 'updatedAt'];

module.exports = { nullCheck: nullCheck, emptyCheck: emptyCheck, defaultNullFields: defaultNullFields };
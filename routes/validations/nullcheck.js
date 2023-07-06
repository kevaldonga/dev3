const nullCheck = (body, { nonNullableFields, mustBeNullFields }) => {
    if (emptyCheck(body)) {
        return "empty object !!";
    }
    if (nonNullableFields !== undefined) {
        for (let i = 0; i < nonNullableFields.length; i++) {
            let field = nonNullableFields[i];
            if (body[field] === undefined) {
                return `${field} is null - can't proceed!!`;
            }
        }
    }
    if (mustBeNullFields !== undefined) {
        for (let i = 0; i < mustBeNullFields.length; i++) {
            let field = mustBeNullFields[i];
            if (body[field] !== undefined) {
                return `${field} is not changable from here - can't proceed!!`;
            }
        }
    }
    return false;
}

const emptyCheck = (body) => {
    if (body == null) {
        return true;
    }
    return false;
}

const defaultNullFields = ['id', 'uuid', 'createdAt', 'updatedAt'];

module.exports = { nullCheck: nullCheck, emptyCheck: emptyCheck, defaultNullFields: defaultNullFields };
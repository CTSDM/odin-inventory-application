function getQueryUpdateItem(keysToUpdate) {
    const stringArr = [];
    keysToUpdate.forEach((key, index) => {
        stringArr.push(`${key} = $${index + 1}`);
    });
    return stringArr.join(", ");
}

function renderWrongCategory(req, res, next) {
    res.locals.errors = [
        {
            msg: "The category id was not found or it is not correct.",
        },
    ];
    res.status(400);
    return next();
}

function renderWrongInformation(req, res, next, errors) {
    res.locals.errors = errors.array();
    console.log(errors.array());
    res.status(400);
    next();
}

module.exports = {
    helpersDB: { getQueryUpdateItem },
    helpersRoutes: { renderWrongInformation, renderWrongCategory },
};

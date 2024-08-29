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

function renderWrongInformation(_, res, next, errors) {
    res.locals.errors = errors.array();
    console.log(errors.array());
    res.status(400);
    next();
}

function getOrderedItemCategoriesArr(arr1, arr2) {
    let arrLarger;
    let singleEntry;
    const arrOrder = [];

    if (arr1.length > arr2.length) {
        arrLarger = arr1;
        arrOrder.push("item_id", "category_id");
        singleEntry = arr2[0];
    } else {
        arrLarger = arr2;
        arrOrder.push("category_id", "item_id");
        singleEntry = arr1[0];
    }

    return [arrLarger, singleEntry, arrOrder];
}

function getQueryAddRelation(arrItems, arrCategories) {
    let queryArr = [];
    const queryValuesArr = [];
    const [arrLarger, singleEntry, arrOrder] = getOrderedItemCategoriesArr(
        arrItems,
        arrCategories,
    );

    const multiplier = 2; // How many columns are in the table
    arrLarger.forEach((item, index) => {
        queryArr.push(
            `($${index * multiplier + 1}, $${index * multiplier + 2})`,
        );
        queryValuesArr.push(item, singleEntry);
    });

    const finalQuery = `(${arrOrder[0]}, ${arrOrder[1]}) VALUES ${queryArr.join(", ")}`;
    return [finalQuery, queryValuesArr];
}

function getQueryFromItemCategory(arrItems, arrCategories) {
    // only one of the arrays can have a length greater than 1
    // we return the part of a delete from query containing the *where* details
    let queryArr = [];
    const queryValuesArr = [];
    const [arrLarger, singleEntry, arrOrder] = getOrderedItemCategoriesArr(
        arrItems,
        arrCategories,
    );

    arrLarger.forEach((item, index) => {
        queryArr.push(`$${index + 1}`);
        queryValuesArr.push(item);
    });
    const finalQuery =
        `${arrOrder[0]} IN (` +
        queryArr.join(" ,") +
        `) AND ${arrOrder[1]} = ($${queryValuesArr.length + 1})`;
    queryValuesArr.push(singleEntry);
    return [finalQuery, queryValuesArr];
}

function getQueryFromItem(itemId) {
    return ["item_id = $1", [itemId]];
}

function getQueryDeleteRelation(arrItems, arrCategories) {
    if (arrItems && arrCategories)
        return getQueryFromItemCategory(arrItems, arrCategories);
    else if (arrCategories === undefined) return getQueryFromItem(arrItems[0]);
}

module.exports = {
    helpersDB: {
        getQueryUpdateItem,
        getQueryDeleteRelation,
        getQueryAddRelation,
    },
    helpersRoutes: { renderWrongInformation, renderWrongCategory },
};

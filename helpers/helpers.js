function getQueryUpdateItem(keysToUpdate) {
    const stringArr = [];
    keysToUpdate.forEach((key, index) => {
        stringArr.push(`${key} = $${index + 1}`);
    });
    return stringArr.join(", ");
}

module.exports = { helpersDB: { getQueryUpdateItem } };

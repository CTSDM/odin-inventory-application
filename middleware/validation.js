const { body, query, param, validationResult } = require("express-validator");
const { constraints } = require("../config/config");

const errorMessages = {
    alphaNumeric: "Category must be only composed of letters.",
    item: {
        length: `must be between ${constraints.item.minLength} and ${constraints.item.maxLength}.`,
    },
    description: {
        length: `must be between ${constraints.description.minLength} and ${constraints.description.maxLength}`,
    },
    category: {
        length: `must be between ${constraints.category.minLength} and ${constraints.category.maxLength}.`,
    },
    price: {
        number: "must be a number.",
        limits: `must be between ${constraints.price.min} and ${constraints.price.max}.`,
    },
    quantity: {
        number: "must be a number.",
        limits: `must be between ${constraints.quantity.min} and ${constraints.quantity.max}.`,
    },
    server: {
        generic: "Something went wrong on the server, please try again.",
    },
};

const validateItemFields = [
    body("name")
        .trim()
        .isLength({
            min: constraints.item.minLength,
            max: constraints.item.maxLength,
        })
        .withMessage(`Item name ${errorMessages.item.length}`),
    body("price")
        .trim()
        .isNumeric()
        .withMessage(`Price ${errorMessages.price.number}`)
        .custom((value) => {
            if (value < constraints.price.min || value > constraints.price.max)
                return false;
            return true;
        })
        .withMessage(`Price ${errorMessages.price.limits}`),
    body("quantity")
        .trim()
        .isNumeric()
        .withMessage(`Quantity ${errorMessages.quantity.number}`)
        .custom((value) => {
            if (
                value < constraints.quantity.min ||
                value > constraints.quantity.max
            )
                return false;
            return true;
        })
        .withMessage(`Price ${errorMessages.quantity.limits}`),
    body("description")
        .trim()
        .custom((value) => {
            if (value < constraints.price.min || value > constraints.price.max)
                return false;
            return true;
        })
        .withMessage(`Price ${errorMessages.description.length}`),
];

const validateItemCategories = [
    // A category need always at least one element
    body("categories")
        .custom((arrValues) => {
            if (arrValues.length === 0) return false;
            return true;
        })
        .withMessage("At least 1 category must be selected.")
        .custom((arrValues) => {
            let pass = true;
            if (arrValues) {
                if (arrValues.length > 0) {
                    arrValues.forEach((id) => {
                        const idNum = +id;
                        if (
                            isFinite(idNum) === false ||
                            typeof idNum !== "number"
                        ) {
                            pass = false;
                            return;
                        }
                    });
                }
            }
            return pass;
        })
        .withMessage(`${errorMessages.server.generic}`),
];

const validateNewCategory = [
    body("name")
        .trim()
        .isLength({
            min: constraints.category.minLength,
            max: constraints.category.maxLength,
        })
        .withMessage(`Category name ${errorMessages.category.length}`),
];

const validateParamId = [
    param("id")
        .trim()
        .isNumeric()
        .withMessage("The item id was not a number.")
        .custom((value) => {
            if (isFinite(value)) {
                return true;
            } else return false;
        })
        .withMessage("The id must be a finite value.")
        .custom((value) => {
            if (value > 0) return true;
            else return false;
        }),
];

const validateCategoryId = [
    param("id")
        .trim()
        .isNumeric()
        .withMessage("The category id was not a number."),
];

const validation = {
    validateItemFields,
    validationResult,
    validateParamId,
    validateNewCategory,
    validateItemCategories,
    validateCategoryId,
};

module.exports = validation;

const { body, query, param, validationResult } = require("express-validator");
const { constraints } = require("../config/config");

const errorMessages = {
    alphaNumeric: "Category must be only composed of letters.",
    item: {
        length: `must be between ${constraints.addNewItem.item.minLength} and ${constraints.addNewItem.item.maxLength}.`,
    },
    description: {
        length: `must be between ${constraints.addNewItem.description.minLength} and ${constraints.addNewItem.description.maxLength}`,
    },
    category: {
        length: `must be between ${constraints.addNewItem.category.minLength} and ${constraints.addNewItem.category.maxLength}.`,
    },
    price: {
        number: "must be a number.",
        limits: `must be between ${constraints.addNewItem.price.min} and ${constraints.addNewItem.price.max}.`,
    },
    quantity: {
        number: "must be a number.",
        limits: `must be between ${constraints.addNewItem.quantity.min} and ${constraints.addNewItem.quantity.max}.`,
    },
    server: {
        generic: "Something went wrong on the server, please try again.",
    },
};

const validateNewItem = [
    body("name")
        .trim()
        .isLength({
            min: constraints.addNewItem.item.minLength,
            max: constraints.addNewItem.item.maxLength,
        })
        .withMessage(`Item name ${errorMessages.item.length}`),
    body("categoryId")
        .trim()
        .isNumeric()
        .withMessage(`${errorMessages.server.generic}`),
    body("price")
        .trim()
        .isNumeric()
        .withMessage(`Price ${errorMessages.price.number}`)
        .custom((value) => {
            if (
                value < constraints.addNewItem.price.min ||
                value > constraints.addNewItem.price.max
            )
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
                value < constraints.addNewItem.quantity.min ||
                value > constraints.addNewItem.quantity.max
            )
                return false;
            return true;
        })
        .withMessage(`Price ${errorMessages.quantity.limits}`),
    body("description")
        .trim()
        .custom((value) => {
            if (
                value < constraints.addNewItem.price.min ||
                value > constraints.addNewItem.price.max
            )
                return false;
            return true;
        })
        .withMessage(`Price ${errorMessages.description.length}`),
];

const validateParamId = [
    param("id")
        .trim()
        .isNumeric()
        .withMessage("The id item was not a number.")
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

const validation = { validateNewItem, validationResult, validateParamId };

module.exports = validation;

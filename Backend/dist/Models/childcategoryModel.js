"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const childcategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    }
});
const Childcategory = (0, mongoose_1.model)('Category', childcategorySchema);
exports.default = Childcategory;

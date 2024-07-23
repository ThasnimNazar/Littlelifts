"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sittingcategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
    }
});
const Sittingcategory = (0, mongoose_1.model)('Sittingcategory', sittingcategorySchema);
exports.default = Sittingcategory;

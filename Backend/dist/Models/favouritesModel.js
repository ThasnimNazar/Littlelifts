"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const favouriteSchema = new mongoose_1.Schema({
    sitters: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Sitter'
        }],
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Parent'
    }
}, {
    timestamps: true
});
const Favourites = (0, mongoose_1.model)('Faourites', favouriteSchema);
exports.default = Favourites;

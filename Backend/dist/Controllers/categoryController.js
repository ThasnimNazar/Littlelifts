"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getName = exports.getchildCategory = exports.getAllchildCategory = exports.getsittingCategory = exports.getAllsittingCategory = exports.deleteSittingcategory = exports.editSittingcategory = exports.addSittingcategory = exports.deleteChildcategory = exports.editChildcategory = exports.addChildcategory = void 0;
const childcategoryModel_1 = __importDefault(require("../Models/childcategoryModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const util_1 = require("util");
const sittingcategoryModel_1 = __importDefault(require("../Models/sittingcategoryModel"));
const upload_1 = require("../Connections/upload");
const uploadSingleImagePromise = (0, util_1.promisify)(upload_1.uploadSingleImage);
const addChildcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const categoryExists = yield childcategoryModel_1.default.findOne({ name, description });
        if (categoryExists) {
            res.status(400).json({ message: 'Category already exists with this name and description' });
            return;
        }
        const newChildCategory = new childcategoryModel_1.default({
            name: name,
            description: description,
        });
        yield newChildCategory.save();
        res.status(200).json({ message: 'New category added successfully', childcategory: newChildCategory });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.addChildcategory = addChildcategory;
const editChildcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        const categoryFind = yield childcategoryModel_1.default.findById(categoryId);
        if (!categoryFind) {
            res.status(400).json({ message: 'Category does not exist' });
            return;
        }
        const updatedCategory = yield childcategoryModel_1.default.findOneAndUpdate({ _id: categoryId }, { name: name, description: description }, { new: true });
        if (!updatedCategory) {
            res.status(400).json({ message: 'Failed to update the category' });
            return;
        }
        res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.editChildcategory = editChildcategory;
const deleteChildcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const categoryExist = yield childcategoryModel_1.default.findById({ _id: categoryId });
        if (!categoryExist) {
            res.status(400).json({ message: 'category doesnt exist' });
        }
        yield childcategoryModel_1.default.findByIdAndDelete({
            _id: categoryId
        });
        res.status(200).json({ message: 'category deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.deleteChildcategory = deleteChildcategory;
const addSittingcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('add');
        const { name, description } = req.body;
        const sittingFind = yield sittingcategoryModel_1.default.findOne({ name, description });
        if (sittingFind) {
            res.status(400).json({ message: 'sitting category already exists' });
            return;
        }
        const newSitting = new sittingcategoryModel_1.default({
            name: name,
            description: description
        });
        yield newSitting.save();
        res.status(200).json({ message: 'new sitting option added successfully', sittingcategory: newSitting });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.addSittingcategory = addSittingcategory;
const editSittingcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield uploadSingleImagePromise(req, res);
    const { sittingId } = req.params;
    const { name, description } = req.body;
    const image = req.file.location;
    const findSitting = yield sittingcategoryModel_1.default.findById(sittingId);
    if (!findSitting) {
        res.status(400).json({ message: 'Sitting category does not exist' });
        return;
    }
    const updatedData = {};
    if (image) {
        updatedData.image = image;
    }
    if (name) {
        updatedData.name = name;
    }
    if (description) {
        updatedData.description = description;
    }
    const updatedSittingCategory = yield sittingcategoryModel_1.default.findOneAndUpdate({ _id: sittingId }, { $set: updatedData }, { new: true });
    if (!updatedSittingCategory) {
        res.status(400).json({ message: 'Failed to update the category' });
        return;
    }
    res.status(200).json({ message: 'Category updated successfully', category: updatedSittingCategory });
}));
exports.editSittingcategory = editSittingcategory;
const deleteSittingcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('delete');
        const { sittingId } = req.params;
        const sittingExist = yield sittingcategoryModel_1.default.findById({ _id: sittingId });
        if (!sittingExist) {
            res.status(400).json({ message: 'sitting category doesnt exist' });
            return;
        }
        yield sittingcategoryModel_1.default.findByIdAndDelete({
            _id: sittingId
        });
        res.status(200).json({ message: ' sitting category deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.deleteSittingcategory = deleteSittingcategory;
const getAllsittingCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield sittingcategoryModel_1.default.find({});
        if (categories) {
            res.status(200).json({ category: categories });
        }
        else {
            res.status(500).json({ message: 'failed to fetch categories' });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getAllsittingCategory = getAllsittingCategory;
const getsittingCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sittingId } = req.params;
        const sittingFind = yield sittingcategoryModel_1.default.findById({ _id: sittingId });
        if (!sittingFind) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        res.status(200).json({ category: sittingFind });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getsittingCategory = getsittingCategory;
const getAllchildCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield childcategoryModel_1.default.find({});
        console.log(categories);
        if (categories) {
            res.status(200).json({ category: categories });
        }
        else {
            res.status(500).json({ message: 'error fetching data' });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getAllchildCategory = getAllchildCategory;
const getchildCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const category = yield childcategoryModel_1.default.findById({ _id: categoryId });
        if (category) {
            res.status(200).json({ category });
        }
        else {
            res.status(500).json({ message: 'error fetching data' });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getchildCategory = getchildCategory;
const getName = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('heyy');
        const { ids } = req.body;
        const childcategories = yield childcategoryModel_1.default.find({ _id: { $in: ids } });
        if (!childcategories.length) {
            return res.status(404).json({ message: 'Categories not found' });
        }
        const names = childcategories.map(category => category.name);
        res.status(200).json({ names });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getName = getName;

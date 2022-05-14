const { getItems, saveItems } = require('../utils/storage');
const crypto = require('crypto');

// Standardized response format
const sendResponse = (res, statusCode, success, payload) => {
    const responseBody = { success };
    if (success) responseBody.data = payload;
    else responseBody.error = payload;
    
    res.json(statusCode, responseBody);
};

const getAll = async (req, res) => {
    const items = await getItems();
    sendResponse(res, 200, true, items);
};

const getOne = async (req, res) => {
    const items = await getItems();
    const item = items.find(i => i.id === req.params.id);
    
    if (!item) return sendResponse(res, 404, false, 'Item not found');
    sendResponse(res, 200, true, item);
};

const create = async (req, res) => {
    const { name, price, size } = req.body;
    
    if (!name || !price || !size) {
        return sendResponse(res, 400, false, 'Name, price, and size are required');
    }

    if (!['s', 'm', 'l'].includes(size.toLowerCase())) {
        return sendResponse(res, 400, false, 'Size must be s, m, or l');
    }

    const items = await getItems();
    const newItem = {
        id: crypto.randomUUID(), // Built-in Node ID generator
        name,
        price: Number(price),
        size: size.toLowerCase()
    };

    items.push(newItem);
    await saveItems(items);
    sendResponse(res, 201, true, newItem);
};

const update = async (req, res) => {
    const items = await getItems();
    const index = items.findIndex(i => i.id === req.params.id);

    if (index === -1) return sendResponse(res, 404, false, 'Item not found');

    const { name, price, size } = req.body;

    if (size && !['s', 'm', 'l'].includes(size.toLowerCase())) {
        return sendResponse(res, 400, false, 'Size must be s, m, or l');
    }

    items[index] = {
        ...items[index],
        name: name || items[index].name,
        price: price ? Number(price) : items[index].price,
        size: size ? size.toLowerCase() : items[index].size
    };

    await saveItems(items);
    sendResponse(res, 200, true, items[index]);
};

const remove = async (req, res) => {
    const items = await getItems();
    const filteredItems = items.filter(i => i.id !== req.params.id);

    if (items.length === filteredItems.length) {
        return sendResponse(res, 404, false, 'Item not found');
    }

    await saveItems(filteredItems);
    sendResponse(res, 200, true, { message: 'Item deleted successfully' });
};

module.exports = { getAll, getOne, create, update, remove };
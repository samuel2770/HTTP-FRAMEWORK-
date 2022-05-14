const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../items.json');

async function getItems() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function saveItems(items) {
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');
}

module.exports = { getItems, saveItems };
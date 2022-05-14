const App = require('./lib/framework');
const inventory = require('./controllers/inventory');

const app = new App();

// Map routes to our controller functions
app.get('/items', inventory.getAll);
app.get('/items/:id', inventory.getOne);
app.post('/items', inventory.create);
app.put('/items/:id', inventory.update);
app.delete('/items/:id', inventory.remove);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
});
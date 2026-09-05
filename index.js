const express = require('express');
const cors = require('cors');
const path = require('path');
const { MenuItem, Inventory, Table, Reservation, Order } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

async function seedData() {
  try {
    if (await Inventory.countDocuments() === 0) {
      const invItems = await Inventory.insertMany([
        { itemName: 'Gourmet Beef Patties', category: 'Meat', availableQty: 30, unit: 'Pcs', minAlertThreshold: 5 },
        { itemName: 'Artisan Burger Buns', category: 'Bakery', availableQty: 25, unit: 'Pcs', minAlertThreshold: 5 },
        { itemName: 'Fresh Milk', category: 'Dairy', availableQty: 15, unit: 'Liters', minAlertThreshold: 4 },
        { itemName: 'Mozzarella Cheese', category: 'Dairy', availableQty: 4, unit: 'Packets', minAlertThreshold: 5 }
      ]);

      await MenuItem.insertMany([
        { name: 'Double Cheese Smash Burger', price: 12.50, category: 'Burgers', inventoryItemId: invItems[0]._id, requiredQtyPerOrder: 1 },
        { name: 'Classic Espresso Latte', price: 4.99, category: 'Beverages', inventoryItemId: invItems[2]._id, requiredQtyPerOrder: 1 },
        { name: 'Four Cheese Pizza', price: 15.99, category: 'Pizza', inventoryItemId: invItems[3]._id, requiredQtyPerOrder: 1 }
      ]);
    }

    if (await Table.countDocuments() === 0) {
      await Table.insertMany([
        { tableNumber: 1, seats: 2, status: 'Available' },
        { tableNumber: 2, seats: 4, status: 'Available' },
        { tableNumber: 3, seats: 6, status: 'Occupied' },
        { tableNumber: 4, seats: 4, status: 'Available' }
      ]);
    }
  } catch (err) {
    console.error('Seed Error:', err);
  }
}
seedData();

// GET APIs
app.get('/api/menu', async (req, res) => res.json(await MenuItem.find().populate('inventoryItemId')));
app.get('/api/inventory', async (req, res) => res.json(await Inventory.find()));
app.get('/api/tables', async (req, res) => res.json(await Table.find()));

// Admin Management APIs
app.post('/api/admin/inventory', async (req, res) => {
  const { adminKey, itemName, category, availableQty, unit, minAlertThreshold } = req.body;
  if (adminKey !== 'admin123') return res.status(401).json({ error: 'Unauthorized Admin Key' });
  const newItem = new Inventory({ itemName, category, availableQty, unit, minAlertThreshold });
  await newItem.save();
  res.json({ message: 'Stock Added Successfully', item: newItem });
});

app.post('/api/admin/menu', async (req, res) => {
  const { adminKey, name, price, category, inventoryItemId } = req.body;
  if (adminKey !== 'admin123') return res.status(401).json({ error: 'Unauthorized Admin Key' });
  const newMenu = new MenuItem({ name, price, category, inventoryItemId });
  await newMenu.save();
  res.json({ message: 'Menu Dish Created Successfully', menu: newMenu });
});

// Process Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, cartItems } = req.body;
    let orderItems = [];
    let subtotal = 0;

    for (let cart of cartItems) {
      const menu = await MenuItem.findById(cart.menuId).populate('inventoryItemId');
      if (!menu) continue;

      const itemSubtotal = menu.price * cart.qty;
      subtotal += itemSubtotal;

      orderItems.push({
        name: menu.name,
        qty: cart.qty,
        price: menu.price,
        subtotal: itemSubtotal
      });

      if (menu.inventoryItemId) {
        const invItem = await Inventory.findById(menu.inventoryItemId._id);
        if (invItem) {
          invItem.availableQty = Math.max(0, invItem.availableQty - (menu.requiredQtyPerOrder * cart.qty));
          await invItem.save();
        }
      }
    }

    const tax = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + tax).toFixed(2));

    const newOrder = new Order({
      orderNumber: 'UM-' + Math.floor(100000 + Math.random() * 900000),
      customerName: customerName || 'Walk-In Customer',
      items: orderItems,
      subtotal,
      tax,
      totalAmount
    });

    await newOrder.save();
    res.json({ success: true, receipt: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Table Reservation
app.post('/api/reservations', async (req, res) => {
  try {
    const { customerName, phone, tableId, date, time } = req.body;
    const table = await Table.findById(tableId);
    if (!table || table.status !== 'Available') return res.status(400).json({ error: 'Table Not Available' });

    const reservation = new Reservation({ customerName, phone, tableId, date, time });
    await reservation.save();

    table.status = 'Reserved';
    await table.save();
    res.json({ success: true, message: 'Table Reserved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics Dashboard
app.get('/api/reports/analytics', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  const inventory = await Inventory.find();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalTaxCollected = orders.reduce((sum, o) => sum + o.tax, 0);
  const lowStockCount = inventory.filter(i => i.availableQty <= i.minAlertThreshold).length;

  res.json({
    totalOrders: orders.length,
    totalRevenue: totalRevenue.toFixed(2),
    totalTaxCollected: totalTaxCollected.toFixed(2),
    lowStockCount
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(5000, () => console.log('🚀 UM Inventory Enterprise active on http://localhost:5000'));
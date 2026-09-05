const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/um_inventory_db')
  .then(() => console.log('✅ Connected to UM Inventory Database'))
  .catch(err => console.error('Database Connection Error:', err));

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  requiredQtyPerOrder: { type: Number, default: 1 }
});

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  availableQty: { type: Number, required: true },
  unit: { type: String, default: 'Pcs' },
  minAlertThreshold: { type: Number, default: 5 }
});

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  seats: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Occupied'], default: 'Available' }
});

const reservationSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  date: String,
  time: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customerName: String,
  items: [{
    name: String,
    qty: Number,
    price: Number,
    subtotal: Number
  }],
  subtotal: Number,
  tax: Number,
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const Table = mongoose.model('Table', tableSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { MenuItem, Inventory, Table, Reservation, Order };
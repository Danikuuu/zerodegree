const Order = require('../models/Order');
const CompletedOrder = require('../models/CompletedOrder');

exports.index = async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const pendingCount = await Order.countDocuments({ status: 'Pending', createdAt: { $gte: startOfToday } });
    const processingCount = await Order.countDocuments({ status: 'Processing', createdAt: { $gte: startOfToday } });
    const completedCount = await Order.countDocuments({ status: 'Completed', createdAt: { $gte: startOfToday } });

    res.render('kitchen/index', {
      pendingCount,
      processingCount,
      completedCount
    });
  } catch (error) {
    console.error('Error loading kitchen dashboard:', error);
    res.status(500).send('Server error');
  }
};


exports.viewKitchenOrders = (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  Promise.all([
    Order.find({ status: 'Processing', createdAt: { $gte: startOfToday } })
      .populate('items.productId').lean(),
    Order.find({ status: 'Completed', createdAt: { $gte: startOfToday } })
      .populate('items.productId').lean()
  ])
    .then(([processingOrders, completedOrders]) => {
      res.render('kitchen/orders', {
        processingOrders,
        completedOrders
      });
    })
    .catch(err => {
      console.error('Error fetching kitchen orders:', err);
      res.status(500).send('Server Error');
    });
};

exports.completeOrder = async (req, res) => {
  const orderId = req.params.orderId; 

  try {
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (order.status !== 'Processing') {
      return res.status(400).send('Only processing orders can be marked as completed');
    }

    const completedOrder = new CompletedOrder({
      orderId: order._id,
      userInfoSnapshot: order.userInfoSnapshot,
      items: order.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      totalAmount: order.totalAmount,
      paymentMode: order.paymentMode,
      status: 'completed'
    });

    await completedOrder.save();

    await Order.findByIdAndDelete(orderId);

    res.redirect('/kitchen/orders');
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).send('Error completing order');
  }
};

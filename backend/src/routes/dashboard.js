const express = require('express');
const { verifyToken } = require('../middleware/auth');
const RequestLog = require('../models/RequestLog');
const ApiEndpoint = require('../models/ApiEndpoint');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.use(verifyToken);

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const activeApisCount = await ApiEndpoint.countDocuments({ userId, isActive: true });
    
    const subscription = await Subscription.findOne({ userId });
    
    // Requests Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const requestsToday = await RequestLog.countDocuments({ userId, timestamp: { $gte: startOfToday } });

    res.json({
      totalRequestsUsed: subscription ? subscription.requestsUsed : 0,
      requestsToday,
      activeApis: activeApisCount,
      currentPlan: subscription ? subscription.plan : 'free',
      requestLimit: subscription ? subscription.requestLimit : 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Chart Data (last 30 days)
router.get('/chart', async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await RequestLog.aggregate([
      { $match: { userId, timestamp: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          requests: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in empty days
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = logs.find(l => l._id === dateStr);
      chartData.push({
        date: dateStr,
        requests: found ? found.requests : 0
      });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Paginated Logs
router.get('/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await RequestLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('apiEndpointId', 'name');

    const total = await RequestLog.countDocuments({ userId: req.user._id });

    res.json({
      logs: logs.map(l => ({
        id: l._id,
        timestamp: l.timestamp,
        endpoint: l.apiEndpointId ? l.apiEndpointId.name : 'Unknown',
        method: l.method,
        path: l.path,
        status: l.statusCode,
        responseTime: l.responseTimeMs
      })),
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

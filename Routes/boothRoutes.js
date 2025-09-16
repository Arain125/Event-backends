const express = require('express');
const router = express.Router();
const Booth = require('../Models/boothModel');

// ✅ Get all booths
router.get('/', async (req, res) => {
  try {
    const booths = await Booth.find().populate('assignedToEvent', 'title date');
    res.json({ status: true, data: booths });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
});

// ✅ Assign a booth to an event
router.post('/assign', async (req, res) => {
  const { boothId, eventId } = req.body;

  try {
    const booth = await Booth.findOne({ boothId });
    if (!booth) return res.status(404).json({ status: false, message: 'Booth not found' });

    if (booth.status === 'assigned') {
      return res.status(400).json({ status: false, message: 'Booth already assigned' });
    }

    // assign
    booth.status = 'assigned';
    booth.assignedToEvent = eventId;
    await booth.save();

    res.json({ status: true, message: 'Booth assigned successfully', booth });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
});

// ✅ Create new booth(s)
router.post('/create', async (req, res) => {
  const { boothId, x, y, width, height } = req.body;
  try {
    const booth = new Booth({ boothId, x, y, width, height });
    await booth.save();
    res.json({ status: true, message: 'Booth created successfully', booth });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error creating booth' });
  }
});

// ✅ Reset (unassign) a booth
router.post('/reset', async (req, res) => {
  const { boothId } = req.body;
  try {
    const booth = await Booth.findOne({ boothId });
    if (!booth) return res.status(404).json({ status: false, message: 'Booth not found' });

    booth.status = 'available';
    booth.assignedToEvent = null;
    await booth.save();

    res.json({ status: true, message: 'Booth unassigned' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
  }
});

module.exports = router;

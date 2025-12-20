const express = require('express');
const router = express.Router();
const Tracking = require('../models/Tracking');
const { generateTransparentPixel, generateTrackingId } = require('../utils/generatePixel');

/**
 * POST /api/pixel/generate
 * Creates a new tracking record and returns tracking ID
 */
router.post('/api/pixel/generate', async (req, res) => {
  try {
    const { emailSubject, recipient } = req.body;

    if (!emailSubject || !recipient) {
      return res.status(400).json({
        error: 'Missing required fields: emailSubject and recipient'
      });
    }

    // Generate unique tracking ID
    const trackingId = generateTrackingId();

    // Create tracking record
    const tracking = new Tracking({
      trackingId,
      emailSubject,
      recipient,
      sentAt: new Date(),
      opens: []
    });

    await tracking.save();

    res.json({
      success: true,
      trackingId,
      pixelUrl: `/pixel/${trackingId}.png`,
      message: 'Tracking pixel generated successfully'
    });

  } catch (error) {
    console.error('Error generating tracking pixel:', error);
    res.status(500).json({ error: 'Failed to generate tracking pixel' });
  }
});

/**
 * GET /pixel/:id.png
 * Serves the tracking pixel and logs the open event
 */
router.get('/pixel/:id.png', async (req, res) => {
  try {
    const trackingId = req.params.id;

    // Extract client information
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.headers['x-forwarded-for'] ||
               req.headers['x-real-ip'] ||
               req.connection.remoteAddress ||
               'Unknown';

    // Log the open event
    const tracking = await Tracking.findOne({ trackingId });

    if (tracking) {
      tracking.opens.push({
        timestamp: new Date(),
        userAgent,
        ip: ip.split(',')[0].trim() // Handle proxy chains
      });
      await tracking.save();
      console.log(`📧 Email opened: ${tracking.emailSubject} (${tracking.recipient})`);
    }

    // Generate and send 1x1 transparent PNG
    const pixelBuffer = await generateTransparentPixel();

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixelBuffer.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pixelBuffer);

  } catch (error) {
    console.error('Error serving pixel:', error);

    // Always return a pixel even on error to avoid broken images
    const pixelBuffer = await generateTransparentPixel();
    res.set('Content-Type', 'image/png');
    res.send(pixelBuffer);
  }
});

/**
 * GET /api/tracking/all
 * Returns all tracked emails with stats
 * NOTE: Must come BEFORE /api/tracking/:id to avoid "all" being treated as an ID
 */
router.get('/api/tracking/all', async (req, res) => {
  try {
    const trackings = await Tracking.find()
      .sort({ sentAt: -1 }) // Most recent first
      .limit(100); // Limit to last 100 emails

    const stats = {
      totalEmails: trackings.length,
      totalOpens: trackings.reduce((sum, t) => sum + t.opens.length, 0),
      openedEmails: trackings.filter(t => t.opens.length > 0).length,
      unopenedEmails: trackings.filter(t => t.opens.length === 0).length,
      openRate: trackings.length > 0
        ? ((trackings.filter(t => t.opens.length > 0).length / trackings.length) * 100).toFixed(1)
        : 0
    };

    res.json({
      success: true,
      stats,
      emails: trackings
    });

  } catch (error) {
    console.error('Error fetching all tracking data:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

/**
 * GET /api/tracking/:id
 * Returns tracking data for a specific email
 */
router.get('/api/tracking/:id', async (req, res) => {
  try {
    const trackingId = req.params.id;
    const tracking = await Tracking.findOne({ trackingId });

    if (!tracking) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    res.json({
      success: true,
      data: tracking
    });

  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

/**
 * DELETE /api/tracking/:id
 * Deletes a tracking record (optional - for cleanup)
 */
router.delete('/api/tracking/:id', async (req, res) => {
  try {
    const trackingId = req.params.id;
    const result = await Tracking.deleteOne({ trackingId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    res.json({
      success: true,
      message: 'Tracking record deleted'
    });

  } catch (error) {
    console.error('Error deleting tracking data:', error);
    res.status(500).json({ error: 'Failed to delete tracking data' });
  }
});

module.exports = router;

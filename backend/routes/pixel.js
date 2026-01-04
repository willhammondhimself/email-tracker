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

    // Get sender's IP to filter self-opens later
    const senderIp = req.headers['x-forwarded-for'] ||
                     req.headers['x-real-ip'] ||
                     req.connection.remoteAddress ||
                     'Unknown';

    // Create tracking record
    const tracking = new Tracking({
      trackingId,
      emailSubject,
      recipient,
      sentAt: new Date(),
      senderIp: senderIp.split(',')[0].trim(), // Store sender's IP
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
      const openerIp = ip.split(',')[0].trim(); // Handle proxy chains
      const isSelf = tracking.senderIp && openerIp === tracking.senderIp;

      tracking.opens.push({
        timestamp: new Date(),
        userAgent,
        ip: openerIp,
        isSelf // Mark if this is the sender opening their own email
      });
      await tracking.save();

      if (isSelf) {
        console.log(`📧 Email opened by SENDER: ${tracking.emailSubject} (${tracking.recipient})`);
      } else {
        console.log(`📧 Email opened: ${tracking.emailSubject} (${tracking.recipient})`);
      }
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

    // Calculate stats excluding self-opens
    const stats = {
      totalEmails: trackings.length,
      totalOpens: trackings.reduce((sum, t) => sum + t.opens.filter(o => !o.isSelf).length, 0),
      openedEmails: trackings.filter(t => t.opens.some(o => !o.isSelf)).length,
      unopenedEmails: trackings.filter(t => !t.opens.some(o => !o.isSelf)).length,
      openRate: trackings.length > 0
        ? ((trackings.filter(t => t.opens.some(o => !o.isSelf)).length / trackings.length) * 100).toFixed(1)
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

/**
 * POST /api/tracking/:id/remove-self-opens
 * Removes all self-opens from a tracking record
 */
router.post('/api/tracking/:id/remove-self-opens', async (req, res) => {
  try {
    const trackingId = req.params.id;
    const tracking = await Tracking.findOne({ trackingId });

    if (!tracking) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    // Filter out self-opens
    const beforeCount = tracking.opens.length;
    tracking.opens = tracking.opens.filter(open => !open.isSelf);
    const afterCount = tracking.opens.length;
    const removedCount = beforeCount - afterCount;

    await tracking.save();

    res.json({
      success: true,
      message: `Removed ${removedCount} self-open(s)`,
      removedCount,
      remainingOpens: afterCount
    });

  } catch (error) {
    console.error('Error removing self-opens:', error);
    res.status(500).json({ error: 'Failed to remove self-opens' });
  }
});

module.exports = router;

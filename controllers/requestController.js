const { db } = require('../config/firebase');
const { getIO } = require('../config/socket');
const crypto = require('crypto');

// In-memory store as fallback if Firebase is not connected
let localRequests = [];

const createRequest = async (req, res) => {
  const { subject, description, imageUrl } = req.body;
  const userId = req.user.uid;

  if (!subject || !description) {
    return res.status(400).json({ success: false, error: 'Subject and description are required' });
  }

  const newRequest = {
    id: crypto.randomUUID(),
    userId,
    subject,
    description,
    imageUrl: imageUrl || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  };

  try {
    if (db) {
      await db.collection('requests').doc(newRequest.id).set(newRequest);
    } else {
      localRequests.push(newRequest);
    }

    // Broadcast the new SOS request to all connected users
    const io = getIO();
    io.emit('new-sos-request', newRequest);

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    let requests = [];
    if (db) {
      const snapshot = await db.collection('requests').where('status', '==', 'pending').get();
      snapshot.forEach(doc => requests.push(doc.data()));
    } else {
      requests = localRequests.filter(r => r.status === 'pending');
    }

    // Filter out expired requests
    const now = new Date();
    requests = requests.filter(r => new Date(r.expiresAt) > now);

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const acceptRequest = async (req, res) => {
  const { requestId } = req.params;
  const helperId = req.user.uid;

  try {
    let request;
    if (db) {
      const doc = await db.collection('requests').doc(requestId).get();
      if (!doc.exists) return res.status(404).json({ success: false, error: 'Request not found' });
      request = doc.data();
    } else {
      request = localRequests.find(r => r.id === requestId);
      if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Request already accepted or expired' });
    }

    if (new Date(request.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, error: 'Request has expired' });
    }

    const updatedData = {
      status: 'accepted',
      helperId,
      acceptedAt: new Date().toISOString()
    };

    if (db) {
      await db.collection('requests').doc(requestId).update(updatedData);
    } else {
      Object.assign(request, updatedData);
    }

    const io = getIO();
    // Notify the student that their request was accepted
    io.emit('request-accepted', { requestId, helperId });

    res.status(200).json({ success: true, data: { ...request, ...updatedData } });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { createRequest, getAllRequests, acceptRequest };

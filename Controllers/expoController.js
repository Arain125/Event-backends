const { default: mongoose } = require("mongoose");
const ExpoModal = require("../Models/ExpoSchema");

const expoController = {
  createExpo: async (req, res) => {
  const { title, imgUrl, date, location, description, booth } = req.body;

  try {
    if (!title || !imgUrl || !date || !location || !description || !booth) {
      return res.status(400).json({
        status: false,
        message: 'All fields are required',
      });
    }

    const newExpo = new ExpoModal({
      title,
      imgUrl,
      date,
      location,
      description,
      booth,
    });

    await newExpo.save();

    res.status(201).json({
      status: true,
      message: 'Event created successfully!',
      data: newExpo
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error while creating event',
      error: error.message
    });
  }
},
  updateExpo: async (req, res) => {
  const { id } = req.params;
  const { title, date, imgUrl, description, location, booth } = req.body;

  try {
    // Validate the incoming data
    if (!title || !date || !imgUrl || !description || !location || !booth) {
      return res.status(400).json({
        status: false,
        message: 'All fields are required'
      });
    }

    // Find and update expo
    const updatedExpo = await ExpoModal.findByIdAndUpdate(
      id,
      { title, date, imgUrl, description, location, booth },
      { new: true, runValidators: true }
    );

    if (!updatedExpo) {
      return res.status(404).json({
        status: false,
        message: 'Expo not found'
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Expo updated successfully',
      data: updatedExpo
    });
  } catch (error) {
    console.error('Error updating expo:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
},
  getAllExpo: async (req, res) => {
    const expos = await ExpoModal.find()
    if (expos.length > 0) {
      res.json({
        message: "expo found",
        data: expos,
        status: true
      })
    } else {
      res.json({
        message: "No expos found",
        status: false
      })
    }
  },
  getAvaliableBooths: async (req, res) => {
    try {
      const expoId = req.params.id;

      // Find the expo by ID
      const expo = await ExpoModal.findById(expoId);

      if (!expo) {
        return res.status(404).json({ message: 'Expo not found' });
      }

      const totalBooths = expo.booth; // total number of booths
      const assignedBooths = expo.assignedBooths.map(ab => ab.boothNumber);

      // Create an array of all booth numbers from 1 to totalBooths
      const allBooths = Array.from({ length: totalBooths }, (_, i) => i + 1);

      // Filter out the assigned booths to get available booths
      const availableBooths = allBooths.filter(boothNum => !assignedBooths.includes(boothNum));

      return res.json({ availableBooths });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
  getSingleExpo: async (req, res) => {
    const { id } = req.params

    const expo = await ExpoModal.findById(id)

    if (!expo) {
      res.json({
        message: "Expo not found",
        status: false
      })
    } else {
      res.json({
        message: "Expo found",
        data: expo,
        status: true
      })
    }
  },
  requestBooth: async (req, res) => {
    try {
      const expoId = req.params.id;
      const { boothNumber, exhibitorId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(exhibitorId)) {
        return res.status(400).json({ message: 'Invalid exhibitor ID' });
      }

      const expo = await Expo.findById(expoId);
      if (!expo) {
        return res.status(404).json({ message: 'Expo not found' });
      }

      // Validate booth number range
      if (boothNumber < 1 || boothNumber > expo.booth) {
        return res.status(400).json({ message: `Booth number must be between 1 and ${expo.booth}` });
      }

      // Check if booth is already assigned
      const isAssigned = expo.assignedBooths.some(ab => ab.boothNumber === boothNumber);
      if (isAssigned) {
        return res.status(400).json({ message: 'Booth is already assigned' });
      }

      // Check if there is already a pending or approved request for this booth by any exhibitor
      const isRequested = expo.boothRequests.some(
        br => br.boothNumber === boothNumber && br.status === 'pending' || br.status === 'approved'
      );
      if (isRequested) {
        return res.status(400).json({ message: 'Booth is already requested or approved for another exhibitor' });
      }

      // Add the new booth request
      expo.boothRequests.push({
        boothNumber,
        exhibitor: exhibitorId,
        status: 'pending',
        requestedAt: new Date()
      });

      await expo.save();

      return res.status(201).json({
        message: 'Booth request submitted successfully',
        boothRequests: expo.boothRequests
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
  // Update expo schedule
  scheduleExpo: async (req, res) => {
    const { id } = req.params; // Get the expo ID from the URL
    const { title, date, time, speaker, location } = req.body; // Extract fields from the request body

    try {
      // Validate the incoming data
      if (!title || !date || !time || !speaker || !location) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Find the expo by ID and update it
      const updatedExpo = await ExpoModal.findByIdAndUpdate(
        id,
        { title, date, time, speaker, location },
        { new: true, runValidators: true } // Return the updated document and run schema validators
      );

      if (!updatedExpo) {
        return res.status(404).json({ message: 'Expo not found' });
      }

      res.status(200).json({ message: 'Expo updated successfully', data: updatedExpo });
    } catch (error) {
      console.error('Error updating expo:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  deleteExpo: async (req, res) => {
    const { id } = req.params;

    try {
      // Find the expo by ID and delete it
      const deletedExpo = await ExpoModal.findByIdAndDelete(id);

      if (!deletedExpo) {
        return res.status(404).json({
          status: false,
          message: 'Expo not found'
        });
      }

      res.status(200).json({
        status: true,
        message: 'Expo deleted successfully',
        data: deletedExpo
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'An error occurred while deleting the expo',
        error: error.message
      });
    }
  },
  attendeeRegister: async (req, res) => {
    const { expoId, name, email } = req.body;

    // Validate the input
    if (!expoId || !name || !email) {
      return res.status(400).json({ message: 'expoId, name, and email are required' });
    }

    try {
      // Find the Expo by ID
      const expo = await ExpoModal.findById(expoId);

      if (!expo) {
        return res.status(404).json({ message: 'Expo not found' });
      }

      // Check if the attendee is already registered
      const isAlreadyRegistered = expo.attendeeList.some(
        (attendee) => attendee.email === email
      );

      if (isAlreadyRegistered) {
        return res.json({ message: 'Attendee already registered', status: false });
      }

      // Add the new attendee to the attendee list
      expo.attendeeList.push({ name, email });

      // Save the updated Expo document
      await expo.save();

      return res.status(200).json({
        message: 'Successfully registered for the expo',
        attendeeCount: expo.attendeeList.length,
        attendeeList: expo.attendeeList,
        status: true
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  exhibitorRequest: async (req, res) => {
  const { expoId, name, email, companyName, productsServices, documents, boothNumber, exhibitorId } = req.body;

  try {
    // Validate exhibitorId
    if (!mongoose.Types.ObjectId.isValid(exhibitorId)) {
      return res.status(400).json({ message: 'Invalid exhibitor ID' });
    }

    // Find the expo
    const expo = await ExpoModal.findById(expoId);
    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    // Validate booth number
    if (boothNumber < 1 || boothNumber > expo.booth) {
      return res.status(400).json({ message: `Booth number must be between 1 and ${expo.booth}` });
    }

    // Check if booth is already assigned
    const isAssigned = expo.assignedBooths.some(ab => ab.boothNumber === boothNumber);
    if (isAssigned) {
      return res.status(400).json({ message: 'Booth is already assigned' });
    }

    // Check if already requested
    const isRequested = expo.boothRequests.some(
      br => br.boothNumber === boothNumber && ['pending', 'approved'].includes(br.status)
    );
    if (isRequested) {
      return res.status(400).json({ message: 'Booth is already requested or approved' });
    }

    // Add exhibitor request
    expo.exhibitorRequests.push({ name, email, companyName, productsServices, documents });

    // Add booth request
    expo.boothRequests.push({
      boothNumber,
      exhibitor: exhibitorId,
      status: 'pending',
      requestedAt: new Date()
    });

    await expo.save();

    return res.status(200).json({
      message: 'Exhibitor registration and booth request submitted successfully',
      status: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
  acceptExhibitorRequest:  async (req, res) => {
  const { expoId } = req.params;
  const { name, email } = req.body;

  try {
    const expo = await ExpoModal.findById(expoId);
    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    // Step 1: Find the exhibitor request by email
    const requestIndex = expo.exhibitorRequests.findIndex(request => request.email === email);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Exhibitor request not found' });
    }

    const [acceptedExhibitor] = expo.exhibitorRequests.splice(requestIndex, 1);
    expo.exhibitorList.push(acceptedExhibitor);

    // Step 2: Find the booth request for this email
    // Assumes exhibitorId is based on email matching in the booth request
    const boothRequestIndex = expo.boothRequests.findIndex(req =>
      req.status === 'pending' &&
      expo.exhibitorList.some(exh => exh.email === email) &&
      req.exhibitor?.email === email // Optional depending on how exhibitor is stored
    );

    // Fallback if exhibitorId stored in boothRequest
    const boothRequest = expo.boothRequests.find(
      br =>
        br.status === 'pending' &&
        String(br.exhibitor).includes(email) // Not ideal, better to use ObjectId match
    );

    const boothByEmail = expo.boothRequests.find(
      br => br.status === 'pending' && br.exhibitorEmail === email
    );

    // Step 3: Use safer matching — based on email logic
    const boothRequestToAccept = expo.boothRequests.find(
      br => br.status === 'pending' &&
            expo.exhibitorList.some(exh => exh.email === email)
    );

    if (boothRequestToAccept) {
      // Push to assignedBooths
      expo.assignedBooths.push({
        boothNumber: boothRequestToAccept.boothNumber,
        exhibitor: boothRequestToAccept.exhibitor,
      });

      // Remove from boothRequests
      expo.boothRequests = expo.boothRequests.filter(
        br => br._id.toString() !== boothRequestToAccept._id.toString()
      );
    }

    await expo.save();

    res.status(200).json({
      message: 'Exhibitor request and booth assignment accepted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},
  getAllExhibitorsRequest: async (req, res) => {
    try {
      // Fetch all expos and project only the exhibitorRequests field
      const expos = await ExpoModal.find({});

      const exhibitorRequests = expos.map(expo => ({
        title: expo.title,
        exhibitorRequests: expo.exhibitorRequests
      }));

      res.status(200).json({
        status: true,
        message: 'Exhibitor requests fetched successfully',
        data: exhibitorRequests
      });
    } catch (error) {
      console.error('Error fetching exhibitor requests:', error);
      res.status(500).json({
        status: false,
        message: 'Internal server error'
      });
    }
  },
  approveExhibitorRequest: async (req, res) => {
    const { expoId, exhibitorRequestId } = req.body;

    try {
      // Find the expo by ID
      const expo = await ExpoModal.findById(expoId);

      if (!expo) {
        return res.status(404).json({ message: 'Expo not found' });
      }

      // Find the exhibitor request by requestId
      const exhibitorRequest = expo.exhibitorRequests.id(exhibitorRequestId);

      if (!exhibitorRequest) {
        return res.status(404).json({ message: 'Exhibitor request not found' });
      }

      // Add the exhibitor request to exhibitorList
      expo.exhibitorList.push(exhibitorRequest);

      // Remove the exhibitor request from exhibitorRequests
      expo.exhibitorRequests.pull(exhibitorRequestId);

      // Save the updated expo document
      await expo.save();

      return res.status(200).json({ message: 'Exhibitor approved successfully', expo });
    } catch (error) {
      console.error('Error approving exhibitor:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
  rejectExhibitorRequest: async (req, res) => {
    const { expoId, exhibitorRequestId } = req.body;

    try {
      const expo = await ExpoModal.findById(expoId);
      if (!expo) {
        return res.status(404).json({ status: false, message: 'Expo not found' });
      }

      // Filter out the rejected exhibitor request
      expo.exhibitorRequests = expo.exhibitorRequests.filter(
        (request) => request._id.toString() !== exhibitorRequestId
      );

      await expo.save();
      res.status(200).json({ status: true, message: 'Exhibitor request rejected successfully', expo });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Error rejecting exhibitor request', error });
    }
  }
}
module.exports = expoController
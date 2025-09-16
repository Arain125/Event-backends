const express = require("express")
const expoController = require("../Controllers/expoController")


const router = express.Router()

// // http://localhost:3000/api/expo/id
router.get('/:id', expoController.getSingleExpo)

// // http://localhost:3000/api/expo/all
router.get('/', expoController.getAllExpo)

//  http://localhost:3000/api/expo/id/available-booths
router.get('/:id/available-booths', expoController.getAvaliableBooths);

// // http://localhost:3000/api/expo/signup
router.post('/:id/request-booth', expoController.requestBooth)

router.post('/create', expoController.createExpo)

// // http://localhost:3000/api/expo/schedule/id
router.post('/schedule/:id', expoController.scheduleExpo)

// // http://localhost:3000/api/expo/updateexpo/id
router.put('/updateexpo/:id', expoController.updateExpo)

// // http://localhost:3000/api/expo/attendeeregister
router.post('/attendeeregister', expoController.attendeeRegister)

// // http://localhost:3000/api/expo/exporegisterrequest
router.post('/exporegisterrequest', expoController.exhibitorRequest)

// GET all exhibitor requests for all expos
// http://localhost:3000/api/expo/exhibitorrequests
router.get('/exhibitorrequests', expoController.getAllExhibitorsRequest)

// http://localhost:3000/api/expo/approve-exhibitor
router.post('/approve-exhibitor',expoController.approveExhibitorRequest)

// http://localhost:3000/api/expo/reject-exhibitor
router.post('/reject-exhibitor',expoController.rejectExhibitorRequest)

// // http://localhost:3000/api/expo/id
// router.put('/:id', expoController.updateexpo)

// // http://localhost:3000/api/expo/id
router.delete('/:id', expoController.deleteExpo)



module.exports = router


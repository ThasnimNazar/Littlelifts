import express from 'express'
import {
 registerParent,parentLogin,parentLogout,editProfile,getProfile,listSitter,verifyOtp,
 forgotPassword,parentpasswordOtp,resetparentPassword,resendOtp,searchBabysitters,filterBabysittersByDate,
 getAvailabledates,getName,getSlots,bookingsParent,
} from '../Controllers/parentController'

import { confirmBooking} from '../Controllers/bookingController'

import { getAllchildCategory,getAllsittingCategory } from '../Controllers/categoryController'

import { protectParent } from '../Middleware/authMiddleware';

const parentroute = express.Router()

parentroute.post('/register-parent',registerParent);
parentroute.post('/verifyotp',verifyOtp)
parentroute.post('/login-parent',parentLogin)
parentroute.post('/forget-password',forgotPassword)
parentroute.post('/forget-verifyotp',protectParent,parentpasswordOtp)
parentroute.post('/reset-password',protectParent,resetparentPassword)
parentroute.post('/resendotp',protectParent,resendOtp)
parentroute.post('/logout',parentLogout)
parentroute.get('/profile/:parentId',protectParent,getProfile)
parentroute.get('/get-childcategory',getAllchildCategory)
parentroute.put('/edit-profile/:parentId',protectParent,protectParent,editProfile)
parentroute.get('/getsittingcat',protectParent,getAllsittingCategory)
parentroute.get('/getsitter',protectParent,listSitter)
parentroute.get('/search-babysitters',protectParent,searchBabysitters)
parentroute.get('/filter-ByDate',protectParent,filterBabysittersByDate)
parentroute.get('/get-availabledates/:sitterId',protectParent,getAvailabledates)
parentroute.get('/get-slots/:sitterId',protectParent,getSlots)
parentroute.post('/checkout-session/:sitterId',protectParent,confirmBooking)
parentroute.get('/bookings/:parentId',protectParent,bookingsParent)



parentroute.post('/getnames',protectParent,getName)    



export default parentroute


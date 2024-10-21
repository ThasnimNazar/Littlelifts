import express from 'express'
import { sitterregisterStep1,sitterregisterStep2,sitterregisterStep3,
    getsittingOptions,manageSlots,saveSittingOption,sitterLogout,
    uploadVerificationDocuments,getStatus,getsitterProfile,sitterverifyOtp,
    sitresendOtp,sitterforgotPassword,sitterpasswordOtp,
    resetsitterPassword,sitterLogin,editProfile,getSlots,getSittingcategory,geteditSlot,editSlot,
    getBabysitter,editTimeslot,bookingsList,createChat,sendMessage,getMessages, checkBlocked, getReview,
    lastSeen,getLastseen,lastMsg,postSeen
} from '../Controllers/sitterController'

import { markSeen } from '../Controllers/parentController'

import { protectSitter } from '../Middleware/authMiddleware'
import { bookingApproval,bookingRejection,handleStripeWebhook,getBookedparents } from '../Controllers/bookingController'

import { getAllchildCategory,getAllsittingCategory,getName } from '../Controllers/categoryController'



const sitterroute = express.Router()

sitterroute.post('/',sitterregisterStep1)
sitterroute.post('/verifyotp',sitterverifyOtp)
sitterroute.post('/resendotp',protectSitter,sitresendOtp)
sitterroute.post('/forget-password',sitterforgotPassword)
sitterroute.post('/verify-passwordotp',protectSitter,sitterpasswordOtp)
sitterroute.post('/reset-password',protectSitter,resetsitterPassword)
sitterroute.put('/register-step2/:sitterId',sitterregisterStep2)
sitterroute.put('/register-step3/:sitterId',sitterregisterStep3)
sitterroute.get('/get-sittingopt',getsittingOptions)
sitterroute.get('/get-childcategory',getAllchildCategory)
sitterroute.get('/get-sittingcategory',getAllsittingCategory)
sitterroute.put('/save-sittingoption/:sitterId',saveSittingOption)
sitterroute.put('/slot-manage/:sitterId/:selectedOptionId',manageSlots)
sitterroute.put('/upload-doc/:sitterId',uploadVerificationDocuments);
sitterroute.get('/getstatus/:sitterId',getStatus)
sitterroute.post('/login',sitterLogin)
sitterroute.post('/logout',sitterLogout)

sitterroute.get('/getprofile/:sitterId',protectSitter,getsitterProfile)//authentication middleware have to add
sitterroute.put('/editprofile/:sitterId',protectSitter,editProfile)

sitterroute.get('/getnames',protectSitter,getName)
sitterroute.get('/get-slots/:sitterId',protectSitter,getSlots)
sitterroute.get('/get-sittingcategory/:sittingcategoryId',getSittingcategory)
sitterroute.get('/get-editslots/:sitterId/:slotId',protectSitter,geteditSlot)
sitterroute.put('/edit-slot/:sitterId',protectSitter,editSlot)
sitterroute.put('/edit-timeslots/:slotId/:sitterId',protectSitter,editTimeslot)

sitterroute.get('/get-sitter/:categoryId',getBabysitter)
sitterroute.get('/bookings/:sitterId',protectSitter,bookingsList)
sitterroute.post('/approve-booking/:bookingId',protectSitter,bookingApproval)
sitterroute.post('/reject-booking/:bookingId',protectSitter,bookingRejection)
sitterroute.post('/webhook',handleStripeWebhook)

sitterroute.get('/booked-parents/:sitterId',protectSitter,getBookedparents)
sitterroute.post('/createchat',protectSitter,createChat)
sitterroute.get('/get-messages/:chatId',protectSitter,getMessages)
sitterroute.post('/send-message',protectSitter,sendMessage)
// sitterroute.post('/mark-seen',protectSitter,markSeen)
sitterroute.get('/check-block',protectSitter,checkBlocked)
sitterroute.get('/get-reviews/:sitterId',protectSitter,getReview)
sitterroute.post('/last-seen/:sitterId',protectSitter,lastSeen)
sitterroute.get('/get-lastseen',protectSitter,getLastseen) 
sitterroute.get('/get-lastmsg',protectSitter,lastMsg)
sitterroute.put('/post-lastseen/:sitterId',protectSitter,postSeen)


export default sitterroute
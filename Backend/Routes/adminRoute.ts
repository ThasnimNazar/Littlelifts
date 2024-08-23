import express from 'express'

import { registerAdmin, adminLogin, adminLogout,getSitters,verifySitter,
blockSitter,unblockSitter,getParent,blockParent,unblockParent,addSubscription,
getSubscriptions,editSubscription,getEditsubscription, getBookingHistory } from '../Controllers/adminController'

import {
    addChildcategory, editChildcategory, deleteChildcategory,getAllchildCategory,
    getchildCategory,
    addSittingcategory, editSittingcategory, deleteSittingcategory,getAllsittingCategory,
    getsittingCategory
} from '../Controllers/categoryController'


import authenticateAdmin from '../Middleware/adminMiddleware'

const adminroute = express.Router()

adminroute.post('/', registerAdmin)
adminroute.post('/login', adminLogin)
adminroute.post('/logout', adminLogout)

adminroute.get('/get-childcategory',authenticateAdmin,getAllchildCategory)
adminroute.post('/add-category', authenticateAdmin, addChildcategory)
adminroute.put('/edit-category/:childId', authenticateAdmin, editChildcategory)
adminroute.delete('/delete-category/:childId', authenticateAdmin, deleteChildcategory)
adminroute.get('/get-childdata/:sittingId',authenticateAdmin,getchildCategory)


adminroute.get('/get-sittingcategory',authenticateAdmin,getAllsittingCategory)
adminroute.post('/add-sittingcategory', authenticateAdmin, addSittingcategory)
adminroute.put('/edit-sittingcategory/:sittingId', authenticateAdmin, editSittingcategory)
adminroute.delete('/delete-sittingcategory/:sittingId', authenticateAdmin, deleteSittingcategory)
adminroute.get('/get-sittingdata/:sittingId',authenticateAdmin,getsittingCategory)

adminroute.get('/get-sitters',authenticateAdmin,getSitters)
adminroute.get('/get-parent',authenticateAdmin,getParent)
adminroute.put('/verify/:sitterId',authenticateAdmin,verifySitter)

adminroute.put('/block-sitter/:sitterId',authenticateAdmin,blockSitter)
adminroute.put('/unblock-sitter/:sitterId',authenticateAdmin,unblockSitter)

adminroute.put('/block-parent/:parentId',authenticateAdmin,blockParent)
adminroute.put('/unblock-parent/:parentId',authenticateAdmin,unblockParent)

adminroute.post('/add-subscription',authenticateAdmin,addSubscription)
adminroute.get('/get-subscriptions',authenticateAdmin,getSubscriptions)
adminroute.put('/edit-subscription/:id',authenticateAdmin,editSubscription)
adminroute.get('/get-editsubscriptions/:id',authenticateAdmin,getEditsubscription)

adminroute.get('/get-bookings',authenticateAdmin,getBookingHistory)




export default adminroute

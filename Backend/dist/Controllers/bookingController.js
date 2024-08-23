"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmSubscription = exports.getBookedparents = exports.getBookedsitters = exports.handleStripeWebhook = exports.bookingRejection = exports.bookingApproval = exports.confirmBooking = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = require("mongoose");
const sitterModel_1 = __importDefault(require("../Models/sitterModel"));
const parentModel_1 = __importDefault(require("../Models/parentModel"));
const bookingModel_1 = __importDefault(require("../Models/bookingModel"));
const stripe_1 = __importDefault(require("stripe"));
const slotHelper_1 = require("../Helper/slotHelper");
const weekendsittingModel_1 = __importDefault(require("../Models/weekendsittingModel"));
const occasionalsittingModel_1 = __importDefault(require("../Models/occasionalsittingModel"));
const specialcareModel_1 = __importDefault(require("../Models/specialcareModel"));
const walletModel_1 = __importDefault(require("../Models/walletModel"));
const socket_1 = require("../Connections/socket");
const subscriptionModel_1 = __importDefault(require("../Models/subscriptionModel"));
const usersubscriptionModel_1 = __importDefault(require("../Models/usersubscriptionModel"));
const chatModel_1 = __importDefault(require("../Models/chatModel"));
function stripSeconds(date) {
    const newDate = new Date(date);
    newDate.setSeconds(0, 0);
    return newDate;
}
const confirmBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        let { selectedDate, startTime, endTime } = req.body;
        const sitterObjectId = new mongoose_1.Types.ObjectId(sitterId);
        const sitter = yield sitterModel_1.default.findById({ _id: sitterObjectId });
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }
        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }
        const parentId = req.parent._id;
        const parent = yield parentModel_1.default.findById({ _id: parentId });
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        const availability = yield (0, slotHelper_1.checkAvailability)({
            sitterId: sitterObjectId,
            selectedDate,
            startTime,
            endTime,
        });
        if (!availability.success) {
            res.status(400).json({ message: availability.message });
            return;
        }
        const userSubscription = yield usersubscriptionModel_1.default.findOne({ userId: parentId, isPaid: true });
        console.log(userSubscription, 'sub');
        if (userSubscription) {
            const booking = new bookingModel_1.default({
                sitter: sitter._id,
                parent: parent._id,
                servicepay: sitter.servicepay,
                status: 'Pending',
                isPaid: true,
                selectedDate,
                timeSlot: {
                    startTime,
                    endTime
                }
            });
            yield booking.save();
            const io = (0, socket_1.getSocketIOInstance)();
            io.to(`babysitter_${sitter._id}`).emit('bookingNotification', {
                message: 'You have a new booking!',
                bookingDetails: {
                    selectedDate,
                    startTime,
                    endTime,
                    parentName: parent.name,
                },
            });
            res.status(200).json({ booking });
            return;
        }
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            res.status(500).json({ message: 'Stripe secret key not configured' });
            return;
        }
        const clientUrl = process.env.CLIENT_SITE_URL;
        if (!clientUrl) {
            res.status(500).json({ message: 'Client URL not configured' });
            return;
        }
        const stripe = new stripe_1.default(stripeSecretKey);
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${clientUrl}/checkout-success`,
            cancel_url: `${req.protocol}://${req.get('host')}/sitter/${sitter._id}`,
            customer_email: parent.email,
            client_reference_id: req.params.sitterId,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        unit_amount: sitter.servicepay * 100,
                        product_data: {
                            name: sitter.name,
                            description: sitter.about,
                            images: [sitter.profileImage],
                        },
                    },
                    quantity: 1,
                },
            ],
        });
        const booking = new bookingModel_1.default({
            sitter: sitter._id,
            parent: parent._id,
            servicepay: sitter.servicepay,
            status: 'Pending',
            isPaid: false,
            sessionId: session.id,
            selectedDate,
            timeSlot: {
                startTime,
                endTime,
            },
        });
        console.log(session.payment_intent, 'ss');
        if (typeof session.payment_intent === 'string') {
            booking.chargeId = session.payment_intent;
        }
        else if (session.payment_intent && typeof session.payment_intent === 'object') {
            booking.chargeId = session.payment_intent.id;
        }
        else {
            booking.chargeId = '';
        }
        yield booking.save();
        const io = (0, socket_1.getSocketIOInstance)();
        io.to(`babysitter_${sitter._id}`).emit('bookingNotification', {
            message: 'You have a new booking!',
            bookingDetails: {
                selectedDate,
                startTime,
                endTime,
                parentName: parent.name,
            },
        });
        res.status(200).json({ message: 'Booking created. Please complete payment.', session });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.confirmBooking = confirmBooking;
const bookingApproval = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const booking = yield bookingModel_1.default.findById(bookingId);
        console.log(booking, 'book');
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        booking.status = ['Approved'];
        yield booking.save();
        const parent = booking.parent;
        const sitter = yield sitterModel_1.default.findById(booking.sitter);
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }
        console.log(sitter, 'heee');
        let slotModel;
        if (sitter.weekendSlots && sitter.weekendSlots.length > 0) {
            slotModel = weekendsittingModel_1.default;
        }
        else if (sitter.occasionalSlots && sitter.occasionalSlots.length > 0) {
            slotModel = occasionalsittingModel_1.default;
        }
        else if (sitter.specialCareSlots && sitter.specialCareSlots.length > 0) {
            slotModel = specialcareModel_1.default;
        }
        if (!slotModel) {
            res.status(500).json({ message: 'Slot model not found' });
            return;
        }
        const slot = yield slotModel.findOne({
            'availableDates.date': booking.selectedDate
        });
        console.log(slot, 'lllll');
        if (!slot) {
            res.status(404).json({ message: 'Slot not found' });
            return;
        }
        const dateSlot = slot.availableDates.find((ds) => ds.date.toISOString() === booking.selectedDate.toISOString());
        console.log(dateSlot, 'dattttt');
        if (!dateSlot) {
            res.status(404).json({ message: 'Date slot not found' });
            return;
        }
        const compareTimes = (date1, date2) => {
            console.log('Comparing Times:', date1, date2);
            return date1.getTime() === date2.getTime();
        };
        const timeSlot = dateSlot.timeslots.find((ts) => compareTimes(new Date(ts.startTime), new Date(booking.timeSlot.startTime)) &&
            compareTimes(new Date(ts.endTime), new Date(booking.timeSlot.endTime)));
        console.log(timeSlot, 'tiiiii');
        if (!timeSlot && timeSlot === 'undefined') {
            res.status(404).json({ message: 'Time slot not found' });
            return;
        }
        timeSlot.bookingStatus = 'approved';
        yield slot.save();
        console.log(slot, 'sloooooo');
        const io = (0, socket_1.getSocketIOInstance)();
        io.to(`parent_${parent._id}`).emit('bookingApproval', {
            message: 'Your Booking is confirmed!',
            bookingDetails: {
                sitterName: sitter.name,
            },
        });
        res.json({ message: 'Booking Approved' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.bookingApproval = bookingApproval;
const bookingRejection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        if (!req.sitter) {
            res.status(401).json({ message: 'Sitter not authenticated' });
            return;
        }
        const sitterId = req.sitter._id;
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        if (!sitter) {
            res.status(404).json({ message: 'parent not found' });
            return;
        }
        const booking = yield bookingModel_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        const parent = booking.parent;
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            res.status(500).json({ message: 'Stripe secret key not configured' });
            return;
        }
        const stripe = new stripe_1.default(stripeSecretKey);
        booking.status = ['Cancelled'];
        booking.rejectionReason = reason;
        yield booking.save();
        const io = (0, socket_1.getSocketIOInstance)();
        io.to(`parent_${parent._id}`).emit('bookingRejected', {
            message: `Your Booking is Rejected! due to ${booking.rejectionReason}`,
            bookingDetails: {
                sitterName: sitter.name,
            },
        });
        if (booking.chargeId) {
            try {
                yield stripe.refunds.create({
                    payment_intent: booking.chargeId,
                });
                res.json({ message: 'Booking rejected and refund initiated' });
            }
            catch (error) {
                console.error('Error processing refund:', error);
                res.status(500).json({ message: 'Error processing refund' });
            }
        }
        else {
            res.json({ message: 'Booking rejected, but no chargeId found for refund' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.bookingRejection = bookingRejection;
const confirmSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subscriptionId } = req.params;
        const selectedPlan = yield subscriptionModel_1.default.findById(subscriptionId);
        console.log(selectedPlan, 'plan');
        if (!selectedPlan) {
            res.status(404).json({ message: "plan not found" });
        }
        const price = selectedPlan === null || selectedPlan === void 0 ? void 0 : selectedPlan.price;
        const name = selectedPlan === null || selectedPlan === void 0 ? void 0 : selectedPlan.name;
        if (price === undefined || price === null) {
            return res.status(400).json({ message: "Plan price is not defined" });
        }
        if (name === undefined || name === null) {
            return res.status(400).json({ message: "Plan name is not defined" });
        }
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            res.status(500).json({ message: 'Stripe secret key not configured' });
            return;
        }
        const clientUrl = process.env.CLIENT_SITE_URLS;
        if (!clientUrl) {
            res.status(500).json({ message: 'client url not configured' });
            return;
        }
        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }
        const parentId = req.parent._id;
        const parent = yield parentModel_1.default.findById({ _id: parentId });
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        const stripe = new stripe_1.default(stripeSecretKey);
        if (selectedPlan && selectedPlan.price === 0) {
            const newSubscription = new usersubscriptionModel_1.default({
                userId: parent._id,
                planId: subscriptionId,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: ['Active'],
                credit: 0,
                isPaid: false,
                autoRenewal: false,
                paymentMethod: 'Free',
                paymentHistory: [],
            });
            yield newSubscription.save();
            res.status(200).json({ message: 'Subscribed to Free Tier successfully' });
        }
        else {
            const session = yield stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                success_url: `${clientUrl}`,
                cancel_url: `${req.protocol}://${req.get('host')}/subscription-cancel`,
                customer_email: parent.email,
                client_reference_id: subscriptionId,
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            unit_amount: price * 100,
                            recurring: {
                                interval: 'month',
                            },
                            product_data: {
                                name: name,
                            }
                        },
                        quantity: 1
                    }
                ],
            });
            const newSubscription = new usersubscriptionModel_1.default({
                userId: parent._id,
                planId: subscriptionId,
                startDate: new Date(),
                status: ['Active'],
                isPaid: true,
                sessionId: session.id,
                paymentMethod: 'Card',
                paymentHistory: [{
                        amount: price,
                        date: Date.now(),
                        method: 'card'
                    }],
            });
            yield newSubscription.save();
            res.status(200).json({ message: 'Subscription initiated successfully', session });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.confirmSubscription = confirmSubscription;
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('webhook');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    console.log(stripeSecretKey, 'stripe key');
    if (!stripeSecretKey) {
        res.status(500).json({ message: 'Stripe secret key not configured' });
        return;
    }
    const stripe = new stripe_1.default(stripeSecretKey);
    let event;
    try {
        event = req.body;
        console.log(event, 'event');
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log(session, 'kk');
                const paymentIntentId = session.payment_intent;
                console.log(paymentIntentId, 'pay');
                if (paymentIntentId) {
                    const booking = yield bookingModel_1.default.findOne({ sessionId: session.id });
                    console.log(booking, 'boo');
                    if (booking) {
                        booking.chargeId = paymentIntentId;
                        console.log(booking.chargeId, 'jjj');
                        booking.isPaid = true;
                        yield booking.save();
                    }
                    console.log(booking, 'af book');
                }
                break;
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(paymentIntent, 'paymentIntent');
                const succeededBooking = yield bookingModel_1.default.findOne({ sessionId: paymentIntent.id });
                if (succeededBooking) {
                    succeededBooking.chargeId = paymentIntent.id;
                    succeededBooking.isPaid = true;
                    yield succeededBooking.save();
                }
                console.log(succeededBooking, 'suc');
                break;
            case 'payment_intent.created':
                const createdPaymentIntent = event.data.object;
                console.log(`PaymentIntent created: ${createdPaymentIntent.id}`);
                break;
            case 'charge.succeeded':
                const charge = event.data.object;
                console.log(`Charge succeeded: ${charge.id}`);
                break;
            case 'charge.updated':
                const updatedCharge = event.data.object;
                console.log(`Charge updated: ${updatedCharge.id}`);
                break;
            case 'charge.refunded':
                const refundedCharge = event.data.object;
                console.log(refundedCharge, 'cgarge');
                const chargeId = refundedCharge.id;
                const payIntentId = refundedCharge.payment_intent;
                const refundedBooking = yield bookingModel_1.default.findOne({ chargeId: payIntentId });
                console.log(refundedBooking);
                if (refundedBooking) {
                    refundedBooking.isPaid = false;
                    yield refundedBooking.save();
                    const parent = yield parentModel_1.default.findById(refundedBooking.parent);
                    console.log(parent, 'parent');
                    if (parent) {
                        const wallet = yield walletModel_1.default.findOne({ parentId: parent._id });
                        const amount = typeof refundedBooking.servicepay === 'string'
                            ? parseFloat(refundedBooking.servicepay)
                            : refundedBooking.servicepay;
                        console.log(amount, 'amount');
                        if (wallet) {
                            wallet.balance += amount;
                            yield wallet.save();
                        }
                        else {
                            const newWallet = new walletModel_1.default({
                                parentId: parent._id,
                                balance: amount,
                            });
                            console.log(newWallet, 'new');
                            yield newWallet.save();
                        }
                    }
                }
                break;
            case 'charge.refund.updated':
                const updatedRefund = event.data.object;
                const updatedChargeId = updatedRefund.payment_intent;
                const updatedBooking = yield bookingModel_1.default.findOne({ chargeId: updatedChargeId });
                if (updatedBooking) {
                    const updatedRefundAmount = updatedRefund.amount / 100;
                    const updatedRefundStatus = updatedRefund.status;
                    updatedBooking.refundStatus = updatedBooking.refundStatus || [];
                    if (!updatedBooking.refundStatus.includes(updatedRefundStatus)) {
                        updatedBooking.refundStatus.push(updatedRefundStatus);
                    }
                    updatedBooking.refundAmount = updatedRefundAmount;
                    yield updatedBooking.save();
                }
                break;
            case 'invoice.payment_succeeded':
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                const customerId = invoice.customer;
                const paymentIntentForInvoice = yield stripe.paymentIntents.retrieve(invoice.payment_intent);
                const subscription = yield stripe.subscriptions.retrieve(subscriptionId);
                const userSubscription = yield usersubscriptionModel_1.default.findOne({ planId: subscriptionId });
                if (userSubscription) {
                    userSubscription.status = ['Active'];
                    userSubscription.endDate = new Date(subscription.current_period_end * 1000);
                    yield userSubscription.save();
                }
                else {
                    const newSubscription = new usersubscriptionModel_1.default({
                        userId: customerId,
                        planId: subscriptionId,
                        startDate: new Date(subscription.current_period_start * 1000),
                        endDate: new Date(subscription.current_period_end * 1000),
                        status: ['Active'],
                        credit: 0,
                        autoRenewal: subscription.cancel_at_period_end === false,
                        paymentMethod: paymentIntentForInvoice.payment_method,
                        paymentHistory: [{ amount: invoice.amount_paid / 100, date: new Date(), method: 'Stripe' }],
                    });
                    yield newSubscription.save();
                }
                break;
            case 'invoice.payment_failed':
                const failedInvoice = event.data.object;
                const failedSubscriptionId = failedInvoice.subscription;
                const failedUserSubscription = yield usersubscriptionModel_1.default.findOne({ planId: failedSubscriptionId });
                if (failedUserSubscription) {
                    failedUserSubscription.status = ['Inactive'];
                    yield failedUserSubscription.save();
                }
                break;
            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object;
                const canceledSubscription = yield usersubscriptionModel_1.default.findOne({ planId: deletedSubscription.id });
                if (canceledSubscription) {
                    canceledSubscription.status = ['Cancelled'];
                    yield canceledSubscription.save();
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log(`Error handling event: ${errorMessage}`);
        res.status(500).json({ message: errorMessage });
    }
});
exports.handleStripeWebhook = handleStripeWebhook;
const getBookedsitters = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const findSitters = yield bookingModel_1.default.find({ parent: parentId, status: 'Approved' })
            .populate({
            path: 'sitter',
            select: '-password',
        });
        const uniqueSitters = new Map();
        yield Promise.all(findSitters.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
            const sitterId = booking.sitter._id.toString();
            if (uniqueSitters.has(sitterId)) {
                return;
            }
            const chat = yield chatModel_1.default.findOne({
                participants: { $all: [sitterId, parentId] }
            })
                .sort({ lastMessageTimestamp: -1 })
                .populate('messages', 'content timestamp')
                .limit(1);
            const lastMessage = chat ? chat.lastMessage : null;
            const lastMessagedTime = chat ? chat.lastMessageTimestamp : null;
            uniqueSitters.set(sitterId, {
                sitter: booking.sitter,
                lastMessage,
                lastMessagedTime
            });
        })));
        const sittersWithLastMessage = Array.from(uniqueSitters.values());
        res.status(200).json({ sitters: sittersWithLastMessage });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getBookedsitters = getBookedsitters;
const getBookedparents = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const findParent = yield bookingModel_1.default.find({ sitter: sitterId, status: 'Approved' })
            .populate({
            path: 'parent',
            select: '-password',
        });
        const uniqueParents = new Map();
        console.log(uniqueParents, 'pp');
        yield Promise.all(findParent.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
            const parentId = booking.parent._id.toString();
            if (uniqueParents.has(parentId)) {
                return;
            }
            const chat = yield chatModel_1.default.findOne({
                participants: { $all: [sitterId, parentId] }
            })
                .sort({ lastMessageTimestamp: -1 })
                .populate('messages', 'content timestamp')
                .limit(1);
            const lastMessage = chat ? chat.lastMessage : null;
            const lastMessagedTime = chat ? chat.lastMessageTimestamp : null;
            uniqueParents.set(parentId, {
                parent: booking.parent,
                lastMessage,
                lastMessagedTime
            });
        })));
        const parentWithLastMessage = Array.from(uniqueParents.values());
        res.status(200).json({ parent: parentWithLastMessage });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getBookedparents = getBookedparents;

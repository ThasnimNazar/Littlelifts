import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { Types, Model, Mongoose } from 'mongoose'
import { Server } from 'socket.io';
import Sitter, { SitterDocument } from '../Models/sitterModel'
import Parent, { ParentDocument } from '../Models/parentModel'
import Booking, { bookingDocument } from '../Models/bookingModel'
import Stripe from 'stripe'
import { checkAvailability } from '../Helper/slotHelper';
import WeekendSitting from '../Models/weekendsittingModel';
import OccasionalSitting from '../Models/occasionalsittingModel';
import SpecialCareSitting from '../Models/specialcareModel';
import Wallet from '../Models/walletModel';
import { getSocketIOInstance } from '../Connections/socket'
import Subscriptionplan from '../Models/subscriptionModel'
import Usersubscription from '../Models/usersubscriptionModel'
import Chat from '../Models/chatModel'



interface RequestParams {
    sitterId: string;
}

interface CustomRequest<T> extends Request {
    parent?: ParentDocument;
    body: T;
}

interface SitterRequest<T> extends Request {
    sitter?: SitterDocument;
    body: T;
}

interface BookingRequestBody {
    selectedDate: Date;
    startTime: Date;
    endTime: Date;
}

interface ReasonBody {
    reason: string;
}

function stripSeconds(date: Date): Date {
    const newDate = new Date(date);
    newDate.setSeconds(0, 0);
    return newDate;
}



const confirmBooking = async (req: CustomRequest<BookingRequestBody>, res: Response) => {
    try {
        const { sitterId } = req.params;
        let { selectedDate, startTime, endTime } = req.body;

        const sitterObjectId = new Types.ObjectId(sitterId);
        const sitter = await Sitter.findById({ _id: sitterObjectId });
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }

        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }

        const parentId = req.parent._id;
        const parent = await Parent.findById({ _id: parentId });
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }

        const availability = await checkAvailability({
            sitterId: sitterObjectId,
            selectedDate,
            startTime,
            endTime,
        });

        if (!availability.success) {
            res.status(400).json({ message: availability.message });
            return;
        }

        const userSubscription = await Usersubscription.findOne({ userId:parentId,isPaid:true });

        console.log(userSubscription,'sub')

        if (userSubscription) {
            const booking = new Booking({
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
            
            await booking.save();


            const io = getSocketIOInstance();
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

        const stripe = new Stripe(stripeSecretKey);

        const session = await stripe.checkout.sessions.create({
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

        const booking = new Booking({
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

        console.log(session.payment_intent,'ss')


        if (typeof session.payment_intent === 'string') {
            booking.chargeId = session.payment_intent;
        } else if (session.payment_intent && typeof session.payment_intent === 'object') {
            booking.chargeId = session.payment_intent.id; 
        } else {
            booking.chargeId = '';
        }
        
        await booking.save();

        const io = getSocketIOInstance();
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
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};





const bookingApproval = asyncHandler(async (req: Request<{ bookingId: string }>, res: Response) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        console.log(booking, 'book')
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        booking.status = ['Approved'];
        await booking.save();

        const parent = booking.parent;

        const sitter = await Sitter.findById(booking.sitter);
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }

        console.log(sitter, 'heee')

        let slotModel: Model<any> | undefined;
        if (sitter.weekendSlots && sitter.weekendSlots.length > 0) {
            slotModel = WeekendSitting;
        } else if (sitter.occasionalSlots && sitter.occasionalSlots.length > 0) {
            slotModel = OccasionalSitting;
        } else if (sitter.specialCareSlots && sitter.specialCareSlots.length > 0) {
            slotModel = SpecialCareSitting;
        }

        if (!slotModel) {
            res.status(500).json({ message: 'Slot model not found' });
            return;
        }

        const slot = await (slotModel as Model<any>).findOne({
            'availableDates.date': booking.selectedDate
        });

        console.log(slot, 'lllll')

        if (!slot) {
            res.status(404).json({ message: 'Slot not found' });
            return;
        }

        const dateSlot = (slot as any).availableDates.find((ds: { date: Date }) =>
            ds.date.toISOString() === booking.selectedDate.toISOString()
        );
        console.log(dateSlot, 'dattttt')
        if (!dateSlot) {
            res.status(404).json({ message: 'Date slot not found' });
            return;
        }

        const compareTimes = (date1: Date, date2: Date) => {
            console.log('Comparing Times:', date1, date2);
            return date1.getTime() === date2.getTime();
        };

        const timeSlot = dateSlot.timeslots.find((ts: { startTime: Date; endTime: Date }) =>
            compareTimes(new Date(ts.startTime), new Date(booking.timeSlot.startTime)) &&
            compareTimes(new Date(ts.endTime), new Date(booking.timeSlot.endTime))
        );

        console.log(timeSlot, 'tiiiii')

        if (!timeSlot && timeSlot === 'undefined') {
            res.status(404).json({ message: 'Time slot not found' });
            return;
        }

        (timeSlot as any).bookingStatus = 'approved';
        await slot.save();
        console.log(slot, 'sloooooo')

        const io = getSocketIOInstance();

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
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const bookingRejection = async (req: SitterRequest<ReasonBody>, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        if (!req.sitter) {
            res.status(401).json({ message: 'Sitter not authenticated' });
            return;
        }


        const sitterId = req.sitter._id;
        const sitter = await Sitter.findById({ _id: sitterId })
        if (!sitter) {
            res.status(404).json({ message: 'parent not found' })
            return;
        }

        const booking = await Booking.findById(bookingId);

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
        const stripe = new Stripe(stripeSecretKey)

        booking.status = ['Cancelled'];
        booking.rejectionReason = reason;
        await booking.save();

        const io = getSocketIOInstance();

        io.to(`parent_${parent._id}`).emit('bookingRejected', {
            message: `Your Booking is Rejected! due to ${booking.rejectionReason}`,
            bookingDetails: {
                sitterName: sitter.name,
            },
        });

        if (booking.chargeId) {
            try {
                await stripe.refunds.create({
                    payment_intent: booking.chargeId,
                });

                res.json({ message: 'Booking rejected and refund initiated' });
            } catch (error) {
                console.error('Error processing refund:', error);
                res.status(500).json({ message: 'Error processing refund' });
            }
        } else {
            res.json({ message: 'Booking rejected, but no chargeId found for refund' });
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

const confirmSubscription = async(req:CustomRequest<{ subscriptionId:string }>,res:Response)=>{
    try{
        const { subscriptionId } = req.params; 
        const selectedPlan = await Subscriptionplan.findById(subscriptionId);
        console.log(selectedPlan,'plan')

        if(!selectedPlan){
            res.status(404).json({message:"plan not found"})
        }

        const price = selectedPlan?.price;
        const name = selectedPlan?.name;

        if (price === undefined || price === null) {
            return res.status(400).json({ message: "Plan price is not defined" });
        }
        if (name === undefined || name === null) {
            return res.status(400).json({ message: "Plan name is not defined" });
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
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
        const parent = await Parent.findById({ _id: parentId });
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }

        const stripe = new Stripe(stripeSecretKey);

        if (selectedPlan && selectedPlan.price === 0) {
            const newSubscription = new Usersubscription({
                userId: parent._id,
                planId: subscriptionId, 
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
                status: ['Active'],
                credit: 0,
                isPaid:false,
                autoRenewal: false,
                paymentMethod: 'Free',
                paymentHistory: [],
            });

            await newSubscription.save();

            res.status(200).json({ message: 'Subscribed to Free Tier successfully' });
        } else {
            const session = await stripe.checkout.sessions.create({
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

            const newSubscription = new Usersubscription({
                userId: parent._id,
                planId: subscriptionId,
                startDate: new Date(),
                status: ['Active'],
                isPaid: true,
                sessionId: session.id,
                paymentMethod: 'Card',
                paymentHistory: [{
                    amount:price,
                    date:Date.now(),
                    method:'card'
                }],
            });

            await newSubscription.save();

            res.status(200).json({ message: 'Subscription initiated successfully', session })
    }
}
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log('webhook')
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    console.log(stripeSecretKey, 'stripe key')

    if (!stripeSecretKey) {
        res.status(500).json({ message: 'Stripe secret key not configured' });
        return;
    }
    const stripe = new Stripe(stripeSecretKey)    

    let event: Stripe.Event;

    try {
        event = req.body;
        console.log(event,'event')

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(session, 'kk')
                const paymentIntentId = session.payment_intent as string;
                console.log(paymentIntentId, 'pay')

                if (paymentIntentId) {
                    const booking = await Booking.findOne({ sessionId: session.id });
                    console.log(booking, 'boo')
                    if (booking) {
                        booking.chargeId = paymentIntentId;
                        console.log(booking.chargeId, 'jjj')
                        booking.isPaid = true;
                        await booking.save();
                    }
                    console.log(booking, 'af book')
                }
                break;
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(paymentIntent, 'paymentIntent');

                const succeededBooking = await Booking.findOne({ sessionId: paymentIntent.id });
                if (succeededBooking) {
                    succeededBooking.chargeId = paymentIntent.id;
                    succeededBooking.isPaid = true;
                    await succeededBooking.save();
                }
                console.log(succeededBooking, 'suc')
                break;

            case 'payment_intent.created':
                const createdPaymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`PaymentIntent created: ${createdPaymentIntent.id}`);
                break;

            case 'charge.succeeded':
                const charge = event.data.object as Stripe.Charge;
                console.log(`Charge succeeded: ${charge.id}`);
                break;

            case 'charge.updated':
                const updatedCharge = event.data.object as Stripe.Charge;
                console.log(`Charge updated: ${updatedCharge.id}`);
                break;

            case 'charge.refunded':
                const refundedCharge = event.data.object as Stripe.Charge;
                console.log(refundedCharge, 'cgarge');
                const chargeId = refundedCharge.id;
                const payIntentId = refundedCharge.payment_intent;

                const refundedBooking = await Booking.findOne({ chargeId: payIntentId });
                console.log(refundedBooking)
                if (refundedBooking) {
                    refundedBooking.isPaid = false;
                    await refundedBooking.save();

                    const parent = await Parent.findById(refundedBooking.parent);
                    console.log(parent, 'parent')
                    if (parent) {
                        const wallet = await Wallet.findOne({ parentId: parent._id });
                        const amount = typeof refundedBooking.servicepay === 'string'
                            ? parseFloat(refundedBooking.servicepay)
                            : refundedBooking.servicepay;
                        console.log(amount, 'amount')
                        if (wallet) {
                            wallet.balance += amount;
                            await wallet.save();
                        } else {
                            const newWallet = new Wallet({
                                parentId: parent._id,
                                balance: amount,
                            });
                            console.log(newWallet, 'new')
                            await newWallet.save();
                        }
                    }
                }
                break;

            case 'charge.refund.updated':
                const updatedRefund = event.data.object as Stripe.Refund;
                const updatedChargeId = updatedRefund.payment_intent as string;

                const updatedBooking = await Booking.findOne({ chargeId: updatedChargeId });

                if (updatedBooking) {
                    const updatedRefundAmount = updatedRefund.amount / 100;
                    const updatedRefundStatus = updatedRefund.status as "Pending" | "succeeded";

                    updatedBooking.refundStatus = updatedBooking.refundStatus || [];

                    if (!updatedBooking.refundStatus.includes(updatedRefundStatus)) {
                        updatedBooking.refundStatus.push(updatedRefundStatus);
                    }

                    updatedBooking.refundAmount = updatedRefundAmount;

                    await updatedBooking.save();
                }
                break;


            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                const customerId = invoice.customer as string;

                const paymentIntentForInvoice = await stripe.paymentIntents.retrieve(invoice.payment_intent as string);

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                const userSubscription = await Usersubscription.findOne({ planId: subscriptionId });
                if (userSubscription) {
                    userSubscription.status = ['Active'];
                    userSubscription.endDate = new Date(subscription.current_period_end * 1000);
                    await userSubscription.save();
                } else {
                    const newSubscription = new Usersubscription({
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
                    await newSubscription.save();
                }
                break;

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object as Stripe.Invoice;
                const failedSubscriptionId = failedInvoice.subscription as string;

                const failedUserSubscription = await Usersubscription.findOne({ planId: failedSubscriptionId });
                if (failedUserSubscription) {
                    failedUserSubscription.status = ['Inactive'];
                    await failedUserSubscription.save();
                }
                break;

            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object as Stripe.Subscription;

                const canceledSubscription = await Usersubscription.findOne({ planId: deletedSubscription.id });
                if (canceledSubscription) {
                    canceledSubscription.status = ['Cancelled'];
                    await canceledSubscription.save();
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log(`Error handling event: ${errorMessage}`);
        res.status(500).json({ message: errorMessage });
    }
};



const getBookedsitters = asyncHandler(async (req: Request<{ parentId: string }>, res: Response) => {
    try {
        const { parentId } = req.params;

        const findSitters = await Booking.find({ parent: parentId, status: 'Approved' })
            .populate({
                path: 'sitter',
                select: '-password',
            });


            const uniqueSitters = new Map();

            await Promise.all(
                findSitters.map(async (booking: any) => {
                    const sitterId = booking.sitter._id.toString();
    
                    if (uniqueSitters.has(sitterId)) {
                        return;
                    }
    
                    const chat = await Chat.findOne({
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
                })
            );

        const sittersWithLastMessage = Array.from(uniqueSitters.values());

        res.status(200).json({ sitters: sittersWithLastMessage });

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});


const getBookedparents = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;

        const findParent = await Booking.find({ sitter: sitterId, status: 'Approved' })
            .populate({
                path: 'parent',
                select: '-password',
            });

        const uniqueParents = new Map();
        console.log(uniqueParents,'pp')

        await Promise.all(
            findParent.map(async (booking: any) => {
                const parentId = booking.parent._id.toString();

                if (uniqueParents.has(parentId)) {
                    return;
                }

                const chat = await Chat.findOne({
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
            })
        );

        const parentWithLastMessage = Array.from(uniqueParents.values());

        res.status(200).json({ parent: parentWithLastMessage });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});



export {
    confirmBooking, bookingApproval, bookingRejection, handleStripeWebhook, getBookedsitters,
    getBookedparents, confirmSubscription
}
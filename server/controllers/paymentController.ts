import type { Request, Response } from "express";
import {randomUUID} from "crypto"

import Gift from "../models/gift";
import Payment from "../models/payment";
import { CASHFREE_BASE_URL, cashfreeHeaders } from "../config/cashfree";

const GIFT_PRICE = 99

export const createPayment = async (req: Request, res: Response) => {
    const {giftId,customerPhone} = req.body;
      if (!giftId || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Gift ID and customer phone are required.",
      });
    }
    const gift = await Gift.findById(giftId)
    if(!gift){
        return res.status(404).json({
            message : "Gift not found"
        })
    }
    if(gift.isPaid){
        return res.status(409).json({
            message : "The gift already has been paid for."
        })
    }   
        const orderId = `gift_${randomUUID().replaceAll('-','')}`;

        const response = await fetch(`${CASHFREE_BASE_URL}/orders`,{
            method : "POST",
            headers : {
                ...cashfreeHeaders,
                "x-idempotency-key" : randomUUID()
            },
            body : JSON.stringify({
                order_id : orderId,
                order_amount : GIFT_PRICE,
                order_currency : "INR",

                customer_details :  {
                    customer_id: `gift_${gift._id}`,
                    customer_phone : customerPhone
                },

                order_meta : {
                    return_url : `${process.env.FRONTEND_URL}/payment/return?order_id={order_id}`
                }
            })
        })

        const cashfreeData = await response.json()

        if(!response.ok){
            console.error("Cashfree create order error", cashfreeData)
            return res.status(502).json({
                message : "Could not create payment order"
            })
        }

        await Payment.create({
            giftId : gift._id,
            orderId,
            status : "pending"
        })

        return res.status(201).json({
            message : "Order created successfully",
            orderId,
            paymentSessionId : cashfreeData.payment_session_id
        })
}


export const verifyPayment = async (req: Request, res: Response) => {
    const {orderId} = req.query;

    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
        method : "GET",
        headers : cashfreeHeaders
    })

    const cashfreeData = await response.json()

    if(cashfreeData.order_status === "PAID"){
        const paymentRecord = await Payment.findOneAndUpdate({orderId},{status : "paid", paymentId : cashfreeData.cf_order_id}, {new : true})

        if(paymentRecord) {
            await Gift.findByIdAndUpdate(paymentRecord.giftId, {
                isPaid : true
            })
        }

          return res.json({
        success : true,
        paid : true
    })

    }

    return res.json({
        success : true,
        paid : false
    })



}
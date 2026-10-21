import type { Request, Response } from "express";
import Gift from "../models/gift.js";

export const createGift = async (req: Request, res: Response) =>{
    try{
        const{giftType,senderName,recipientName,message,theme} = req.body;
        if(!giftType || !senderName || !recipientName || !theme){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }
        const slugify = (await import("slugify")).default

         const slug = `${slugify(`${recipientName} - ${giftType}`,{
                lower : true,
                strict : true
            })}-${Math.random().toString(36).substring(2, 8)}`;

        const gift = await Gift.create({
            slug,
            giftType,
            senderName,
            recipientName,
            message,
            theme
        })

        return res.status(201).json({
            success :true,
            message : "Gift created successfully",
            gift,
            shareUrl : `${process.env.FRONTEND_URL}/g/${gift.slug}`
        })
    }catch(err){
        console.error("Create Gift Error", err)
        return res.status(500).json({
            success : false,
            message : "We couldn't create your gift. Please try again."
        })
    }
}

export const getGift = async (req: Request, res: Response) => {
    try {
        const gift = await Gift.findOne({ slug: req.params.slug });

        if (!gift) {
            return res.status(404).json({
                success: false,
                message: "Gift not found"
            });
        }

        return res.status(200).json({
            success: true,
            gift
        });
    } catch (err) {
        console.error("Get Gift Error", err);
        return res.status(500).json({
            success: false,
            message: "Unable to load gift"
        });
    }
};
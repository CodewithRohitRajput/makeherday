import mongoose from "mongoose"

export const paymentSchema = new mongoose.Schema({
    giftId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Gift"
    },
    orderId : String,
    paymentId : String,
    status : {
        type : String,
        enum : ["pending", "paid", "failed"],
        default : "pending"
    }
}, {timestamps : true})

export default mongoose.model("Payment", paymentSchema)
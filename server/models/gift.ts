import mongoose from "mongoose"

export const giftSchema = new mongoose.Schema({
    slug :{
        type: String,
        required: true,
        unique : true
    },
    giftType : {
        type : String,
        required : true
    },
    senderName : String,
    recipientName: String,
    message : String,
    theme : String,
    isPaid :{
        type: Boolean,
        default : false
    }

},{timestamps: true})


export default mongoose.model("Gift", giftSchema)
import mongoose from "mongoose"

export const giftSchema = new mongoose.Schema({
    slug :{
        type: String,
        required: true,
        unique : true
    },
    giftType : {
        type : String,
        enum : ["birthday", "love-letter", "anniversary"],
        required : true
    },
    senderName : String,
    recipientName: String,
    message : String,
    theme : String
},{timestamps: true})


export default mongoose.model("Gift", giftSchema)
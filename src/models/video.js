import mongoose,{Schema, trusted} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema =new Schema({
       videoFile:{
        type:String,
        required:trusted
       },
       thumbnail:{
        type:String,
        required:true
       },
       title:{
        type:String,
        required:true
       },
       description:{
        type:String,
        required:true
       },
       duration:{
        type:Number,
        required:true
       },
       owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
       }
},

{
    timestamps:true
}
)
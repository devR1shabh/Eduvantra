const mongoose=require("mongoose")

//define the user schema using mongoose schema constructor
const userSchema = new mongoose.Schema(

    {
        //define the name field with type string ,required and trimmed
        firstName:{
            type:String,
            required:true,
            trim:true,
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
        },
        
        email:{
            type:String,
            required:true,
            trim:true,
        },
        
        password:{
            type:String,
            required:true,
        },

        accountType:{
            type:String,
            enum:["Admin","Student","Instructor"],
            required:true,
        },
        active:{
            type:Boolean,
            default:true,
        },
        approved:{
            type:Boolean,
            default:true,
        },
        additionalDetails:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Profile",
        },
        courses:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course",

            },

        ],
        token:{
            type:String,

        },
        resetPasswordExpires:{
            type:Date,
        },
        image:{
            type:String,
            required:true,
        },
        courseProgress:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"courseProgress",
            },
        ],
    },

    {timestamps:true}
)

//Export the Mongoose model for the user schema ,using the name 'User'
module.exports=mongoose.model("User",userSchema);

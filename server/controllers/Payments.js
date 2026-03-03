const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");

//capture payment and initiate the razorpay order
exports.capturePayment  = async (req,res) =>{
    //get course id and user id
    const {course_id} = req.body;
    const {user_id} = req.user.id;
    
    //validation
    if(!course_id){
        return res.status(400).json({
            success:false,
            message:"Please provide valid course id",
        });
    }

    //valid course id or not
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.status(400).json({
                success:false,
                message:"Could not find the course",
            });
        }

        //user already bought or not
        const uid = new mongoose.types.ObjectId(user_id);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Already enrolled student",
            });
        }

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }

    //order create
    const amount = course.price;
    const currency = "INR";
    
    const options = {
        amount: amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    }

    try{
        //initiate the payment using razor pay
        const paymentResponse  = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail: course.courseThumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            message:"Order created",
        });

    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"Could not initiate order",
        });
    }
}

//verify signature of razorpay and server

exports.verifySignature = async (req,res) =>{
    
        const webhookSecret = "123456789";
        const signature = req.headers("x-razorpay-signature");
        
        crypto.createHmac("sha256" , webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if(signature === digest){
            console.log("Payment is authorized");

            const {courseId , userId} = req.body.payload.payment.entity.notes;

            try{
                //action - student ko enrol kro

                //find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                    {_id:courseId},
                    {$push:{studentsEnrolled:userId}},
                    {new:true},
                );

                if(!enrolledCourse){
                    return res.status(500).json({
                        success:false,
                        message:"Course not found",
                    });
                }

                console.log(enrolledCourse);

                //find the student and add course to their list of enrolled courses

                const enrolledStudent = await User.findOneAndUpdate(
                    {_id:userId},
                    {$push:{courses:courseId}},
                    {new:true},
                );

                //mail send
                const emailResponse = await mailSender(
                    enrolledStudent.email,
                    "Congratulations hahahahaha",
                    "yooooooooooooooooooooooooooooooo",
                )

                return res.status(200).json({
                    success:true,
                    message:"Done",
                });
            }catch(error){
                console.error(error);
                return res.status(500).json({
                    success:false,
                    message:error.message,
                });
            }
        }

        
    
    else{
        return res.status(500).json({
            success:false,
            message:"Invalid request",
        });
    }
}


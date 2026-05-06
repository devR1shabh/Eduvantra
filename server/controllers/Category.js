const Category = require("../models/Category");
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

//creating category handler function
exports.createCategory = async (req,res) =>{
    try{
        //fetch data
        const{name,description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //create entry in DB
        const CategoryDetails = await Category.create({
            name:name,
            description:description,
        });

        console.log(CategoryDetails);
        //return response

        return res.status(200).json({
            success:true,
            message:"category created successfully",
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    };
};

//getAlltags handler function


exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find()
    res.status(200).json({
      success: true,
      data: allCategorys,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory: null,
          mostSellingCourses: [],
        },
        message: "No courses found",
      })
    }

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })

    let differentCategory = null

    if (categoriesExceptSelected.length > 0) {
      const randomIndex = getRandomInt(categoriesExceptSelected.length)

      differentCategory = await Category.findById(
        categoriesExceptSelected[randomIndex]._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()
    }

    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

    const allCourses = allCategories.flatMap((cat) => cat.courses)

    const mostSellingCourses = allCourses
      .sort(
        (a, b) =>
          (b.studentsEnroled?.length || 0) -
          (a.studentsEnroled?.length || 0)
      )
      .slice(0, 10)

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
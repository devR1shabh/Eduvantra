const express = require("express")
const router = express.Router()

const { chatWithAI } = require("../controllers/AI")
const { auth, isStudent } = require("../middlewares/auth")

router.post("/chat", auth, isStudent, chatWithAI)

module.exports = router

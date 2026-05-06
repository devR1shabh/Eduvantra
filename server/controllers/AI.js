const buildSystemPrompt = (context) => {
  const courseTitle = context?.courseTitle || "the current course"
  const lectureTitle = context?.lectureTitle || "the current lesson"
  const lectureDescription = context?.lectureDescription || "No lesson description was provided."

  return [
    "You are EduVantra AI, a helpful doubt-solving assistant for students.",
    "Explain concepts clearly, step by step, and keep answers focused on learning.",
    "If the question is unrelated to studying or the course, politely guide the student back to the topic.",
    "If you are unsure, say what information is missing instead of guessing.",
    "",
    `Course: ${courseTitle}`,
    `Current lesson: ${lectureTitle}`,
    `Lesson description: ${lectureDescription}`,
  ].join("\n")
}

const getOpenAIAnswer = async (question, context) => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: buildSystemPrompt(context),
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.3,
      max_output_tokens: 700,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed")
  }

  return (
    data?.output_text ||
    data?.output?.[0]?.content?.find((item) => item.type === "output_text")?.text
  )
}

const getGeminiAnswer = async (question, context) => {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: buildSystemPrompt(context),
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: question,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 700,
        },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini request failed")
  }

  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
}

exports.chatWithAI = async (req, res) => {
  try {
    const { question, context } = req.body
    const trimmedQuestion = question?.trim()

    if (!trimmedQuestion) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      })
    }

    const provider = process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")

    if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on the server",
      })
    }

    if (provider === "openai" && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OPENAI_API_KEY is not configured on the server",
      })
    }

    const answer =
      provider === "gemini"
        ? await getGeminiAnswer(trimmedQuestion, context)
        : await getOpenAIAnswer(trimmedQuestion, context)

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        answer: answer || "I could not generate an answer right now. Please try again.",
      },
    })
  } catch (error) {
    console.log("AI_CHAT_API_ERROR", error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong while solving the doubt",
    })
  }
}

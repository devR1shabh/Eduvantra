import { toast } from "react-hot-toast"

import { apiConnector } from "../apiConnector"
import { aiEndpoints } from "../apis"

const { AI_CHAT_API } = aiEndpoints

export const askAIChatbot = async ({ question, context }, token) => {
  try {
    const response = await apiConnector(
      "POST",
      AI_CHAT_API,
      { question, context },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not get AI response")
    }

    return response.data.data.answer
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Could not get AI response"
    toast.error(message)
    return {
      error: message,
    }
  }
}

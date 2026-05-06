import { useMemo, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useSelector } from "react-redux"
import { useLocation, useParams } from "react-router-dom"
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi"

import { askAIChatbot } from "../../services/operations/aiAPI"
import { ACCOUNT_TYPE } from "../../utils/constants"

const starterMessages = [
  {
    role: "assistant",
    content:
      "Hi, I am EduVantra AI. Ask me a doubt from your course and I will explain it clearly.",
  },
]

export default function AIChatbot() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { courseSectionData, courseEntireData } = useSelector(
    (state) => state.viewCourse
  )
  const location = useLocation()
  const params = useParams()
  const listRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState(starterMessages)
  const [loading, setLoading] = useState(false)

  const currentLecture = useMemo(() => {
    const pathParts = location.pathname.split("/")
    const sectionId = params.sectionId || pathParts[pathParts.indexOf("section") + 1]
    const subSectionId =
      params.subSectionId || pathParts[pathParts.indexOf("sub-section") + 1]

    const section = courseSectionData?.find((item) => item._id === sectionId)
    return section?.subSection?.find((item) => item._id === subSectionId)
  }, [courseSectionData, location.pathname, params.sectionId, params.subSectionId])

  const shouldShow = token && user?.accountType === ACCOUNT_TYPE.STUDENT

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      })
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || loading) return

    const userMessage = { role: "user", content: trimmedQuestion }
    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setLoading(true)
    scrollToBottom()

    const result = await askAIChatbot(
      {
        question: trimmedQuestion,
        context: {
          courseTitle: courseEntireData?.courseName,
          lectureTitle: currentLecture?.title,
          lectureDescription: currentLecture?.description,
        },
      },
      token
    )

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          typeof result === "string"
            ? result
            : result?.error ||
              "I could not solve that right now. Please try asking again in a simpler way.",
      },
    ])
    setLoading(false)
    scrollToBottom()
  }

  if (!shouldShow) return null

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-lg border border-richblack-600 bg-richblack-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-richblack-600 bg-richblack-700 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-richblack-5">EduVantra AI</p>
              <p className="text-xs text-richblack-300">Student doubt solver</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-richblack-100 transition hover:bg-richblack-600"
              aria-label="Close AI chatbot"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 leading-6 ${
                    message.role === "user"
                      ? "bg-yellow-50 text-richblack-900"
                      : "bg-richblack-700 text-richblack-25"
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-richblack-300">Thinking...</div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-richblack-600 p-3"
          >
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask your doubt..."
              rows={2}
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-md border border-richblack-600 bg-richblack-900 px-3 py-2 text-sm text-richblack-5 outline-none placeholder:text-richblack-400 focus:border-yellow-50"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="grid h-11 w-11 place-items-center rounded-md bg-yellow-50 text-richblack-900 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send doubt"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="grid h-14 w-14 place-items-center rounded-full bg-yellow-50 text-richblack-900 shadow-2xl transition hover:bg-yellow-100"
        aria-label="Open AI chatbot"
      >
        <FiMessageCircle className="text-2xl" />
      </button>
    </div>
  )
}

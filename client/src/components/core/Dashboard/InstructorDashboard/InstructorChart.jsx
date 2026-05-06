import { useState, useMemo } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")

  // ✅ Fixed color palette (no random re-render issues)
  const COLORS = [
    "#FFD60A",
    "#22C55E",
    "#EF4444",
    "#3B82F6",
    "#A855F7",
    "#F97316",
    "#14B8A6",
    "#EAB308",
  ]

  // ✅ Memoized data (prevents lag)
  const chartData = useMemo(() => {
    const labels = courses.map((course) => course.courseName)

    const studentsData = courses.map(
      (course) => course.totalStudentsEnrolled
    )

    const incomeData = courses.map(
      (course) => course.totalAmountGenerated
    )

    return {
      students: {
        labels,
        datasets: [
          {
            data: studentsData,
            backgroundColor: COLORS.slice(0, labels.length),
          },
        ],
      },
      income: {
        labels,
        datasets: [
          {
            data: incomeData,
            backgroundColor: COLORS.slice(0, labels.length),
          },
        ],
      },
    }
  }, [courses])

  // ✅ Better chart options
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#E5E7EB",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`
          },
        },
      },
    },
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
      <p className="text-lg font-bold text-richblack-5">Visualize</p>

      {/* Toggle Buttons */}
      <div className="space-x-4 font-semibold">
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "students"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Students
        </button>

        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "income"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Income
        </button>
      </div>

      {/* Chart */}
      <div className="mx-auto h-[350px] w-[350px]">
        <Pie
          data={
            currChart === "students"
              ? chartData.students
              : chartData.income
          }
          options={options}
        />
      </div>
    </div>
  )
}
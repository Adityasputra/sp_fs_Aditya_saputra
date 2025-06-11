"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useMemo } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Task = {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
};

interface Props {
  tasks: Task[];
}

export default function TaskAnalytics({ tasks }: Props) {
  const countByStatus = useMemo(() => {
    const result = { todo: 0, "in-progress": 0, done: 0 };
    tasks.forEach((task) => {
      result[task.status]++;
    });
    return result;
  }, [tasks]);

  const data = {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [
          countByStatus["todo"],
          countByStatus["in-progress"],
          countByStatus["done"],
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(234, 179, 8, 0.5)",
          "rgba(34, 197, 94, 0.5)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f3f4f6",
        bodyColor: "#e5e7eb",
        padding: 10,
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#4B5563",
          font: {
            family: "Inter, sans-serif",
          },
        },
        grid: {
          color: "#E5E7EB",
        },
      },
      x: {
        ticks: {
          color: "#4B5563",
          font: {
            family: "Inter, sans-serif",
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full overflow-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Task Status Overview
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Distribution of tasks based on their current status.
      </p>
      <div className="max-w-3xl mx-auto">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

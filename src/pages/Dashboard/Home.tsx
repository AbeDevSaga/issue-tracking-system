import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/cn/card";

import { Briefcase, CircleAlert, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 bg-gray-50 rounded-2xl min-h-screen"
    >
      <h1 className="text-2xl font-semibold">Issue Tracking Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Briefcase className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">128</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CircleAlert className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">42</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">86</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues Table placeholder */}
      <Card className="shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">Table will be here...</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Charts & Graphs Section ---
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <Card className="rounded-2xl shadow-sm">
    <CardHeader>
      <CardTitle>Issue Status Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64">
        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Pending", value: 42 },
                { name: "Resolved", value: 86 },
                { name: "Total", value: 128 },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>

  <Card className="rounded-2xl shadow-sm">
    <CardHeader>
      <CardTitle>Issues Created Per Month</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64">
        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { month: "Jan", issues: 20 },
              { month: "Feb", issues: 35 },
              { month: "Mar", issues: 25 },
              { month: "Apr", issues: 40 },
            ]}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="issues" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
</div>;

// --- Recent Issues Table Section ---
// Replace the placeholder with a professional table layout below.

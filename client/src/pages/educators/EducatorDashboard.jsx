import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets, dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";

function EducatorDashboard() {
  const { currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    // Simulate fetching data
    setDashboardData(dummyDashboardData);
  };

  // ✅ Run only once on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!dashboardData) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col gap-10 md:p-8 pt-8">
      {/* ---------- Stats Section ---------- */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md">
          <img src={assets.patients_icon} alt="students_icon" />
          <div>
            <p className="text-2xl font-medium text-gray-600">
              {dashboardData.enrolledStudentsData.length}
            </p>
            <p className="text-base text-gray-500">Total Enrolments</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md">
          <img src={assets.earning_icon} alt="earning_icon" />
          <div>
            <p className="text-2xl font-medium text-gray-600">
              {currency}
              {dashboardData.totalEarnings}
            </p>
            <p className="text-base text-gray-500">Total Earnings</p>
          </div>
        </div>
      </div>

      {/* ---------- Table Section ---------- */}
      <div className="w-full max-w-4xl bg-white rounded-md shadow-card border border-gray-200">
        <h2 className="px-6 pt-6 pb-3 text-lg font-medium text-gray-800">
          Latest Enrolments
        </h2>
        <table className="table-auto w-full text-left border-t border-gray-100">
          <thead className="bg-gray-50 text-gray-900 text-sm">
            <tr>
              <th className="px-6 py-3 font-semibold">#</th>
              <th className="px-6 py-3 font-semibold">Student Name</th>
              <th className="px-6 py-3 font-semibold">Course Title</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {dashboardData.enrolledStudentsData.map((item, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">{index + 1}</td>
                <td className="px-6 py-3 flex items-center gap-3">
                  <img
                    src={item.student.imageUrl}
                    alt="Profile"
                    className="w-9 h-9 rounded-full"
                  />
                  <span className="truncate">{item.student.name}</span>
                </td>
                <td className="px-6 py-3 truncate">{item.courseTitle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EducatorDashboard;

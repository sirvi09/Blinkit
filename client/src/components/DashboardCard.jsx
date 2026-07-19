import React from "react";

const DashboardCard = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-lg transition-all">

      <div className="flex justify-between items-center">

        <div>
          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

export default DashboardCard;
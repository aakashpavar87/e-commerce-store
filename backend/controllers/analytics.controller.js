import { Sequelize } from "sequelize";
import { sequelize } from "../lib/db.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js"

export const getAnalyticsData = async () => {
  const totalUsers = await User.count();
  const totalProducts = await Product.count();
  const salesData = await sequelize.query(`
        SELECT
          COUNT(*) AS totalSales,
          SUM("totalAmount") AS totalRevenue
        FROM
          Public."Orders"
      `, { type: Sequelize.QueryTypes.SELECT })
  const { totalsales: totalSales, totalrevenue: totalRevenue } = salesData[0];
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales: Number(totalSales),
    totalRevenue
  }
}

export const getDailySalesData = async (startDate, endDate) => {
  const dailySalesData = await sequelize.query(`
    SELECT
      TO_CHAR("createdAt", 'YYYY-MM-DD') AS id,
      COUNT(*) AS sales,
      SUM("totalAmount") AS revenue
    FROM
      Public."Orders"
    WHERE
      "createdAt" BETWEEN :startDate AND :endDate
    GROUP BY
      id
    ORDER BY
      id ASC
  `, {
    replacements: {
      startDate: startDate,
      endDate: endDate
    },
    type: Sequelize.QueryTypes.SELECT
  });
  const dateArray = getDatesInRange(startDate, endDate);
  // console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

  return dateArray.map((date) => {
    const foundData = dailySalesData.find((item) => item.id === date);
    return {
      date,
      sales: Number(foundData?.sales) || 0,
      revenue: foundData?.revenue || 0,
    };
  });
}
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
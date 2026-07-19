import { pool } from "../config/connectDB.js";

export const getDashboardStats = async (req, res) => {
  try {

    const totalRevenue = await pool.query(`
      SELECT COALESCE(
        SUM(total_amt),
        0
      ) AS revenue
      FROM (
        SELECT DISTINCT order_id, total_amt
        FROM orders
      ) t
    `);

    const totalOrders = await pool.query(`
      SELECT COUNT(DISTINCT order_id)
      AS total_orders
      FROM orders
    `);

    const totalUsers = await pool.query(`
      SELECT COUNT(*) AS total_users
      FROM users
    `);

    const totalProducts = await pool.query(`
      SELECT COUNT(*) AS total_products
      FROM products
    `);

    const monthlyRevenue = await pool.query(`
      SELECT COALESCE(
        SUM(total_amt),
        0
      ) AS revenue
      FROM (
        SELECT DISTINCT order_id,total_amt,created_at
        FROM orders
      ) t
      WHERE DATE_TRUNC('month',created_at)
      = DATE_TRUNC('month',CURRENT_DATE)
    `);

    const monthlyOrders = await pool.query(`
      SELECT COUNT(DISTINCT order_id)
      AS monthly_orders
      FROM orders
      WHERE DATE_TRUNC('month',created_at)
      = DATE_TRUNC('month',CURRENT_DATE)
    `);

    const todayRevenue = await pool.query(`
      SELECT COALESCE(
        SUM(total_amt),
        0
      ) AS revenue
      FROM (
        SELECT DISTINCT order_id,total_amt,created_at
        FROM orders
      ) t
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const todayOrders = await pool.query(`
      SELECT COUNT(DISTINCT order_id)
      AS today_orders
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    return res.json({
      success: true,
      data: {
        todayRevenue: todayRevenue.rows[0].revenue,
        todayOrders: todayOrders.rows[0].today_orders,

        monthlyRevenue: monthlyRevenue.rows[0].revenue,
        monthlyOrders: monthlyOrders.rows[0].monthly_orders,

        totalRevenue: totalRevenue.rows[0].revenue,
        totalOrders: totalOrders.rows[0].total_orders,

        totalUsers: totalUsers.rows[0].total_users,
        totalProducts: totalProducts.rows[0].total_products,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
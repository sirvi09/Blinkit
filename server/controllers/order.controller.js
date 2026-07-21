import Stripe from "../config/stripe.js";
import { pool } from "../config/connectDB.js";
import { getOrdersByUser } from "../models/order.model.js";
import { io } from "../index.js";
import { findUserById } from "../models/user.model.js";
import { getProductById } from "../models/product.model.js";

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
  return Number(price) - discountAmount;
};

export async function CashOnDeliveryOrderController(req, res) {
  const client = await pool.connect();
  try {
    const userId = req.userId;
    const { list_items, addressId } = req.body;

    if (!list_items || !addressId) {
      return res.status(400).json({ message: "Invalid request", error: true, success: false });
    }

    await client.query('BEGIN');

    const orders = [];

    for (const item of list_items) {
      const productId = item?.productId?.id || item?.productId?._id || item?.productId || item?.product_id;
      const product = await getProductById(productId);
      if(!product) {
          continue;
      }

      const itemPrice = pricewithDiscount(product.price, product.discount);
      const itemSubtotal = itemPrice * item.quantity;

      const orderQuery = `
        INSERT INTO orders (user_id, order_id, product_id, product_details, payment_id, payment_status, delivery_address, subtotal_amt, total_amt, invoice_receipt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const orderValues = [
        userId,
        `ORD-${Date.now()}-${product.id}`,
        product.id,
        JSON.stringify({ name: product.name, image: product.image }),
        "",
        "CASH ON DELIVERY",
        addressId,
        itemSubtotal,
        itemSubtotal,
        ""
      ];
      
      const resOrder = await client.query(orderQuery, orderValues);
      orders.push(resOrder.rows[0]);
    }

    // clear cart
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    await client.query('COMMIT');

    io.emit("dashboard-updated");

    return res.json({
      message: "Order successfully placed",
      error: false,
      success: true,
      data: orders,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("COD error:", error, error.stack);
    return res.status(500).json({
      message: error.message || "Order failed to process",
      error: true,
      success: false,
    });
  } finally {
    client.release();
  }
}


export async function paymentController(req, res) {
  try {
    const userId = req.userId;
    const { list_items, addressId } = req.body;

    const user = await findUserById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found", error: true, success: false });
    }

    const line_items = [];
    for (const item of list_items) {
      const productId = item?.productId?.id || item?.productId?._id || item?.productId || item?.product_id;
      const product = await getProductById(productId);
      if(!product) continue;
      
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: Array.isArray(product.image) ? product.image.slice(0, 1) : [],
            metadata: {
              productId: product.id,
            },
          },
          unit_amount: pricewithDiscount(product.price, product.discount) * 100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity,
      });
    }

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId,
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    return res.status(200).json(session);
  } catch (error) {
    console.error("Payment setup error:", error, error.stack);
    return res.status(500).json({
      message: error.message || "Failed to initialize payment",
      error: true,
      success: false,
    });
  }
}

const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
}) => {
  const productList = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      const payload = {
        user_id: userId,
        order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        product_id: Number(product.metadata.productId),
        product_details: JSON.stringify({
          name: product.name,
          image: product.images,
        }),
        payment_id: paymentId,
        payment_status: payment_status,
        delivery_address: Number(addressId),
        subtotal_amt: Number(item.amount_total / 100),
        total_amt: Number(item.amount_total / 100),
        invoice_receipt: "",
      };

      productList.push(payload);
    }
  }

  return productList;
};


export async function webhookStripe(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    const client = await pool.connect();
    try {
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
      const userId = Number(session.metadata.userId);
      const addressId = Number(session.metadata.addressId);

      const orderProducts = await getOrderProductItems({
        lineItems,
        userId,
        addressId,
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
      });

      await client.query('BEGIN');
      const createdOrders = [];

      for (const item of orderProducts) {
        const orderQuery = `
          INSERT INTO orders (user_id, order_id, product_id, product_details, payment_id, payment_status, delivery_address, subtotal_amt, total_amt, invoice_receipt)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;
        const orderValues = [item.user_id, item.order_id, item.product_id, item.product_details, item.payment_id, item.payment_status, item.delivery_address, item.subtotal_amt, item.total_amt, item.invoice_receipt];
        const resOrder = await client.query(orderQuery, orderValues);
        createdOrders.push(resOrder.rows[0]);
      }

      if (createdOrders.length > 0) {
        await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
      }
      
      await client.query('COMMIT');
      io.emit("dashboard-updated");
      console.log("Stripe order processed successfully");
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Webhook transaction failed:", error);
    } finally {
      client.release();
    }
  }

  return res.json({ received: true });
}


export async function getOrderDetailsController(req, res) {
  try {
    const userId = req.userId;
    const orderList = await getOrdersByUser(userId);

    return res.json({
      message: "order list",
      data: orderList,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Order details error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

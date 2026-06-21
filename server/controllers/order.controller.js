import Stripe from "../config/stripe.js";
import { pool } from "../config/connectDB.js";
import { createOrder, getOrdersByUser } from "../models/order.model.js";
import { findUserById } from "../models/user.model.js";

export async function CashOnDeliveryOrderController(req, res) {
  try {
    const userId = req.userId;

    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    const orders = [];

    for (const item of list_items) {
      const order = await createOrder({
        user_id: userId,
        order_id: `ORD-${Date.now()}-${item.productId.id}`,
        product_id: item.productId.id,
        product_details: JSON.stringify({
          name: item.productId.name,
          image: item.productId.image,
        }),
        payment_id: "",
        payment_status: "CASH ON DELIVERY",
        delivery_address: addressId,
        subtotal_amt: subTotalAmt,
        total_amt: totalAmt,
        invoice_receipt: "",
      });

      orders.push(order);
    }

    // clear cart
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return res.json({
      message: "Order successfully",
      error: false,
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);

  const actualPrice = Number(price) - discountAmount;

  return actualPrice;
};
export async function paymentController(req, res) {
  try {
    const userId = req.userId;

    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    const user = await findUserById(userId);

    const line_items = list_items.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
            metadata: {
              productId: item.productId.id,
            },
          },
          unit_amount:
            pricewithDiscount(item.productId.price, item.productId.discount) *
            100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity,
      };
    });

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
    return res.status(500).json({
      message: error.message || error,
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
  try {
    const event = req.body;

    console.log("event", event);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const lineItems = await Stripe.checkout.sessions.listLineItems(
          session.id,
        );

        const userId = Number(session.metadata.userId);
        const addressId = Number(session.metadata.addressId);

        const orderProducts = await getOrderProductItems({
          lineItems,
          userId,
          addressId,
          paymentId: session.payment_intent,
          payment_status: session.payment_status,
        });

        const createdOrders = [];

        for (const item of orderProducts) {
          const order = await createOrder(item);
          createdOrders.push(order);
        }

        if (createdOrders.length > 0) {
          await pool.query("DELETE FROM cart_items WHERE user_id = $1", [
            userId,
          ]);
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({
      received: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
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
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

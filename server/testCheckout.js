import { CashOnDeliveryOrderController } from "./controllers/order.controller.js";
import { pool } from "./config/connectDB.js";

const req = {
  userId: 1, // replace with a valid user id if needed
  body: {
    list_items: [
      {
        id: "local-1234",
        productId: { id: 1 },
        quantity: 1
      }
    ],
    addressId: 1
  }
};

const res = {
  status: (code) => {
    console.log("Status:", code);
    return res;
  },
  json: (data) => {
    console.log("JSON:", data);
  }
};

(async () => {
  try {
    await CashOnDeliveryOrderController(req, res);
  } finally {
    pool.end();
  }
})();

import jwt from "jsonwebtoken";

const token = jwt.sign({ id: 1 }, process.env.SECRET_KEY_ACCESS_TOKEN || "your_secret", { expiresIn: "1h" });

fetch("http://localhost:5000/api/order/cash-on-delivery", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    list_items: [
      {
        productId: { id: 1 },
        quantity: 1
      }
    ],
    addressId: 1
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Data:", await res.text());
}).catch(err => {
  console.error("Error:", err);
});

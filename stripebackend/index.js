const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(
  "get key from secret key > click on three dots and click on revoke key"
);
const { v4: uuidv4 } = require("uuid");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// ROUTES
app.get("/", (req, res) => {
  res.send("It works");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("PRODUCT", product);
  console.log("PRICE", product.price);

  /* this is unique key that keeps track that
  user not charge for redundunt products */
  const idempotencyKey = uuidv4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100, // default is cents it will convert to dollar
          currency: "usd",
          customer: customer.id,
          recept_email: token.email,
          description: `purchase of ${product.name} `,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

// LISTEN

app.listen(8282, () => console.log("LISTNING AT PORT 8282"));

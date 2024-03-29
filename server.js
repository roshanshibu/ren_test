require("dotenv").config();

const express = require("express");

const transactionRoutes = require("./routes/transaction");
const accountRoutes = require("./routes/account");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const dashboardRoutes = require("./routes/dashboard");

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require("cors");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Expense Manager",
      version: "1.0.0",
    },
    host: "localhost:4000",
    basePath: "/",
    tags: [
      {
        name: "Users",
        description: "API endpoints for user management in the system",
      },
      {
        name: "Dashboard",
        description: "API endpoint for fetching user's dashboard data",
      },
      {
        name: "Accounts",
        description:
          "API endpoint to view and manage user's financial accounts",
      },
      {
        name: "Transactions",
        description: "API endpoint to view and manage user's transactions",
      },
      {
        name: "Categories",
        description: "API endpoint to view and manage transaction Categories",
      },
    ],
  },
  apis: [
    "./routes/user.js",
    "./routes/dashboard.js",
    "./routes/account.js",
    "./routes/transaction.js",
    "./routes/category.js",
  ],
};

const app = express();
const port = process.env.PORT;

//ENABLE CORS
app.use(cors());

//SWAGGER
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Mongoose
const mongoose = require("mongoose");

//Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method); //logs requests
  next();
});

//connect to db with mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    //Listen for requests
    app.listen(port, () =>
      console.log(`Conntected to DB & Server running on port ${port}`)
    );
  })
  .catch((error) => {
    console.log(error);
  });

//routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);

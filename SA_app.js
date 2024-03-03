const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const moment = require("moment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var punycode = require("punycode/");

//Initialisations
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Session Setup
app.use(
  session({
    secret: "your secret key",
    resave: false,
    saveUninitialized: false,
  })
);

const accountSid = "AC04d25b18d449c7bf302c51353eaddb20";
const authToken = "a30c5b7b1effe32cde29349f9f87bba4";
const twilioNumber = "+14582175133";

const twilio = require("twilio")(accountSid, authToken);
var otp = 0;

//Database Models
var userType = require("./models/userTypeModel");
var user = require("./models/userModel");
var serviceCategory = require("./models/serviceCategoryModel");
var cities = require("./models/citiesModel");
var services = require("./models/servicesModel");
var subCategories = require("./models/subCategoryModel");
var Booking = require("./models/bookingModel");
var serviceAgent = require("./models/serviceAgentModel");

//Database Setup
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://meghshah05:Shreeganesh2018@cluster0.tsvylyb.mongodb.net/VeeServe?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("ERROR:", err.message);
  });
var status = 0;

//Get Requests

app.get("/", function (req, res) {
  res.render("SA_login", { message: "" });
});

app.get("/dashboard", function (req, res) {
  if (req.session.isLoggedIn) {
    const serviceAgentId = req.session.serviceAgentId;
    var totalServedServices = 0;
    var totalServices = 0;
    console.log(serviceAgentId);
    Booking.aggregate([
      {
        $match: {
          serviceAgentId: mongoose.Types.ObjectId(serviceAgentId),

          status: "Served",
        },
      },
      {
        $group: {
          _id: "$serviceAgentId",
          totalServedServices: { $sum: 1 },
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.error(err);
        // Handle the error
      } else {
        // If a service agent is found, extract the totalServices count
        totalServedServices =
          result.length > 0 ? result[0].totalServedServices : 0;

        // Use the totalServices count as needed
        console.log(
          `Total services served by service agent: ${totalServedServices}`
        );
      }
    });
    Booking.aggregate([
      {
        $match: {
          serviceProviderId: mongoose.Types.ObjectId(serviceAgentId),
        },
      },
      {
        $group: {
          _id: "$serviceProviderId",
          totalServices: { $sum: 1 },
        },
      },
    ]).exec((err, result) => {
      if (err) {
        console.error(err);
        // Handle the error
      } else {
        // If a service agent is found, extract the totalServices count
        totalServices = result.length > 0 ? result[0].totalServices : 0;

        // Use the totalServices count as needed
        console.log(`Total services served by service agent: ${totalServices}`);
      }
    });

    const today = moment().startOf("day");

    // Find orders for the specified service provider and today's date
    Booking.find({
      serviceProviderId: serviceAgentId,
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf("day").toDate(),
      },
    })
      .populate("serviceId") // Populate the serviceId field with the corresponding service document
      .exec()
      .then((orders) => {
        res.render("SA_dashboard", {
          fullName: fullName,
          totalServices: totalServices,
          totalServedServices: totalServedServices,
          bookings: orders,
        });
        console.log("Today's orders:", orders);
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
      });
  } else {
    res.redirect("/");
  }
});

app.get("/earnings", function (req, res) {
  if (req.session.isLoggedIn) {
    res.send(
      "<h1>Coming Soon</h1>" +
        "<p>The Earnings page is currently under construction. Please check back later.</p>"
    );
  } else {
    res.redirect("/");
  }
});

app.get("/change-pass", function (req, res) {
  if (req.session.isLoggedIn) {
    res.render("change-password");
  } else {
    res.redirect("/");
  }
});

app.get("/bookings", function (req, res) {
  if (req.session.isLoggedIn) {
    const serviceAgentId = req.session.serviceAgentId;
    Booking.find({ serviceProviderId: serviceAgentId })
      .populate("serviceId")
      .exec()
      .then((orders) => {
        res.render("SA_bookings", {
          fullName: fullName,
          bookings: orders,
        });
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
      });
  } else {
    res.redirect("/");
  }
});

app.get("/sendOTPRequest/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  const { customerPhone } = booking;
  otp = Math.floor(100000 + Math.random() * 900000);
  const message = `Your OTP for booking ${booking.name} is ${otp}`;
  twilio.messages
    .create({
      body: message,
      from: twilioNumber,
      to: customerPhone,
    })
    .then((message) => {
      console.log(message.sid);
      res.json({ success: true });
    });
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

//Post Requests

app.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the service agent with the provided username
    const serviceagent = await serviceAgent.findOne({ userName: username });
    // Check if the service agent exists and the password matches
    if (serviceagent && serviceagent.password === password) {
      // Successful login
      // You can perform additional actions here, such as setting session variables

      req.session.isLoggedIn = true;
      req.session.emailAddress = serviceagent.userName;
      req.session.serviceAgentId = serviceagent._id;
      fullName = serviceagent.name;
      res.redirect("/dashboard");
    } else {
      // Invalid username or password
      res.render("admin_login", { message: "Invalid Credentials" });
    }
  } catch (error) {
    // Error occurred while querying the database
    console.error(error);
  }
});

app.post("/startService/otpVerification/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { otp } = req.body;

  try {
    // Perform OTP verification logic here
    // You can access the `otp` value received from the client

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Yet To Serve") {
      // Update the booking status to "Serving"
      booking.status = "Serving";
    } else {
      // Update the booking status to "Served"
      booking.status = "Served";
    }

    await booking.save();

    res.json({ success: true, message: "OTP Verified Successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while updating booking status",
    });
  }
});

app.post("/change-password", async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/");
  }

  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.send("New passwords do not match.");
  }

  try {
    const serviceAgent = await serviceAgent.findById(
      req.session.serviceAgentId
    );

    if (!serviceAgent) {
      return res.send("User not found.");
    }

    // Check if the old password is correct
    if (serviceAgent.password !== oldPassword) {
      return res.send("Old password is incorrect.");
    }

    // Update the password
    serviceAgent.password = newPassword;
    await serviceAgent.save();

    res.send("Password changed successfully.");
  } catch (error) {
    console.error(error);
    res.send("An error occurred while changing the password.");
  }
});

app.listen(2500, function () {
  console.log("Server started on port 2500");
});

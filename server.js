const express = require("express");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const nodeMailer = require("nodemailer");
const ejs = require("ejs");
const processenv = require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { json } = bodyParser;
const { Router } = express;
const { UserBookingModel, ProductsAndBannerModel, findUser, saveNewUser } = require("./models/database-models.js");
const { createJwtToken, verifyJwtToken, extractJwtFromCookie } = require("./server-functions.js");
const { checkUserLoggedIn, getBannerAndProductImages, getUserSelectedProduct } = require("./middleware.js");
const server = express(); 
const port = process.env.PORT || 3000;
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_AUTH_EMAIL,
    pass: process.env.NODEMAILER_AUTH_PASSWORD,
  }
});

server.set("view engine", "ejs");
server.set("views", "./views");
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json({limit: "50mb"}))
server.use(json());
server.use(express.static("public"));
server.use(cors());
server.use(cookieParser());

//connecting to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(success => {
  server.listen(port, () => {
    console.log("Express server connected to mongodb atlas and listening on port 3000 for request.")
  });
})  
.catch(err => {
  console.log("Couldn't connect to mongodb atlas.");
});

server.get("/", checkUserLoggedIn, getBannerAndProductImages, (req, res) => {
  let registeredUserData = req.registeredUserData;
  let productAndBannerImages = req.productAndBannerImages;
  
  res.render("homepage", { registeredUserData, productAndBannerImages });
});

server.post("/user-login", async (req, res) => {
  let payload = req.body;
  let registeredUser = await findUser(UserBookingModel, payload);
 
  if (typeof registeredUser === "object") {
    res.cookie("jwt", registeredUser.jwt);
    res.json({ user: "authorized" });
  } else {
    let newUserDetails = await saveNewUser(UserBookingModel, payload);
    res.cookie("jwt", newUserDetails.jwt);
    res.json(newUserDetails._id);
  }
}); 

server.get("/my-orders-page", (req, res) => {
  let jwtToken = extractJwtFromCookie(req.headers.cookie);

  if (jwtToken) {
    let userMongoId = verifyJwtToken(jwtToken);
    let userData;

    UserBookingModel.findById(userMongoId, (err, doc) => {
      if (doc) {
        userData = doc;
        
        res.render("my-orders-page", { userData });
      }
    })
  }
});

server.get("/product-page", checkUserLoggedIn, getUserSelectedProduct, (req, res) => {
  let selectedProductDetails = req.selectedProduct;
  let registeredUserData;

  if (req.registeredUserData !== null) {
    registeredUserData = req.registeredUserData;

    res.render("product-page", { registeredUserData, selectedProductDetails, user: true }); 
  } else {
    res.render("product-page", { selectedProductDetails, user: false }); 
  } 
});

server.get("/get-products", (req, res) => {
  ProductsAndBannerModel.find({}, async (err, doc) => {
    let arrayOfProducts;
    
    if (doc[0].products) {
      arrayOfProducts = doc[0].products;

      res.json(arrayOfProducts);
    }
  });
});

server.post("/upload-product", (req, res) => {
  let payload = req.body;
  let newProduct;

  ProductsAndBannerModel.find({}, async (err, doc) => {
    if (doc.length === 0) {
      newProduct = new ProductsAndBannerModel(payload);
      newProduct.save((err, doc) => {
        if (doc) {
          res.json(doc);
        } else {
          res.json({error: "Uploading failed."});
        }
      });
    } else {
      newProduct = payload.products[0];

      doc[0].products.push(newProduct);
      await  doc[0].save((err, doc) => {

        if (doc) {
          res.json(newProduct);
        } else {
          res.json({error: "Couldn't upload the new banner image."})
        }
      });
    }
  });
});

server.post("/delete-product", (req, res) => {
  let indexOfProductToDelete = Number(req.body.productNumber);

  ProductsAndBannerModel.find({}, async (err, doc) => {
    let arrayOfProducts = doc[0].products;

    if (arrayOfProducts) {
       let newArrayOfProductsToSave = arrayOfProducts.filter((product, indexOfProduct) => {
         return indexOfProduct !== indexOfProductToDelete;
       });
       
       doc[0].products = newArrayOfProductsToSave;
       await  doc[0].save((err, doc) => {

        if (doc) {
          res.json({deleteStatus: "Successfully deleted."});
        } else {
          res.json({error: "Couldn't upload the new banner image."})
        }
      });
    }
  });
});

server.post("/set-product-availability", (req, res) => {
  let productNumber = Number(req.body.productNumber);
  let availabilityStatusToSet = req.body.availabilityStatus;

  ProductsAndBannerModel.find({}, (err, doc) => {
    let arrayOfProducts;

    if (doc) {
      arrayOfProducts = doc[0].products;

      arrayOfProducts.forEach(async (productObject, index) => {
        
        if (productNumber === index) {
          doc[0].products[productNumber]["product-availability"] = availabilityStatusToSet;

          await doc[0].save((err, doc) => {
            if (doc) {
              res.json({availabilityStatus: "successful"});
            } else {
              res.json({availabilityStatus: "unsuccessful"});
            }
          });
        }
      });
    }
  });
});

server.post("/upload-banner-image", (req, res) => {
  let payload = req.body;
  let newBannerImage;

  ProductsAndBannerModel.find({}, async (err, doc) => {
    if (doc.length === 0) {
      newBannerImage = new ProductsAndBannerModel(payload);
      newBannerImage.save((err, doc) => {
        if (doc) {
          res.json(doc);
        } else {
          res.json({error: "Uploading failed."});
        }
      });
    } else {
      newBannerImage = req.body.bannerImages[0];

      doc[0].bannerImages.unshift(newBannerImage);
      await  doc[0].save((err, doc) => {
        if (doc) {
          res.json({bannerImages: doc.bannerImages});
        } else {
          res.json({error: "Couldn't upload the new banner image."})
        }
      });
    }
  });
});

server.post("/delete-banner", (req, res) => {
  let imageNumber = req.body.imageNumber;
  
  ProductsAndBannerModel.find({},async (err, doc) => {
    if (doc) {
      let arrayOfBannerImages = doc[0].bannerImages;
      let newArrayOfBannerImages = arrayOfBannerImages.filter((bannerImage, index) => {
        return imageNumber !== index;
      });
        
      doc[0].bannerImages = newArrayOfBannerImages;
      await doc[0].save((err, doc) => {
  
        if (doc) {
          let updateNumberOfBannerImages = doc.bannerImages.length;
          res.json({numberOfBannerImages: updateNumberOfBannerImages});
        }
      });
    } 
  });
});

server.get("/get-total-banner", (req, res) => {
  let totalOfBannerImages;

  ProductsAndBannerModel.find({}, (err, doc) => {
    if (doc[0].bannerImages) {
      totalOfBannerImages = doc[0].bannerImages.length;
      res.json({totalBannerImages: totalOfBannerImages});
    } else {
      res.json({totalBannerImages: "No Banner Image"});
    }
  });
});

server.get("/invoice-page", (req, res) => {
  let jwtToken = extractJwtFromCookie(req.headers.cookie);

  if (jwtToken) {
    let userMongoId = verifyJwtToken(jwtToken);
    let userData;

    if (req.query.orderId) {
      let orderId = req.query.orderId;
      let userData = {};

      UserBookingModel.findOne({
        orders: { 
          $elemMatch: {_id: orderId}
        }
      }, (err, doc) => {
      doc.orders.forEach(order => {
        if (String(order._id) === String(orderId)) {
          userData.email = doc.email;
          userData["user-image"] = doc["user-image"];
          userData["event-date"] = order["event-date"];
          userData.time = order.time;
          userData.eventType = order.eventType;
          userData.productName = order.productName;
          userData.productPrice = order.productPrice;
          userData.productDiscount = order.productDiscount;
          userData.discountedPrice = order.discountedPrice;
          userData.orderStatus = order.orderStatus;

          res.render("invoice-page", { userData });
        }
      })
     });
    } else {
      UserBookingModel.findById(userMongoId, (err, doc) => {
        if (doc) {
          userData = doc.orders[doc.orders.length-1];
          userData.email = doc.email;
          userData["user-image"] = doc["user-image"];
  
          res.render("invoice-page", { userData });
        }
      });
    }
  } 
});

server.post("/invoice-page", (req, res) => {
  let jwtToken = extractJwtFromCookie(req.headers.cookie);
  let userMongoId = verifyJwtToken(jwtToken);
  let payload = req.body;
  let appEmail = "rajtanuchakravarty@gmail.com";
  let userEmail;
  let username;
  let userImage;
  
  if (userMongoId.hasOwnProperty("_id")) {
    UserBookingModel.findById(userMongoId._id, async (err, doc) => {
      if (doc) {
        userEmail = doc.email;
        username = doc.username;
        userImage = doc["user-image"];

        doc.orders.push(payload.order);

        await doc.save((err, result) => {
          if (result) {
            transporter.sendMail({
              from: appEmail,
              to: userEmail,
              subject: "Order Booking Successful",
              text: "Congratulations, " + username + ".\n\nYou've successfully booked your order!!\nOur team will connect to you shortly for further confirmation on your booking.\nThank you for choosing us.\n\nBest Wishes,\nfrom Balloonfix Team"
            }, (err, info) => {
              if (info) {
                console.log("Order Successful email sent to client.");
              } 
            });
           transporter.sendMail({
             from: appEmail,
             to: appEmail,
             subject: "New Order booking.",
             text: "Hello, Admin.\nIt seems like we have a new booking from " + username + "(" + userEmail + ")." + "\nTo know more and manage orders visit the link below:\nhttps://balloonfix.in/edit-orders-admin-page"
           }, (err, info) => {
             if (info) {
               console.log("New Booking email sent to Admin.");
             } 
           });
          }
        });

        res.json({ updateStatus: "success", path: "/invoice-page", userEmail, userImage});
      } else {
        res.json({ updateStatus: "failed" });
      }
     });
   }
});

server.get("/edit-orders-admin-page", (req, res) => {
  res.sendFile("./public/html/edit-orders-admin-page/edit-orders-admin-page.html", { root: __dirname });
});

server.get("/get-order-details", (req, res) => {
  UserBookingModel.find({}, (err, doc) => {
    if (doc) {
      res.json(doc);
    } else {
      res.json({ status: "Not found" });
    }
  });
});

server.post("/update-order", (req, res) => {
  let payload = req.body;
  let orderId = req.body.orderId;
  let eventDate = req.body.eventDate;
  let appEmail = "rajtanuchakravarty@gmail.com";

  UserBookingModel.findOne({
    orders: {
      $elemMatch: {_id: orderId}
    }
  }, (err, doc) => {
    if (doc) {
      let updatedOrder;
      let indexOfOrder;
      
      doc.orders.forEach(async order => {
        if (String(order._id) === String(orderId)) {
          indexOfOrder = doc.orders.indexOf(order);
          doc.orders[indexOfOrder].orderStatus = payload.orderStatus;
          doc.orders[indexOfOrder].time = payload.time;
          updatedOrder = await doc.save()
          .then(success => {
            transporter.sendMail({
              from: appEmail,
              to: payload.clientEmail,
              subject: "Order Confirmed",
              text: "Congratulations, " + payload.clientName + ".\n\nYour booking for " + payload.productName +  " has been confirmed with " + payload.time.trim() + " time slot for " + eventDate + ".\nYou could check the order status from 'My Orders' page on the website.\nBalloonfix Team is grateful to be a part of this special celebration.\n\nWe look forward to making this occasion a memorable one for you.\n\nBest Wishes,\nfrom Balloonfix Team"
            }, (err, info) => {
              if (info) {
                console.log("Order confirmation email sent to client.");
              } 
            });
            res.json({ updateStatus: "success" });
          }).catch(err => {
            res.json({ updateStatus: "failed" });
          });
        }
      });
    }
  });
});

server.get("/about-page", (req, res) => {
  res.sendFile("./public/html/about-page/about-page.html", { root: __dirname });
});
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { createJwtToken } = require("../server-functions.js");

let userBookingSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String, 
    required: true
  },
  "user-image": {
    type: String
  },
  orders: {
    type: [{
      productName: { type: String },
      productPrice: { type: Number },
      productDiscount: { type: String },
      discountedPrice: { type: Number },
      eventType: { type: String },
      productImage: {type: String},
      day: { type: String },
      month: { type: String },
      year: { type: String }, 
      phoneNumber: { type: String },
      userAddress: { type: String },
      time: { type: String },
      ["event-date"]: { type: String },
      orderStatus: { type: String },
      additionalInfo: { type: String }
    }]
  },
  admin: { type: String }
});

let productsAndBannerSchema = {
  products: {
    type: [{
      "product-name": { type: String},
      "product-description": { type: String },
      "product-price": { type: Number },
      "product-discount": { type: Number },
      "product-availability": { type: String },
      "discount-price": { type: Number },
      "discount-percentage": { type: Number },
      primaryImage: { type: String },
      additionalImages: { type: []},
    }]
  },
  bannerImages: { type: [] }
};

let UserBookingModel = mongoose.model("User-booking-detail", userBookingSchema);
let ProductsAndBannerModel = mongoose.model("Products-and-banner", productsAndBannerSchema);

async function findUser(userModel, payload) {
  let registeredUser;
  let userMongoId;
  let newJwtToken;
  
  await userModel.findOne({ email: payload.email })
  .then(document => {
    if (document) {
      userMongoId = { _id: document._id };
      newJwtToken = createJwtToken(userMongoId);

      registeredUser = {
        _id: userMongoId,
        jwt: newJwtToken
      }
    }
  }).catch(err => {
    console.log(err)
    registeredUser = false;
  });
  
  return registeredUser;
};

async function saveNewUser(userModel, payload) {
  let newUser = new userModel(payload);
  let newUserMongoId;
  let newJwtToken;

  await newUser.save()
    .then(success => {
      newUserMongoId = { _id: success._id };
      newJwtToken = createJwtToken(newUserMongoId);
    }).catch(err => {
      console.log(err);
    });  

  return { _id: newUserMongoId, jwt: newJwtToken };
};

module.exports = { UserBookingModel, ProductsAndBannerModel, findUser, saveNewUser };
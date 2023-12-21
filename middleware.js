const { extractJwtFromCookie, verifyJwtToken } = require("./server-functions");
const { UserBookingModel, ProductsAndBannerModel } = require("./models/database-models.js");

function checkUserLoggedIn(req, res, next) {
    let isCookieAvailable = req.headers.cookie;
    let cookie;
    let token;
    let userMongoId;
    let userData;

  if (isCookieAvailable) {
    cookie = req.headers.cookie;
    token = extractJwtFromCookie(cookie);
    userMongoId = verifyJwtToken(token);
    
    UserBookingModel.findById(userMongoId, (err, doc) => {
        if (doc) {
          userData = doc;
          req.registeredUserData = userData;

          next();
        } else {
          req.registeredUserData = null;
          next();
        }
    });
  } else {
    req.registeredUserData = null;
    next();
  }
};

function getBannerAndProductImages(req, res, next) {
  let productAndBannerImages;
  let arrayOfProductImages = [];

  ProductsAndBannerModel.find({} , (err, doc) => {
    if (doc.length === 0) {
      req.productAndBannerImages = null;
      next();
    } else {
      if (doc[0].products.length !== 0) {
        let products = doc[0].products;
        
        products.forEach(productObj => {
          arrayOfProductImages.push(productObj.primaryImage)
        });
      }

      productAndBannerImages = {
        bannerImages: doc[0].bannerImages,
        arrayOfProductImages
      }
      req.productAndBannerImages = productAndBannerImages;
      next();
    }
  });
};

function getUserSelectedProduct(req, res, next) {
  let indexOfSelectedProduct = Number(req.query.productNumber);
  let arrayOfProducts;
  let selectedProduct;

  ProductsAndBannerModel.find({}, (err, doc) => {
    if (doc) {
      arrayOfProducts = doc[0].products;

      arrayOfProducts.forEach((product, index) => {
        if (indexOfSelectedProduct === index) {
          selectedProduct = product;
          return ;
        }
      });

      req.selectedProduct = selectedProduct;
      next();
    } else {
      req.selectedProduct = null;
      next();
    }
  });
};


module.exports = { checkUserLoggedIn, getBannerAndProductImages, getUserSelectedProduct };
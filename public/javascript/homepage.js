import { signingInUser, signingOutUser } from "./firebase_google-signIn.js";



let navbarBarsIconWrapper = document.querySelector(".navbar__bars-icon-wrapper");
let navbarBarsIcon = document.querySelector(".bars-icon-wrapper__bars-icon");
let xmarkIcon = document.querySelector(".xmark-icon-wrapper__xmark-icon");
let navbarLinksWrapper = document.querySelector(".navbar__links-wrapper");
let navbarButtonWrapper = document.querySelector(".button-userID-container__button-wrapper");
let googleLoginButton = document.querySelector(".button-wrapper__login-button");
let loadingButton = document.querySelector(".loading-button");
let userElement = document.querySelector(".user");
let userImage = document.querySelector(".user__image");
let userName = document.querySelector(".user__name");
let banner = document.querySelector(".banner");
let scrollImageWrapper = document.querySelector(".scroll-image-wrapper");
let productCardsWrapper = document.querySelector(".product-cards-wrapper");
let imageIndicatorWrapper = document.querySelector(".scroll-image-wrapper__indicator-wrapper");
let arrayOfBannerImages = [...document.querySelectorAll(".scroll-image-wrapper__image")];
let arrayOfImageIndicators = [...document.querySelectorAll(".scroll-image-wrapper__indicator")];
let googleUser = {
    username: "",
    "user-image": "",
    email: "",
    admin: ""
  }



//custom functions 
function changeNavbarLinksWrapperVisibility() {
  let isInsideViewport;
  navbarLinksWrapper.offsetLeft < 0 ? isInsideViewport = false : isInsideViewport = true; //offset property shows the offset value of a positioned element
  
  if(isInsideViewport) {
    navbarLinksWrapper.style.left = "-100vw";
  } else {
    navbarLinksWrapper.style.left = "0vw";
  }
};

function makingUserElementVisible() {
  if (userElement.classList.contains("invisible")) {
    changeClassnameOfAnElement(userElement, "invisible", "visible");
    changeElementDisplayProperty(userElement, "flex");
  }
};

function displayUserID() {
  setTimeout(function() {
    makingUserElementVisible();
    changeClassnameOfAnElement(navbarButtonWrapper, "visible", "invisible");
    changeElementDisplayProperty(navbarButtonWrapper, "none");
  }, 2000);
};

function changeBackgroundColorOfImageIndicatorElement(indicatorIndex) {
  let indexOfImageIndicatorToChange = indicatorIndex;
  arrayOfImageIndicators.forEach(indicator => {
    if (arrayOfImageIndicators.indexOf(indicator) === indexOfImageIndicatorToChange) {
      indicator.style.backgroundColor = "var(--golden-color)"; 
    } else {
      indicator.style.backgroundColor = "var(--black-color)";
    }
  })
}; 

function automateScrollingOfBannerImagesWithThreeSecondInterval() {
  function setNextBannerImageWithinBannerViewport() {
    arrayOfBannerImages.forEach(image => {
      let bannerWidth = banner.getBoundingClientRect().width;
      let imageWidth = arrayOfBannerImages[0].getBoundingClientRect().width;
      let distanceOfImageFromBannerViewport = banner.getBoundingClientRect().left - image.getBoundingClientRect().left;
      let indexOfLastImageElementInArrayOfBannerImages = arrayOfBannerImages.length - 1;
      let indexOfNextImageToScrollInsideBannerViewport;
      let scrollingValueForScrollImageWrapper;
      
      if (distanceOfImageFromBannerViewport > -bannerWidth && distanceOfImageFromBannerViewport <= bannerWidth) {
        if (indexOfLastImageElementInArrayOfBannerImages === arrayOfBannerImages.indexOf(image)) {
          movingElementOnHorizontalAxisUsingTranslateCSSProperty(scrollImageWrapper, 0);
          changeBackgroundColorOfImageIndicatorElement(0);
          return ;
        }
        indexOfNextImageToScrollInsideBannerViewport = arrayOfBannerImages.indexOf(image) + 1;
        scrollingValueForScrollImageWrapper = indexOfNextImageToScrollInsideBannerViewport * imageWidth;
        movingElementOnHorizontalAxisUsingTranslateCSSProperty(scrollImageWrapper, -scrollingValueForScrollImageWrapper);
        changeBackgroundColorOfImageIndicatorElement(indexOfNextImageToScrollInsideBannerViewport);
        return ;
      }
    });
  }
  setInterval(setNextBannerImageWithinBannerViewport, 8000);
};

function scrollBannerImageUsingIndicator(indexOfIndicator) {
  let imageToScrollInView = arrayOfBannerImages[indexOfIndicator];
  let imageDistanceFromViewport = imageToScrollInView.getBoundingClientRect().left;
  let distanceOfLeftBorderOfScrollImageWrapperFromViewport = scrollImageWrapper.getBoundingClientRect().left;
  let distanceToBeScrolled;
  
  if (imageDistanceFromViewport < 0) {
    distanceToBeScrolled = Math.abs(distanceOfLeftBorderOfScrollImageWrapperFromViewport) - Math.abs(imageDistanceFromViewport);
    movingElementOnHorizontalAxisUsingTranslateCSSProperty(scrollImageWrapper, -distanceToBeScrolled);
  } else {
    distanceToBeScrolled = distanceOfLeftBorderOfScrollImageWrapperFromViewport - imageDistanceFromViewport;
    movingElementOnHorizontalAxisUsingTranslateCSSProperty(scrollImageWrapper, distanceToBeScrolled);
  }

  changeBackgroundColorOfImageIndicatorElement(indexOfIndicator);
}

function serverRequestUsingQueryStringForProductPage(...params) {
  let queryStringObject = {};
  let queryString;

  if (params.length !== 0) {
    params.forEach(param => {
      queryStringObject[param[0]] = param[1]
    });

    queryString = new URLSearchParams(queryStringObject);
  }
  window.location.href = window.location.origin + "/product-page" + "?" + queryString;
}

async function postRequestToServerOnLogin(loginData) {
  let requestURL = `${window.location.origin}/user-login`;
  let payload = loginData;
  let response = await fetch(requestURL, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    }, 
    body: JSON.stringify(payload)
  });
  let jsonResponse = await response.json();

  if (jsonResponse) {
     return "successful";
  }
};



//event listeners
imageIndicatorWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let indicatorIndex;
  
  if (eventTarget.parentElement === imageIndicatorWrapper) {
    indicatorIndex = arrayOfImageIndicators.indexOf(eventTarget);
    scrollBannerImageUsingIndicator(indicatorIndex);
  }
});

googleLoginButton.addEventListener("click", async function(event) {
    let userData = await signingInUser();

    if (typeof userData === "object") {
      if (userData.success) {
        googleUser.username = userData.success._tokenResponse.fullName;
        googleUser["user-image"] = userData.success._tokenResponse.photoUrl;
        googleUser.email = userData.success._tokenResponse.email;
        googleUser.admin = false;

        if (await postRequestToServerOnLogin(googleUser) === "successful") {
          changeImgElementSourceAttribute(userImage, googleUser["user-image"]);
          changeElementTextContent(userName, googleUser.username);
          changeElementDisplayProperty(loadingButton, "block");
          changeClassnameOfAnElement(loadingButton, "invisible", "visible");
          displayUserID();
        }
      }
    }
});

loadingButton.addEventListener("click", function() {
  let isVisible = loadingButton.classList.contains("visible");

  if(isVisible) {
    changeClassnameOfAnElement(loadingButton, "visible", "invisible");
    changeElementDisplayProperty(loadingButton, "none");
  }
});

navbarBarsIconWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;

  if (eventTarget === navbarBarsIcon) {
    changeNavbarLinksWrapperVisibility();
    changeClassnameOfAnElement(navbarLinksWrapper, "invisible", "visible");
  }
});

navbarLinksWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;

  if (eventTarget === xmarkIcon) {
    changeNavbarLinksWrapperVisibility();
    changeClassnameOfAnElement(navbarLinksWrapper, "visible", "invisible");
  }
});

productCardsWrapper.addEventListener("mouseover", function(event) {
  let eventTarget = event.target;
  let arrayOfProductCards = [...productCardsWrapper.children];
  let isAProductCardButton = eventTarget.classList.contains("product-card__button");
  let productCard;
  let productCardImageWrapper;

  if (isAProductCardButton) {
    productCard = eventTarget.parentElement;
    productCardImageWrapper = eventTarget.previousElementSibling;

    productCard.classList.add("hovered");
    productCard.style.borderColor = "transparent";
    productCardImageWrapper.style.clipPath = "inset(0px)";
  } else {
    arrayOfProductCards.forEach(child => {
      let hasBeenHovered = child.classList.contains("hovered");

      if (hasBeenHovered) {
        productCard = child;
        productCardImageWrapper = child.firstElementChild;

        productCard.style.borderColor = "var(--golden-color)";
        productCardImageWrapper.style.clipPath = "inset(10% 10% 28% 10% round 8px)";
        productCard.classList.remove("hovered");    
      }
    });
  }
});

productCardsWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isProductCardButton = eventTarget.classList.contains("product-card__button");
  let userEmail = googleUser.userEmail;
  let productCardsWrapper;
  let productCard;
  let productNumber;
  // let selectedProductImageSource;

  if (isProductCardButton) {
    // selectedProductImageSource = eventTarget.parentElement.querySelector(".product-card-image").src.match(/\/\i\S+/);
    function findIndexNumberOfAChildElement(parentElement, childElement) {
      let arrayOfChildElements = [...parentElement.children];
      let childIndex;

      arrayOfChildElements.forEach(child => {
        if (child === childElement) {
          childIndex = arrayOfChildElements.indexOf(childElement);
        } 
      });

      if (typeof childIndex === "number") {
        return childIndex;
      } else {
        console.log("Not a child");
      }
    };

    productCard = eventTarget.parentElement;
    productCardsWrapper = productCard.parentElement;
    productNumber = findIndexNumberOfAChildElement(productCardsWrapper, productCard);

    if (userEmail) {
      serverRequestUsingQueryStringForProductPage(["productNumber", productNumber], ["userEmail", userEmail]);
    } else {
      serverRequestUsingQueryStringForProductPage(["productNumber", productNumber]);
    }
  }
});

automateScrollingOfBannerImagesWithThreeSecondInterval();
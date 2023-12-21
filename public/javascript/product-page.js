import { signingInUser, signingOutUser } from "./firebase_google-signIn.js"
import { timepicker } from "./time-picker.js";

let userNavigation = document.querySelector(".user-navigation");
let userNavigationImage = document.querySelector(".user-navigation__image");
let userNavigationEmail = document.querySelector(".user-navigation__user-email");
let selectedProductImage = document.querySelector(".selected-product-image");
let selectedProductImageRow = document.querySelector(".selected-product-image-row");
let phoneNumberFieldWrapper = document.querySelector(".book-now-popup__phone-number-field-wrapper");
let phoneNumberInputField = document.querySelector(".book-now-popup__phone-number-input-field");
let eventTypeButton = document.querySelector(".event-type-button");
let eventTypeErrorMessage = document.querySelector(".event-type-button__error-message");
let bookNowButton = document.querySelector(".book-now-button");
let bookNowPopupWrapper = document.querySelector(".book-now-popup-wrapper");
let popupBookNowButton = document.querySelector(".book-now");
let bookNowPopupTimeField = document.querySelector(".book-now-popup__time-field");
let bookNowPopupCloseButtonWrapper = document.querySelector(".book-now-popup__close-button-wrapper");
let timeFieldTimeValue = bookNowPopupTimeField.firstElementChild;
let timeFieldTimePeriodValue = bookNowPopupTimeField.lastElementChild;
let eventDateInputField = document.querySelector(".book-now-popup__event-date-input-field");
let userAddressInputField = document.querySelector(".book-now-popup__user-address-input-field");
let additionalInfoWrapper = document.querySelector(".book-now-popup__additional-info-wrapper");
let additionalInfoInputField = document.querySelector(".book-now-popup__additional-info-input-field");
let customButton = document.querySelector(".custom");
let validationErrorMessage = document.querySelector(".book-now-popup__validation-error-message");
let bookingSuccessfulPopupWrapper = document.querySelector(".booking-successful-popup-wrapper");
let bookingSuccessfulPopupCloseButton = document.querySelector(".booking-successful-popup__close-button");
let viewInvoiceButton = document.querySelector(".booking-successful-popup__button");
let signupPopupWrapper = document.querySelector(".sign-up-popup-wrapper");
let signupPopupCloseButtonWrapper = document.querySelector(".sign-up-popup__close-button-wrapper");
let googleLoginButton = document.querySelector(".button-wrapper__login-button");
let loginFeedbackSnackbar = document.querySelector(".login-feedback-snackbar");
let productName = document.querySelector(".about-product-container-title").innerText;
let productPrice = Number(document.querySelector(".product-price").innerText);
let productImage = selectedProductImage.src;
let productDiscount = document.querySelector(".product-discount-percentage").textContent.match(/\d+/)[0];
let productDiscountedPrice = document.querySelector(".product-discounted-price").textContent;
let eventType; 
let dateDetailsArray = new Date().toDateString().split(" ");
let date = {
  day: dateDetailsArray[2],
  month: dateDetailsArray[1],
  year: dateDetailsArray[3]
};



//custom functions
function formatDateStringToDDMMYYYY(dateString) {
  let yyyymmdd = dateString;
  let day = yyyymmdd.slice(8, 10);
  let month = yyyymmdd.slice(5,7);
  let year = yyyymmdd.slice(0, 4);
  let ddmmyyyy = `${day}-${month}-${year}`;

  return ddmmyyyy;
}

function addContentToTimeFieldChildElements(...content) {
  let arrayOfChildElementsOfTimeField = [...bookNowPopupTimeField.children];
  let arrayOfContents = content;
  let indexOfCurrentChild;

  arrayOfChildElementsOfTimeField.forEach(child => {
    indexOfCurrentChild = arrayOfChildElementsOfTimeField.indexOf(child);
    child.textContent = arrayOfContents[indexOfCurrentChild];
  });
};

function extractTimeFieldContentAsAString() {
  let arrayOfChildElementsOfTimeField = [...bookNowPopupTimeField.children];
  let stringContent = "";

  arrayOfChildElementsOfTimeField.forEach(child => {
    stringContent += child.textContent 
  });
  
  return stringContent;
}

function animatingHeightOfValidationErrorMessage() {
  validationErrorMessage.style.height = "45px";
  setTimeout(function() {
    validationErrorMessage.style.height = "0px";
  }, 2000);
};

function checkTimePhoneNumberEventDateAddressValue() {
  let timeFieldValue = extractTimeFieldContentAsAString();
  let phoneNumberInputFieldValue = phoneNumberInputField.value;
  let userAddressInputFieldValue = userAddressInputField.value;
  let eventDateInputFieldValue = eventDateInputField.value;

  if (timeFieldValue) {
    if (phoneNumberInputFieldValue) {
      if (userAddressInputFieldValue) {
        if (eventDateInputFieldValue) {
          return true;
        }
      }
    }
  } 
  return false;
};

function signupPopupCloseButtonWrapperEventHandler(event) {
  animatingElementVisibility("invisible", signupPopupWrapper, "transform", "scaleX(0)");
};

function showLoginFeedbackSnackbar(loginResult) {
  if (loginResult === "successful") {
    changeElementTextContent(loginFeedbackSnackbar, "Login successful.");
    animatingElementVisibility("visible", loginFeedbackSnackbar, "top", "0%");
    changeClassnameOfAnElement(loginFeedbackSnackbar, "login-feedback-snackbar__failed", "login-feedback-snackbar__successful");
  } else if (loginResult === "failed") {
    changeElementTextContent(loginFeedbackSnackbar, "Login failed!");
    animatingElementVisibility("visible", loginFeedbackSnackbar, "top", "0%");    
    changeClassnameOfAnElement(loginFeedbackSnackbar, "login-feedback-snackbar__successful", "login-feedback-snackbar__failed");
  }
};

function hideLoginFeedbackSnackbar() {
  animatingElementVisibility("visible", loginFeedbackSnackbar, "top", "-100%");
  changeClassnameOfAnElement(loginFeedbackSnackbar, "visible", "invisible");
};

async function postRequestToServerOnBooking(data) {
  let requestURL = `${window.location.origin}/invoice-page`;
  let payload = data;
  let response = await fetch(requestURL, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  let jsonResponse = await response.json();

  if (jsonResponse.updateStatus === "success") {
    changeElementTextContent(bookNowButton, "Booked");
    changePointerEventsCSSProperty(bookNowButton, "none");
    changePointerEventsCSSProperty(eventTypeButton, "none");
    animatingElementVisibility("invisible", bookingSuccessfulPopupWrapper, "transform", "scaleY(1)");
    animatingElementVisibility("visible", userNavigation, "visibility", "visible");
    changeImgElementSourceAttribute(userNavigationImage, jsonResponse.userImage);
    changeElementTextContent(userNavigationEmail, jsonResponse.userEmail);
    viewInvoiceButton.addEventListener("click", function(event) {
      window.location.href = window.location.origin + jsonResponse.path;
    });
  }
};

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
  let statusCode;

  try {
    statusCode = response.status;

    if (response.status === 200 || response.status === 201) {
    return "success";
    } else {
      throw "failed";
    }
  } catch (err) {
    return err;
  }
};

async function googleLoginButtonEventHandler(event) {
  let userData = await signingInUser();
  let userRegistration;
  let userSelectedEventType = eventTypeButton.firstChild.textContent.trim();
  let payload = {
    username: "",
    email: "",
    "user-image": "",
    admin: ""
  }

  if (typeof userData === "object") {
    if (userData.success) {
      payload.username = userData.success._tokenResponse.fullName;
      payload["user-image"] = userData.success._tokenResponse.photoUrl;
      payload.email = userData.success._tokenResponse.email;
      payload.admin = false;

      userRegistration = await postRequestToServerOnLogin(payload);

      if (userRegistration === "success") {
        changeElementDisplayProperty(signupPopupWrapper, "none");
        changeClassnameOfAnElement(signupPopupWrapper, "visible", "invisible");
        animatingElementVisibility("visible", userNavigation, "visibility", "visible");
        changeImgElementSourceAttribute(userNavigationImage, payload["user-image"]);
        changeElementTextContent(userNavigationEmail, payload.email);
        showLoginFeedbackSnackbar("successful");
        setTimeout(function() {
          hideLoginFeedbackSnackbar();       
        }, 1500);
        
        if (userSelectedEventType !== "Event Type") {
          animatingElementVisibility("visible", bookNowPopupWrapper, "transform", "scaleX(1)");
        }
      }
    } else {
      showLoginFeedbackSnackbar("failed");
      setTimeout(function() {
        hideLoginFeedbackSnackbar();       
      }, 1500);
    }
  }
};


//event listeners
userNavigation.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isDownArrow = eventTarget.classList.contains("user-navigation__down-arrow-icon");
  let userNavigation;
  let dropDown;
  let isDropDownVisible;

  if (isDownArrow) {
    userNavigation = eventTarget.parentElement;
    dropDown = userNavigation.querySelector(".user-navigation__navigation-drop-down-wrapper");
    isDropDownVisible = dropDown.classList.contains("visible");

    if (isDropDownVisible) {
      animatingElementVisibility("invisible", dropDown, "transform", "scaleY(0)");
    } else {
      animatingElementVisibility("visible", dropDown, "transform", "scaleY(1)");
    }
  }
});

selectedProductImageRow.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isRowImageElement = eventTarget.localName === "img";

  if (isRowImageElement) {
    let sourceOfClickedRowImageElement = eventTarget.src;

    changeImgElementSourceAttribute(selectedProductImage, sourceOfClickedRowImageElement);
  }
});

phoneNumberFieldWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;

  if (eventTarget === phoneNumberFieldWrapper || eventTarget === phoneNumberInputField) {
    phoneNumberInputField.focus();
  }
});

bookNowPopupTimeField.addEventListener("click", function () {
  changeElementDisplayProperty(timepicker, "block")
  changeClassnameOfAnElement(timepicker, "invisible", "visible");
});

popupBookNowButton.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isValid = checkTimePhoneNumberEventDateAddressValue();
  let bookingData = {};
  let eventDate = formatDateStringToDDMMYYYY(eventDateInputField.value);

  eventType = eventTypeButton.firstChild.textContent;

  if (isValid) {
    bookingData = { 
      order: {
        productName,
        productPrice,
        productDiscount,
        discountedPrice: productDiscountedPrice,
        eventType,
        productImage,
        day: date.day,
        month: date.month,
        year: date.year,
        phoneNumber: phoneNumberInputField.value,
        time: timeFieldTimeValue.textContent + " " + timeFieldTimePeriodValue.textContent,
        ["event-date"]: eventDate,
        userAddress: userAddressInputField.value, 
        orderStatus: "Pending",
        additionalInfo: additionalInfoInputField.value
      }
    };

    animatingElementVisibility("invisible", bookNowPopupWrapper, "transform", "scaleX(0)");
    setEmptyValueToAnInputElementOrHtmlElement(phoneNumberInputField);
    setEmptyValueToAnInputElementOrHtmlElement(timeFieldTimeValue);
    setEmptyValueToAnInputElementOrHtmlElement(timeFieldTimePeriodValue);
    setEmptyValueToAnInputElementOrHtmlElement(userAddressInputField);
    setEmptyValueToAnInputElementOrHtmlElement(eventDateInputField);
    postRequestToServerOnBooking(bookingData);
  } else {
    animatingHeightOfValidationErrorMessage();
  }
});

customButton.addEventListener("click", function(event) {
  let isAdditionalInfoWrapperVisible = additionalInfoWrapper.classList.contains("visible");

  if (isAdditionalInfoWrapperVisible) {
    animatingElementVisibility("invisible", additionalInfoWrapper, "height", "0px");
    changeClassnameOfAnElement(customButton, "selected", "unselected")
    changeElementBackgroundColor(customButton, "white");
    changeElementTextColor(customButton, "var(--golden-color");
  } else {
    animatingElementVisibility("visible", additionalInfoWrapper, "height", "10rem");
    changeClassnameOfAnElement(customButton, "unselected", "selected")
    changeElementBackgroundColor(customButton, "var(--golden-color");
    changeElementTextColor(customButton, "white");
  }
});

bookNowButton.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let signupPopupWrapperDisplayProperty = signupPopupWrapper.style.display;
  let userSelectedEventType = eventTypeButton.firstChild.textContent.trim();

  if (checkCookie() === true) {
    if (userSelectedEventType !== "Event Type") {
      if (signupPopupWrapperDisplayProperty !== "none") {
        changeElementDisplayProperty(signupPopupWrapper, "none");
        changeClassnameOfAnElement(signupPopupWrapper, "visible", "invisible");
        animatingElementVisibility("visible", bookNowPopupWrapper, "transform", "scale(1)");
      } else {
      animatingElementVisibility("visible", bookNowPopupWrapper, "transform", "scale(1)");
      }
    } else {
      animatingElementVisibility("visible", eventTypeErrorMessage, "display", "block");
      setTimeout(function() {
      animatingElementVisibility("invisible", eventTypeErrorMessage, "display", "none");
      }, 1500);
    }
  } else {
    animatingElementVisibility("visible", signupPopupWrapper, "transform", "scaleX(1)");
    addingEventListener(signupPopupCloseButtonWrapper, "click", signupPopupCloseButtonWrapperEventHandler);
    addingEventListener(googleLoginButton, "click", googleLoginButtonEventHandler);  
  }
});

eventTypeButton.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let productButtonDropDownList = document.querySelector(".event-type-button__drop-down-list");
  let angleDownIcon = document.querySelector(".angle-down-icon");
  let isProductButtonDropDownListVisible = productButtonDropDownList.classList.contains("visible");
  let isDropDownListOption = eventTarget.classList.contains("event-type-button__drop-down-list-option");
  let userSelectedEventType;

  if (isProductButtonDropDownListVisible) {
    animatingElementVisibility("invisible", productButtonDropDownList, "transform", "scaleY(0)");
    animatingElementVisibility("rotated", angleDownIcon, "transform", "rotate(-90deg)");

    if (isDropDownListOption) {
      userSelectedEventType = eventTarget.textContent;

      eventTypeButton.childNodes[0].textContent = userSelectedEventType;
    }
  } else {
    animatingElementVisibility("visible", productButtonDropDownList, "transform", "scaleY(1)");
    animatingElementVisibility("unrotate", angleDownIcon, "transform", "rotate(0deg)");
  }  
});

bookNowPopupCloseButtonWrapper.addEventListener("click", function(event) {
  animatingElementVisibility("invisible", bookNowPopupWrapper, "transform", "scaleX(0)");
  setEmptyValueToAnInputElementOrHtmlElement(phoneNumberInputField);
  setEmptyValueToAnInputElementOrHtmlElement(timeFieldTimeValue);
  setEmptyValueToAnInputElementOrHtmlElement(timeFieldTimePeriodValue);
});

bookingSuccessfulPopupCloseButton.addEventListener("click", function(event) {
  animatingElementVisibility("visible", bookingSuccessfulPopupWrapper, "transform", "scaleX(0)");
});




//exports
export { addContentToTimeFieldChildElements }

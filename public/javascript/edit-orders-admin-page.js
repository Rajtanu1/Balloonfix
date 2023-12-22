import { signingInUser, signingOutUser } from "../javascript/firebase_google-signIn.js";
import { getStorage, ref, uploadString, getDownloadURL } from "../javascript/firebase_cloud-storage.js";

let orderStateToggleWrapper = document.querySelector(".edit-orders-wrapper__order-state-toggle-wrapper");
let orderStatePending = document.querySelector(".edit-orders-wrapper__order-state-pending");
let orderStateConfirmed = document.querySelector(".edit-orders-wrapper__order-state-confirmed");
let orderStatusWrapper = document.querySelector(".editable-order__order-status-wrapper");
let dropDownButton = document.querySelector(".drop-down-button");
let getOrderDetailsButton = document.querySelector(".get-order-details-button");
let adminLoginPopupWrapper = document.querySelector(".admin-login-popup-wrapper");
let googleLoginButton = document.querySelector(".google-login-button");
let accessUnauthorizedNotification = document.querySelector(".admin-login-popup__access-unauthorized-notification");
let productNameInput = document.querySelector(".product-upload__product-name-value");
let productDescriptionInput = document.querySelector(".product-upload__product-description-value");
let productPriceInput = document.querySelector(".product-upload__product-price-value");
let productDiscountInput = document.querySelector(".product-upload__product-discount-value");
let productImageChooseFileButton = document.querySelector(".product-upload__choose-image-button");
let productPrimaryImagePreview = document.querySelector(".product-upload__primary-image-preview");
let productAdditionalImageChooseFileButton = document.querySelector(".product-upload__choose-additional-image-button");
let arrayOfProductAdditionalImagePreview = [...document.querySelectorAll(".product-upload__additional-image-preview")];
let productDetailsUploadButton = document.querySelector(".product-upload__upload-button");
let insufficientProductDetails = document.querySelector(".notification__insufficient-product-details");
let deleteProductProductsWrapper = document.querySelector(".delete-product__products-wrapper");
let deleteProductGetOrdersButton = document.querySelector(".delete-product__button");
let productAvailabilityProductsWrapper = document.querySelector(".product-availability__products-wrapper")
let productAvailabilityGetOrdersButton = document.querySelector(".product-availability__button");
let bannerUploadButton = document.querySelector(".banner-upload__upload-button");
let bannerImageChooseFileButton = document.querySelector(".banner-upload__choose-image-button");
let bannerImagePreview = document.querySelector(".banner-upload__banner-image-preview");
let deleteBannerButton = document.querySelector(".delete-banner__button");
let deleteBannerUpdateNotification = document.querySelector(".delete-banner__update-notification");
let totalBannerImageNumber = document.querySelector(".delete-banner__total-banner-image-number");
let uploadNotification = document.querySelector(".upload-notification");
let uploadNotificationSuccessful = document.querySelector(".upload-notification__successful");
let uploadNotificationFailed = document.querySelector(".upload-notification__failed")
let uploadSpinnerWrapper = document.querySelector(".upload-spinner-wrapper");
let root = ReactDOM.createRoot(document.querySelector(".editable-order-list-wrapper"));
let productDetails = {
  "product-name": "",
  "product-description": "",
  "product-price": "",
  "product-discount": "",
  "product-availability": "available",
  primaryImage: "",
  additionalImages: []
};
let arrayOfDeleteProductTrashIcons;


//custom function
function changePreviewImageElementVisibility(visibilityType, previewImageElement) {
  let type = visibilityType; 

    if (type === "visible") {
      animatingElementVisibility("visible", previewImageElement, "bottom", "0px");
    } else {
      animatingElementVisibility("invisible", previewImageElement, "bottom", "-200px");
    }
};

function displayImageSelectedByAnUser(arrayOfImgElementsOrImgElement, arrayOfImageFilesOrImageFile) {
  let isAnArray = arrayOfImgElementsOrImgElement.length;

  if (isAnArray) {
    checkForPreviouslySelectedVisibleImagesInTheAdditionalImagePreviewWrapperAndHideThem();

    setTimeout(function() {
      arrayOfImageFilesOrImageFile.forEach((imgFile, index) => {
        arrayOfImgElementsOrImgElement[index].src = window.URL.createObjectURL(imgFile);
        changePreviewImageElementVisibility("visible", arrayOfImgElementsOrImgElement[index]);
      });
    }, 500);
  } else {
    changePreviewImageElementVisibility("invisible", arrayOfImgElementsOrImgElement);
    
    setTimeout(function() {
      arrayOfImgElementsOrImgElement.src = window.URL.createObjectURL(arrayOfImageFilesOrImageFile);
      changePreviewImageElementVisibility("visible", arrayOfImgElementsOrImgElement);
    }, 500);
  }
};

function checkForPreviouslySelectedVisibleImagesInTheAdditionalImagePreviewWrapperAndHideThem() {
  let arrayOfAdditionalImagePreviewElements = [...document.querySelectorAll(".product-upload__additional-image-preview")];

  arrayOfAdditionalImagePreviewElements.forEach(element => {
    let isVisible = element.classList.contains("visible");

    if (isVisible) {
      changePreviewImageElementVisibility("invisible", element);
    }
  });
};

function closeDropDownList(dropDownList) {
  changeClassnameOfAnElement(dropDownList, "visible", "invisible");
  animatingElementVisibility("invisible", dropDownList, "transform", "scaleY(0)");
};

function openDropDownList(dropDownList) {
  changeClassnameOfAnElement(dropDownList, "invisible", "visible");
  animatingElementVisibility("visible", dropDownList, "transform", "scaleY(1)");
};

function setEmptyStringsToProductDetailsObjectKeys() {
  for (let key in productDetails) {
    if (key === "additionalImages") {
      productDetails[key] = [];
    } else {
      productDetails[key] = "";
    }
  }
};

function changeTimeEditButtonTextContent(timeEditButtonElement, textContent) {
  let timeEditButton = timeEditButtonElement;
  let timeEditButtonTextContent = timeEditButton.querySelector(".time-edit-button__text-content");

  timeEditButtonTextContent.textContent = textContent;
};

function highlightSelectedTimePeriod(element) {
  let isAmTimePeriodElement = element.classList.contains("time-edit-field__time-period-am");
  let amTimePeriodElement;
  let pmTimePeriodElement;
  let selectedTimePeriod;

  if (isAmTimePeriodElement) {
    amTimePeriodElement = element;
    pmTimePeriodElement = amTimePeriodElement.parentElement.querySelector(".time-edit-field__time-period-pm");

    changeClassnameOfAnElement(amTimePeriodElement, "unselected", "selected");
    changeClassnameOfAnElement(pmTimePeriodElement, "selected", "unselected");
    changeElementTextColor(amTimePeriodElement, "var(--golden-color)");
    changeElementTextColor(pmTimePeriodElement, "inherit");

    selectedTimePeriod = amTimePeriodElement.textContent;
  } else {
    pmTimePeriodElement = element;
    amTimePeriodElement = pmTimePeriodElement.parentElement.querySelector(".time-edit-field__time-period-am");

    changeClassnameOfAnElement(pmTimePeriodElement, "unselected", "selected");
    changeClassnameOfAnElement(amTimePeriodElement, "selected", "unselected");
    changeElementTextColor(pmTimePeriodElement, "var(--golden-color)");
    changeElementTextColor(amTimePeriodElement, "inherit");

    selectedTimePeriod = pmTimePeriodElement.textContent;
  }
};

function findSelectedTimePeriodElement(amTimePeriodElement, pmTimePeriodElement) {
  let isAMTimePeriodSelected = amTimePeriodElement.classList.contains("selected");
  let isPMTimePeriodSelected = pmTimePeriodElement.classList.contains("selected");
  
  if(isAMTimePeriodSelected) {
    return amTimePeriodElement;
  } else if (isPMTimePeriodSelected) {
    return pmTimePeriodElement;
  }
};

function showTimeEditField(timeEditField) {
  let timeEditHourField = timeEditField.querySelector(".time-edit-field__hour-field");
  let timeEditMinuteField = timeEditField.querySelector(".time-edit-field__minute-field");

  changeClassnameOfAnElement(timeEditField, "invisible", "visible");
  changeElementDisplayProperty(timeEditField, "flex");
  setEmptyValueToAnInputElementOrHtmlElement(timeEditHourField);
  setEmptyValueToAnInputElementOrHtmlElement(timeEditMinuteField);
};

function hideTimeField(timeEditField) {
  let timeEditHourField = timeEditField.querySelector(".time-edit-field__hour-field");
  let timeEditMinuteField = timeEditField.querySelector(".time-edit-field__minute-field");

  changeClassnameOfAnElement(timeEditField, "visible", "invisible");
  changeElementDisplayProperty(timeEditField, "none");
  setEmptyValueToAnInputElementOrHtmlElement(timeEditHourField);
  setEmptyValueToAnInputElementOrHtmlElement(timeEditMinuteField);
}

function checkAndReturnValidTimeFieldValues(timeEditHourField, timeEditMinuteField) {
  let timeEditHourFieldValue = timeEditHourField.value;
  let timeEditMinuteFieldValue = timeEditMinuteField.value;
  let isValidHourField;
  let isValidMinuteField;
  let timeValueToReturn;

  if (timeEditHourFieldValue !== "" && timeEditHourFieldValue <= 12 && timeEditHourFieldValue >= 1) {
    isValidHourField = true;
    removeBorderFromAnElement(timeEditHourField);
  } else {
    addBorderToAnElement(timeEditHourField, "0.5px solid red");
  }

  if (timeEditMinuteFieldValue !== "" && timeEditMinuteFieldValue <= 59 && timeEditMinuteFieldValue >= 0) {
    isValidMinuteField = true;
    removeBorderFromAnElement(timeEditMinuteField);
  } else {
    addBorderToAnElement(timeEditMinuteField, "0.5px solid red");
  }

  if (isValidHourField === true && isValidMinuteField === true) {
    timeValueToReturn = timeEditHourField.value + ":" + timeEditMinuteField.value;
    
    return timeValueToReturn;
  }
};

function changeVisibilityOfOrderId(event) {
  let eventTarget = event.target;
  let orderId;
  
  if (eventTarget.classList.contains("editable-order__client-order-id")) {
    orderId = eventTarget.querySelector(".order-id");
 
    if (orderId.classList.contains("invisible")) {
      animatingElementVisibility("visible", orderId, "clipPath", "inset(0px 0px 0px 0px)");
    } else {
      animatingElementVisibility("invisible", orderId, "clipPath", "inset(0px 0px 0px 100%)");
    }
  }
};

function editOrderStatus(event) {
  let eventTarget = event.target;
  let isAButton = eventTarget.classList.contains("update-cancel-buttons__button");
  let parentElement; 
  let updateButton;
  let cancelButton;
  let editableOrder;
  let dropDownButton;
  let orderStatus;

  if (isAButton) {
    parentElement = eventTarget.parentElement;
    updateButton = parentElement.querySelector(".update-button");
    cancelButton = parentElement.querySelector(".cancel-button");
    editableOrder = parentElement.parentElement;
    dropDownButton = editableOrder.querySelector(".drop-down-button");
    orderStatus = dropDownButton.childNodes[0].textContent;

    if (eventTarget === updateButton && orderStatus === "Confirmed") {
      updateOrder(editableOrder);
    } else if (eventTarget === cancelButton) {
      animatingElementVisibility("invisible", parentElement, "height", "0px");
    }
  }
};

function eventListenerCallbackForPendingOrderWrapper(event) {
  let eventTarget = event.target;
  let isAPenIcon = eventTarget.classList.contains("time-edit-button__pen-icon");
  let isTimePeriodElement = eventTarget.classList.contains("time-edit-field__time-period");
  let isDoneButton = eventTarget.classList.contains("time-edit-field__done-button");
  let isDropDownButton = eventTarget.classList.contains("drop-down-button");
  let isSortDownIcon = eventTarget.classList.contains("fa-sort-down");
  let isDropDownListOption = eventTarget.classList.contains("drop-down-list-option");
  let selectedTimePeriod;
  let isDropDownListInvisible;
  let dropDownListToDisplay;
  let selectedTime;

  if (isAPenIcon) {
    let timeEditField = eventTarget.nextElementSibling;
    let isTimeEditFieldVisible = timeEditField.classList.contains("visible");

    if (isTimeEditFieldVisible === false) {
      showTimeEditField(timeEditField)
    } else {
      hideTimeField(timeEditField);
    }
  }

  if (isTimePeriodElement) {
    highlightSelectedTimePeriod(eventTarget);
  }
  
  if (isDoneButton) {
    let timeEditField = eventTarget.parentElement;
    let timeEditButton = timeEditField.parentElement;
    let timeEditHourField = timeEditField.querySelector(".time-edit-field__hour-field");
    let timeEditMinuteField = timeEditField.querySelector(".time-edit-field__minute-field");
    let amTimePeriodElement = timeEditField.querySelector(".time-edit-field__time-period-am");
    let pmTimePeriodElement = timeEditField.querySelector(".time-edit-field__time-period-pm");

    addingZeroBeforeASingleDigitNum(timeEditHourField);
    addingZeroBeforeASingleDigitNum(timeEditMinuteField);
    selectedTime = checkAndReturnValidTimeFieldValues(timeEditHourField, timeEditMinuteField);

    if (selectedTime) {
      selectedTimePeriod = findSelectedTimePeriodElement(amTimePeriodElement, pmTimePeriodElement).textContent;
      if (selectedTimePeriod) {
        changeTimeEditButtonTextContent(timeEditButton, selectedTime +  " " + selectedTimePeriod);
        changeClassnameOfAnElement(timeEditField, "visible", "invisible");
        changeElementDisplayProperty(timeEditField, "none");
      }
    }
  }

  if (isDropDownButton || isSortDownIcon) {
    dropDownListToDisplay = eventTarget.querySelector(".drop-down-list") || eventTarget.nextElementSibling;
    isDropDownListInvisible = dropDownListToDisplay.classList.contains("invisible");

    if (isDropDownListInvisible) {
      openDropDownList(dropDownListToDisplay);
    } else {
      closeDropDownList(dropDownListToDisplay);
    }
  }

  if (isDropDownListOption) {
    let dropDownList = eventTarget.parentElement;
    let dropDownButton = eventTarget.parentElement.parentElement;
    let editableOrder = dropDownButton.offsetParent;
    let updateCancelButton = editableOrder.querySelector(".update-cancel-buttons");
    let dropDownButtonTextNode = dropDownButton.firstChild;
    let textContentOfDropDownListOption;
  
    textContentOfDropDownListOption = eventTarget.textContent;
    closeDropDownList(dropDownList);
    changeElementTextContent(dropDownButtonTextNode, textContentOfDropDownListOption);
    animatingElementVisibility("visible", updateCancelButton, "height", "56px");
  }
}

async function getOrderDetailsOfUsers() {
  let response = await fetch("/get-order-details");
  let jsonResponse = await response.json();
  
  if (jsonResponse) {
    root.render([<ConfirmedOrderList arrayOfUsers={jsonResponse} />, <PendingOrderList arrayOfUsers={jsonResponse} />]);
  } 
};

async function updateOrder(order) {
  try {
    let editableOrder = order;
    let updateCancelButton = editableOrder.querySelector(".update-cancel-buttons");
    let updateFeedbackSnackbar = editableOrder.querySelector(".update-feedback-snackbar");
    let orderId = editableOrder.querySelector(".order-id").textContent;
    let time = editableOrder.querySelector(".time-edit-button__text-content").textContent;
    let eventDate = editableOrder.querySelector(".editable-order__client-event-date").lastChild.textContent;
    let orderStatus = editableOrder.querySelector(".drop-down-button").childNodes[0].textContent;
    let clientName = editableOrder.querySelector(".editable-order__client-name").lastChild.textContent;
    let clientEmail = editableOrder.querySelector(".editable-order__client-email").lastChild.textContent;
    let productName = editableOrder.querySelector(".editable-order__client-product-name").lastChild.textContent;
    let payload = {
      orderId,
      orderStatus,
      time,
      clientName, 
      clientEmail, 
      productName,
      eventDate,
    };

    let response = await fetch("/update-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    let jsonResponse = await response.json();

    if (jsonResponse) {
      showUpdateFeedbackSnackbar("successful", updateFeedbackSnackbar);

      setTimeout(function() {
        hideUpdateFeedbackSnackbar(updateFeedbackSnackbar); 
        animatingElementVisibility("invisible", updateCancelButton, "height", "0px");

        setTimeout(function() {
          getOrderDetailsOfUsers();
        }, 2500);
      }, 1500);
    }
  } catch(err) {
    let editableOrder = order;
    let updateFeedbackSnackbar = editableOrder.querySelector(".update-feedback-snackbar");
    let updateCancelButton = editableOrder.querySelector(".update-cancel-buttons");      

    showUpdateFeedbackSnackbar("failed", updateFeedbackSnackbar);
    setTimeout(function() {
      hideUpdateFeedbackSnackbar(updateFeedbackSnackbar); 
      animatingElementVisibility("invisible", updateCancelButton, "height", "0px");
    });
  }
};

function showUpdateFeedbackSnackbar(updateResult, updateFeedbackSnackbar) {
  if (updateResult === "successful") {
    changeElementTextContent(updateFeedbackSnackbar, "Order Updated");
    animatingElementVisibility("visible", updateFeedbackSnackbar, "top", "70%");
    changeClassnameOfAnElement(updateFeedbackSnackbar, "update-feedback-snackbar__failed", "update-feedback-snackbar__successful");
  } else if (updateResult === "failed") {
    changeElementTextContent(updateFeedbackSnackbar, "Failed");
    animatingElementVisibility("visible", updateFeedbackSnackbar, "top", "70%");    
    changeClassnameOfAnElement(updateFeedbackSnackbar, "update-feedback-snackbar__successful", "update-feedback-snackbar__failed");
  }
};

function hideUpdateFeedbackSnackbar(updateFeedbackSnackbar) {
  animatingElementVisibility("invisible", updateFeedbackSnackbar, "top", "-100%");
  changeClassnameOfAnElement(updateFeedbackSnackbar, "visible", "invisible");
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

  if (jsonResponse) {
     return "success";
  }
};

function checkProductDetailsForUpload() {
  let productDetailsElement = document.querySelector(".product-upload__product-details");
  let textTypeInputElements = productDetailsElement.querySelectorAll("input");
  let fileTypeInputElements = productDetailsElement.querySelectorAll("[type=file]");
  let numberTypeInputElements = productDetailsElement.querySelectorAll("[type=numnber]")
  let textFileAndNumberTypeInputElements = [...textTypeInputElements, ...fileTypeInputElements, ...numberTypeInputElements]

  try {
    textFileAndNumberTypeInputElements.forEach(input => {
      let type = input.type;
      let value = input.value;
      let inputName = input.name;

      if (type === "text" && value === "") {
        throw new Error();
      }

      if (type === "number" && value === "" && inputName === "product-price") {
        throw new Error();
      }

      if (type === "file" && inputName === "primary-image-button" && input.files.length === 0) {
        throw new Error();
      }

      if (type === "file" && inputName === "additional-image-button" && input.files.length === 0) {
        throw new Error();
      }
    });

    return true;
  } catch (error) {
    return false;
  }
};


async function uploadProductDetailsToTheServer(productData) {
  let requestPayload = { products: [productData] };
  let response = await fetch("/upload-product", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(requestPayload)
  });
  let jsonResponse = await response.json(); 

  if (jsonResponse) {
    setEmptyStringsToProductDetailsObjectKeys();
    animatingElementVisibility("visible", uploadNotification, "bottom", "0px");
    changeElementDisplayProperty(uploadNotificationSuccessful, "block");
    changeClassnameOfAnElement(uploadNotificationSuccessful, "invisible", "visible");
    changeElementDisplayProperty(uploadNotificationFailed, "none");
    changeClassnameOfAnElement(uploadNotificationFailed, "visible", "invisible");

    setTimeout(function() {
      changePreviewImageElementVisibility("invisible", productPrimaryImagePreview);
      arrayOfProductAdditionalImagePreview.forEach(element => changePreviewImageElementVisibility("invisible", element));
      animatingElementVisibility("invisible", uploadNotification, "bottom", "-100%");
      changeClassnameOfAnElement(uploadNotificationSuccessful, "visible", "invisible");
      changeElementDisplayProperty(uploadNotificationSuccessful, "none");
      setEmptyValueToAnInputElementOrHtmlElement(productNameInput);
      setEmptyValueToAnInputElementOrHtmlElement(productDescriptionInput);
      setEmptyValueToAnInputElementOrHtmlElement(productPriceInput);
      setEmptyValueToAnInputElementOrHtmlElement(productDiscountInput);
      setEmptyValueToAnInputElementOrHtmlElement(productAdditionalImageChooseFileButton);
      setEmptyValueToAnInputElementOrHtmlElement(productImageChooseFileButton);
      animatingElementVisibility("invisible", uploadSpinnerWrapper, "display", "none");
    }, 1500);
  } else {
    animatingElementVisibility("visible", uploadNotification, "bottom", "0px");
    changeElementDisplayProperty(uploadNotificationFailed, "block");
    changeClassnameOfAnElement(uploadNotificationFailed, "invisible", "visible");
    changeElementDisplayProperty(uploadNotificationSuccessful, "none");
    changeClassnameOfAnElement(uploadNotificationSuccessful, "visible", "invisible");
   
    setTimeout(function() {
      setEmptyStringToProductImageElementsSrcAttribute();
      animatingElementVisibility("invisible", uploadNotification, "bottom", "-100%");
      changeClassnameOfAnElement(uploadNotificationFailed, "visible", "invisible");
      changeElementDisplayProperty(uploadNotificationFailed, "none");
      setEmptyValueToAnInputElementOrHtmlElement(productNameInput);
      setEmptyValueToAnInputElementOrHtmlElement(productDescriptionInput);
      setEmptyValueToAnInputElementOrHtmlElement(productPriceInput);
      setEmptyValueToAnInputElementOrHtmlElement(productDiscountInput);
      animatingElementVisibility("invisible", uploadSpinnerWrapper, "display", "none");
    }, 1500);
  }
};


async function uploadBannerImageURLToServer(imageURL) {
  let requestPayload = { bannerImages: [imageURL]};
  let response = await fetch("/upload-banner-image", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(requestPayload)
  });
  let json = await response.json();  
  
  if (json) {
    animatingElementVisibility("visible", uploadNotification, "bottom", "0px");
    changeClassnameOfAnElement(uploadNotificationSuccessful, "invisible", "visible");
    changeElementDisplayProperty(uploadNotificationSuccessful, "block");
    changeClassnameOfAnElement(uploadNotificationFailed, "visible", "invisible");
    changeElementDisplayProperty(uploadNotificationFailed, "none");

    setTimeout(function() {
      changePreviewImageElementVisibility("invisible", bannerImagePreview);
      animatingElementVisibility("invisible", uploadNotification, "bottom", "-100%");
      changeClassnameOfAnElement(uploadNotificationSuccessful, "visible", "invisible");
      changeElementDisplayProperty(uploadNotificationSuccessful, "none");
      setEmptyValueToAnInputElementOrHtmlElement(bannerImageChooseFileButton);
      animatingElementVisibility("invisible", bannerImagePreview, "bottom", "-100%");
      animatingElementVisibility("invisible", uploadSpinnerWrapper, "display", "none");
    }, 1500);
  } else {
    animatingElementVisibility("visible", uploadNotification, "bottom", "0px");
    changeElementDisplayProperty(uploadNotificationFailed, "block");
    changeClassnameOfAnElement(uploadNotificationFailed, "invisible", "visible");
    changeElementDisplayProperty(uploadNotificationSuccessful, "none");
    changeClassnameOfAnElement(uploadNotificationSuccessful, "visible", "invisible");

    setTimeout(function() {
      animatingElementVisibility("invisible", uploadNotification, "bottom", "-100%");
      changeClassnameOfAnElement(uploadNotificationFailed, "visible", "invisible");
      changeElementDisplayProperty(uploadNotificationSuccessful, "none");
    }, 1500);
  }
};

function setBase64PrimaryImageOnProductDetailsObject(image) {
  //converting an image file to base64 string and adding the string to the primaryImage property of productDetails object.
  let imageFile = image;
  let reader = new FileReader();
  let base64Representation;
  
  reader.addEventListener("load", function(event) {
    base64Representation = reader.result.replace("data:", "").replace(/^.+,/,"");
    productDetails.primaryImage = base64Representation;
  });

  reader.readAsDataURL(imageFile);
};

function setBase64AdditionalImagesOnProductDetailsObject(image) {
  //converting an image file to base64 string and adding the string to the additionalImages array of productDetails object.
  let imageFile = image;
  let reader = new FileReader();
  let base64Representation;

  reader.readAsDataURL(imageFile);

  reader.addEventListener("load", function(event) {
    let lengthOfArrayOfAdditionalImages = productDetails.additionalImages.length;
    base64Representation = reader.result.replace("data:", "").replace(/^.+,/, "");
    
    if (lengthOfArrayOfAdditionalImages <= 3) {
      productDetails.additionalImages.push(base64Representation);
    } 
  });
}

function uploadBase64BannerImgStringToFirebaseCloudStorage(base64File) {
  let uniqueKey = "123" + Date.now();
  let firebaseStorageInstance = getStorage();
  let currentBannerImageRef = ref(firebaseStorageInstance, "banner-images/" + uniqueKey);
  let base64ImageFile = base64File;

  uploadString(currentBannerImageRef, base64ImageFile, "base64")
  .then(snapshot => {
    getDownloadURL(currentBannerImageRef)
    .then(imageURL => {
      uploadBannerImageURLToServer(imageURL);  
    });
  });
};

function uploadBase64StringOfProductAdditionalImagesToFirebaseCloudStorage() {
  let arrayOfBase64StringsOfAdditionalImages = productDetails.additionalImages;
  let firebaseStorageInstance = getStorage();
  let productName = productDetails["product-name"];
  let numberToMatch = arrayOfBase64StringsOfAdditionalImages.length-1;//excluding the first base64 string in the "additionalImages" array
  let numberOfImageURLsReceivedFromFirebaseCloudStorage = 0;
  
  arrayOfBase64StringsOfAdditionalImages.forEach((base64, index) => {
    let uniqueKey = "456" + Date.now();
    let productRef = ref(firebaseStorageInstance, `${productName}/additional-images/${uniqueKey}`);

    if (index === 0) {
      //the first element in the array has already been set to an image URL
    } else {
      uploadString(productRef, base64, "base64")
      .then(snapshot => {
        getDownloadURL(productRef)
        .then(imageURL => {
          productDetails.additionalImages[index] = imageURL;
          numberOfImageURLsReceivedFromFirebaseCloudStorage++;

          if (numberOfImageURLsReceivedFromFirebaseCloudStorage === numberToMatch) {
            uploadProductDetailsToTheServer(productDetails);
          }
        });
      });
    }
  })
};

function uploadBase64StringOfProductPrimaryImageToFirebaseCloudStorage() {
  let productName = productDetails["product-name"];
  let base64PrimaryImage = productDetails.primaryImage;
  let isAnURLLink = /https/.test(productDetails.primaryImage);
  let firebaseStorageInstance = getStorage();
  let productRef;

  if (isAnURLLink === false) {
    productRef = ref(firebaseStorageInstance, `${productName}/primary-image/`);

    uploadString(productRef, base64PrimaryImage, "base64")
    .then(snapshot => {
        getDownloadURL(productRef)
        .then(imageURL => {
          productDetails.primaryImage = imageURL;
          productDetails.additionalImages.unshift(imageURL); //setting primary image url as the first item in the additionalImages property of "productDetails" object
          // used a setTimeout to upload additional product images to firebase cloud storage
          setTimeout(function() { 
            uploadBase64StringOfProductAdditionalImagesToFirebaseCloudStorage()
          }, 1500);
        });
      });
  }
};

function setProductInfoOnProductDetailsObject() {
  let productDetailsElement = document.querySelector(".product-upload__product-details");
  let inputElements = [...productDetailsElement.querySelectorAll("input")];
  let productPrice;

  inputElements.forEach(input => {
    let type = input.type;

    if (type !== "file") {
      for (let key in productDetails) {
        if (productDetails.hasOwnProperty(input.name)) {
          productDetails[input.name] = input.value; 
        }
      }
    } 
  });

  return productDetails;
}

async function setProductAvailabilityWithAPostRequest(availabilityStatus, productNumber, productRow) {
  let response = await fetch("/set-product-availability", {
    method: "POST", 
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({productNumber, availabilityStatus})
  });
  let jsonResponse = await response.json();
  let changedAvailabilityLabel = productRow.querySelector(".product-availability__changed-availability-label");
  
  if (jsonResponse) {
    animatingElementVisibility("visible", changedAvailabilityLabel, "left", "0px");
    
    setTimeout(function() {
      productAvailabilityGetOrdersButton.click();
    }, 3000);
  }
};

async function getTotalNumberOfBannerImages() {
  let response = await fetch("/get-total-banner");
  let jsonResponse = await response.json(); 

  if (jsonResponse) {
    totalBannerImageNumber.textContent = `Total banner images: ${jsonResponse.totalBannerImages}`;
  }
};

async function deleteABannerImage(bannerImageNumber) {
  let enterBannerNumberInputField = document.querySelector(".delete-banner__enter-banner-number-input-field");
  let totalBannerImagesAvailable = Number(totalBannerImageNumber.textContent.match(/\d+/).join(""));
  let imageNumber;

  if (bannerImageNumber >= 1 && bannerImageNumber <= totalBannerImagesAvailable) {
    imageNumber = bannerImageNumber - 1;

    console.log(imageNumber)
    let response = await fetch("/delete-banner", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ imageNumber: imageNumber })
    });
    let jsonResponse = await response.json(); 

    if (jsonResponse) {
      console.log(jsonResponse)
      changeElementTextContent(deleteBannerUpdateNotification, "Deleted successfully.")
      animatingElementVisibility("visible", deleteBannerUpdateNotification, "bottom", "0px");
      setEmptyValueToAnInputElementOrHtmlElement(enterBannerNumberInputField);

      setTimeout(function() {
        animatingElementVisibility("invisible", deleteBannerUpdateNotification, "bottom", "-200px");
        getTotalNumberOfBannerImages();
      }, 1500);
    }
  } else {
    changeElementTextContent(deleteBannerUpdateNotification, "Select a valid number.");
    changeElementBackgroundColor(deleteBannerUpdateNotification, "var(--red-color)");
    animatingElementVisibility("visible", deleteBannerUpdateNotification, "bottom", "0px");

    setTimeout(function() {
      animatingElementVisibility("invisible", deleteBannerUpdateNotification, "bottom", "-200px");
    }, 1500);
  }
};


//functional react components
function ConfirmedOrderList(props) {
  let elementsToDisplay = [];
  let isConfirmedStateSelected = orderStateConfirmed.classList.contains("selected");

  props.arrayOfUsers.forEach(user => {
    let arrayOfUserOrders;
    let username = user.username;
    let userEmail = user.email;

    arrayOfUserOrders = user.orders.map((order, index) => {
      if (order.orderStatus === "Confirmed") {
        return (
          <ConfirmedOrderWrapper username={username} userEmail={userEmail} orderDetails={order} key={index}/>
        );
      }
    });

    elementsToDisplay.push(arrayOfUserOrders);
  });

  if (isConfirmedStateSelected) {
    return (
      <div className="edit-orders-wrapper__confirmed-order-list confirmed-order-list visible" style={{display: "flex"}}>
        {elementsToDisplay}
      </div> 
    ); 
  } else {
    return (
      <div className="edit-orders-wrapper__confirmed-order-list confirmed-order-list invisible" style={{display: "none"}}>
        {elementsToDisplay}
      </div>
    );
  }
};

function ConfirmedOrderWrapper(props) {
    return (
      <div className="confirmed-order-list__confirmed-order-wrapper confirm-order-wrapper">
        <ConfirmedOrder username={props.username} email={props.userEmail} orderData={props.orderDetails}/>
      </div>
    ); 
};

function ConfirmedOrder(props) {
  return (
    <div className="confirmed-order-list__confirmed-order confirmed-order">
      <div className="confirmed-order__date">Booked on:&nbsp;
        {`${props.orderData.day} of ${props.orderData.month}, ${props.orderData.year}`}&nbsp;&nbsp;
        <i className="fa-solid fa-calendar-days"></i>
      </div>
      <div className="confirmed-order__client-details">
        <div className="confirmed-order__client-name">
          <i className="fa-solid fa-user client-icon"></i>&nbsp;
          {props.username}
        </div> 
        <div className="confirmed-order__client-mobile-number">
          <i className="fa-solid fa-phone"></i>&nbsp;&nbsp;
          {props.orderData.phoneNumber}
        </div>
        <div className="confirmed-order__client-email">
          <i className="fa-solid fa-envelope"></i>&nbsp;
          {props.email}
        </div>
        <div className = "confirmed-order__client-address">
          <i className="fa-solid fa-location-dot"></i>&nbsp;
          {props.orderData.userAddress}
        </div>
        <div className="confirmed-order__client-product-name">
          <i className="fa-solid fa-box-open"></i>
          {props.orderData.productName}
        </div>
        <div className="confirmed-order__client-event-type">
          <i className="fa-solid fa-cake-candles"></i>&nbsp;
          {props.orderData.eventType}
        </div>
        <div className="confirmed-order__client-event-date">
          <i className="fa-solid fa-calendar-days confirmed-order__calendar-icon"></i>
          {props.orderData["event-date"]}
        </div>
        <div className="confirmed-order__client-additional-info">
          <i className="fa-solid fa-circle-info"></i>&nbsp;
          <u>Additional-info:</u>
          <br></br>
          <span style={{color: "var(--golden-color)"}}>{props.orderData.additionalInfo}</span>
        </div>
      </div>
      <div className="confirmed-order__time">
        <div className="confirmed-order__time-text">
          TIME:
        </div>
        <div className="confirmed-order__time-button time-button">
          <i className="fa-solid fa-clock time-button__clock-icon"></i>
          <span className="time-button__text-content">{props.orderData.time}</span>
        </div>
      </div>
      <div className="confirmed-order__order-status-wrapper">
        <div className="confirmed-order__order-status-text">
          STATUS:
        </div>
        <div className="confirmed-order__order-status-button">
          {props.orderData.orderStatus}
        </div>
      </div>
    </div>
  );
};

function PendingOrderList(props) {
  let elementsToDisplay = [];
  let isPendingStateSelected = orderStatePending.classList.contains("selected");

  props.arrayOfUsers.forEach(user => {
    let arrayOfUserOrders;
    let username = user.username;
    let userEmail = user.email;
    let orderId;

    arrayOfUserOrders = user.orders.map((order, index) => {
      if (order.orderStatus === "Pending") {
        orderId = order._id;

        return (
          <PendingOrderWrapper orderId={orderId} username={username} userEmail={userEmail} orderDetails={order} key={index} eventHandler={eventListenerCallbackForPendingOrderWrapper} editOrderStatus={editOrderStatus}/>
        );
      }
    });

    elementsToDisplay.push(arrayOfUserOrders);
  });

  if (isPendingStateSelected) {
    return (
      <div className="edit-orders-wrapper__editable-order-list editable-order-list editable-pending-order-list visible" style={{display: "flex"}}>
        {elementsToDisplay}
      </div>
    );
  } else {
    return (
      <div className="edit-orders-wrapper__editable-order-list editable-order-list editable-pending-order-list invisible" style={{display: "none"}}>
        {elementsToDisplay}
      </div>
    );
  }
};

function PendingOrderWrapper(props) {
  return (
    <div className="editable-order-list__editable-order-wrapper pending-order-wrapper visible">
      <EditableOrder orderId={props.orderId} username={props.username} email={props.userEmail} orderData={props.orderDetails} editOrderFunction={props.eventHandler} editOrderStatus={props.editOrderStatus} changeVisibility={changeVisibilityOfOrderId} updateOrder={updateOrder}/>
    </div>
  );
};

function EditableOrder(props) {
  return (
    <div className="editable-order-list__editable-order editable-order" onClick={props.editOrderFunction} >
      <div className="editable-order__update-feedback-snackbar update-feedback-snackbar"></div>
      <div className="editable-order__date">Booked on:&nbsp;
      {`${props.orderData.day} of ${props.orderData.month}, ${props.orderData.year}`}&nbsp;&nbsp;
        <i className="fa-solid fa-calendar-days"></i>
      </div>
      <div className="editable-order__client-details">
        <div className="editable-order__client-order-id" onMouseEnter={props.changeVisibility} onMouseLeave={props.changeVisibility}>
          Order ID&nbsp;
          <i className="fa-solid fa-circle-info order-id-info-icon"></i> 
          <span className="order-id invisible">
            {props.orderId}
          </span>
        </div>
        <div className="editable-order__client-name">
          <i className="fa-solid fa-user client-icon"></i>&nbsp;
          {props.username}
        </div>
        <div className="editable-order__client-email">
          <i className="fa-solid fa-envelope"></i>&nbsp;
          {props.email}
        </div>
        <div className="editable-order__client-mobile-number">
          <i className="fa-solid fa-phone"></i>&nbsp;&nbsp;
          {props.orderData.phoneNumber}
        </div>
        <div className="editable-order__client-address">
          <i className="fa-solid fa-location-dot"></i>&nbsp;
          {props.orderData.userAddress}
        </div>
        <div className="editable-order__client-product-name">
          <i className="fa-solid fa-box-open"></i>
          {props.orderData.productName}
        </div>
        <div className="editable-order__client-event-type">
          <i className="fa-solid fa-cake-candles"></i>&nbsp;
          {props.orderData.eventType}
        </div>
        <div className="editable-order__client-event-date">
          <i className="fa-solid fa-calendar-days editable-order__calendar-icon"></i>&nbsp;
          {props.orderData["event-date"]}
        </div>
        <div className="editable-order__client-additional-info">
          <i className="fa-solid fa-circle-info"></i>&nbsp;&nbsp;
          <u>Additional-info:</u>
          <br></br>
          <span style={{color: "var(--golden-color)"}}>{props.orderData.additionalInfo}</span>
        </div>
      </div>
      <div className="editable-order__time">
        <div className="editable-order__time-text">
          TIME:
        </div>
        <div className="editable-order__time-edit-button time-edit-button">
          <i className="fa-solid fa-clock time-edit-button__clock-icon"></i>
          <span className="time-edit-button__text-content">{props.orderData.time}</span>
          <i className="fa-solid fa-pen time-edit-button__pen-icon"></i>
          <div className="time-edit-field">
            <input className="time-edit-field__hour-field" type="text" maxLength="2" name="hour-field" placeholder="--"/>
            <span className="time-edit-field__separator">:</span>
            <input className="time-edit-field__minute-field" type="text" maxLength="2" name="minute-field" placeholder="--"/>
            <div className="time-edit-field__time-period-wrapper">
              <div className="time-edit-field__time-period time-edit-field__time-period-am selected">AM</div>
              <div className="time-edit-field__time-period time-edit-field__time-period-pm unselected">PM</div>
            </div>
            <div className="time-edit-field__done-button">
              Done
            </div>
          </div>
        </div>
      </div>
      <div className="editable-order__order-status-wrapper">
        <div className="editable-order__order-status-text">
          STATUS:
        </div>
        <div className="drop-down-button">
          {props.orderData.orderStatus}
          <i className="fa-solid fa-sort-down"></i>
          <div className="drop-down-button__drop-down-list drop-down-list pending-order-drop-down-list invisible">
            <span className="drop-down-list__confirmed drop-down-list-option">Confirmed</span>
            <span className="drop-down-list__pending drop-down-list-option">Pending</span>
          </div>
        </div>
      </div>
      <div className="update-cancel-buttons invisible" onClick={props.editOrderStatus}>
        <div className="update-cancel-buttons__button update-button">Update</div>
        <div className="update-cancel-buttons__button cancel-button">Cancel</div>
      </div>
    </div>
  );
};



//event listeners
getOrderDetailsButton.addEventListener("click", function(event) {
  getOrderDetailsOfUsers();
});

googleLoginButton.addEventListener("click",async function(event) {
  let userData = await signingInUser();
  let userRegistration;
  let payload = {
    username: "",
    email: "",
    "user-image": "",
    admin: ""
  }

  if (typeof userData === "object") {
    if (userData.success) {
      if (userData.success._tokenResponse.email) {
        payload.username = userData.success._tokenResponse.fullName;
        payload["user-image"] = userData.success._tokenResponse.photoUrl;
        payload.email = userData.success._tokenResponse.email;
        payload.admin = true;
  
        userRegistration = await postRequestToServerOnLogin(payload);
  
        if (userRegistration === "success") {
          animatingElementVisibility("invisible", adminLoginPopupWrapper, "transform", "scaleX(0)");
        }
      }  else {
        animatingElementVisibility("visible", accessUnauthorizedNotification, "bottom", "20%");

        setTimeout(function() {
          animatingElementVisibility("invisible", accessUnauthorizedNotification, "bottom", "-100%");
        }, 2500);
      }   
    } 
  }
});

orderStateToggleWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isASelectedChild = event.target.classList.contains("selected");
  let confirmedOrderList = document.querySelector(".confirmed-order-list");
  let pendingOrderList = document.querySelector(".editable-pending-order-list");


  if (eventTarget === orderStatePending && isASelectedChild === false) {
    changeClassnameOfAnElement(orderStatePending, "unselected", "selected");
    changeElementBackgroundColor(orderStatePending, "var(--golden-color)");
    changeElementTextColor(orderStatePending, "black");
    changeClassnameOfAnElement(orderStateConfirmed, "selected", "unselected");
    changeElementBackgroundColor(orderStateConfirmed, "transparent");
    changeElementTextColor(orderStateConfirmed, "white"); 

    if (confirmedOrderList) {
      changeElementDisplayProperty(confirmedOrderList, "none");
      changeClassnameOfAnElement(confirmedOrderList, "visible", "invisible");
      changeElementDisplayProperty(pendingOrderList, "flex"); 
      changeClassnameOfAnElement(pendingOrderList, "invisible", "visible");
    }
  } else if (eventTarget === orderStateConfirmed && isASelectedChild === false) {
    changeClassnameOfAnElement(orderStateConfirmed, "unselected", "selected");
    changeElementBackgroundColor(orderStateConfirmed, "var(--golden-color)");
    changeElementTextColor(orderStateConfirmed, "black");
    changeClassnameOfAnElement(orderStatePending, "selected", "unselected");
    changeElementBackgroundColor(orderStatePending, "transparent");
    changeElementTextColor(orderStatePending, "white");
   
    if (pendingOrderList) {
      changeElementDisplayProperty(pendingOrderList, "none");
      changeClassnameOfAnElement(pendingOrderList, "visible", "invisible");
      changeElementDisplayProperty(confirmedOrderList, "flex");
      changeClassnameOfAnElement(confirmedOrderList, "invisible", "visible");
    }
  }
});

productImageChooseFileButton.addEventListener("change", function(event) {
  let eventTarget = event.target;
  let imageFile = eventTarget.files[0];
  let primaryImageWrapper = eventTarget.parentElement;
  let previewImageElement = primaryImageWrapper.querySelector(".image-preview");

  displayImageSelectedByAnUser(previewImageElement, imageFile);
  setBase64PrimaryImageOnProductDetailsObject(imageFile);
});

productAdditionalImageChooseFileButton.addEventListener("change", function(event) {
  let eventTarget = event.target;
  let additionalImageWrapper = eventTarget.parentElement;
  let numberOfAdditionalImagesSelectedByUser = eventTarget.files.length;
  let arrayOfImageFiles = Array.from(eventTarget.files);
  let imagePreviewElements = additionalImageWrapper.querySelectorAll(".image-preview");

  //removing any existing image data from "additionalImages" property of "productDetails" object
  if (productDetails.additionalImages.length) {
    productDetails.additionalImages = [];
  }

  if (numberOfAdditionalImagesSelectedByUser) { 

    if (arrayOfImageFiles.length > 3) {
      arrayOfImageFiles.length = 3//reducing the length of arrayOfImageFiles to 3

      displayImageSelectedByAnUser(imagePreviewElements, arrayOfImageFiles);
      arrayOfImageFiles.forEach((image, index) => {      
        setBase64AdditionalImagesOnProductDetailsObject(image);
      });
    } else {
      displayImageSelectedByAnUser(imagePreviewElements, arrayOfImageFiles);
      arrayOfImageFiles.forEach((image, index) => {      
        setBase64AdditionalImagesOnProductDetailsObject(image);
      });
    }
  }
});

bannerImageChooseFileButton.addEventListener("change", function(event) {
  let eventTarget = event.target;
  let bannerUploadElement = eventTarget.parentElement;
  let imageFile = eventTarget.files[0];
  let previewImageElement = bannerUploadElement.querySelector(".image-preview");

  displayImageSelectedByAnUser(previewImageElement, imageFile);  
});

productDetailsUploadButton.addEventListener("click", async function(event) {
  let isRequiredDetailsProvided = checkProductDetailsForUpload();
  
  if (isRequiredDetailsProvided) {
    productDetails = setProductInfoOnProductDetailsObject();

    animatingElementVisibility("visible", uploadSpinnerWrapper, "display", "block");
    uploadBase64StringOfProductPrimaryImageToFirebaseCloudStorage();
  } else {
    animatingElementVisibility("visible", insufficientProductDetails, "bottom", "0px");

    setTimeout(function() {
      animatingElementVisibility("invisible", insufficientProductDetails, "bottom", "-100px");
      animatingElementVisibility("invisible", uploadSpinnerWrapper, "display", "none");
    }, 1500);
  }
});

deleteProductGetOrdersButton.addEventListener("click", async function(event) {
  let response = await fetch("/get-products");
  let jsonResponse = await response.json();
  let deleteProductsWrapperIsNotEmpty = deleteProductProductsWrapper !== "";

  if (deleteProductsWrapperIsNotEmpty) {
    deleteProductProductsWrapper.innerHTML = "";
  }
  
  if (jsonResponse) {
    let productsArray = jsonResponse;

      productsArray.forEach((product, index) => {
        let htmlStringToAppend = `<div class="delete-product__product-row"><div class="delete-product__delete-label">Deleted</div><div class="delete-product__product-name"><span class="product-number">${index}</span>${product["product-name"]}</div><i class="fa-solid fa-trash delete-product-trash-icon"></i></div>`;

        deleteProductProductsWrapper.insertAdjacentHTML("beforeend", htmlStringToAppend);
      });
  }
});

productAvailabilityGetOrdersButton.addEventListener("click", async function(event) {
  let response = await fetch("/get-products");
  let jsonResponse = await response.json();
  let isProductAvailabilityProductsWrapperElementEmpty = productAvailabilityProductsWrapper.innerHTML !== "";
  
  if (isProductAvailabilityProductsWrapperElementEmpty) {
    productAvailabilityProductsWrapper.innerHTML = "";
  }

  if (jsonResponse) {
    let productsArray = jsonResponse;
    
      productsArray.forEach((product, index) => {
        let htmlStringToAppend =  `<div class="product-availability__product-row"><div class="product-availability__changed-availability-label">Availability changed.</div><div class="product-availability__product-name"><span class="product-number">${index}</span>${product["product-name"]} is ${product["product-availability"]}.</div><div class="product-availability__available-unavailable-buttons-wrapper"><div class="product-availability__button available-button">available</div><div class="product-availability__button unavailable-button">unavailable</div></div></div></div>`;

        productAvailabilityProductsWrapper.insertAdjacentHTML("beforeend", htmlStringToAppend); 
      });
  }
});

deleteProductProductsWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isATrashIcon = eventTarget.classList.contains("delete-product-trash-icon");
  let deleteProductRow;
  let deleteLabel;
  let productNumber;

  if (isATrashIcon) {
    deleteProductRow = eventTarget.parentElement;
    deleteLabel = deleteProductRow.querySelector(".delete-product__delete-label");
    productNumber = deleteProductRow.querySelector(".delete-product__product-name").querySelector(".product-number").textContent;

    deleteAProduct(productNumber);

    async function deleteAProduct(productNum) {
      let response = await fetch("/delete-product", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        }, 
        body: JSON.stringify({
          productNumber: productNum
        })
      });
      let jsonResponse = await response.json();

      if (jsonResponse) {
        animatingElementVisibility("visible", deleteLabel, "left", "0px");
        setTimeout(function () {
          deleteProductGetOrdersButton.click();
        }, 1500);
      }
    };
  };
});


productAvailabilityProductsWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isEventTargetAButton = eventTarget.classList.contains("product-availability__button");
  let productRow;
  let productNumber;
  let availabilityStatus;

  if (isEventTargetAButton) {
    productRow = eventTarget.parentElement.parentElement;
    productNumber = productRow.querySelector(".product-availability__product-name").querySelector(".product-number").textContent;
    availabilityStatus = eventTarget.textContent;

    setProductAvailabilityWithAPostRequest(availabilityStatus, productNumber, productRow);
  }
});



bannerUploadButton.addEventListener("click", function(event) {
  let input = bannerImageChooseFileButton;
  let imageFile = input.files[0];
  let fileReader = new FileReader();

  if (imageFile) {
    animatingElementVisibility("visible", uploadSpinnerWrapper, "display", "block");
    fileReader.readAsDataURL(imageFile);
  
    fileReader.addEventListener("load", function(event) {
      let base64 = fileReader.result.replace("data:", "").replace(/^.+,/, "");
  
      uploadBase64BannerImgStringToFirebaseCloudStorage(base64);
    });
  }
});

deleteBannerButton.addEventListener("click", function(event) {
  let eventTarget = event.target;
  let isDeleteBannerButton = event.target.classList.contains("delete-banner__button");
  let enterBannerNumberInputField = document.querySelector(".delete-banner__enter-banner-number-input-field");
  let isABannerNumber = Number(enterBannerNumberInputField.value);

  if (isDeleteBannerButton) {
    deleteABannerImage(isABannerNumber);
  }
});


//fetching order details from the database to display
getOrderDetailsButton.click();
getTotalNumberOfBannerImages();



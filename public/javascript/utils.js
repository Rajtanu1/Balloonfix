function changeElementTextContent(element, textContent) {
  element.textContent = textContent;
};

function changeElementTextColor(element, color) {
  element.style.color = color;
};

function changeElementBackgroundColor(element, backgroundColor) {
  element.style.backgroundColor = backgroundColor;
};

function changeElementDisplayProperty(element, displayType) {
  element.style.display = displayType;
}

function changeClassnameOfAnElement(element, classnameToRemove, classnameToAdd) {
  element.classList.remove(classnameToRemove);
  element.classList.add(classnameToAdd);
};

function addBorderToAnElement(element, borderPropertyValue) {
  element.style.border = borderPropertyValue;
};

function removeBorderFromAnElement(element) {
  element.style.border = "none";
};

function addingZeroBeforeASingleDigitNum(element) {
  let elementValue = element.value;
  let isASingleDigitNumber = /^[0-9]$/.test(elementValue);

  if (isASingleDigitNumber) {
    element.value = 0 + elementValue;
  }
};

function animatingElementVisibility(visibilityState, element, styleProperty, stylePropertyValue) {
  if (visibilityState === "visible") {
    element.classList.add(visibilityState);
    element.classList.remove("invisible");
  } else {
    element.classList.remove("visible");
    element.classList.add(visibilityState);
  }

  element.style[styleProperty] = stylePropertyValue;
};

function changeImgElementSourceAttribute(imgElement, source) {
  let isImgElement = imgElement.localName === "img";

  if (isImgElement) {
    imgElement.src = source;
  }
}	

function movingElementOnHorizontalAxisUsingTranslateCSSProperty(element, translateXValue) {
  element.style.transform = `translateX(${translateXValue}px)`;
};

function setEmptyValueToAnInputElementOrHtmlElement(element) {
  let isInputElement = element.localName === "input";

  if (isInputElement) {
    element.value = "";
  } else {
    element.textContent = "";
  }
};

function addingEventListener(elementOrArrayOfElements, eventType, eventListenerCallback) {
  let isAnArray = elementOrArrayOfElements.length !== undefined;
 
  if (isAnArray) {
    elementOrArrayOfElements.forEach(element => {
      element.addEventListener(eventType, eventListenerCallback);
    });
  } else {
    elementOrArrayOfElements.addEventListener(eventType, eventListenerCallback);   
  }
};

function checkCookie() {
  let isCookieAvailable = document.cookie;
  
  if (isCookieAvailable) {
    return true;
  } else {
    return false;
  }
};

function changePointerEventsCSSProperty(element, propertyValue) {
  element.style.pointerEvents = "none";
};
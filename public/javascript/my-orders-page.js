let orderCardsWrapper = document.querySelector(".order-cards-wrapper");
let arrayOfOrderCards = [...orderCardsWrapper.children];
let userNavigation = document.querySelector(".user-navigation");

//custom functions
function serverRequestUsingQueryStringForOrderInvoice(event) {
  let eventTarget = event.target;
  let isAnArrowIcon = eventTarget.classList.contains("right-arrow-icon");
  let orderCard;
  let orderId;
  let queryStringObject = {};
  let queryString;

  if (isAnArrowIcon) {
    orderCard = eventTarget.parentElement.parentElement.parentElement;
    orderId = orderCard.querySelector(".order-card__orderId").dataset.orderid;
    queryStringObject.orderId = orderId;
    queryString = new URLSearchParams(queryStringObject)

    window.location.href = window.location.origin + "/invoice-page" + "?" + queryString;
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

addingEventListener(arrayOfOrderCards, "click", serverRequestUsingQueryStringForOrderInvoice);
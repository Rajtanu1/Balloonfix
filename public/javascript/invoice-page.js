let userNavigation = document.querySelector(".user-navigation");


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
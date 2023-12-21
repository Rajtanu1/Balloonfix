let timepicker = document.querySelector(".time-picker");
let timePeriodWrapper = document.querySelector(".time-picker__time-period-wrapper");
let timePeriodAM = document.querySelector(".time-picker__time-period-am");
let timePeriodPM = document.querySelector(".time-picker__time-period-pm");
let timepickerCancelButton = document.querySelector(".time-picker__cancel-button");
let timepickerOkButton = document.querySelector(".time-picker__ok-button");
let timepickerValidationMessage = document.querySelector(".time-picker__validation-message");



//custom functions
function findUserSelectedTimePeriod() {
  let userSelectedTimePeriod;
  let arrayOfTimePeriodWrapperChildElements = [...timePeriodWrapper.children];

  arrayOfTimePeriodWrapperChildElements.forEach(child => {
    let hasSelectedClassName = child.classList.contains("selected");

    if (hasSelectedClassName) {
      userSelectedTimePeriod = child.textContent;
    }

    return ;
  });
  
  return userSelectedTimePeriod;
};

function findValueOfHourColumn() {
  let timePickerHourColumn = document.querySelector(".time-picker__hour-column");
  let topBorderDistanceOfHourColumnfromViewport = Math.trunc(timePickerHourColumn.getBoundingClientRect().top); //removing the decimal part from the value by using Math.trunc();
  let arrayOfHourColumnNumbers = [...timePickerHourColumn.children];
  let userSelectedHour;

  arrayOfHourColumnNumbers.forEach((number) => {
    let topBorderDistanceOfHourColumnNumberFromViewport = Math.trunc(number.getBoundingClientRect().top);// removing the decimal part from the value by using Math.trunc() method

    if (topBorderDistanceOfHourColumnfromViewport === topBorderDistanceOfHourColumnNumberFromViewport) {
      userSelectedHour = number.textContent;

      return
    };
  });

  return userSelectedHour;
};

function findValueOfMinuteColumn() {
  let timePickerMinuteColumn = document.querySelector(".time-picker__minute-column");
  let topBorderDistanceOfMinuteColumnfromViewport = Math.trunc(timePickerMinuteColumn.getBoundingClientRect().top);//removing the decimal part from the value by using Math.trunc();
  let arrayOfMinuteColumnNumbers = [...timePickerMinuteColumn.children];
  let userSelectedMinute;

  arrayOfMinuteColumnNumbers.forEach(number => {
    let topBorderDistanceOfMinuteColumnNumberfromViewport = Math.trunc(number.getBoundingClientRect().top);//removing the decimal part from the value by using Math.trunc();

    if (topBorderDistanceOfMinuteColumnfromViewport === topBorderDistanceOfMinuteColumnNumberfromViewport) {
      userSelectedMinute = number.textContent;

      return;
    };
  });

  return userSelectedMinute;
};



//event listeners
timePeriodWrapper.addEventListener("click", function(event) {
  let eventTarget = event.target;

  if (eventTarget === timePeriodPM) {
    changeClassnameOfAnElement(timePeriodPM, "unselected", "selected");
    changeClassnameOfAnElement(timePeriodAM, "selected", "unselected");
    timePeriodPM.style.backgroundColor = "orange";
    timePeriodAM.style.backgroundColor = "transparent";
  } else {
    changeClassnameOfAnElement(timePeriodAM, "unselected", "selected");
    changeClassnameOfAnElement(timePeriodPM, "selected", "unselected");
    timePeriodAM.style.backgroundColor = "orange";
    timePeriodPM.style.backgroundColor = "transparent";
  }
});

timepickerCancelButton.addEventListener("click", function () {
  changeElementDisplayProperty(timepicker, "none")
  changeClassnameOfAnElement(timepicker, "visible", "invisible");
  
});

timepickerOkButton.addEventListener("click", function () {
  // let userSelectedHour = document.querySelector(".time-field__hour").textContent;
  let timePeriod = document.querySelector(".time-field__time-period"); 
  let timeFieldMinute = document.querySelector(".time-field__min");
  let timeFieldHour = document.querySelector(".time-field__hour");
  let userSelectedHour = findValueOfHourColumn();
  let userSelectedMinute = findValueOfMinuteColumn();
  let userSelectedTimePeriod = findUserSelectedTimePeriod();

  if (userSelectedHour !== "00") {
    changeElementDisplayProperty(timepicker, "none")
    changeClassnameOfAnElement(timepicker, "visible", "invisible");
    changeElementTextContent(timePeriod, userSelectedTimePeriod);
    changeElementTextContent(timeFieldMinute, userSelectedMinute);
    changeElementTextContent(timeFieldHour, userSelectedHour);
  } else {
    animatingElementVisibility("visible", timepickerValidationMessage, "transform", "rotateX(0deg)");
    setTimeout(function() {
      animatingElementVisibility("invisible", timepickerValidationMessage, "transform", "rotateX(90deg)");
    }, 1500);
  }
});


//exports
export { timepicker }
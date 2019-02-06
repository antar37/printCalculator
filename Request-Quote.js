// housekeeping
window.onload = function(){
   housekeeping();
}
// SETTINGS ===========================
const printSettings = {
  "Banners": {
    maxHeight: 60,
    minWidth: 0,
    minHeight: 0,
    setupCostPerItem: 15
  },
  "Stickers": {
    maxWidth: 12,
    minWidth: 0,
    maxHeight: 12,
    minHeight: 0,
    setupCostPerProject: 15
  },
  "Decals": {
    maxWidth: 60,
    minWidth: 12,
    maxHeight: 60,
    minHeight: 12,
    setupCostPerProject: 15
  },
  "Large Format Prints": {
    minWidth: 36,
    minHeight: 36,
    setupCostPerProject: 15
  },
  "Window Clings": {
    maxWidth: 60,
    minWidth: 0,
    minHeight: 0,
    setupCostPerProject: 15
  },
  "Printed Shirts": {
    setupCostPerProject: 15
  },
  "Mounted Posters": {
    maxWidth: 48,
    minWidth: 0,
    maxHeight: 96,
    minHeight: 0,
    setupCostPerProject: 15
  },
  "Signage": {
    maxWidth: 48,
    minWidth: 0,
    maxHeight: 96,
    minHeight: 0,
    setupCostPerProject: 15
  }
}

// FORMS ==============================
let tabsMenu = document.querySelector('.quote_tabs-menu');
let forms = document.querySelector('.w-tab-content');
let activeForm = forms.querySelector("div.w--tab-active");
let activeTab = tabsMenu.querySelector("a.w--current");
let activeSettings = printSettings[activeTab.textContent];

// INPUTS =============================
let amount = 0;
let width = 0;
let height = 0;
let total = 0;
let squareFootage = 0;
let printAreas = "";
let cost = 0;
let setupFee = 0;
let printedShirtsSelected = false;
let runningTotal = [];
let addToQuote = activeForm.querySelector('.addtoquote');
let finalQuote = document.querySelector("#finalQuote");
let runningTotalNumber = document.querySelector("#runningTotalNumber");
let runningTotalText = document.querySelector("#runningTotalText");

// LISTENERS ==========================
forms.addEventListener("input", updateForm);
addToQuote.addEventListener("click", addToFinalQuote);
tabsMenu.addEventListener("click", () => {setTimeout(updateTab, 500)});

// HELPERS ============================

function setMaxMin(maxWidth, minWidth, maxHeight, minHeight){
  console.log("setMaxMin ran with values = ", maxWidth, minWidth, maxHeight, minHeight);

  if(maxWidth && parseFloat(activeForm.querySelector('.width').value) > maxWidth){
    activeForm.querySelector('.width').value = maxWidth;
  }
  if(maxHeight && parseFloat(activeForm.querySelector('.height').value) > maxHeight){
    activeForm.querySelector('.height').value = maxHeight;
  }
  if(parseFloat(activeForm.querySelector('.width').value) < minWidth){
    activeForm.querySelector('.width').value = minWidth;
  }
  if(parseFloat(activeForm.querySelector('.height').value) < minHeight){
    activeForm.querySelector('.height').value = minHeight;
  }

  // Since the listener is on input, this is bypassing inputs. Need to call updateForm manually
  updateForm();
}

function setMaxMinAttrs(maxWidth, minWidth, maxHeight, minHeight){
  console.log("setMaxMinAttrs ran with values = ", maxWidth, minWidth, maxHeight, minHeight);
  if(maxWidth) {
    activeForm.querySelector('.width').setAttribute("max", maxWidth);
  }
  if(maxHeight){
    activeForm.querySelector('.height').setAttribute("max", maxHeight);
  }
  if(minWidth){
    activeForm.querySelector('.width').setAttribute("min", minWidth);
  }
  if(minHeight){
    activeForm.querySelector('.height').setAttribute("min", minHeight);
  }
}

// FUNCTIONS ==========================
function updateTab(){
  console.log("updateTab Ran");
  activeTab = tabsMenu.querySelector("a.w--current");
  activeForm = forms.querySelector("div.w--tab-active");
  activeSettings = printSettings[activeTab.textContent];

  // Check to see if printed Shirts are selected
  if(activeForm.querySelector('select.printareasdropdown')){
    printedShirtsSelected = true;
  } else {
    printedShirtsSelected = false;
    activeForm.querySelector('.width')
    setMaxMinAttrs(activeSettings.maxWidth, activeSettings.minWidth, activeSettings.maxHeight, activeSettings.minHeight)
  }  

  // Make the number forms actual numbers
  activeForm.querySelector('.amount').type = "number";  
  activeForm.querySelector('.amount').setAttribute("min", 0);
  
  addToQuote = activeForm.querySelector('.addtoquote');
  addToQuote.removeEventListener("click", addToFinalQuote);
  addToQuote.addEventListener("click", addToFinalQuote);
  if(printedShirtsSelected){
    cost = Number(printAreas.split("_")[1]) ? Number(printAreas.split("_")[1]) : 0;
  }
  else {
    cost = parseFloat(activeForm.querySelector('.squarefootage').dataset.cost);
  }

  // If there are radio buttons in the active Form
  if(activeForm.querySelector('.w-radio')){
    // Hide width and height inputs
    $('.width-height-container').hide();
  }
}

function housekeeping(){
  updateTab();
}

function updateForm() {
  amount = parseFloat(activeForm.querySelector('.amount').value) ? parseFloat(activeForm.querySelector('.amount').value) : 0;

  if(printedShirtsSelected){  
    printAreas = activeForm.querySelector('.printareasdropdown').value;
  } else {
    // If there's a radio button preset selectors, make the width and height be set to what's in the radio button value
    if(activeForm.querySelector('.w-radio')){
      if($("input[name=size]:checked").val() !== "custom"){
        $('.width-height-container').fadeOut();
        // Get values of the width and height from the radio button value using the formula "WIDTHxHEIGHT"
        const radioBtnWidthHeightArray = $("input[name=size]:checked").val().split("x");
        activeForm.querySelector('.width').value = Number(radioBtnWidthHeightArray[0]);
        activeForm.querySelector('.height').value = Number(radioBtnWidthHeightArray[1]);
      } else {
        $('.width-height-container').fadeIn();
      }
    }
    // Set the max size to the max specified in printSettings object
    // Checks for existence of a setting, and checks if the size exceeds the limit put by the object
    // Put it on a timer to give the input a chance to put in a number
    $("div.w-tab-pane.w--tab-active .width").focusout(function(){setMaxMin(activeSettings.maxWidth, activeSettings.minWidth, activeSettings.maxHeight, activeSettings.minHeight)});
    $("div.w-tab-pane.w--tab-active .height").focusout(function(){setMaxMin(activeSettings.maxWidth, activeSettings.minWidth, activeSettings.maxHeight, activeSettings.minHeight)});
    
    width = Number(activeForm.querySelector('.width').value);
    height = Number(activeForm.querySelector('.height').value);
  }
  calculateTotal(width, height);
}

function calculateTotal(width = 0, height = 0){
  console.log("calculateTotal. Width: "+width+". Height: "+height);
  setupFee = activeSettings.setupCostPerProject ? activeSettings.setupCostPerProject : (activeSettings.setupCostPerItem * amount)
  if(printedShirtsSelected){
    cost = Number(printAreas.split("_")[1]) ? Number(printAreas.split("_")[1]) : 0;
    total = ((cost * amount) + setupFee);
    activeForm.querySelector(".printareas").textContent = printAreas.split("_")[0];
  } else if(activeForm.querySelector('.w-radio')){
    if($("input[name=size]:checked").val() !== "custom"){
      // If it's a radio button
      squareFootage = Number((amount * (width * height)) * 0.0069444444444444).toFixed(1); // the long number is to convert from square inches to square feet
      activeForm.querySelector(".squarefootage").textContent = squareFootage;
      cost = $("input[name=size]:checked")[0].dataset.price;
      total = ((cost * amount) + setupFee);
    }
  } else {
    squareFootage = Number((amount * (width * height)) * 0.0069444444444444).toFixed(1); // the long number is to convert from square inches to square feet
    total = Number((squareFootage * cost) + setupFee).toFixed(2);
    activeForm.querySelector(".squarefootage").textContent = squareFootage;
  }
  //Update the textContents
  activeForm.querySelector(".total").textContent = total;
}

function addToFinalQuote() {
  const textAreaWrapper = document.createElement("div");
  const closeBtn = document.createElement("div");
  const textArea = document.createElement("textarea");
  const totalToAdd = Math.round(Number(total) * 100) / 100;
  runningTotal.push(totalToAdd);
  if( $(runningTotalText).css('display') != 'block') {
    $(runningTotalText).fadeIn();
  }

  runningTotalNumber.innerHTML = runningTotal.reduce((a, b) => a + b, 0).toFixed(2);
  textAreaWrapper.classList.add('textareawrapper');
  $(textAreaWrapper).attr('data-totalWithSetupFee', totalToAdd);
  closeBtn.classList.add('close');
  closeBtn.innerHTML = '✖';
  textArea.setAttribute("name", activeTab.textContent);

  if(printedShirtsSelected){
    
    textArea.textContent = `
      Category: ${activeTab.textContent}
      Amount: ${amount}
      Print Areas: ${printAreas.split("_")[0]}
      `;

  } else {
    textArea.textContent = `
      Category: ${activeTab.textContent}
      Amount: ${amount}
      Square Footage: ${squareFootage}
      Width: ${height}
      Height: ${width}
      `;
  }
  textArea.rows = 10;
  textArea.cols = 30;
  textArea.disabled = true;
  textArea.classList.add('quote-text-area');
  finalQuote.querySelector(".quotelist").appendChild(textAreaWrapper);
  textAreaWrapper.appendChild(closeBtn);
  textAreaWrapper.appendChild(textArea);
  
  activateCloseBtns();
};

function activateCloseBtns(){
  let closeBtns = finalQuote.querySelectorAll('.close');
  closeBtns.forEach( (closeBtn) => {
    closeBtn.addEventListener('click', (e) => {
      runningTotal.splice(runningTotal.indexOf(e.target.parentNode.dataset.totalWithSetupFee), 1);
      runningTotalNumber.innerHTML = runningTotal.reduce((a, b) => a + b, 0);
      e.target.parentNode.remove();
    });
  });
};
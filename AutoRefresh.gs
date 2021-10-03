/**
 * This function by Vadorequest generates a random number in the "randomNumber" sheet.
 *
 * It needs to be triggered with a Google Apps Scripts trigger at https://script.google.com/home/:
 *   - Select project and add trigger
 *   - Choose which function to run: triggerAutoRefresh
 *   - Select event source: Time-driven
 *   - Select type of time based trigger: Minutes timer
 *   - Select minute interval: 10 minutes (to avoid too many requests)
 **/

// Updates cell A1 in "randomNumber" with a random number
function triggerAutoRefresh() {  
    SpreadsheetApp.getActive().getSheetByName('doNotDelete').getRange(1, 1).setValue(getRandomInt(1, 200));
}
// Basic Math.random() function
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
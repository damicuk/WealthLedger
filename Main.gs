/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('WealthLedger')
    .addItem('Step 1: Create sample assets & ledger', 'createSampleAssetsLedger')
    .addSeparator()
    .addItem('Step 2: Validate assets & ledger', 'validateAssetsLedger')
    .addSeparator()
    .addItem('Step 3: Write reports', 'writeReports')
    .addSeparator()
    .addItem('Settings', 'showSettingsDialog')
    .addToUi();
}

/**
 * Calls the corresponding method of a new instance of AssetTracker
 */
function createAssetsLedger() {

  new AssetTracker().createAssetsLedger();

}

/**
 * Calls the corresponding method of a new instance of AssetTracker
 */
function validateAssetsLedger() {

  new AssetTracker().validateAssetsLedger();

}

/**
 * Calls the corresponding method of a new instance of AssetTracker
 */
function writeReports() {

  new AssetTracker().writeReports();
}

/**
 * Displays the settings dialog
 */
function showSettingsDialog() {

  let html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
    .setWidth(480)
    .setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

/**
 * Calls the corresponding method of a new instance of AssetTracker
 */
function saveSettings(settings) {

  new AssetTracker().saveSettings(settings);

}

/**
 * Calls the corresponding method of a new instance of AssetTracker
 * Not intended for use by the end user
 * Useful in development and testing
 */
function deleteReports() {

  new AssetTracker().deleteReports();

}

/**
 * Deletes all the user properties
 * Not intended for use by the end user
 * Useful in development and testing
 */
function deleteSettings() {

  let userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();

}
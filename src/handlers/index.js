'use strict';

const CREDENTIALS_CLIENT_ID = process.env['CREDENTIALS_CLIENT_ID'];
const CREDENTIALS_CLIENT_SECRET = process.env['CREDENTIALS_CLIENT_SECRET'];
const CREDENTIALS_REDIRECT_URI = process.env['CREDENTIALS_REDIRECT_URI'];
const REFRESH_TOKEN = process.env['REFRESH_TOKEN'];
const SPREADSHEET_ID = process.env['SPREADSHEET_ID'];
const SPREADSHEET_NAME = process.env['SPREADSHEET_NAME'];
const SPREADSHEET_RANGE = process.env['SPREADSHEET_RANGE'];
const SPREADSHEET_START_RANGE = process.env['SPREADSHEET_START_RANGE'];

const {google} = require('googleapis');

exports.handler = async (event) => {
  let callbackFunction;
  if (event.callback){
    callbackFunction = (event.callback === 'getCellsValue') ? getCellsValue : updateCellsValue;
  } else {
    callbackFunction = updateCellsValue;
  };

  let content = await authorize(callbackFunction);
  let result = {
      'isOk': !(typeof(content) === 'string'),
      'content': content
  };

  return result;
}

async function authorize(callback) {
  const oAuth2Client = new google.auth.OAuth2(
    CREDENTIALS_CLIENT_ID,
    CREDENTIALS_CLIENT_SECRET,
    CREDENTIALS_REDIRECT_URI
  );

  let result;
  try{
    oAuth2Client.setCredentials({
        'refresh_token': REFRESH_TOKEN
    });

    result = await callback(oAuth2Client);
    console.log('oAuth succeeded.');
  } catch(err) {
    const errorMessage = 'oAuth failed.';
    result = errorMessage;
    console.log(errorMessage);
    console.log(err);
  };

  return result;
}

async function getCellsValue(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const params = {
      spreadsheetId: SPREADSHEET_ID,
      majorDimension: "ROWS",
      range: SPREADSHEET_NAME + SPREADSHEET_RANGE,
  };

  let result;
  try {
      let response = await sheets.spreadsheets.values.get(params);
      const rows = response.data.values;
      const lastIndex = rows.length - 1;

      result = [
          rows[lastIndex][0],
          rows[lastIndex][1]
      ]
  } catch(err) {
      const errorMessage = 'The API returned an error.';
      result = errorMessage;
      console.log(errorMessage);
      console.log(err);
  }

  return result;
}

async function updateCellsValue(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const inputValues = {
    values: [
      ["test value \"A\"", "test value \"B\""],
      ["test value \"C\"", "test value \"D\""]
    ]
  };

  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_NAME + SPREADSHEET_START_RANGE,
    valueInputOption: "USER_ENTERED",
    resource: inputValues,
  };

  let result;
  try {
    let response = await sheets.spreadsheets.values.update(params);
    result = {'statusText': response.statusText};
  } catch(err) {
    const errorMessage = 'The API returned an error.';
    result = errorMessage;
    console.log(errorMessage);
    console.log(err);
  }

  return result;
}
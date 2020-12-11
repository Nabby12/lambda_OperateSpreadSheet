'use strict';

const CREDENTIALS = process.env['CREDENTIALS'];
const TOKEN_PATH = process.env['TOKEN_PATH'];
const SPREADSHEET_ID = process.env['SPREADSHEET_ID'];
const SPREADSHEET_NAME = process.env['SPREADSHEET_NAME'];
const SPREADSHEET_START_RANGE = process.env['SPREADSHEET_START_RANGE'];

const {google} = require('googleapis');

exports.handler = () => {
  try{
    authorize(JSON.parse(CREDENTIALS), updateCells);
    console.log('authorize success.');
  } catch(err) {
    console.log('authorize failed.');
    console.log(err);
  };
}

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try{
    oAuth2Client.setCredentials(JSON.parse(TOKEN_PATH));
    callback(oAuth2Client);
    console.log('oAuth success.');
  } catch(err) {
    console.log('oAuth failed.');
    console.log(err);
  };
}

function updateCells(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const inputValues = {
    values: [
      ["test value \"A\"", "test value \"B\""],
    ]
  };

  const param = {
    spreadsheetId: SPREADSHEET_ID,
    range: SPREADSHEET_NAME + SPREADSHEET_START_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption : "INSERT_ROWS",
    resource: inputValues,
  };

  sheets.spreadsheets.values.append(param, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log('statusCode: ' + res.status);
    console.log('statusText: ' + res.statusText);
  });
}
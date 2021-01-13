'use strict'

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const proxyquire = require('proxyquire');
const { createSandbox } = require('sinon');

const {google} = require('googleapis');

describe('Test for index', function () {
    let sandbox;
    let proxyIndex;
    let googleStub;
    let googleMock;
    let googleMockClass;

    let dummyStub;
    let dummyStub2;
    let dummyStub3;
    let dummyStub4;
    let dummyStub5;

    const getCellsValueEvent = {
        "callback": "getCellsValue"
    };
    const notGetCellsValueEvent = {
        "callback": "dummy"
    };
    const updateCellsValueEvent = {};

    const dummyGetParams = {
        spreadsheetId: 'dummy id',
        majorDimension: "dummy dimension",
        range: 'dummy range',
    };
    const dummyUpdateParams = {
        spreadsheetId: 'dummy id',
        range: 'dummy range',
        valueInputOption: "dummy option",
        resource: "dummy values",
    };

    const index = require('../../../src/handlers/index.js');
    let OAuth2Mock
    let OAuth2Stub
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(process, 'env').value({
            CREDENTIALS_CLIENT_ID: 'dummy clientId',
            CREDENTIALS_CLIENT_SECRET: 'dummy clientSecret',
            CREDENTIALS_REDIRECT_URI: 'dummy redirectUri',
            REFRESH_TOKEN: 'dummy token',
            SPREADSHEET_ID: 'dummy id',
            SPREADSHEET_NAME: 'dummy sheetName',
            SPREADSHEET_RANGE: 'dummy range',
            SPREADSHEET_START_RANGE: 'dummy startRange',
        });

        let googleMockClass = class {
            auth() {
                return {
                    promise: () => {}
                }
            }
            OAuth2(params) {
                return {
                    promise: () => {}
                }
            }
            setCredentials(params) {
                return {
                    promise: () => {}
                }
            }
            sheets(params) {
                return {
                    promise: () => {}
                }
            }
            spreadsheets() {
                return {
                    promise: () => {}
                }
            }
            values() {
                return {
                    promise: () => {}
                }
            }
            get(params) {
                return {
                    promise: () => {}
                }
            }
            update(params) {
                return {
                    promise: () => {}
                }
            }
        };
        let googleMock = new googleMockClass();

        googleStub = {};

        // googleStub = {
        //     'spreadsheets': {},
        //     'values': {},
        //     get(params) {
        //         return {
        //             promise: () => {}
        //         }
        //     },
        //     sheets() {
        //         return {
        //             promise: () => {}
        //         }
        //     }
        // };
        // dummyStub = sandbox.stub(google, 'sheets').returns(googleStub)
        // googleStub = sandbox.stub(google, 'sheets').returns(googleStub)
        // dummyStub2 = sandbox.stub(google, 'values').returns(googleStub)
        // dummyStub3 = sandbox.stub(google, 'get').returns(googleStub)
        // googleStub.auth = sandbox.stub(google, 'auth').returns(googleStub)
        // // dummyStub5 = sandbox.stub(google, 'OAuth2').returns(googleStub)
        
        // googleStub.auth = sandbox.stub().resolves(googleStub);
        // googleStub.OAuth2 = sandbox.stub().resolves(googleStub);
        // googleStub.setCredentials = sandbox.stub().resolves(googleStub);
        // googleStub.sheests = sandbox.stub().resolves(googleStub);
        // googleStub.spreadsheets = sandbox.stub().resolves(googleStub);
        // googleStub.values = sandbox.stub().resolves(googleStub);
        // googleStub.get = sandbox.stub().resolves(googleStub);
        // googleStub.update = sandbox.stub().resolves(googleStub);

        // googleStub.auth = sandbox.stub(googleMock, 'auth');
        // googleStub.OAuth2 = sandbox.stub(googleMock, 'OAuth2');
        // googleStub.setCredentials = sandbox.stub(googleMock, 'setCredentials');
        // googleStub.sheets = sandbox.stub(googleMock, 'sheets').returns({test:1});
        // googleStub.spreadsheets = sandbox.stub(googleMock, 'spreadsheets');
        // googleStub.values = sandbox.stub(googleMock, 'values');
        // googleStub.get = sandbox.stub(googleMock, 'get');
        // googleStub.update = sandbox.stub(googleMock, 'update');

        OAuth2Mock = new google.auth.OAuth2(
            // process.env.CREDENTIALS_CLIENT_ID,
            // process.env.CREDENTIALS_CLIENT_SECRET,
            // process.env.CREDENTIALS_REDIRECT_URI
        ); 
        googleStub = sinon
            .mock(new google.auth.OAuth2)
            .expects('setCredentials')
            .once()
            .resolves({});

        googleStub = sandbox.stub(google.auth, 'OAuth2').returns(googleStub);

        // googleStub = sandbox.stub(google, 'sheets').returns({test:1});
        
        proxyIndex = proxyquire('../../../src/handlers/index.js', {
            'googleapis': googleStub,
        });
        // proxyIndex = proxyquire('../../../src/handlers/index.js', {
        //     'googleapis': googleMock,
        // });
    });
    afterEach(() => {
        sandbox.restore();
    });


    it('渡されるeventによって、呼び出されるcallback関数が変わる', async () => {
        // OAuth2Mock.setCredentials()
        //     .then(r => console.log('------->' + JSON.stringify(r)))
        //     .catch(e => console.error('------->' + e));

        // googleStub.auth.returns({promise: () => {
        //     return Promise.resolve(googleStub);
        // }});
        // googleStub.OAuth2.returns({promise: () => {
        //     return Promise.resolve(googleStub);
        // }});
        // googleStub.setCredentials.returns({promise: () => {
        //     return Promise.resolve(googleStub);
        // }});
        // googleStub.sheets.returns({promise: () => {
        //     return Promise.resolve({test:1});
        // }});
        // googleStub.spreadsheets.returns({promise: () => {
        //     return Promise.resolve(googleStub);
        // }});
        // googleStub.values.returns({promise: () => {
        //     return Promise.resolve(googleStub);
        // }});

        // googleStub.get.withArgs(dummyGetParams).returns({promise: () => {
        //     return Promise.resolve({test:1});
        // }});
        // googleStub.sheets.returns();
        // googleStub.spreadsheets.returns({});
        // googleStub.values.returns({});
        const getValues = [
            'value1',
            'value2',
        ];

        const expected = { isOk: true, content: getValues };
        return expect(index.handler(getCellsValueEvent)).to.be.fulfilled.then(result => {
            console.log('----result----');
            console.log(result);
            console.log(expected);
            // sinon.assert.calledOnce(cryptoStub.createHmac);
            // sinon.assert.calledWith(cryptoStub.createHmac, 'sha256', );
            // sinon.assert.calledOnce(cryptoStub.update);
            // sinon.assert.calledOnce(cryptoStub.digest);
            // sinon.assert.calledWith(cryptoStub.digest, 'base64');
            // sinon.assert.callOrder(cryptoStub.createHmac, cryptoStub.update, cryptoStub.digest);
            // assert.deepEqual(result, expected);
        });
    });

    it('認証実行関数でエラーが発生した場合、認証失敗ステータスが返る', async () => {
        
    });

    it('認証処理に失敗した場合、認証失敗ステータスが返る', async () => {
        
    });

    it('getCellsVallueが失敗した場合、APIエラーステータスが返る', async () => {
        
    });

    it('getCellsVallueが成功した場合、成功ステータスが返る', async () => {
        
    });
    
    it('updateCellsVallueが失敗した場合、APIエラーステータスが返る', async () => {
        
    });

    it('updateCellsVallueが成功した場合、成功ステータスが返る', async () => {
        
    });
});

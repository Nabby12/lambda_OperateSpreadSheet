'use strict'

const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const expect = chai.expect;
const { createSandbox } = require('sinon');

const {google} = require('googleapis');

describe('Test for index', function () {
    let sandbox;
    let oAuth2ClientStub;
    let setCredentialsStub;
    let sheetsStub;
    let getStub;
    let updateStub;

    const getCellsValueEvent = {
        "callback": "getCellsValue"
    };
    const updateCellsValueEvent = {
        "callback": "updateCellsValue"
    };

    const index = require('../../../src/handlers/index.js');
    beforeEach(() => {
        sandbox = sinon.createSandbox();

        setCredentialsStub = sandbox.stub();
        oAuth2ClientStub = sandbox.stub(google.auth, 'OAuth2').returns({
            setCredentials: setCredentialsStub
        });

        getStub = sandbox.stub();
        updateStub = sandbox.stub();
        sheetsStub = sandbox.stub(google, 'sheets').returns({
            spreadsheets: {
                values: {
                    get: getStub,
                    update: updateStub
                }
            }
        });;
    });
    afterEach(() => {
        sandbox.restore();
    });


    it('渡されるeventによって、呼び出されるcallback関数が変わる', async () => {
        const dummyGetResponse = {
            data: {
                values: [['value1', 'value2']]
            }
        }
        getStub.returns(dummyGetResponse);
        expect(index.handler(getCellsValueEvent)).to.be.fulfilled.then(result => {
            console.log(sinon.assert.calledOnce(setCredentialsStub));
            console.log(sinon.assert.calledOnce(getStub));
            console.log(sinon.assert.notCalled(updateStub));
        });

        const dummyUpdateResponse = {statusText: 'OK'}
        updateStub.returns(dummyUpdateResponse);
        expect(index.handler(updateCellsValueEvent)).to.be.fulfilled.then(result => {
            console.log(sinon.assert.calledOnce(setCredentialsStub));
            console.log(sinon.assert.notCalled(getStub));
            console.log(sinon.assert.calledOnce(updateStub));
        });
    });

    it('認証処理に失敗した場合、認証失敗ステータスが返る', async () => {
        setCredentialsStub.throws(new Error('error'));

        const errorMessage = 'oAuth failed.';
        const expected = { isOk: false, content: errorMessage };

        return expect(index.handler(getCellsValueEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(setCredentialsStub);
            sinon.assert.notCalled(getStub);
            sinon.assert.notCalled(updateStub);
            assert.deepEqual(result, expected);
        });
    });

    it('getCellsVallueが失敗した場合、APIエラーステータスが返る', async () => {
        getStub.throws(new Error('error'));

        const errorMessage = 'The API returned an error.';

        const expected = { isOk: false, content: errorMessage };
        return expect(index.handler(getCellsValueEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(setCredentialsStub);
            sinon.assert.calledOnce(getStub);
            sinon.assert.notCalled(updateStub);
            assert.deepEqual(result, expected);
        });
    });

    it('getCellsVallueが成功した場合、成功ステータスが返る', async () => {
        const dummyGetResponse = {
            data: {
                values: [['value1', 'value2']]
            }
        }
        getStub.returns(dummyGetResponse);

        const getValues = [
            'value1',
            'value2',
        ];

        const expected = { isOk: true, content: getValues };
        return expect(index.handler(getCellsValueEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(setCredentialsStub);
            sinon.assert.calledOnce(getStub);
            sinon.assert.notCalled(updateStub);
            assert.deepEqual(result, expected);
        });
    });
    
    it('updateCellsVallueが失敗した場合、APIエラーステータスが返る', async () => {
        const dummyUpdateResponse = {statusText: 'OK'}
        updateStub.throws(new Error('error'));

        const errorMessage = "The API returned an error.";

        const expected = { isOk: false, content: errorMessage };
        return expect(index.handler(updateCellsValueEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(setCredentialsStub);
            sinon.assert.notCalled(getStub);
            sinon.assert.calledOnce(updateStub);
            assert.deepEqual(result, expected);
        });
    });

    it('updateCellsVallueが成功した場合、成功ステータスが返る', async () => {
        const dummyUpdateResponse = {statusText: 'OK'}
        updateStub.returns(dummyUpdateResponse);

        const updateStatus = {"statusText": "OK"};

        const expected = { isOk: true, content: updateStatus };
        return expect(index.handler(updateCellsValueEvent)).to.be.fulfilled.then(result => {
            sinon.assert.calledOnce(setCredentialsStub);
            sinon.assert.notCalled(getStub);
            sinon.assert.calledOnce(updateStub);
            assert.deepEqual(result, expected);
        });
    });
});

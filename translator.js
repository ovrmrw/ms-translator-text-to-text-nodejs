/*
  MicrosoftのTranslator APIを使ってText-to-Textの翻訳をするサンプル。
  https://www.microsoft.com/en-us/translator
  
  es2015形式でJSにトランスパイルした後、babel-nodeで実行すると簡単です。
  
  Dependencies: request, xml2js, babel-polyfill
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import 'babel-polyfill';
import request from 'request';
import { parseString } from 'xml2js';
const azureDataMarket = require('./azureDataMarket.json'); // CliendIdとClientSecretを書いた設定ファイル。
const azureDataMarketClientId = azureDataMarket.ClientId;
const azureDataMarketClientSecret = azureDataMarket.ClientSecret;
// 非同期処理を同期的に書くときはasync/awaitが書きやすい。
(() => __awaiter(this, void 0, void 0, function* () {
    let accessToken;
    // AccessTokenを取得するまで。
    try {
        // request.postでbodyを取得する。awaitでPromiseを待機する。
        const body = yield new Promise((resolve, reject) => {
            request({
                method: 'post',
                url: 'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
                form: {
                    grant_type: 'client_credentials',
                    client_id: azureDataMarketClientId,
                    client_secret: azureDataMarketClientSecret,
                    scope: 'http://api.microsofttranslator.com'
                }
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            });
        });
        // request.postで取得したbodyからaccess_tokenを取得する。
        accessToken = JSON.parse(body)['access_token'];
        console.log('Access Token: ' + accessToken + '\n');
    }
    catch (err) {
        console.error(err);
    }
    // AccessTokenを取得してTranslateするまで。
    try {
        // 翻訳にかけたいテキスト。
        const text = 'Introduction to data analysis with Python';
        // request.getでbodyを取得する。accessTokenがないとエラーになる。awaitでPromiseを待機する。
        const body = yield new Promise((resolve, reject) => {
            request({
                method: 'get',
                url: 'http://api.microsofttranslator.com/v2/Http.svc/Translate' + `?text=${encodeURI(text)}&from=en&to=ja`,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            });
        });
        // 取得したbodyはXMLなのでパースする必要がある。awaitでPromiseを待機する。
        const translated = yield new Promise((resolve, reject) => {
            parseString(body, (err, result) => {
                if (err) {
                    reject(err);
                }
                console.log(body + '\n↓ parsing XML to JS object');
                console.log(result);
                console.log('\n');
                resolve(result.string._);
            });
        });
        console.log('Translated: ' + translated); // 翻訳結果の表示。
    }
    catch (err) {
        console.error(err);
    }
}))();

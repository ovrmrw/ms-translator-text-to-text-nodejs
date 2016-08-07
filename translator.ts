/*
  MicrosoftのTranslator APIを使ってText-to-Textの翻訳をするサンプル。
  https://www.microsoft.com/en-us/translator
*/

import 'babel-polyfill'; // async/awaitを書くなら必要。
import request from 'request';
import {parseString} from 'xml2js';

interface Credential {
  ClientId: string;
  ClientSecret: string;
}

const azureDataMarket: Credential = require('./azureDataMarket.json'); // CliendIdとClientSecretを書いた設定ファイル。
const azureDataMarketClientId = azureDataMarket.ClientId;
const azureDataMarketClientSecret = azureDataMarket.ClientSecret;

// 非同期処理を同期的に書くときはasync/awaitが書きやすい。
(async () => {
  let accessToken: string;

  // AccessTokenを取得するまで。
  try {
    // request.postでbodyを取得する。awaitでPromiseを待機する。
    const body = await new Promise<string>((resolve, reject) => {
      request(
        {
          method: 'post',
          url: 'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
          form: {
            grant_type: 'client_credentials',
            client_id: azureDataMarketClientId,
            client_secret: azureDataMarketClientSecret,
            scope: 'http://api.microsofttranslator.com'
          }
        }, (err, res, body) => {
          if (err) { reject(err) }
          resolve(body);
        });
    });
    // request.postで取得したbodyからaccess_tokenを取得する。
    accessToken = JSON.parse(body)['access_token'];
    console.log('Access Token: ' + accessToken + '\n');
  } catch (err) {
    console.error(err);
  }

  // AccessTokenを取得してTranslateするまで。
  try {
    // 翻訳にかけたいテキスト。
    const text = 'Node.jsでデータ分析';

    // request.getでbodyを取得する。accessTokenがないとエラーになる。awaitでPromiseを待機する。
    const body = await new Promise<string>((resolve, reject) => {
      request(
        {
          method: 'get',
          url: 'http://api.microsofttranslator.com/v2/Http.svc/Translate' + `?text=${encodeURI(text)}&from=ja&to=en`,
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        }, (err, res, body) => {
          if (err) { reject(err) }
          resolve(body);
        });
    });
    
    // 取得したbodyはXMLなのでパースする必要がある。awaitでPromiseを待機する。
    const translated = await new Promise<string>((resolve, reject) => {      
      parseString(body, (err, result) => {
        if (err) { reject(err) }
        console.log(body + '\n↓ parsing XML to JS object');
        console.log(result);
        console.log('\n');
        resolve(result.string._);
      });
    });
    console.log('Translated: ' + translated); // 翻訳結果の表示。
  } catch (err) {
    console.error(err);
  }
})();
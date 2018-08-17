/*

 ----------------------------------------------------------------------------
 | ripple-cdr-blackpear: Ripple BlackPear Interface                         |
 |                                                                          |
 | Copyright (c) 2017-18 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  14 August 2018

*/

var request = require('request');
var api_server = require('./hosts').api;
var cacheHeadingResources = require('./cacheHeadingResources');

module.exports = function(nhsNumber, credentials, session, callback) {

  var cachedPatient = session.data.$(['BlackPear', 'Patient', 'by_nhsNumber', nhsNumber]);

  if (cachedPatient.$('resources').exists) {
    // resources for this patient already fetched and cached
    callback(false);
  }
  else {
    var emisIds = [];
    cachedPatient.$('Patient').forEachChild(function(emisId) {
      emisIds.push(emisId);
    });
    var max = emisIds.length;
    var count = 0;
    emisIds.forEach(function(emisId) {
      var uri = api_server.host + api_server.paths.getPatientResources(credentials, emisId);
      var params = {
        url: uri,
        method: 'GET',
        headers: {
          Authorization: credentials.auth
        },
        json: true
      };
      console.log('getPatientResources params = ' + JSON.stringify(params, null, 2));
      request(params, function(error, response, body) {
        console.log('Patient Resources response: ' + JSON.stringify(response, null, 2));
        if (!error) {
          cacheHeadingResources(nhsNumber, emisId, body, session);
          count++;
          if (count === max) return callback(false);
        }
        else {
          count++;
          if (count === max) return callback(error);
        }
      });
    });
  }
};

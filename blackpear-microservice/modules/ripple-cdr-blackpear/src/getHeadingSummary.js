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

  3 August 2018

*/

var transform = require('qewd-transform-json').transform;
var headingMap = require('./headingMap');

function getSubscriptArray(ref) {
  var arr = [];
  ref.split('.').forEach(function(subscript) {
    arr.push(subscript);
  });
  return arr;
}

module.exports = function(nhsNumber, headingName, format, session) {

  var resourceName = headingMap[headingName];
  console.log('\n *** headingName = ' + headingName);
  console.log('\n *** resourceName = ' + resourceName);
  console.log('\n *** nhsNumber = ' + nhsNumber);

  var to_openehr_template = require('../templates/' + headingName + '/blackpear_to_openehr.json');

  var to_format_template;
  var format_helpers;
  if (format === 'pulsetile') {
    to_format_template = require('../templates/' + headingName + '/openEHR_to_Pulsetile.json');
    format_helpers = require('./helpers');
  }

  var blackpear_helpers = {
    fhirDateTime: function(d) {
      return new Date(d).toISOString();
    },
    getRef: function(resourceRef, subst) {
      var pieces = resourceRef.split('/');
      var resourceName = pieces[0];
      var id = pieces[1];
      var resource = session.data.$(['BlackPear', resourceName, 'by_id', id, 'data']);
      var subscripts = getSubscriptArray(subst);
      console.log('\n**** subscripts ' + subscripts);
      return resource.$(subscripts).value;
    }
  };


  var patientResourceCache = session.data.$(['BlackPear', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', resourceName]);
  var resourceCache = session.data.$(['BlackPear', resourceName, 'by_id']);

  var results = [];

  patientResourceCache.forEachChild(function(id) {
    console.log('*** patientResourceCache id = ' + id);
    var resourceDoc = resourceCache.$([id, 'data']);
    var resource = resourceDoc.getDocument(true);
    //console.log('resource: ' + JSON.stringify(resource, null, 2));
    var result = transform(to_openehr_template, resource, blackpear_helpers);
    console.log(JSON.stringify(result, null, 2));
    if (to_format_template) {
      result = transform(to_format_template, result, format_helpers);
      console.log(JSON.stringify(result, null, 2));
    }
    
    console.log('=======================');
    results.push(result);  // should be pulsetile format!!
  });
  return results;
};

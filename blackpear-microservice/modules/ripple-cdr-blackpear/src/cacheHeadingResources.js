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

function getId(ref) {
  return ref.split('/')[1];
}

module.exports = function(nhsNumber, emisId, rawData, session) {

  var blackPearCache = session.data.$('BlackPear');
  var cachedNHSNo = blackPearCache.$(['Patient', 'by_nhsNumber', nhsNumber]);

  rawData.entry.forEach(function(entry) {
    var id = entry.id;
    var content = entry.content;
    var resourceType = content.resourceType;

    /*
    if (resourceType === 'Condition') {
      content.patient = getId(content.subject.reference);
      content.practitioner = getId(content.asserter.reference);
    }

    if (resourceType === 'Encounter') {
      content.patient = getId(content.subject.reference);
      content.practitioner = getId(content.participant[0].individual.reference);
      content.location = getId(content.location[0].location.reference);
    }

    if (resourceType === 'Immunization') {
      content.patient = getId(content.subject.reference);
      content.practitioner = getId(content.performer.reference);
    }

    if (resourceType === 'MedicationPrescription') {
      content.patient = getId(content.patient.reference);
      content.practitioner = getId(content.prescriber.reference);
    }
    */

    content.nhsNumber = nhsNumber;
    blackPearCache.$([resourceType, 'by_id', id, 'data']).setDocument(content);
    cachedNHSNo.$(['resources', resourceType, id]).value = id;
  });
};


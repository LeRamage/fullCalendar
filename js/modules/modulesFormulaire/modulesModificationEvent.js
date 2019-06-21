////////////////////////////////////////////////////////////////////
// Modules pour la modification d'évènements et/ou d'informations //
///////////////////////////////////////////////////////////////////


// ---------  obtient les infos sur un évènement avant modification  --------- //
function get_oldVariables(event){
    let oldVariables = [];
    let start = event.start;
    let end = event.end;
    let startHour,endHour;
    if(moment(start).hour() == 9)
        startHour = 'Matin';
    else
        startHour = 'Après-midi';
  
    if(moment(end).hour() == 18)
        endHour = 'Soir';
    else
        endHour = 'Après-midi';
    
    oldVariables.push({'start':start,'end':end,'startHour':startHour,'endHour':endHour});
    return oldVariables;
}
//////////////////////////////////////////////////////////////////////////////////

  
// --------- Supprime les anciennes informations de l'évènement modifié --------- //
function removeOldInfo(className){
    switch(className){
        case 'conge':
            congeInfos.splice(congeInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case 'demandeCongeValid':
            demandeCongeValidInfos.splice(demandeCongeValidInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case 'absence':
            absenceInfos.splice(absenceInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case "arret":
            arretInfos.splice(arretInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case "teletravail":
            teletravailInfos.splice(teletravailInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case "formation" :
            formationInfos.splice(formationInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case 'rdv_pro':
            rdv_proInfos.splice(rdv_proInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
        case 'recup':
            recupInfos.splice(recupInfos.findIndex(info=>moment(info['dateDebut']).isSame(event.start,'day') && info['emp_id'] == event.getResources()[0].id));
            break;
    }
}
//////////////////////////////////////////////////////////////////////////////////////

  
// --------- création des booleans pour la modification --------- //
function createModifBoolean(event,variables,oldVariables){
    let _isTypeC = (event.classNames[0] == 'conge' || event.classNames[0] == 'demandeCongeValid');
    let _startIsOldStart = moment(variables[0].start).isSame(oldVariables[0].start,'day');
    let _endIsOldEnd = moment(variables[0].end).isSame(oldVariables[0].end,'day');
    let _startHourIsOldStartHour = (variables[0].startHour == oldVariables[0].startHour);
    let _endHourIsOldEndHour = (variables[0].endHour == oldVariables[0].endHour);
    let _removeDaysAndHalf = ((!_startHourIsOldStartHour && moment(event.start).hour() == 13) || (!_endHourIsOldEndHour && moment(event.end).hour() == 12));
    let _addDaysAndHalf = ((!_startHourIsOldStartHour && moment(event.start).hour() == 9) || (!_endHourIsOldEndHour && moment(event.end).hour() == 18));
  
    return [_isTypeC,_startIsOldStart,_endIsOldEnd,_startHourIsOldStartHour,_endHourIsOldEndHour,_addDaysAndHalf,_removeDaysAndHalf]
}
//////////////////////////////////////////////////////////////////
  
// --------- Modifie un évènements autre que Congé ou Demande de Congé --------- //
function modif_event(event,variables){
    let resourceId = event.getResources()[0].id;
    let inputsValid = checkIfInputValid($('#form-info-event :input'),variables[0].start, variables[0].end, variables[0].startHour, variables[0].endHour, true, false, event);
  
    if(inputsValid){
      toggle_invalid_isSame($('#form-info-event :input'),true,false);  
      event = resetEvent(event,event.classNames[0],variables,resourceId)
  
      pushInfos(event.classNames[0], info = [], $("form#form-info-event :input"), resourceId, true)      
      let eventsToRemove = thisDateHasEvent(variables[0].start, variables[0].end, resourceId, true, variables[0].startHour, variables[0].endHour);
      EventsManagment(eventsToRemove, variables[0].startHour, variables[0].endHour, variables[0].start, variables[0].end, event, $('#modalInfoEvent'));
      cancelModalInfoEvent(); 
    }
}
//////////////////////////////////////////////////////////////////////////////////

  
// --------- Modifie un évènements de type Congé ou Demande de Congé --------- //
function modif_event_typeC(event, addDaysAndHalf, removeDaysAndHalf, variables){
    let nbrOfDays = (moment(variables[0].end).dayOfYear() - moment(variables[0].start).dayOfYear() ) - (moment(event.end).dayOfYear() - moment(event.start).dayOfYear());
    let _classNames = event.classNames[0];
    let inputsValid = checkIfInputValid($('#form-info-event :input'),variables[0].start, variables[0].end, variables[0].startHour, variables[0].endHour, true, false, event);
    let resourceId = event.getResources()[0].id;
    if(addDaysAndHalf)
      nbrOfDays = nbrOfDays - 0.5
    if(removeDaysAndHalf)
      nbrOfDays = nbrOfDays + 0.5      
    
    if(inputsValid){
      toggle_invalid_isSame($('#form-info-event :input'),true,false);  
      let hasenoughCongeAvailable = checkSolde($('#form-info-event :input'),event,nbrOfDays,$('#modalInfoEvent'),true,false);
      if(hasenoughCongeAvailable){
          if(_classNames == 'conge')
              soldeConge[resourceId] = soldeConge[resourceId] - nbrOfDays;
          event = resetEvent(event,event.classNames[0],variables,resourceId)
  
          pushInfos(event.classNames[0],info = [],$("form#form-info-event :input"),resourceId,true)
          let eventsToRemove = thisDateHasEvent(variables[0].start,variables[0].end,resourceId,true,variables[0].startHour,variables[0].endHour,);
          EventsManagment(eventsToRemove,variables[0].startHour,variables[0].endHour,variables[0].start,variables[0].end,event,$('#modalInfoEvent'));
          cancelModalInfoEvent(); 
      } 
    } 
}
///////////////////////////////////////////////////////////////////////////////

  
// --------- permet de passer de la description à la modification --------- //
function activate_modif_event(){
    $('#valid-modif-event-btn').show();
    $('#modif-event-btn').hide();
  
    $("form#form-info-event :input").each(function(){
      $(this).prop('disabled',false);
    })
}
//////////////////////////////////////////////////////////////////////////////
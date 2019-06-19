// creation d'évenement //
function confirm_form_event(form, nbrOfSlice, modal, idInfo){
  // cache le bouton validation et met un spinner pdt le traitement
  toggle_spinner(true); // appelé après le reste donc ne s'affiche pas 

  // Declaration Variables //
  let booleans = createBooleans(modal);
  let isTypeAddE = booleans[0], isTypeC = booleans[1], isConge = booleans[2];
  if(modal[0].id == 'modalAddEvent'){
    idInfo = setIdInfo(idInfo);
  }  
  let variables = pre_traitement(form, modal, isTypeAddE, isTypeC);

  // Check si les inputs sont valides
  let inputsValid = checkIfInputValid(form, variables[0].start, variables[0].end, variables[0].startHour, variables[0].endHour, isTypeC, isTypeAddE, variables[0].event);

  if(inputsValid){
      let allGood = true;
      // Check le solde de Conge si l'évenement est de type conge ou demande de conge
      if(isTypeC)
          allGood = checkSolde(form,variables[0].event, variables[0].nbrOfDays , modal, isTypeC, isTypeAddE);
      if(allGood){
          toggle_invalid_isSame(form,isTypeC,isTypeAddE);
          if(isConge)
              modifSolde(isTypeC,isTypeAddE,variables[0].nbrOfDays,variables[0].resourceId);
          infoManagment(isTypeAddE,variables,form,idInfo,nbrOfSlice,variables[0].event,variables[0].resourceId,modal);
          let eventsToRemove = thisDateHasEvent(variables[0].start, variables[0].end, variables[0].resourceId, true, variables[0].startHour, variables[0].endHour);
          EventsManagment(eventsToRemove, variables[0].startHour, variables[0].endHour, variables[0].start, variables[0].end, variables[0].event, modal);
      }
  } 
}
//////////////////////////

// Modules de creation d'événement //

// Créer les booleans pour la création d'un évènement // 
function createBooleans(modal){
  let _isTypeAddE = false, _isTypeC = false, _isConge = false;
  if(modal[0].id == 'modalAddEvent'){
    _isTypeAddE = true;
  }   
  if(modal[0].id == 'modalConge' || modal[0].id == 'modalDemandeConge' || modal[0].id == 'modalValidationConge' || (modal[0].id == 'modalAddEvent' && ($('#typeEvent option:selected').val() == 'demandeConge' || $('#typeEvent option:selected').val() == 'conge')))
      _isTypeC = true;
  if(modal[0].id == 'modalConge' || modal[0].id == 'modalValidationConge' || (modal[0].id == 'modalAddEvent' && $('#typeEvent option:selected').val() == 'conge'))
      _isConge = true;
  return [_isTypeAddE, _isTypeC, _isConge]
}
/////////////////////////////////////////

// Pre-traitement de la création d'évènements : créer les variables pour le traitement //
function pre_traitement(form,modal,isTypeAddE,isTypeC){
  // Variables //
  let _variables = create_variables(form, isTypeC, isTypeAddE);
  let event;
  let resourceId;
  if(modal[0].id == 'modalValidationConge'){
      event = $('#eventClicked').val();
      resourceId = $('#eventClicked').val().getResources()[0].id;
      event = resetEvent(event,['demandeCongeValid','zIndex'],_variables,resourceId);
  }
  else if(isTypeAddE){
      resourceId = $("#eventDblClicked").val().getResources()[0].id;
      event = {
          classNames: _variables[0].className,
          start: _variables[0].start,
          end: _variables[0].end,
          resourceId: resourceId,
      }; 
      calendar.addEvent(event);
      event = calendar.getEvents()[calendar.getEvents().length - 1]; 
  }
  else{
      event = _variables[0].event;
      resourceId = $('#dropLocation').val(); 
  }        
  _variables[0].event = event;
  _variables[0].resourceId = resourceId;

  return _variables;
}
//////////////////////////////////////////////////

// Permet de récupérer l'objet qui stocke les infos du type d'évènement créé (pour modalAddEvent) // 
function setIdInfo(idInfo){
  let _idInfo;
  switch(idInfo){
      case 'demandeConge':
      _idInfo = demandeCongesInfos;
      break;
      case "conge":
      _idInfo = congeInfos;
      break;
      case "absence":
      _idInfo = absenceInfos;
      break;
      case "arret":
      _idInfo = arretInfos;
      break;
      case "teletravail":
      _idInfo = teletravailInfos;
      break;
      case "formation":
      _idInfo = formationInfos;
      break;
      case "rdv_pro":
      _idInfo = rdv_proInfos;
      break;
      case "recup":
      _idInfo = recupInfos;
      break;
  }
  return _idInfo;
}
////////////////////////////////////////////////

// Modifie le solde de conge de l'employé si l'évènement créer est de type Congé //
function modifSolde(isTypeC,isTypeAddE,nbrOfDays,resourceId){
  if(isTypeC){
      if(isTypeAddE){
          soldeConge[resourceId] = soldeConge[resourceId] - nbrOfDays;
      }
      else{
          soldeConge[resourceId] = soldeConge[resourceId] - nbrOfDays;
      }
  }
}
/////////////////////////////////////////////////

// Push les infos de l'évènement dans l'objet qui stocke les infos du type d'évènement créé //
function infoManagment(isTypeAddE,variables,form,idInfo,nbrOfSlice,event,resourceId,modal){
  if(isTypeAddE){
      pushInfos(variables[0].className, variables[0].info, form, resourceId);
  }
  else if(modal[0].id == 'modalValidationConge'){
      pushInfos(event.classNames[0], variables[0].info, form, resourceId);
  }
  else{
      let info = variables[0].info
      form.each(function(){
          let info_id = $(this)[0].id.slice(nbrOfSlice);
          let val = $(this).val() ;
          info[info_id] = val;
      })
      info['emp_id'] = resourceId;
      idInfo.push(info);
  }
}
///////////////////////////////////////////////

// Vérifie que les inputs des modals sont valides //
function checkIfInputValid(form, start, end, startHour, endHour, isTypeC, isTypeAddE, event){
  let startIndex = 1;
  if(isTypeC)
      startIndex = 2;
  if(isTypeAddE){
      startIndex = 3;
  }
      

  if((start <= end) == false){
      $('.invalid').show()
      var element = document.getElementById(form[startIndex].id);
      element.classList.add('not-valid');
      event.remove();
      toggle_spinner(false);
      return false;
  }

  else if(
      (moment(start).isSame(moment(end),'day')) 
      && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
      $('.isTheSame').show();
      var element = document.getElementById(form[startIndex+1].id);
      element.classList.add('not-valid');
      element = document.getElementById(form[startIndex+2].id);
      element.classList.add('not-valid');
      event.remove();
      toggle_spinner(false);
      return false;
  }
  else  
      return true;
}
//////////////////////////////////////////////////////

// Vérifier si l'employé à suffisament de solde de congé disponible //
function checkSolde(form,event,nbrOfDays,modal,isTypeC,isTypeAddE){
  if( soldeConge[event.getResources()[0].id] - nbrOfDays < 0 ){
      cancelModal(form,modal,isTypeC,isTypeAddE,event);
      $('#soldeRestant').html();
      $('#soldeRestant').html(soldeConge[event.getResources()[0].id].toString()); // est faux si modal = modalAddEvent
      $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
      setTimeout(function(){
      $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500);
      }, 3000);
      toggle_spinner(false);
      return false;
  }
  else
      return true;
}
///////////////////////////////////////////////////////////////////

// active/desactive le spinner lors de création/modification d'évènement // 
function toggle_spinner(bool){
  if(bool){
      $('.btn-primary').hide();
      $('.spinner-border').show();
  }
  else if(!bool){
      $('.spinner-border').hide();
      $('.btn-primary').show();
      $('#valid-modif-event-btn').hide();
  }
}
////////////////////////////////////////////////////////////////////

// créer les variables pour le traitement de la création d'évènement // 
function create_variables(form,isTypeC,isTypeAddE){
  let variables = [];
  let startIndex = 0;
  let nbrOfDays = 0;
  let className = '';
  if(isTypeC)
      startIndex = 1;
  if(isTypeAddE){
      startIndex = 2;
      className = $('#typeEvent option:selected').val();
  } 
  let start = new Date(form[startIndex].value);
  let end = new Date(form[startIndex+1].value);
  let startHour = form[startIndex+2].value;
  let endHour = form[startIndex+3].value;
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if(isTypeC){
      nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1;
      if(startHour == 'Après-midi')
          nbrOfDays = nbrOfDays - 0.5
      if(endHour == 'Après-midi')
          nbrOfDays = nbrOfDays - 0.5
  }

  variables.push({'start':start,'end':end,'startHour':startHour,'endHour':endHour,'event':event,'className':className,'info':info,'nbrOfDays':nbrOfDays})
  return variables;
}
//////////////////////////////////////////////////////

// reset le formulaire s'il comportait des erreurs // 
function toggle_invalid_isSame(form,isTypeC,isTypeAddE){
  startIndex = 1;
  if(isTypeC)
      startIndex = 2;
  if(isTypeAddE)
      startIndex = 3;

  $('.invalid').hide();
  $('#'+form[startIndex].id).removeClass('not-valid');
  $('.isTheSame').hide();
  $('#'+form[startIndex+1].id).removeClass('not-valid');
  $('#'+form[startIndex+2].id).removeClass('not-valid');
}
////////////////////////////////////////////////

// ferme la modal ouvert // 
function cancelModal(form,modal,isTypeC,isTypeAddE,event){
  if(!isTypeAddE)
      event.remove();
  toggle_invalid_isSame(form,isTypeC,isTypeAddE);
  modal.modal('hide');
  setHeightOfRow();
}
//////////////////////////////////

// remove event et recrée un event avec les nouvelles propriété //
function resetEvent(event,classNames,variables,resourceId){
  let resetEvent;
  let _extendedProps;
  resourceId = event.getResources()[0].id;
  resetEvent = {
    classNames : classNames,
    start:variables[0].start,
    end:variables[0].end,
    resourceId:resourceId,
  };
  _extendedProps = event.extendedProps.ID;
  deleteEvent(event,true);
  calendar.addEvent(resetEvent);
  
  resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
  resetEvent.setExtendedProp('_ID',_extendedProps);
  event = resetEvent;
  return event;
}
//////////////////////////////////

//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////

// --------- Permet de se rendre à une date --------- //
function goToDate(date){
  dt = new Date(date)
  let oldViewStart = calendar.view.activeStart;
  calendar.gotoDate(dt);
  let newViewStart = calendar.view.activeStart;
  if(oldViewStart < newViewStart){
    createDefault();
  }
  $('#goToDate').modal('hide');
}
//////////////////////////////

// --------- Hide Modals et reset form-input | msg-erreur --------- //
function cancel(event){
  $('#modalDemandeConge').modal('hide');
  $('#modalConge').modal('hide');
  $('#modalAbsence').modal('hide');
  $('#modalArret').modal('hide');
  $('#modalTeletravail').modal('hide');
  $('#modalFormation').modal('hide');
  $('#modalRdvPro').modal('hide');
  $('#modalRecup').modal('hide');

  $('#dateFin').removeClass('not-valid');
  $('#CdateFin').removeClass('not-valid');
  $('#AdateFin').removeClass('not-valid');
  $('#ArdateFin').removeClass('not-valid');
  $('#TdateFin').removeClass('not-valid');
  $('#FdateFin').removeClass('not-valid');
  $('#RDVdateFin').removeClass('not-valid');
  $('#RdateFin').removeClass('not-valid');
  
  $('#heureDebut').removeClass('not-valid');
  $('#heureFin').removeClass('not-valid');
  $('#CheureDebut').removeClass('not-valid');
  $('#CheureFin').removeClass('not-valid');
  $('#AheureDebut').removeClass('not-valid');
  $('#AheureFin').removeClass('not-valid');
  $('#ArheureDebut').removeClass('not-valid');
  $('#ArheureFin').removeClass('not-valid');
  $('#TheureDebut').removeClass('not-valid');
  $('#TheureFin').removeClass('not-valid');
  $('#FheureDebut').removeClass('not-valid');
  $('#FheureFin').removeClass('not-valid');
  $('#RDVheureDebut').removeClass('not-valid');
  $('#RDVheureFin').removeClass('not-valid');
  $('#RheureDebut').removeClass('not-valid');
  $('#RheureFin').removeClass('not-valid');

  $('.require').hide();
  $('.invalid').hide();
  $('.isTheSame').hide();

  event.remove();
  setHeightOfRow();
  $('.spinner-border').hide();
  $('.btn-primary').show();
}

function cancelModalInfoEvent(){
  $("form#form-info-event :input").each(function(){
    $(this).prop('disabled',true);
  })

  $('#valid-modif-event-btn').hide();
  $('#modif-event-btn').show();
  $('#modalInfoEvent').modal('hide')
  toggle_invalid_isSame($("form#form-info-event :input"),true,false)
}
// --------- ------------------ --------- //

// --------- Deny d'un Congé --------- //
function denyDemandeConge(event){
  let newEvent = {
    start:event.start,
    end:event.end,
    classNames:['congeDeny','zIndex'],
    extendedProps: {'ID':event.extendedProps.ID},
    resourceId:event.getResources()[0].id,
  }
  event.remove();
  calendar.addEvent(newEvent);
  $('#modalValidationConge').modal('hide'); 
}
///////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////

// --------- permet de modifier les informations et / ou l'évenement --------- //
function valid_modif_event(event){
  // cache le bouton validation et met un spinner pdt le traitement //
  toggle_spinner(true); // appelé après le reste donc ne s'affiche pas

  // Variables //
  let variables = create_variables($('#form-info-event :input'),true,false);
  variables[0].event = event;
  let oldVariables = get_oldVariables(event);
  let booleans = createModifBoolean(event,variables,oldVariables);
  let isTypeC = booleans[0], startIsOldStart = booleans[1], endIsOldEnd = booleans[2], startHourIsOldStartHour = booleans[3], endHourIsOldEndHour = booleans[4], addDaysAndHalf = booleans[5],removeDaysAndHalf = booleans[6];

  // traitement //
  if( !startIsOldStart || !endIsOldEnd ){
      if(isTypeC)
          modif_event_typeC(event,addDaysAndHalf,removeDaysAndHalf,variables);
      else
          modif_event(event);
  }
  else if( (startIsOldStart && !startHourIsOldStartHour) || (endIsOldEnd && !endHourIsOldEndHour) ){
      if(isTypeC){
        modif_event_typeC(event,addDaysAndHalf,removeDaysAndHalf,variables);
      }  
      else{
        modif_event(event,variables);
      }
  }

  else{
      removeOldInfo(event.classNames[0]);
      pushInfos(event.classNames[0],info = [],$("form#form-info-event :input"),event.getResources()[0].id,true);
      cancelModalInfoEvent();
      toggle_spinner(false);
  }    
}
/////////////////////////////////

// Modules pour la modification d'évènements et/ou d'informations //

// obtient les infos sur un évènement avant modification //
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
///////////////////////////////////////////

// Supprime les anciennes informations de l'évènement modifié //
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
//////////////////////////////////////

// création des booleans pour la modification //
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
/////////////////////////////////////

// Modifie un évènements autre que Congé ou Demande de Congé
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
/////////////////////////////////////////////////

// Modifie un évènements de type Congé ou Demande de Congé //
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
/////////////////////////////////////

// --------- permet de passer de la description à la modification --------- //
function activate_modif_event(){
  $('#valid-modif-event-btn').show();
  $('#modif-event-btn').hide();

  $("form#form-info-event :input").each(function(){
    $(this).prop('disabled',false);
  })
}
//////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////

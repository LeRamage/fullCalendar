// --------- creation d'évenement --------- //
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
//////////////////////////////////////////////////


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
//////////////////////////////////////////////////////////////////////////////////


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
//////////////////////////////////////////////////////


// --------- Hide Modals et reset form-input | msg-erreur --------- //
function cancel(event){
  let hide = 'hide', not_valid = 'not-valid';
  $('#modalDemandeConge').modal(hide);
  $('#modalConge').modal(hide);
  $('#modalAbsence').modal(hide);
  $('#modalArret').modal(hide);
  $('#modalTeletravail').modal(hide);
  $('#modalFormation').modal(hide);
  $('#modalRdvPro').modal(hide);
  $('#modalRecup').modal(hide);

  $('#dateFin').removeClass(not_valid);
  $('#CdateFin').removeClass(not_valid);
  $('#AdateFin').removeClass(not_valid);
  $('#ArdateFin').removeClass(not_valid);
  $('#TdateFin').removeClass(not_valid);
  $('#FdateFin').removeClass(not_valid);
  $('#RDVdateFin').removeClass(not_valid);
  $('#RdateFin').removeClass(not_valid);
  
  $('#heureDebut').removeClass(not_valid);
  $('#heureFin').removeClass(not_valid);
  $('#CheureDebut').removeClass(not_valid);
  $('#CheureFin').removeClass(not_valid);
  $('#AheureDebut').removeClass(not_valid);
  $('#AheureFin').removeClass(not_valid);
  $('#ArheureDebut').removeClass(not_valid);
  $('#ArheureFin').removeClass(not_valid);
  $('#TheureDebut').removeClass(not_valid);
  $('#TheureFin').removeClass(not_valid);
  $('#FheureDebut').removeClass(not_valid);
  $('#FheureFin').removeClass(not_valid);
  $('#RDVheureDebut').removeClass(not_valid);
  $('#RDVheureFin').removeClass(not_valid);
  $('#RheureDebut').removeClass(not_valid);
  $('#RheureFin').removeClass(not_valid);

  $('.require').hide();
  $('.invalid').hide();
  $('.isTheSame').hide();

  event.remove();
  setHeightOfRow();
  toggle_spinner(false);
}
////////////////////////////////////////////////////////////////


// --------- Ferme la modalInfoEvent --------- //
function cancelModalInfoEvent(){
  $("form#form-info-event :input").each(function(){
    $(this).prop('disabled',true);
  })

  $('#valid-modif-event-btn').hide();
  $('#modif-event-btn').show();
  $('#modalInfoEvent').modal('hide')
  toggle_invalid_isSame($("form#form-info-event :input"),true,false)
}
////////////////////////////////////////////////


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
//////////////////////////////////////////


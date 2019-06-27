//////////////////
// Formulaires //
/////////////////


// --------- creation d'évenement --------- //
async function confirm_form_event(form, nbrOfSlice, modal, idInfo){
  // cache le bouton validation et met un spinner pdt le traitement
  toggle_spinner(true).then(() => {
    // Declaration Variables //
    try{
      let booleans = createBooleans(modal);
      let isTypeAddE = booleans[0], isTypeC = booleans[1], isConge = booleans[2];
      if(modal[0].id == 'modalAddEvent'){
        idInfo = setIdInfo(idInfo);
      }  
      let variables = pre_traitement(form, modal, isTypeAddE, isTypeC);
  
      // Check si les inputs sont valides
      let inputsValid = checkIfInputValid(form, variables[0].start, variables[0].end, variables[0].startHour, variables[0].endHour, isTypeC, isTypeAddE, variables[0].event);
  
      if(inputsValid){
          let inoffSolde = true;
          // Check le solde de Conge si l'évenement est de type conge ou demande de conge
          if(isTypeC)
            inoffSolde = checkSolde(form,variables[0].event, variables[0].nbrOfDays , modal, isTypeC, isTypeAddE);
          if(inoffSolde){
              toggle_invalid_isSame(form,isTypeC,isTypeAddE);
              if(isConge)
                  modifSolde(isTypeC,isTypeAddE,variables[0].nbrOfDays,variables[0].resourceId);
              infoManagment(isTypeAddE,variables,form,idInfo,nbrOfSlice,variables[0].event,variables[0].resourceId,modal);
              let eventsToRemove = thisDateHasEvent(variables[0].start, variables[0].end, variables[0].resourceId, true, variables[0].startHour, variables[0].endHour);
              EventsManagment(eventsToRemove, variables[0].startHour, variables[0].endHour, variables[0].start, variables[0].end, variables[0].event, modal);
          }
      }
    }
    catch{
      unknownErrorManagment(modal);
    } 
  }); // appelé après le reste donc ne s'affiche pas

}
//////////////////////////////////////////////////


// --------- permet de modifier les informations et / ou l'évenement --------- //
function valid_modif_event(event){
  // cache le bouton validation et met un spinner pdt le traitement //
  toggle_spinner(true); // appelé après le reste donc ne s'affiche pas

  // Variables //
  try{
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
  catch{
    unknownErrorManagment($('#modalInfoEvent'));
  }    
}
//////////////////////////////////////////////////////////////////////////////////


// --------- Permet de se rendre à une date --------- //
function goToDate(date){
  try{
    dt = new Date(date)
    let oldViewStart = calendar.view.activeStart;
    calendar.gotoDate(dt);
    let newViewStart = calendar.view.activeStart;
    if(oldViewStart < newViewStart){
      createDefault();
    }
    $('#goToDate').modal('hide');
  }
  catch{
    calendar.gotoDate(Date.now());
    $('#goToDate').modal('hide');
    displayAlert($('#alertErreurUnknown'));
  }
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

  toggle_spinner(false);
  event.remove();
  setHeightOfRow();
}
////////////////////////////////////////////////////////////////


// --------- Ferme la modalInfoEvent --------- //
function cancelModalInfoEvent(){
  $("form#form-info-event :input").each(function(){
    $(this).prop('disabled',true);
  })

  $('#valid-modif-event-btn').hide();
  $('#modif-event-btn').show();
  $('#modalInfoEvent').modal('hide');
  toggle_invalid_isSame($("form#form-info-event :input"),true,false);
}
////////////////////////////////////////////////


// --------- hide la modal addEvent --------- //
function cancelModalAddEvent(){
  $('#modalAddEvent').modal('hide');
  toggle_invalid_isSame($('#form-addEvent :input'),true,true);
  toggle_spinner(false);
}
///////////////////////////////////////////////


// --------- Deny d'un Congé --------- //
function denyDemandeConge(event){
  try{
    let eventDeny = createEventWithExtProp(['congeDeny','zIndex'],event.start,event.end,event.extendedProps.ID,event.getResources()[0].id);
    event.remove();
    calendar.addEvent(eventDeny);
    $('#modalValidationConge').modal('hide'); 
  }
  catch{
    unknownErrorManagment($('#modalValidationConge'));
  }
}
//////////////////////////////////////////


// --------- Au cas où il y aurait une erreur... --------- //
function unknownErrorManagment(modal){
  if(modal[0].id == 'modalAddEvent')
    cancelModalAddEvent();
  else if(modal[0].id == 'modalInfoEvent')
    cancelModalInfoEvent();
  else{
    event = $('#eventReceive').val();
    cancel(event);
  }
  toggle_spinner(false);
  displayAlert($('#alertErreurUnknown'));
}
////////////////////////////////////////////////////////////


// --------- Display une alert en cas d'erreur --------- //
function displayAlert(alert){
  alert.css('opacity', 1).slideDown();
  setTimeout(function(){
    alert.fadeTo(500, 0).slideUp(500);
  }, 3000);
}
//////////////////////////////////////////////////////////
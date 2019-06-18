function confirm_form_event(form, nbrOfSlice, modal, idInfo){
  // cache le bouton validation et met un spinner pdt le traitement
  toggle_spinner(true); // appelé après le reste donc ne s'affiche pas 
  
  // Declaration Variables //
  let isTypeAddE = false, isTypeC = false, isConge = false;
  if(modal[0].id == 'modalAddEvent'){
    isTypeAddE = true;
    idInfo = setIdInfo(idInfo);
  }   
  if(modal[0].id == 'modalConge' || modal[0].id == 'modalDemandeConge' || (modal[0].id == 'modalAddEvent' && ($('#typeEvent option:selected').val() == 'demandeConge' || $('#typeEvent option:selected').val() == 'conge')))
    isTypeC = true;
  if(modal[0].id == 'modalConge' || (modal[0].id == 'modalAddEvent' && $('#typeEvent option:selected').val() == 'conge'))
    isConge = true;
  let variables = create_variables(form, isTypeC, isTypeAddE);
  let event;
  let resourceId;

  // Check si les inputs sont valides
  let inputsValid = checkIfInputValid(form, variables[0].start, variables[0].end, variables[0].startHour, variables[0].endHour, isTypeC, isTypeAddE);

  if(inputsValid){
    let allGood = true;
    // Check le solde de Conge si l'évenement est de type conge ou demande de conge
    if(isTypeC)
      allGood = checkSolde(form,variables[0].event, variables[0].nbrOfDays , modal,isTypeC,isTypeAddE);
    if(allGood){
      toggle_invalid_isSame(form,isTypeC,isTypeAddE);
      if(isConge)
        modifSolde(isTypeC,isTypeAddE,variables[0].nbrOfDays);
      if(isTypeAddE){
        resourceId = $("#eventDblClicked").val().getResources()[0].id;
        event = {
            classNames: variables[0].className,
            start: variables[0].start,
            end: variables[0].end,
            resourceId: resourceId,
        };        
        calendar.addEvent(event);
        event = calendar.getEvents()[calendar.getEvents().length - 1];
      }
      else{
        event = variables[0].event;
        resourceId = $('#dropLocation').val();
      }

      infoManagment(isTypeAddE,variables,form,idInfo,nbrOfSlice,event);
      let eventsToRemove = thisDateHasEvent(variables[0].start, variables[0].end, resourceId, true, variables[0].startHour, variables[0].endHour);
      EventsManagment(eventsToRemove, variables[0].startHour, variables[0].endHour, variables[0].start, variables[0].end, event, modal);
    }
  } 
}


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


function modifSolde(isTypeC,isTypeAddE,nbrOfDays){
  if(isTypeC){
      if(isTypeAddE){
        soldeConge[$("#eventDblClicked").val().getResources()[0].id] = soldeConge[$("#eventDblClicked").val().getResources()[0].id] - nbrOfDays;
      }
      else{
        soldeConge[$('#draggedEventIdEmp').val()] = soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays;
      }
  }
}


function infoManagment(isTypeAddE,variables,form,idInfo,nbrOfSlice,event){
  if(isTypeAddE){
      pushInfos(variables[0].className, variables[0].info, $("form#form-addEvent :input"), $("#eventDblClicked").val().getResources()[0].id);
  }
  else{
      let info = variables[0].info
      form.each(function(){
          let info_id = $(this)[0].id.slice(nbrOfSlice);
          let val = $(this).val() ;
          info[info_id] = val;
      })
      info['emp_id'] = event.getResources()[0].id;
      idInfo.push(info);
  }
}


function checkIfInputValid(form, start,end,startHour,endHour,isTypeC, isTypeAddE){
  let startIndex = 1;
  if(isTypeC)
      startIndex = 2;
  if(isTypeAddE)
      startIndex = 3;

  if((start <= end) == false){
      $('.invalid').show()
      var element = document.getElementById(form[startIndex].id);
      element.classList.add('not-valid');
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
      toggle_spinner(false);
      return false;
  }
  else  
      return true;
}


function checkSolde(form,event,nbrOfDays,modal,isTypeC,isTypeAddE){
  if( soldeConge[event.getResources()[0].id] - nbrOfDays < 0 ){
    cancelModal(form,modal,isTypeC,isTypeAddE,event);
    $('#soldeRestant').html();
    $('#soldeRestant').html(soldeConge[event.getResources()[0].id].toString()); // est faux si modal = addEventClick
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


function cancelModal(form,modal,isTypeC,isTypeAddE,event){
  if(!isTypeAddE)
    event.remove();
  toggle_invalid_isSame(form,isTypeC,isTypeAddE);
  modal.modal('hide');
  setHeightOfRow();
}



















// --------- permet de passer de la description à la modification --------- //
function activate_modif_event(){
  $('#valid-modif-event-btn').show();
  $('#modif-event-btn').hide();

  $("form#form-info-event :input").each(function(){
    $(this).prop('disabled',false);
  })
}

// --------- permet de modifier les informations et / ou l'évenement --------- //
function valid_modif_event(event){
  $('.spinner-border').show();
  $('.btn-primary').hide();

  setTimeout(function(){
    let start = event.start;
    let end = event.end;
    if(event.end == null){
      end = event.start;
    }
    let startHour,endHour;
    if(moment(start).hour() == 9)
      startHour = 'Matin'
    else
      startHour = 'Après-midi'

    if(moment(end).hour() == 18)
      endHour = 'Soir'
    else
      endHour = 'Après-midi'

    if( !moment($('#IdateDebut').val()).isSame(start,'day') || !moment($('#IdateFin').val()).isSame(end,'day')){
      if(event.classNames[0] == 'conge' || event.classNames[0] == 'demandeCongeValid'){
        modif_event_typeC(event);
      }  
      else{
        modif_event(event);
      }
    }

    else if( (moment($('#IdateDebut').val()).isSame(start,'day') && $('#IheureDebut').val() != startHour) || (moment($('#IdateFin').val()).isSame(end,'day') && $('#IheureFin').val() != endHour) ){
      if(event.classNames[0] == 'conge' || event.classNames[0] == 'demandeCongeValid'){
        if(moment(start).hour() == 13)
          modif_event_typeC(event,false,true);
        else if(moment(end).hour() == 12)
          modif_event_typeC(event,false,true);
        else
          modif_event_typeC(event,true,false);
      }  
      else{
        modif_event(event);
      }
    }

    else{
      switch(event.classNames[0]){
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
      pushInfos(event.classNames[0],info = [],$("form#form-info-event :input"),event.getResources()[0].id,true);
      cancelModalInfoEvent();
      $('.spinner-border').hide();
      $('.btn-primary').show();
      $('#valid-modif-event-btn').hide();
    }   
  },10)

}

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

  $('#IdateFin').removeClass('not-valid');

  $('#IheureDebut').removeClass('not-valid');
  $('#IheureFin').removeClass('not-valid');

  $('.require').hide();
  $('.invalid').hide();
  $('.isTheSame').hide();
}

function cancelModalAddEvent(){
  $('#modalAddEvent').modal('hide')
  $('#addEdateFin').removeClass('not-valid');
  $('#addEheureDebut').removeClass('not-valid');
  $('#addEheureFin').removeClass('not-valid');

  $('.require').hide();
  $('.invalid').hide();
  $('.isTheSame').hide();
  setHeightOfRow();
}
// --------- ------------------ --------- //

// --------- Validation d'une Demande Congé --------- //
function validation_demande_conge(event){
  $('.spinner-border').show();
  $('.btn-primary').hide();

  setTimeout(function(){
    let start = new Date($('#VdateDebut').val());
    let end = new Date($('#VdateFin').val());
    let startHour = $('#VheureDebut').val();
    let endHour = $('#VheureFin').val();
    let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1
  
    if(startHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
    if(endHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
  
    if((start <= end) == false){
      $('.invalid').show()
      let element = document.getElementById('VdateFin');
      element.classList.add('not-valid');
      $('.btn-primary').show();
      $('.spinner-border').hide();
      $('#valid-modif-event-btn').hide();
    }
  
    else if(
      (moment(start).isSame(moment(end),'day')) 
      && (startHour =='Après-midi' && endHour == 'Après-midi')
    ){
      $('.isTheSame').show()
      let element = document.getElementById('VheureDebut');
      element.classList.add('not-valid');
      element = document.getElementById('VheureFin');
      element.classList.add('not-valid');
      $('.btn-primary').show();
      $('.spinner-border').hide();
      $('#valid-modif-event-btn').hide();
    }
  
    else if(soldeConge[event.getResources()[0].id] - nbrOfDays < 0){
      $('#modalValidationConge').modal('hide');
      $('#soldeRestant').html();
      $('#soldeRestant').html(soldeConge[event.getResources()[0].id].toString());
      $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
      setTimeout(function(){
        $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
      }, 3000);
    }
  
    else{
      $('.invalid').hide();
      $('#VdateFin').removeClass('not-valid');
      $('.isTheSame').hide();
      $('#VheureDebut').removeClass('not-valid');
      $('#VheureFin').removeClass('not-valid');
  
      let resetEvent;
      let _extendedProps;
      resetEvent = {
        classNames:['demandeCongeValid','zIndex'],
        extendedProps: {'ID':event.extendedProps.ID},
        start:start,
        end:end,
        resourceId:event.getResources()[0].id,
      };
  
      soldeConge[event.getResources()[0].id] = soldeConge[event.getResources()[0].id] - nbrOfDays;
      _extendedProps = event.extendedProps.ID;
      deleteEvent(event,true);
      calendar.addEvent(resetEvent);
      resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
      resetEvent.setExtendedProp('_ID',_extendedProps);
      pushInfos(resetEvent.classNames[0],info = [],$("form#form-validation-conge :input"),resetEvent.getResources()[0].id)
      let eventsToRemove = thisDateHasEvent(start,end,resetEvent.getResources()[0].id,true);
      EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalValidationConge'));
    }
  },10)

}

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

function modif_event(event){
  let start = new Date($('#IdateDebut').val());
  let end = new Date($('#IdateFin').val());
  let startHour = $('#IheureDebut').val();
  let endHour = $('#IheureFin').val();
  let inputsValid = checkIfInputValid(start,end,startHour,endHour)

  if(inputsValid){
    $('.invalid').hide();
    $('#IdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#IheureDebut').removeClass('not-valid');
    $('#IheureFin').removeClass('not-valid');

    let resetEvent;
    let _extendedProps;
    resetEvent = {
      classNames : event.classNames[0],
      start:start,
      end:end,
      resourceId:event.getResources()[0].id,
    };
    _extendedProps = event.extendedProps.ID;
    deleteEvent(event,true);
    calendar.addEvent(resetEvent);
    
    resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
    resetEvent.setExtendedProp('_ID',_extendedProps);
    pushInfos(resetEvent.classNames[0],info = [],$("form#form-info-event :input"),resetEvent.getResources()[0].id,true)
    
    let eventsToRemove = thisDateHasEvent(start,end,resetEvent.getResources()[0].id,true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalInfoEvent'));
    cancelModalInfoEvent(); 
  }
}

function modif_event_typeC(event,singleDayToMidDay = false,midDayToFullDay = false){

    let start = new Date($('#IdateDebut').val());
    let end = new Date($('#IdateFin').val());
    let startHour = $('#IheureDebut').val();
    let endHour = $('#IheureFin').val();
    let eventEnd = event.end;
    if(event.end == null){
      eventEnd = event.start;
    }
    let nbrOfDays = (moment(end).dayOfYear() - moment(start).dayOfYear() ) - (moment(eventEnd).dayOfYear() - moment(event.start).dayOfYear());
    let _classNames = event.classNames[0];
    let inputsValid = checkIfInputValid(start,end,startHour,endHour);
  
    if( (startHour == 'Après-midi' && moment(start).isBefore(event.start,'day')) || midDayToFullDay)
      nbrOfDays = nbrOfDays - 0.5
    if( (endHour == 'Après-midi' && moment(end).isAfter(eventEnd,'day')))
      nbrOfDays = nbrOfDays - 0.5
    if((startHour == 'Après-midi' && moment(start).isAfter(event.start,'day')) || singleDayToMidDay)
      nbrOfDays = nbrOfDays + 0.5
    if((endHour == 'Après-midi' && moment(end).isBefore(eventEnd,'day')))
      nbrOfDays = nbrOfDays + 0.5
    

    let hasenoughCongeAvailable = checkSolde(event,nbrOfDays);
  
    if(inputsValid && hasenoughCongeAvailable){
      $('.invalid').hide();
      $('#IdateFin').removeClass('not-valid');
      $('.isTheSame').hide();
      $('#IheureDebut').removeClass('not-valid');
      $('#IheureFin').removeClass('not-valid');
  
      if(_classNames == 'conge')
        soldeConge[event.getResources()[0].id] = soldeConge[event.getResources()[0].id] - nbrOfDays;
  
      let resetEvent;
      let _extendedProps;
      resetEvent = {
        classNames : event.classNames[0],
        start:start,
        end:end,
        resourceId:event.getResources()[0].id,
      };
      _extendedProps = event.extendedProps.ID;
      deleteEvent(event,true);
      calendar.addEvent(resetEvent);
      
      resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
      resetEvent.setExtendedProp('_ID',_extendedProps);
      pushInfos(resetEvent.classNames[0],info = [],$("form#form-info-event :input"),resetEvent.getResources()[0].id,true)
      let eventsToRemove = thisDateHasEvent(start,end,resetEvent.getResources()[0].id,true);
      EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalInfoEvent'));
      cancelModalInfoEvent(); 
    }

}


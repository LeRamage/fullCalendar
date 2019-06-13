// --------- Confirmation Demande de Congé | Congé --------- //
function confirm_form_typeC(form,nbrOfSlice,modal,idForm){
  $('.btn-primary').hide();
  $('.spinner-border').show();
  
  let start = new Date(form[1].value);
  let end = new Date(form[2].value);
  let startHour = form[3].value;
  let endHour = form[4].value;
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = []
  let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1

  if(startHour == 'Après-midi')
    nbrOfDays = nbrOfDays - 0.5
  if(endHour == 'Après-midi')
    nbrOfDays = nbrOfDays - 0.5

  if((start <= end) == false){
    $('.invalid').show()
    var element = document.getElementById(form[2].id);
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    var element = document.getElementById(form[3].id);
    element.classList.add('not-valid');
    element = document.getElementById(form[4].id);
    element.classList.add('not-valid');
  }

  else if(soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays < 0){
    event.remove();
    setHeightOfRow();
    modal.modal('hide');
    $('#soldeRestant').html();
    $('#soldeRestant').html(soldeConge[$('#draggedEventIdEmp').val()].toString());
    $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
    setTimeout(function(){
      $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
    }, 3000);
  }

  else{
    $('.invalid').hide();
    $(form[2].id).removeClass('not-valid');
    $('.isTheSame').hide();
    $(form[3].id).removeClass('not-valid');
    $(form[4].id).removeClass('not-valid');

    if(idForm == congeInfos)
      soldeConge[$('#draggedEventIdEmp').val()] = soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays;

    form.each(function(){
      let info_id = $(this)[0].id.slice(nbrOfSlice);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    idForm.push(info);
    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,modal);
  }
}

// --------- confirmation event Absence | Arret | Teletravail | Formation | RDV-Pro | Recup --------- //
function confirm_form_event(form,nbrOfSlice,modal,idForm){
  $('.btn-primary').hide();
  $('.spinner-border').show();

  let start = new Date(form[0].value);
  let end = new Date(form[1].value);
  let startHour = form[2].value;
  let endHour = form[3].value;
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];
  
  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById(form[1].id);
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById(form[2].id);
    element.classList.add('not-valid');
    element = document.getElementById(form[3].id);
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $(form[1].id).removeClass('not-valid');
    $('.isTheSame').hide();
    $(form[2].id).removeClass('not-valid');
    $(form[3].id).removeClass('not-valid');

    form.each(function(){
      let info_id = $(this)[0].id.slice(nbrOfSlice);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    idForm.push(info);
    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,modal);
  }
}

// --------- Validation formulaire d'ajout d'événement --------- //
function confirm_form_addEvent(){
  $('.spinner-border').show();
  $('.btn-primary').hide();

  let start = new Date($('#addEdateDebut').val());
  let end = new Date($('#addEdateFin').val());
  let startHour = $('#addEheureDebut').val();
  let endHour = $('#addEheureFin').val();
  let _classNames = $('#typeEvent option:selected').val();
  let info = [];
  let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1

  if(_classNames == 'demandeConge' || _classNames == 'conge'){
    if(startHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
    if(endHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
  }

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('addEdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('addEheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('addEheureFin');
    element.classList.add('not-valid');
  }

  else if((_classNames == 'demandeConge' || _classNames == 'conge') && soldeConge[$("#eventDblClicked").val().getResources()[0].id] - nbrOfDays < 0){
    $('#modalAddEvent').modal('hide');
    $('#soldeRestant').html();
    $('#soldeRestant').html(soldeConge[$("#eventDblClicked").val().getResources()[0].id].toString());
    $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
    setTimeout(function(){
      $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
    }, 3000);
  }

  else{
    $('.invalid').hide();
    $('#addEdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#addEheureDebut').removeClass('not-valid');
    $('#addEheureFin').removeClass('not-valid');

    if(_classNames == 'conge')
      soldeConge[$("#eventDblClicked").val().getResources()[0].id] = soldeConge[$("#eventDblClicked").val().getResources()[0].id] - nbrOfDays;
    
    pushInfos(_classNames,info,$("form#form-addEvent :input"),$("#eventDblClicked").val().getResources()[0].id);

    let event = {
      classNames: _classNames,
      start: start,
      end: end,
      resourceId: $("#eventDblClicked").val().getResources()[0].id,
    };
    
    calendar.addEvent(event);
    event = calendar.getEvents()[calendar.getEvents().length - 1];
    let eventsToRemove = thisDateHasEvent(start,end,$("#eventDblClicked").val().getResources()[0].id,true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalAddEvent');
  }  
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

  let start = event.start;
  let end = event.end;
  if(event.end == null){
    end = event.start;
  }
  if( !moment($('#IdateDebut').val()).isSame(start,'day') || !moment($('#IdateFin').val()).isSame(end,'day') ){
    if(event.classNames[0] == 'conge' || event.classNames[0] == 'demandeCongeValid'){
      modif_event_typeC(event);
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
    $('.spinner-border').show();
    $('.btn-primary').hide();
  }   
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
  $('.spinner-border').show();
  $('.btn-primary').hide();
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
    deleteEvent(event);
    calendar.addEvent(resetEvent);
    resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
    resetEvent.setExtendedProp('_ID',_extendedProps);
    pushInfos(resetEvent.classNames[0],info = [],$("form#form-validation-conge :input"),resetEvent.getResources()[0].id)
    let eventsToRemove = thisDateHasEvent(start,end,resetEvent.getResources()[0].id,true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalValidationConge'));
  }
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
    deleteEvent(event);
    calendar.addEvent(resetEvent);
    
    resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
    resetEvent.setExtendedProp('_ID',_extendedProps);
    pushInfos(resetEvent.classNames[0],info = [],$("form#form-info-event :input"),resetEvent.getResources()[0].id,true)
    
    let eventsToRemove = thisDateHasEvent(start,end,resetEvent.getResources()[0].id,true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalInfoEvent'));
    cancelModalInfoEvent(); 
  }
}

function modif_event_typeC(event){
  let start = new Date($('#IdateDebut').val());
  let end = new Date($('#IdateFin').val());
  let startHour = $('#IheureDebut').val();
  let endHour = $('#IheureFin').val();
  let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1
  let _classNames = event.classNames[0];
  let inputsValid = checkIfInputValid(start,end,startHour,endHour);

  if(startHour == 'Après-midi')
    nbrOfDays = nbrOfDays - 0.5
  if(endHour == 'Après-midi')
    nbrOfDays = nbrOfDays - 0.5
  
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
    deleteEvent(event);
    calendar.addEvent(resetEvent);
    
    resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
    resetEvent.setExtendedProp('_ID',_extendedProps);
    pushInfos(resetEvent.classNames[0],info = [],$("form#form-info-event :input"),resetEvent.getResources()[0].id,true)
    let eventsToRemove = thisDateHasEvent(start,end,resetEvent.getResources()[0].id,true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalInfoEvent'));
    cancelModalInfoEvent(); 
  }
}

function checkIfInputValid(start,end,startHour,endHour){
  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('IdateFin');
    element.classList.add('not-valid');
    $('.spinner-border').show();
    $('.btn-primary').hide();
    return false;
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('IheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('IheureFin');
    element.classList.add('not-valid');
    $('.spinner-border').show();
    $('.btn-primary').hide();
    return false;
  }
  else  
    return true;
}

function checkSolde(event,nbrOfDays){
  if( soldeConge[event.getResources()[0].id] - nbrOfDays < 0 ){
    cancelModalInfoEvent();
    $('#soldeRestant').html();
    $('#soldeRestant').html(soldeConge[event.getResources()[0].id].toString());
    $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
    setTimeout(function(){
      $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
    }, 3000);
    $('.spinner-border').show();
    $('.btn-primary').hide();
    return false;
  }
  else
    return true;
}


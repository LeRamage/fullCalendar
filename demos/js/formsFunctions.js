// --------- Confirmation du formulaire de Demande de Congé --------- //
function confirm_form_Demandeconge(){

    let start = new Date($('#dateDebut').val());
    let end = new Date($('#dateFin').val());
    let startHour = $('#heureDebut').val();
    let endHour = $('#heureFin').val();
    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let info = [];
    let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1

    if(startHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
    if(endHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5

    if((start <= end) == false){
      $('.invalid').show()
      let element = document.getElementById('dateFin');
      element.classList.add('not-valid');
    }
    
    else if(
      (moment(start).isSame(moment(end),'day')) 
      && (startHour =='Après-midi' && endHour == 'Après-midi')
    ){
      $('.isTheSame').show()
      let element = document.getElementById('heureDebut');
      element.classList.add('not-valid');
      element = document.getElementById('heureFin');
      element.classList.add('not-valid');
    }

    else if(soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays < 0){
      event.remove();
      setHeightOfRow();
      $('#modalDemandeConge').modal('hide');
      $('#soldeRestant').html();
      $('#soldeRestant').html(soldeConge[$('#draggedEventIdEmp').val()].toString());
      $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
      setTimeout(function(){
        $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
      }, 3000);
    }

    else{
      $('.invalid').hide();
      $('#dateFin').removeClass('not-valid');
      $('.isTheSame').hide();
      $('#heureDebut').removeClass('not-valid');
      $('#heureFin').removeClass('not-valid');
      

      $("form#form-demandeConge :input").each(function(){
        let info_id = 'V'+$(this)[0].id;
        let val = $(this).val() ;
        info[info_id] = val;
      })      
      info['emp_id'] = event.getResources()[0].id;
      demandeCongesInfos.push(info);

      let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
      EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalDemandeConge');     
    } 
  }
  
// --------- Confirmation du formulaire de Congé --------- //
function confirm_form_conge(){
  let start = new Date($('#CdateDebut').val());
  let end = new Date($('#CdateFin').val());
  let startHour = $('#CheureDebut').val();
  let endHour = $('#CheureFin').val();   
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = []
  let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1

  if(startHour == 'Après-midi')
    nbrOfDays = nbrOfDays - 0.5
  if(endHour == 'Après-midi')
    nbrOfDays = nbrOfDays - 0.5

  if((start <= end) == false){
    $('.invalid').show()
    var element = document.getElementById('CdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    var element = document.getElementById('CheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('CheureFin');
    element.classList.add('not-valid');
  }

  else if(soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays < 0){
    event.remove();
    setHeightOfRow();
    $('#modalConge').modal('hide');
    $('#soldeRestant').html();
    $('#soldeRestant').html(soldeConge[$('#draggedEventIdEmp').val()].toString());
    $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
    setTimeout(function(){
      $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
    }, 3000);
  }

  else{
    $('.invalid').hide();
    $('#dateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#CheureDebut').removeClass('not-valid');
    $('#CheureFin').removeClass('not-valid');

    soldeConge[$('#draggedEventIdEmp').val()] = soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays;

    $("form#form-Conge :input").each(function(){
      let info_id = $(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    congeInfos.push(info);
    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalConge')
  } 
}

// --------- Validation formulaire absence --------- //
function confirm_form_Absence(){
  let start = new Date($('#AdateDebut').val());
  let end = new Date($('#AdateFin').val());
  let startHour = $('#AheureDebut').val();
  let endHour = $('#AheureFin').val();
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('AdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('AheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('AheureFin');
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $('#AdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#AheureDebut').removeClass('not-valid');
    $('#AheureFin').removeClass('not-valid');

    $("form#form-absence :input").each(function(){
      let info_id = $(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    absenceInfos.push(info);
    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalAbsence');
  
  } 
}

// --------- Validation formulaire arret --------- //
function confirm_form_Arret(){
  let start = new Date($('#ArdateDebut').val());
  let end = new Date($('#ArdateFin').val());
  let startHour = $('#ArheureDebut').val();
  let endHour = $('#ArheureFin').val();
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('ArdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('ArheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('ArheureFin');
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $('#ArdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#ArheureDebut').removeClass('not-valid');
    $('#ArheureFin').removeClass('not-valid');

    $("form#form-arret :input").each(function(){
      let info_id = $(this)[0].id.slice(2);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    arretInfos.push(info);
    
    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalArret'); 
  } 
}

// --------- Validation formulaire teletravail --------- //
function confirm_form_Teletravail(){
  let start = new Date($('#TdateDebut').val());
  let end = new Date($('#TdateFin').val());
  let startHour = $('#TheureDebut').val();
  let endHour = $('#TheureFin').val();
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('TdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('TheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('TheureFin');
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $('#TdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#TheureDebut').removeClass('not-valid');
    $('#TheureFin').removeClass('not-valid');

    $("form#form-teletravail :input").each(function(){
      let info_id = $(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    teletravailInfos.push(info);

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalTeletravail'); 
  } 
}

// --------- Validation formulaire formation --------- //
function confirm_form_formation(){
  let start = new Date($('#FdateDebut').val());
  let end = new Date($('#FdateFin').val());
  let startHour = $('#FheureDebut').val();
  let endHour = $('#FheureFin').val();
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('FdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('FheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('FheureFin');
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $('#FdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#FheureDebut').removeClass('not-valid');
    $('#FheureFin').removeClass('not-valid');

    $("form#form-formation :input").each(function(){
      let info_id = $(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    formationInfos.push(info);

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalFormation'); 
  } 
}

// --------- Validation formulaire rdv pro --------- //
function confirm_form_RdvPro(){
  let start = new Date($('#RDVdateDebut').val());
  let end = new Date($('#RDVdateFin').val());
  let startHour = $('#RDVheureDebut').val();
  let endHour = $('#RDVheureFin').val();
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('RDVdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('RDVheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('RDVheureFin');
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $('#RDVdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#RDVheureDebut').removeClass('not-valid');
    $('#RDVheureFin').removeClass('not-valid');

    $("form#form-rdvPro :input").each(function(){
      let info_id = $(this)[0].id.slice(3);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    rdv_proInfos.push(info);

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalRdvPro'); 
  } 
}

// --------- Validation formulaire recup --------- //
function confirm_form_Recup(){
  let start = new Date($('#RdateDebut').val());
  let end = new Date($('#RdateFin').val());
  let startHour = $('#RheureDebut').val();
  let endHour = $('#RheureFin').val();
  let event = calendar.getEvents()[calendar.getEvents().length - 1];
  let info = [];

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('RdateFin');
    element.classList.add('not-valid');
  }

  else if(
    (moment(start).isSame(moment(end),'day')) 
    && (startHour =='Après-midi' && endHour == 'Après-midi')
  ){
    $('.isTheSame').show()
    let element = document.getElementById('RheureDebut');
    element.classList.add('not-valid');
    element = document.getElementById('RheureFin');
    element.classList.add('not-valid');
  }

  else{
    $('.invalid').hide();
    $('#RdateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#RheureDebut').removeClass('not-valid');
    $('#RheureFin').removeClass('not-valid');

    $("form#form-recup :input").each(function(){
      let info_id = $(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = event.getResources()[0].id;
    recupInfos.push(info);

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,startHour,endHour,start,end,event,'#modalRecup'); 
  } 
}

// --------- Validation formulaire d'ajout d'événement --------- //
function confirm_form_addEvent(){
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
  let start = new Date($('#IdateDebut').val());
  let end = new Date($('#IdateFin').val());
  let startHour = $('#IheureDebut').val();
  let endHour = $('#IheureFin').val();
  let nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1
  let _classNames = event.classNames[0];

  if(_classNames == 'demandeConge' || _classNames == 'conge'){
    if(startHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
    if(endHour == 'Après-midi')
      nbrOfDays = nbrOfDays - 0.5
  }

  if((start <= end) == false){
    $('.invalid').show()
    let element = document.getElementById('IdateFin');
    element.classList.add('not-valid');
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
  }

  else if((_classNames == 'demandeConge' || _classNames == 'conge' || _classNames == 'demandeCongeValid') && soldeConge[event.getResources()[0].id] - nbrOfDays < 0){
    $('#modalInfoEvent').modal('hide');
    $('#soldeRestant').html();
    $('#soldeRestant').html(soldeConge[event.getResources()[0].id].toString());
    $('#alertSoldeInsuffisant').css('opacity', 1).slideDown();
    setTimeout(function(){
      $('#alertSoldeInsuffisant').fadeTo(500, 0).slideUp(500)
    }, 3000);
  }

  else{
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
    if(eventsToRemove.length > 0 && !eventsToRemove.find(e=>e==true)) {
      EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalInfoEvent'));
      cancelModalInfoEvent(); 
    }
    else{
      cancelModalInfoEvent();
    } 
    
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

  else if(soldeConge[$('#draggedEventIdEmp').val()] - nbrOfDays < 0){
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
    if(eventsToRemove.length > 0 && !eventsToRemove.find(e=>e==true)) {
      EventsManagment(eventsToRemove,startHour,endHour,start,end,resetEvent,$('#modalValidationConge'));
    }
    else{
      $('#modalValidationConge').modal('hide')
    }
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

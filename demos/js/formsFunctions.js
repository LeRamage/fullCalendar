// --------- Confirmation du formulaire de Demande de Congé --------- //
function confirm_form_Demandeconge(){

    let start = new Date($('#dateDebut').val());
    let end = new Date($('#dateFin').val());
    let startHour = $('#heureDebut').val();
    let endHour = $('#heureFin').val();
    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let info = [];
  
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
  
      let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
      EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalDemandeConge');
      
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

  else{
    $('.invalid').hide();
    $('#dateFin').removeClass('not-valid');
    $('.isTheSame').hide();
    $('#CheureDebut').removeClass('not-valid');
    $('#CheureFin').removeClass('not-valid');

    $("form#form-Conge :input").each(function(){
      let info_id = 'V'+$(this)[0].id.slice(1);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalConge')
  } 
}

// --------- Annulation d'un Congé --------- //
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
}

// --------- Validation d'une Demande Congé --------- //
function validation_demande_conge(event){
    let newEvent = {
      start:event.start,
      end:event.end,
      classNames:['conge','zIndex'],
      extendedProps: {'ID':event.extendedProps.ID},
      resourceId:event.getResources()[0].id,
    }
    
    event.remove(); 
    calendar.addEvent(newEvent);
    
    $('#modalValidationConge').modal('hide'); 
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

    // $("form#form-absence :input").each(function(){
    //   let info_id = 'V'+$(this)[0].id;
    //   let val = $(this).val() ;
    //   info[info_id] = val;
    // })

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalAbsence');
  
  } 
}

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

    // $("form#form-arret :input").each(function(){
    //   let info_id = 'V'+$(this)[0].id;
    //   let val = $(this).val() ;
    //   info[info_id] = val;
    // })

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalArret'); 
  } 
}

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

    // $("form#form-teletravail :input").each(function(){
    //   let info_id = 'V'+$(this)[0].id;
    //   let val = $(this).val() ;
    //   info[info_id] = val;
    // })

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalTeletravail'); 
  } 
}

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

    // $("form#form-formation :input").each(function(){
    //   let info_id = 'V'+$(this)[0].id;
    //   let val = $(this).val() ;
    //   info[info_id] = val;
    // })

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalFormation'); 
  } 
}

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

    // $("form#form-rdvPro :input").each(function(){
    //   let info_id = 'V'+$(this)[0].id;
    //   let val = $(this).val() ;
    //   info[info_id] = val;
    // })

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalRdvPro'); 
  } 
}

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

    // $("form#form-recup :input").each(function(){
    //   let info_id = 'V'+$(this)[0].id;
    //   let val = $(this).val() ;
    //   info[info_id] = val;
    // })

    let eventsToRemove = thisDateHasEvent(start,end,$('#dropLocation').val(),true);
    EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalRecup'); 
  } 
}

function confirm_form_addEvent(){
  let start = new Date($('#addEdateDebut').val());
  let end = new Date($('#addEdateFin').val());
  let startHour = $('#addEheureDebut').val();
  let endHour = $('#addEheureFin').val();
  let _classNames;
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
      
      $("form#form-addEvent :input").each(function(){
        let info_id = 'V'+$(this)[0].id.slice(4);
        let val = $(this).val() ;
        info[info_id] = val;
      })

      switch($('#typeEvent option:selected').val()){
        case 'DemandedeConge':
          _classNames = 'demandeConge';
          break;
        case 'Conge' :
          _classNames = 'conge';
          break;
        case 'Absence' :
          _classNames = 'absence';
          break;
        case 'Arret' :
          _classNames = 'arret';
          break;
        case 'Teletravail' :
          _classNames = 'teletravail';
          break;
        case 'Formation' :
          _classNames = 'formation';
          break;
        case 'RDVpro' :
          _classNames = 'rdv_pro';
          break;
        case 'Recup' :
          _classNames = 'recup';
          break;
      }
    
      let event = {
        classNames: _classNames,
        start: start,
        end: end,
        resourceId: $("#eventDblClicked").val().getResources()[0].id,
      };
    
      calendar.addEvent(event);
      event = calendar.getEvents()[calendar.getEvents().length - 1];
      
      let eventsToRemove = thisDateHasEvent(start,end,$("#eventDblClicked").val().getResources()[0].id,true);
      EventsManagment(eventsToRemove,info,startHour,endHour,start,end,event,'#modalAddEvent'); 
  }  
}

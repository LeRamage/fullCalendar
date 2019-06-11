var calendar ;
var demandeCongesInfos = [], demandeCongeValidInfos = [], congeInfos = [], absenceInfos = [], arretInfos = [], teletravailInfos = [], formationInfos = [], rdv_proInfos = [], recupInfos = [];
var width_event;
var soldeConge = []; 

document.addEventListener('DOMContentLoaded', function() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable;

    /* initialize the external events
    -----------------------------------------------------------------*/
    //// the individual way to do it
    var containerEl = document.getElementById('external-events-list');
    var eventEls = Array.prototype.slice.call(
      containerEl.querySelectorAll('.fc-event')
    );
    for(i=1;i<eventEls.length - 1; i++){
      eventEl = eventEls[i];
      _id = eventEl.id;
      new Draggable(eventEl, {
        eventData: {
          title: eventEl.innerText.trim(),
          classNames:_id,
          id:_id,
        }
      });
    }

    /* initialize the calendar
    -----------------------------------------------------------------*/

    var calendarEl = document.getElementById('calendar');

    calendar = new Calendar(calendarEl, {
    plugins: [ 'resourceTimeline','interaction'],
    
    defaultView: 'custom3Month',
    timezone : 'local',
    locale: 'fr',
    droppable:true,
    editable: false,
    displayEventTime: false,
    displayEventEnd: false,
    contentHeight: 'auto',
    resourceAreaWidth: '10%',
    firstDay:1,

    customButtons: {
      myCustomButton: {
        text: 'Aller à la date',
        click: function() {
          $('#goToDate').modal('show');
        }
      }
    },

    views: {
      custom3Month:{
        type:'resourceTimeline',
        duration:{ months: 3 },
        slotDuration: { days:1 },
        buttonText: '3 mois',
      },
      customWeek:{
        type:'resourceTimeline',
        duration:{ weeks: 1 },
        slotDuration: { days:1 },
        buttonText: '1 semaine',
      },
      customDay:{
        type:'resourceTimeline',
        duration:{ days: 1 },
        slotDuration: { days:1 },
        buttonText: '1 jour',
      }
    },

    header: {
      left: 'prev,next today, myCustomButton',
      center: 'title',
      right: 'customDay,customWeek,custom3Month'
    },

    resourceLabelText: 'Date',
    resourceGroupField: 'type',
    resources: [
      { id: 'emp1', type: 'Employés',title: 'Jean Bombeur' },
      { id: 'emp2', type: 'Employés',title: 'Jean Talu' },
      { id: 'emp3', type: 'Employés',title: 'Bowie Ken' },
      { id: 'emp4', type: 'Employés',title: 'Alain Dii' },
      { id: 'recap-present', type:'Récapitulatif', title: 'Total Présences'},
    ],
    
    eventClick: function(e) {
      var eventClassNames = e.event.classNames[0];
      $('#eventClicked').val(e.event);

      if(eventClassNames == 'demandeConge'){
        $('#info-type-conge').show();
        demandeCongesInfos.forEach(function(info){
          dateConge = new Date(info["VdateDebut"]);
          if(moment(dateConge).isSame(moment(e.event.start),'day') && info['emp_id'] == e.event.getResources()[0].id){
            Object.keys(info).forEach(function(element){
              $('#'+element).val(info[element]);
            })
            return; // ?
          }
        }) 
        $('#modalValidationConge').modal('show')
      }
      else if(eventClassNames == 'conge'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').show();
        remplirModalInfoEvent(congeInfos,e.event,$('#modalInfoEvent'));
      }
      else if(eventClassNames == 'absence'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').hide();
        remplirModalInfoEvent(absenceInfos,e.event,$('#modalInfoEvent'));       
      }  
      else if(eventClassNames == 'arret'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').hide();
        remplirModalInfoEvent(arretInfos,e.event,$('#modalInfoEvent'));
      }  
      else if(eventClassNames == 'teletravail'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').hide();
        remplirModalInfoEvent(teletravailInfos,e.event,$('#modalInfoEvent'));
      } 
      else if(eventClassNames == 'formation'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').hide();
        remplirModalInfoEvent(formationInfos,e.event,$('#modalInfoEvent'));
      }  
      else if(eventClassNames == 'rdv_pro'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').hide();
        remplirModalInfoEvent(rdv_proInfos,e.event,$('#modalInfoEvent'));
      }     
      else if(eventClassNames == 'recup'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').hide();
        remplirModalInfoEvent(recupInfos,e.event,$('#modalInfoEvent'));
      }
      else if(eventClassNames == 'demandeCongeValid'){
        $('#modalInfoEvent').modal({backdrop: 'static'});
        $('#info-type-conge').show();
        demandeCongeValidInfos.forEach(function(info){
          date = new Date(info["VdateDebut"]);
          if(moment(date).isSame(moment(e.event.start),'day') && info['emp_id'] == e.event.getResources()[0].id){
            Object.keys(info).forEach(function(element){
              $('#I'+element.slice(1)).val(info[element]);
            })
            return; // ?
          }
        })
        $('#modalInfoConge').modal('show')
      } 
    },

    eventReceive: function(e){
      $('#eventReceive').val(e.event);
    },

    eventDrop: function(e){
      setHeightOfRow();
    },

    drop: function(arg) {  
      let Cid = arg.draggedEl.id;
      setHeightOfRow();

      if(Cid == 'demandeConge'){ 
        $('#modalDemandeConge').modal({backdrop: 'static'});
        $('#modalDemandeConge').modal('show');
        $('#dateDebut').val(arg["dateStr"].slice(0,10));
        $('#dateFin').val(arg["dateStr"].slice(0,10));     
      }

      else if(Cid == 'conge'){
        $('#modalConge').modal({backdrop: 'static'});
        $('#modalConge').modal('show');
        $('#CdateDebut').val(arg["dateStr"].slice(0,10));
        $('#CdateFin').val(arg["dateStr"].slice(0,10));
      }
      
      else if(Cid == 'absence'){
        $('#modalAbsence').modal({backdrop: 'static'});
        $('#modalAbsence').modal('show');
        $('#AdateDebut').val(arg["dateStr"].slice(0,10));
        $('#AdateFin').val(arg["dateStr"].slice(0,10));
      }

      else if(Cid == 'arret'){
        $('#modalArret').modal({backdrop: 'static'});
        $('#modalArret').modal('show');
        $('#ArdateDebut').val(arg["dateStr"].slice(0,10));
        $('#ArdateFin').val(arg["dateStr"].slice(0,10));
      }

      else if(Cid == 'teletravail'){
        $('#modalTeletravail').modal({backdrop: 'static'});
        $('#modalTeletravail').modal('show');
        $('#TdateDebut').val(arg["dateStr"].slice(0,10));
        $('#TdateFin').val(arg["dateStr"].slice(0,10));
      }

      else if(Cid == 'formation'){
        $('#modalFormation').modal({backdrop: 'static'});
        $('#modalFormation').modal('show');
        $('#FdateDebut').val(arg["dateStr"].slice(0,10));
        $('#FdateFin').val(arg["dateStr"].slice(0,10));
      }

      else if(Cid == 'rdv_pro'){
        $('#modalRdvPro').modal({backdrop: 'static'});
        $('#modalRdvPro').modal('show');
        $('#RDVdateDebut').val(arg["dateStr"].slice(0,10));
        $('#RDVdateFin').val(arg["dateStr"].slice(0,10));
      }

      else if(Cid == 'recup'){
        $('#modalRecup').modal({backdrop: 'static'});
        $('#modalRecup').modal('show');
        $('#RdateDebut').val(arg["dateStr"].slice(0,10));
        $('#RdateFin').val(arg["dateStr"].slice(0,10));
      }
      
      else if(Cid == 'ferie_WE'){
        setTimeout(function(){
          $('#eventReceive').val().remove();
        },10)
      }

      else{
        let start = arg.date;
        let eventAtDropPlace = calendar.getEvents().filter(e => moment(e.start).isSame(moment(start),'day'));
        eventAtDropPlace = eventAtDropPlace.filter(e => e.getResources()[0].id == $('#dropLocation').val());
        eventAtDropPlace[0].remove();   
        setTimeout(function(){
          updateTotalPresenceAtDate($('#eventReceive').val()) 
        },10)          
      }
    },
    
    eventRender: function(event) {   
      let element = $(event.el);
      element.css('border','none');
      element.css('height','20px');
      setHeightOfRow();
      // ajoute un listener pour le click droit sur certains évenements
      if(event.event.classNames[0] != 'present' && event.event.classNames[0] != 'ferie_WE' && event.event.classNames[0] != 'specialPresent'){
        element[0].addEventListener('contextmenu', function(ev){
          ev.preventDefault();
          $('#eventRightClicked').val(event.event)
          $('#modalDelete').modal('show');
          return false;
        }, false);
      }

      if(event.event.classNames[0] == 'specialPresent'){
        element.css('width',width_event / 2)
      }
      // ajoute un listener pour le doubleclick sur l'évenements présent
      if(event.event.classNames[0] == 'present'){
        element[0].addEventListener('dblclick', function(){
          $('#modalAddEvent').modal({backdrop: 'static'});
          $('#modalAddEvent').modal('show');
          $('#addEdateDebut').val(moment(event.event.start).add(1,'days').toISOString().slice(0,10));
          $('#addEdateFin').val(moment(event.event.start).add(1,'days').toISOString().slice(0,10));
          $("#eventDblClicked").val(event.event);
        });
      }
    },
    
    eventAllow: function(dropLocation, draggedEvent){
      events = calendar.getEvents().filter( e => moment(e.start).isSame(moment(dropLocation.start),'day'))
      events = events.filter(e=>e.getResources()[0].id == dropLocation.resource.id)
      if(events.find(e=>e.classNames[0] != 'present') == undefined){
        if(draggedEvent.classNames[0] == 'demandeConge' || draggedEvent.classNames[0] == 'conge'){
          if(soldeConge[draggedEvent.getResources()[0].id] > 0){
            $('#dropLocation').val(dropLocation.resource.id);
            setHeightOfRow();
            $('#draggedEventIdEmp').val(draggedEvent.getResources()[0].id);
            return true;
          }
          else{
            setHeightOfRow();
            $('#alertSoldeEmpty').css('opacity', 1).slideDown();
            setTimeout(function(){
              $('#alertSoldeEmpty').fadeTo(500, 0).slideUp(500)
            }, 3000);
            return false;
          }
        }
      }
      else if(events.find(e=>e.classNames[0] != 'specialPresent') == undefined){
        if(draggedEvent.classNames[0] == 'demandeConge' || draggedEvent.classNames[0] == 'conge'){
          if(soldeConge[draggedEvent.getResources()[0].id] > 0){
            $('#dropLocation').val(dropLocation.resource.id);
            setHeightOfRow();
            $('#draggedEventIdEmp').val(draggedEvent.getResources()[0].id);
            return true;
          }
          else{
            setHeightOfRow();
            $('#alertSoldeEmpty').css('opacity', 1).slideDown();
            setTimeout(function(){
              $('#alertSoldeEmpty').fadeTo(500, 0).slideUp(500)
            }, 3000);
            return false;
          }
        }
      }      
      else{
        setHeightOfRow();
        return false;
      }   
        
    },

  });
  calendar.render();
  createDefault();
  width_event = getWidthOfEvent();
  initSoldeConge();
  $('.fc-next-button').click(function(){
    createDefault();
    setHeightOfRow();
  })
  $('.fc-prev-button').click(function(){
    setHeightOfRow();
  })
  $('.fc-customDay-button').click(function(){
    setHeightOfRow();
  })
  $('.fc-customWeek-button').click(function(){
    setHeightOfRow();
  })
  $('.fc-custom3Month-button').click(function(){
    setHeightOfRow();
  })
});

$(document).ready(function(){
  $('#typeEvent').change(function(){
    switch($('#typeEvent option:selected').val()){
      case 'demandeConge':
        $('#type-conge-content').show();
        $('#justification-content').show();
        $('#addToGoogleAgenda').show();
        break;
      case 'conge' :
        $('#type-conge-content').show();
        $('#justification-content').show();
        $('#addToGoogleAgenda').show();
        break;
      case 'absence' :
        $('#type-conge-content').hide();
        $('#justification-content').show();
        $('#addToGoogleAgenda').hide();
        break;
      case 'arret' :
        $('#type-conge-content').hide();
        $('#justification-content').show();
        $('#addToGoogleAgenda').hide();
        break;
      case 'teletravail' :
        $('#type-conge-content').hide();
        $('#justification-content').hide();
        $('#addToGoogleAgenda').show();
        break;
      case 'formation' :
        $('#type-conge-content').hide();
        $('#justification-content').hide();
        $('#addToGoogleAgenda').show();
        break;
      case 'rdv_pro' :
        $('#type-conge-content').hide();
        $('#justification-content').hide();
        $('#addToGoogleAgenda').show();
        break;
      case 'recup' :
        $('#type-conge-content').hide();
        $('#justification-content').hide();
        $('#addToGoogleAgenda').show();
        break;
    }
  })
})

/////////////////
// Calendrier //
////////////////


// --------- Variables Globales --------- //
var calendar ;
var demandeCongesInfos = [], demandeCongeValidInfos = [], congeInfos = [], absenceInfos = [], arretInfos = [], teletravailInfos = [], formationInfos = [], rdv_proInfos = [], recupInfos = [];
var width_event;
var soldeConge = []; 
///////////////////////////////////////////

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
    // --------- Plugins --------- //
    plugins: [ 'resourceTimeline','interaction'],
    ///////////////////////////////
    
    // --------- Display --------- //
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
    ///////////////////////////////////

    // --------- Custom Buttons --------- //
    customButtons: {
      myCustomButton: {
        text: 'Aller à la date',
        click: function() {
          $('#goToDate').modal('show');
        }
      }
    },
    ///////////////////////////////////////

    // --------- Custom Views --------- //
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
    /////////////////////////////////////

    // --------- Header --------- //
    header: {
      left: 'prev,next today, myCustomButton',
      center: 'title',
      right: 'customDay,customWeek,custom3Month'
    },
    ///////////////////////////////
    
    // ---------  Ressources --------- //
    resourceLabelText: 'Date',
    resourceGroupField: 'type',
    resources: [
      { id: 'emp1', type: 'Employés',title: 'Jean Bombeur' },
      { id: 'emp2', type: 'Employés',title: 'Jean Talu' },
      { id: 'emp3', type: 'Employés',title: 'Bowie Ken' },
      { id: 'emp4', type: 'Employés',title: 'Alain Dii' },
      { id: 'recap-present', type:'Récapitulatif', title: 'Total Présences'},
    ],
    ///////////////////////////////////
    
    // --------- Fonction clique simple sur un événement (autre que présent / special Présent / recap) --------- //
    eventClick: function(e) {
      var eventClassNames = e.event.classNames[0];
      $('#eventClicked').val(e.event);
      
      if(eventClassNames == 'demandeConge')
        remplirModalInfoEvent(demandeCongesInfos,e.event,$('#modalValidationConge'),'V',0,false);     
      else if(eventClassNames == 'conge')
        showFormInfo($('#modalInfoEvent'),congeInfos,e.event);    
      else if(eventClassNames == 'absence')
        showFormInfo($('#modalInfoEvent'),absenceInfos,e.event);            
      else if(eventClassNames == 'arret')
        showFormInfo($('#modalInfoEvent'),arretInfos,e.event);     
      else if(eventClassNames == 'teletravail')
        showFormInfo($('#modalInfoEvent'),teletravailInfos,e.event);      
      else if(eventClassNames == 'formation')
        showFormInfo($('#modalInfoEvent'),formationInfos,e.event);       
      else if(eventClassNames == 'rdv_pro')
        showFormInfo($('#modalInfoEvent'),rdv_proInfos,e.event);           
      else if(eventClassNames == 'recup')
        showFormInfo($('#modalInfoEvent'),recupInfos,e.event);      
      else if(eventClassNames == 'demandeCongeValid')
        remplirModalInfoEvent(demandeCongeValidInfos,e.event,$('#modalInfoEvent'),'I',1,true);       
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --------- Fonction quand un external event est reçu par le calendrier --------- //
    eventReceive: function(e){
      $('#eventReceive').val(e.event);
    },
    ////////////////////////////////////////////////////////////////////////////////////

    // --------- Fonction quand un événement à l'intérieur du calendrier est dropé ailleurs --------- //
    eventDrop: function(e){
      setHeightOfRow();
    },
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    // --------- Fonction quand un external event est dropé sur le calendrier --------- //
    drop: function(arg) {  
      let Cid = arg.draggedEl.id;

      if(Cid == 'demandeConge')
        showFormOther($('#modalDemandeConge'),arg,'');     
      else if(Cid == 'conge')
        showFormOther($('#modalConge'),arg,'C');     
      else if(Cid == 'absence')
        showFormOther($('#modalAbsence'),arg,'A');     
      else if(Cid == 'arret')
        showFormOther($('#modalArret'),arg,'Ar');      
      else if(Cid == 'teletravail')
        showFormOther($('#modalTeletravail'),arg,'T');      
      else if(Cid == 'formation')
        showFormOther($('#modalFormation'),arg,'F');      
      else if(Cid == 'rdv_pro')
        showFormOther($('#modalRdvPro'),arg,'RDV'); 
      else if(Cid == 'recup')
        showFormOther($('#modalRecup'),arg,'R');     
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
      
      setTimeout(function(){
        setHeightOfRow();
      },100)
    },
    /////////////////////////////////////////////////////////////////////////////////////
    
    // --------- Fonction de rendu des events présent sur le calendrier --------- //
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
    ///////////////////////////////////////////////////////////////////////////////

    // --------- Fonction de gestion des autorisations pour le drop d'external Event --------- //
    eventAllow: function(dropLocation, draggedEvent){
      events = calendar.getEvents().filter( e => moment(e.start).isSame(moment(dropLocation.start),'day'))
      events = events.filter(e=>e.getResources()[0].id == dropLocation.resource.id)
      if(events.find(e=>e.classNames[0] == 'present')){
          return allowDrop(draggedEvent,dropLocation);
      }
      else if(events.find(e=>e.classNames[0] == 'specialPresent')){
          return allowDrop(draggedEvent,dropLocation);
      }      
      else{
        setHeightOfRow();
        return false;
      }         
    },
    ////////////////////////////////////////////////////////////////////////////////////////////
  });

  // --------- Rendu du calendrier --------- //
  calendar.render();
  createDefault();
  width_event = getWidthOfEvent();
  initSoldeConge();
  $('.fc-next-button').click(function(){
    createDefault();
    setWidthViewChanges();
    setHeightOfRow();
  })
  $('.fc-prev-button').click(function(){
      setWidthViewChanges();
      setHeightOfRow();
  })
  $('.fc-customDay-button').click(function(){
      getWidthOfEvent();
      setWidthViewChanges();
      setHeightOfRow();
  })
  $('.fc-customWeek-button').click(function(){
      getWidthOfEvent();
      setWidthViewChanges();
      setHeightOfRow();
  })
  $('.fc-custom3Month-button').click(function(){
      getWidthOfEvent();
      setWidthViewChanges();
      setHeightOfRow();
  })
  ////////////////////////////////////////////
});
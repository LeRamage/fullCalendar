/* --------- Check si un évenemment existe à/aux dates(s) du drop 
             Si celui-ci est de type présent ou weekend / ferié le drop est possible, sinon erreur --------- */
function thisDateHasEvent(start,end,resourceId,isTrue = false){
  let hasNext = false;
  let allEvents = calendar.getEvents();
  if(isTrue)
    allEvents.splice(allEvents.length - 1);
  let daysToCheck = createDateArray(start,end);
  let eventsToRemove = [];

  if(moment(start).isSame(moment(end),'day')){ // External Event = 1 journée
    let allEventsFilter = allEvents.filter(e => moment(e.start).isSame(moment(start),'day'))
    allEventsFilter = allEventsFilter.filter(e=>e.getResources()[0].id == resourceId)
    allEventsFilter.forEach(function(e){
      if(e.classNames[0] == 'present' || e.classNames[0] == 'ferie_WE' ){
          eventsToRemove.push(e); 
      } 
      else
        hasNext = true;
    })
  }

  else{ // External Event = plrs journées
    let allEventsFilter = allEvents.filter(e => daysToCheck.find(date => moment(date).isSame(moment(e.start),'day')))
    allEventsFilter = allEventsFilter.filter(e=>e.getResources()[0].id == resourceId)
    allEventsFilter.forEach(function(e){
      if(e.classNames[0] == 'present' || e.classNames[0] == 'ferie_WE' ){
          eventsToRemove.push(e); 
      }  
      else
        hasNext = true;
    })
  }
  if(hasNext)
    eventsToRemove.push(hasNext);

  return eventsToRemove;
}

// // --------- Contraintes pour les Drops  --------- //
// function constrainDrop(start,end,indexOE = null){
//   let allEvents = calendar.getEvents();
//   let eventsToReplace = []; 

//   if(indexOE != null)
//     allEvents.splice(indexOE,1)
  
//   if(moment(start).isSame(moment(end),'day')){
//     index = allEvents.findIndex(event => moment(event.start).isSame(moment(start),'day'))
//     if(allEvents[index].classNames[0] == 'present')
//       eventsToReplace.push(allEvents[index]);
//     else
//       eventsToReplace.push(true)
//   }

//   else{
//     end = moment(end).subtract(1, "days")._d;
//     let dates = createDateArray(start,end)
//     allEvents.findIndex(function(event){
//       if(dates.find(date => moment(date).isSame(moment(event.start),'day'))){
//         if(event.classNames[0] == "present")
//           eventsToReplace.push(event)
//         else  
//           eventsToReplace.push(true)
//       }
//     })
//   }
//   return eventsToReplace;
// }

// // --------- Contraintes pour les resizes  --------- //
// function constrainResize(days,start){
//   let allEvents = calendar.getEvents();
//   let eventsToRemove = [];

//   allEvents.sort((a,b) => moment(a.start).dayOfYear() - moment(b.start).dayOfYear())

//   if(days > 0){
//     index = allEvents.findIndex(event => moment(event.start).isSame(moment(start),'day'))  
//     for(i = 1; i <= days;i++){
//       if(allEvents[index+i].classNames[0] === 'present')
//         eventsToRemove.push(allEvents[index+i]);
//       else{
//         eventsToRemove.push(true);
//         break;
//       }        
//     }
//     return eventsToRemove;
//   }

//   else{
//     return [];
//   }
// }

// --------- Creer ID unique --------- //
function create_unique_ID(){
  return '_' + Math.random().toString(36).substr(2, 9);
}

// --------- Tableau contenant toutes les dates entre une start date et une end date  --------- //
function createDateArray(start,end){
  let
    dateArray = [],
    dt = new Date(start);

  while (moment(dt).dayOfYear() <= moment(end).dayOfYear()) {
    dateArray.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return dateArray;
}


// --------- Ajout dynamique de l'évenement Présence + Weekend --------- AJOUT DYNAMIQUE EN FONCTION DU NOMBRE D'EMPLOYES //
function createDefault(){
  let view = calendar.view;
  let events = [];
  let dates;
  if(moment().isBetween(view.activeStart, view.activeEnd,'day') || moment().isSame(view.activeStart,'day') || moment().isSame(view.activeEnd,'day')){
    dates = createDateArray(view.activeStart, view.activeEnd);
  }
  else{
    dates = createDateArray(moment(view.activeStart).add(1,'days'), view.activeEnd);
  }
  let allEventsInView = calendar.getEvents().filter(e=>moment(e.start).isAfter(view.activeStart) || moment(e.end).isAfter(view.activeStart));
  let employes = calendar.getResources().filter(r => r.id.includes('emp'));

  if(allEventsInView.length == 0){
    createDefaultFromDates(events,dates,employes)
  }
  else{
      let dateWhereNotPutDefault = [];
      let datesWhereToPutDefault = [];

      allEventsInView.forEach(e=>{
        if(e.end != null){
          let source = {
            emp : e.getResources()[0].id,
            dates : createDateArray(e.start,e.end)
          }
          dateWhereNotPutDefault.push(source);  
        }
        else{
          let source = {
            emp : e.getResources()[0].id,
            dates : createDateArray(e.start,e.start)
          }
          dateWhereNotPutDefault.push(source);  
        }
      })
     
      employes.forEach(employe=>{
        filterPerEmploye = dateWhereNotPutDefault.filter(source => source.emp == employe.id)
        dates.forEach(d=>{
          if(!filterPerEmploye.find(source=>source.dates.find(source_d=>moment(source_d).isSame(d,'day')))){
            datesWhereToPutDefault.push(d)
          }
        })
        events = [];        
        if(datesWhereToPutDefault.length > 0){
          createDefaultFromDatesWithoutRecap(events,datesWhereToPutDefault, _employe = [employe])
        }      
        datesWhereToPutDefault = [];
      })
      if(allEventsInView.filter(e=> e.classNames[0] == 'recap').length == 0)
        createDefaultRecap(dates)
  }
}

// --------- display Erreur--------- //
function displayError(){
  $('#alertD').show();
  $('#modalDemandeConge').modal('hide');
  setTimeout(function(){
    $('#alertD').fadeOut(3000);
  },5000)         
  setTimeout(function(){
    $('#eventReceive').val().remove();
  },10);
}

// --------- Ajout d'un évenement present qui prend une demi journée --------- //
function addEventPresentIfMidDay(start,end,event,startHour,endHour){
  
  let _ID = event.extendedProps.ID;
  let eventPresent;
  let startPresent = start
  let endPresent = end
  
  if(startHour == 'Après-midi'){    
    eventPresent = {
        classNames: ['specialPresent','split-right'],
        start: startPresent,
        end: endPresent,
        extendedProps: {'ID':_ID},
        resourceId:event.getResources()[0].id,
    }
    calendar.addEvent(eventPresent);
  }
  if(endHour == 'Après-midi'){
    eventPresent = {
        classNames: ['specialPresent','split-left'],
        start: startPresent,
        end: endPresent,
        extendedProps: {'ID':_ID},
        resourceId:event.getResources()[0].id,
    }
    calendar.addEvent(eventPresent);
  }
}

// --------- Ajout d'évenements present d'une demi journée ainsi que d'un demandeDeConge special --------- //
function addSpecialEventPresentIfMidDay(start,end,event){
  let _ID = event.extendedProps.ID;

  eventPresent1 = {
    classNames: ['specialPresent','split-right'],
    start: start,
    end: start,
    extendedProps: {'ID':_ID},
    resourceId:event.getResources()[0].id,
  }

  eventPresent2 = {
    classNames: ['specialPresent','split-left'],
    start: end,
    end: end,
    extendedProps: {'ID':_ID},
    resourceId:event.getResources()[0].id,
  }

  calendar.addEvent(eventPresent1);
  calendar.addEvent(eventPresent2);
}

// --------- permet de modifier l'heure de départ et de fin d'un évenement --------- //
function setHoursOfEvent(startHour,endHour,start,end,event,matineesIsChecked = false,apremsIsChecked = false){
  if(startHour == 'Matin' || matineesIsChecked)
    start.setHours(9,0,0,0);
  else
    start.setHours(13,0,0,0);

  if(endHour == 'Soir' || apremsIsChecked)
    end.setHours(18,0,0,0);
  else
    end.setHours(12,0,0,0);

  event.setDates(start,end); 
}

// --------- Gère tout ce qu'il faut lors de la création d'un nouvel évènement  --------- //
function EventsManagment(eventsToRemove,startHour,endHour,start,end,event,modal){
  if(eventsToRemove.length>0 && eventsToRemove[eventsToRemove.length-1] != true){
    event.setExtendedProp('ID',create_unique_ID());
    eventsToRemove.forEach(eventToRemove => eventToRemove.remove());
    if(moment(start).isSame(moment(end),'day')){
      if(!(startHour=='Matin' && endHour=='Soir')){
        addEventPresentIfMidDay(start,end,event,startHour,endHour);
      }
    }
    else{
      setHoursOfEvent(startHour,endHour,start,end,event);
      if(startHour == 'Après-midi' && endHour == 'Après-midi'){
        addSpecialEventPresentIfMidDay(start,end,event);
      }
      else if(startHour == 'Après-midi'){
        addEventPresentIfMidDay(start,start,event,startHour,endHour);
      }
      else if(endHour == 'Après-midi')
        addEventPresentIfMidDay(end,end,event,startHour,endHour);
    }
    updateTotalPresenceAtDate(event);
    event.setProp('title','');
    $(modal).modal('hide');    
    setHeightOfRow();
  }
  else{
    displayError();
  }  
}

// --------- Supprimer un évènement (sauf évenement present) --------- //
function deleteEvent(eventRightClicked){
  let _ID = eventRightClicked.extendedProps.ID; 
  let eventsToRemove = calendar.getEvents().filter(e => e.extendedProps.ID == _ID);
  let dates = deleteManagment(eventsToRemove)

  eventsToRemove.forEach(e => {
    e.remove();
    resetTotalPresence(e);
  })

  dates.forEach(d => {
    if(![0,6].includes(d.getDay())){
      event = {
        classNames: 'present',
        start: d,
        allDay: true,
        resourceId: eventRightClicked.getResources()[0].id,
      };
      calendar.addEvent(event)
    }
    else{
      event = {
        classNames: 'ferie_WE',
        start: d,
        allDay: true,
        resourceId: eventRightClicked.getResources()[0].id,
        rendering:'background',
      };
      calendar.addEvent(event)
    } 
  }) 
  $('#modalDelete').modal('hide');
}

function goToDate(date){
  dt = new Date(date)
  calendar.gotoDate(dt)
  $('#goToDate').modal('hide')
}

function getWidthOfEvent(){
  return width_event = $('.present').width();
}

// --------- Initialise les totaux de présence au chargement de la page --------- //
// function initTotalPrecense(){
//   let allEvents = calendar.getEvents().filter(e=> e.classNames[0] == 'present');
//   let totalPresenceAtCurrentDate = calendar.getEvents().filter(e=>e.classNames[0] == 'recap');
//   allEvents.sort((a,b) => a.start - b.start);
//   totalPresenceAtCurrentDate.sort((a,b) => a.start - b.start);
//   let currentDate = allEvents[0].start;
//   let compteurPresence = 0;
//   let iterator = 0;
//   allEvents.forEach(e=>{
//     if(moment(e.start).isSame(moment(currentDate),'day')){ 
//       if(e.classNames[0] == 'present')
//         compteurPresence++;
//     }
//     else{
//       totalPresenceAtCurrentDate[iterator].setProp('title',compteurPresence.toString());
//       totalPresenceAtCurrentDate[iterator].setExtendedProp('totPres',compteurPresence);
//       currentDate = e.start;
//       compteurPresence = 1;
//       iterator++;
//     }
//   })
// }

// --------- Update les totaux de présence après l'ajout d'un événement --------- //
function updateTotalPresenceAtDate(event){
  let start = moment(event.start);
  let end = event.end;
  let eventTotPresence;
  let compteurPresence;

  if(start.isSame(end,'day') || end == null){
    let eventsAtDate = calendar.getEvents().filter(e=>moment(e.start).isSame(start,'day') && e.getResources()[0].id == event.getResources()[0].id);
    eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(start,'day'));
    if(eventsAtDate.length > 1){     
      compteurPresence = eventTotPresence[0].extendedProps.totPres - 0.5;
      eventTotPresence[0].setProp('title',compteurPresence);
      eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
    }
    else{
      compteurPresence = eventTotPresence[0].extendedProps.totPres - 1;
      eventTotPresence[0].setProp('title',compteurPresence);
      eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
    }
  }
  else{
    let eventsAtDate = calendar.getEvents().filter(e=>
      (moment(e.start).isSame(start,'day') && e.getResources()[0].id == event.getResources()[0].id && e.classNames[0] == 'specialPresent')
      || (moment(e.start).isSame(end,'day') && e.getResources()[0].id == event.getResources()[0].id && e.classNames[0] == 'specialPresent')
    )
    let dates = createDateArray(start,end);
    dates.forEach(d=>{
      if(!calendar.getEvents().find(e => moment(e.start).isSame(d,'day') && e.classNames[0] == 'ferie_WE')){
        eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(d,'day'));
        if(eventTotPresence.length > 0){
          compteurPresence = eventTotPresence[0].extendedProps.totPres - 1;
          eventTotPresence[0].setProp('title',compteurPresence);
          eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
        }
      }
    })

    eventsAtDate.forEach(ev=>{
      eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(ev.start,'day'))
      compteurPresence = eventTotPresence[0].extendedProps.totPres + 0.5;
      eventTotPresence[0].setProp('title',compteurPresence);
      eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
    })
  }
}

// --------- Update les totaux de présence après la suppression d'un évènement --------- //
function resetTotalPresence(event){
  let start = moment(event.start);
  let end = event.end;
  let eventTotPresence;
  let compteurPresence;


  if(start.isSame(end,'day') || end == null){
    eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(start,'day'));
    
    if(event.classNames[0] == 'specialPresent'){     
      compteurPresence = eventTotPresence[0].extendedProps.totPres - 0.5;
      eventTotPresence[0].setProp('title',compteurPresence);
      eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
    }
    else{
      compteurPresence = eventTotPresence[0].extendedProps.totPres + 1;
      eventTotPresence[0].setProp('title',compteurPresence);
      eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
    }
  }
  
  else{
    if(event.classNames[0] != 'specialPresent'){
      let dates = createDateArray(start,end);
      dates.forEach(d=>{
        if(!calendar.getEvents().find(e => moment(e.start).isSame(d,'day') && e.classNames[0] == 'ferie_WE')){
          eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(d,'day'));
          compteurPresence = eventTotPresence[0].extendedProps.totPres + 1;
          eventTotPresence[0].setProp('title',compteurPresence);
          eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
        }
      })
    }
    else{
      eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(event.start,'day'))
      compteurPresence = eventTotPresence[0].extendedProps.totPres - 0.5;
      eventTotPresence[0].setProp('title',compteurPresence);
      eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
    }
  }
}

// --------- Update les totaux de présence après un eventDrop (!drop) --------- //
function updateTotalPresenceAfterEventDrop(event,oldevent){
  let startE = moment(event.start);
  let startOE = moment(oldevent.start);
  let totPresenceAtOldPlace = calendar.getEvents().filter(e => moment(e.start).isSame(startOE,'day') && e.classNames[0] == 'recap');
  let totPresenceAtNewPlace = calendar.getEvents().filter(e => moment(e.start).isSame(startE,'day') && e.classNames[0] == 'recap');
  let compteurPresence = totPresenceAtOldPlace[0].extendedProps.totPres;

  totPresenceAtOldPlace[0].setExtendedProp('totPres',compteurPresence +1);
  totPresenceAtOldPlace[0].setProp('title',compteurPresence +1);
  compteurPresence = totPresenceAtNewPlace[0].extendedProps.totPres;
  totPresenceAtNewPlace[0].setExtendedProp('totPres',compteurPresence -1);
  totPresenceAtNewPlace[0].setProp('title',compteurPresence -1);
}

function deleteManagment(eventsToRemove){
  let _dates;
  if( eventsToRemove.length == 2 && eventsToRemove[0].classNames[0] != 'specialPresent'){
    if(eventsToRemove[0].end == null)
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].start);
    else
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
  }

  else if(eventsToRemove.length == 2 && eventsToRemove[1].classNames[0] != 'specialPresent'){
    if(eventsToRemove[1].end == null)
      _dates = createDateArray(eventsToRemove[1].start,eventsToRemove[1].start);
    else
      _dates = createDateArray(eventsToRemove[1].start,eventsToRemove[1].end);
  }

  else if (eventsToRemove.length == 1 && !moment(eventsToRemove[0].start).isSame(moment(eventsToRemove[0].end),'day')){
    if(eventsToRemove[0].end == null)
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].start);
    else
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
  }    

  else{
    if(eventsToRemove[0].classNames[0] != 'specialPresent')
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[eventsToRemove.length -1].start);
    else if(eventsToRemove[eventsToRemove.length -1].classNames[0] == 'conge' || eventsToRemove[eventsToRemove.length -1].classNames[0] == 'congeDeny')
      _dates = createDateArray(eventsToRemove[eventsToRemove.length -1].start,eventsToRemove[eventsToRemove.length -2].start);
  }

  return _dates;
}

function setHeightOfRow(){
  let nbrOfRessources = calendar.getResources().length;
  let fc_widgets_content_div = $('.fc-widget-content:nth-child(1)')
  for(i=1+nbrOfRessources;i<fc_widgets_content_div.length-1;i++){
    $(fc_widgets_content_div[i].firstElementChild).css('height','38px');
  }
}

function createDefaultFromDates(events,dates,employes){
  dates.forEach(function(date){ 
    employes.forEach(emp => {
      if(![0,6].includes(date.getDay())){
        event = {
            classNames: ['present','pres'],
            start: date,
            allDay: true,
            resourceId: emp.id,          
          }  
        
        events.push(event)
      }
      else{
        event = {
            classNames: 'ferie_WE',
            start: date,
            allDay: true,
            resourceId:emp.id,
            rendering:'background'
          }
        
        events.push(event)
      }
    })
    if(![0,6].includes(date.getDay())){
      event = {
          title: employes.length,
          classNames:'recap',
          start: date,
          resourceId: 'recap-present',
          extendedProps:{'totPres':employes.length}
        }
      
      events.push(event)
    }
  })
  calendar.addEventSource(events);
}

function createDefaultFromDatesWithoutRecap(events,dates,employes){
  dates.forEach(function(date){ 
    employes.forEach(emp => {
      if(![0,6].includes(date.getDay())){
        event = {
            classNames: ['present','pres'],
            start: date,
            allDay: true,
            resourceId: emp.id,          
          }  
        
        events.push(event)
      }
      else{
        event = {
            classNames: 'ferie_WE',
            start: date,
            allDay: true,
            resourceId:emp.id,
            rendering:'background'
          }
        
        events.push(event)
      }
    })
  })
  calendar.addEventSource(events);
}

function createDefaultRecap(dates){
  let events = []
  dates.forEach(date=>{
    nbrOfPresentAtThisDay = calendar.getEvents().filter(e=>moment(e.start).isSame(date,'day') && e.classNames[0] == 'present')
    if(![0,6].includes(date.getDay())){
      event = {
          title: nbrOfPresentAtThisDay.length,
          classNames:'recap',
          start: date,
          resourceId: 'recap-present',
          extendedProps:{'totPres':nbrOfPresentAtThisDay.length}
        }
      events.push(event)
    }
  })
  calendar.addEventSource(events);
}

function remplirModalInfoEvent(typeEvent,event,modal){
  typeEvent.forEach(function(info){
    date = new Date(info["dateDebut"]);
    if(moment(date).isSame(moment(event.start),'day') && info['emp_id'] == event.getResources()[0].id){
      Object.keys(info).forEach(function(element){
        $('#I'+element).val(info[element]);
      })
      return; // ?
    }
  }) 
  modal.modal('show')
}
/* --------- Check si un évenemment existe à/aux dates(s) du drop 
             Si celui-ci est de type présent / ferié le drop est possible, sinon erreur --------- */
function thisDateHasEvent(start,end,resourceId,isTrue = false,startHour,endHour){
  let hasNext = false;
  let allEvents = calendar.getEvents();
  if(isTrue)
    allEvents.splice(allEvents.length - 1);
  let daysToCheck = createDateArray(start,end);
  let eventsToRemove = [];
  
  if(moment(start).isSame(moment(end),'day')){ // External Event = 1 journée
      let allEventsFilter = allEvents.filter(e => moment(e.start).isSame(moment(start),'day'))
      let ETR = pushEventsToRemove(allEventsFilter,resourceId,startHour,endHour);
      eventsToRemove = ETR[0];
      hasNext = ETR[1];
  }
  
  else{ // External Event = plrs journées
      let allEventsFilter = allEvents.filter(e => daysToCheck.find(date => moment(date).isSame(moment(e.start),'day') || moment(date).isSame(e.end,'day')))
      let ETR = pushEventsToRemove(allEventsFilter,resourceId,startHour,endHour);
      eventsToRemove = ETR[0];
      hasNext = ETR[1];
  }
  
  if(hasNext)
      eventsToRemove.push(hasNext);
  
  return eventsToRemove;
}
////////////////////////////////////////////////////////////////////////////////////////////////////
          
          
/* --------- selectionne les évènements à retirer
              Si un évènement autre que présent se trouve sur la plage de date, impossible de créer l'évènement --------- */
function pushEventsToRemove(allEventsFilter,resourceId,startHour,endHour){
    let _eventsToRemove = [];
    let _hasNext = false;
    if(allEventsFilter.length == 0){
        _eventsToRemove.push('thisDateIsEmpty');
    }
    else{
        allEventsFilter = allEventsFilter.filter(e=>e.getResources()[0].id == resourceId)
        allEventsFilter.forEach(function(e){
            if(e.classNames[0] == 'present' || e.classNames[0] == 'ferie_WE' || e.classNames[0] == 'specialPresent'){
                _eventsToRemove.push(e); 
            }  
            else{
                if( !(moment(e.start).hour() == 13 && endHour == 'Après-midi') && !(moment(e.end).hour() == 12 && startHour == 'Après-midi') )
                    _hasNext = true;
            }
          })
    }
    return [_eventsToRemove,_hasNext];
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- Creer ID unique --------- //
function create_unique_ID(){
  return '_' + Math.random().toString(36).substr(2, 9);
}
////////////////////////////////////////


// --------- Tableau contenant toutes les dates entre une start date et une end date  --------- //
function createDateArray(start,end){
  let
    dateArray = [],
    dt = new Date(start);

  while (moment(dt).isSameOrBefore(end) || moment(dt).isSame(end,'day')) {
    dateArray.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return dateArray;
}
////////////////////////////////////////////////////////////////////////////////////////////////


// --------- Ajout dynamique de l'évenement Présence + Weekend + Recap --------- //
function createDefault(){
  let events = [];
  let variables = createVariablesDefault();
  let dates = variables[0], allEventsInView = variables[1], employes = variables[2];

  if(allEventsInView.length == 0){
    createDefaultFromDates(events,dates,employes)
  }
  else{
      let dateWhereNotPutDefault = setDateWhereNotPutDefault(allEventsInView);
      let datesWhereToPutDefault = [];
     
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
/////////////////////////////////////////////////////////////////////////////////////


// --------- Creation des variables pour createDefault() --------- //
function createVariablesDefault(){
  let view = calendar.view;
  let _dates;
  if(moment().isBetween(view.activeStart, view.activeEnd,'day') || moment().isSame(view.activeStart,'day') || moment().isSame(view.activeEnd,'day')){
    _dates = createDateArray(view.activeStart, view.activeEnd);
  }
  else{
    _dates = createDateArray(moment(view.activeStart).add(1,'days'), view.activeEnd);
  }
  let _allEventsInView = calendar.getEvents().filter(e=>moment(e.start).isAfter(view.activeStart) || moment(e.end).isAfter(view.activeStart));
  let _employes = calendar.getResources().filter(r => r.id.includes('emp'));

  return [_dates,_allEventsInView,_employes];
}
////////////////////////////////////////////////////////////////////


// --------- retourne toutes les dates où il y a déjà un évènement de créé --------- //
function setDateWhereNotPutDefault(allEventsInView){
  let _dateWhereNotPutDefault = [];

  allEventsInView.forEach(e=>{
  if(e.end != null){
      let source = {
      emp : e.getResources()[0].id,
      dates : createDateArray(e.start,e.end)
      }
      _dateWhereNotPutDefault.push(source);  
  }
  else{
      let source = {
      emp : e.getResources()[0].id,
      dates : createDateArray(e.start,e.start)
      }
      _dateWhereNotPutDefault.push(source);  
  }
  })
    
  return _dateWhereNotPutDefault;
}
//////////////////////////////////////////////////////////////////////////////////////


// --------- display Erreur--------- //
function displayError(){
  $('#alertD').show();
  $('#modalDemandeConge').modal('hide');

  $('#alertD').css('opacity', 1).slideDown();
  setTimeout(function(){
    $('#alertD').fadeTo(500, 0).slideUp(500)
  }, 3000);
        
  setTimeout(function(){
    $('#eventReceive').val().remove();
  },10);
}
///////////////////////////////////////


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
////////////////////////////////////////////////////////////////////////////////


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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- modifie l'aparence d'un évènement qui commence ou fini sur un specialPresent --------- //
function setWidthEvent(start,end,event){
  let e = calendar.getEvents().filter(e=> (moment(e.start).isSame(start,'day') || moment(e.start).isSame(end,'day')) && e.classNames[0] == 'specialPresent' && e.getResources()[0].id == event.getResources()[0].id);
  let specialPresent = e[0];
  let _ID = event.extendedProps.ID;

  if(moment(start).isSame(end,'day')){
    if(moment(specialPresent.start).hour() == 9){
      setPropOfEvent_RemoveSp([event.classNames[0],'specialRight'],event,specialPresent);
    }
    else if(moment(specialPresent.start).hour() == 13){
      setPropOfEvent_RemoveSp([event.classNames[0],'specialLeft'],event,specialPresent);
    }
  } 
   
  else{
      let data =  setData(specialPresent,start,end,event);
      let ESplitStart = data[0],  ESplitEnd = data[1],  ESplitClassNames = data[2], resetEventStart = data[3], resetEventEnd = data[4];
      let eSplit = {
          classNames:ESplitClassNames,
          start: ESplitStart,
          end:ESplitEnd,
          resourceId:event.getResources()[0].id
      }
      let resetEvent = {
          classNames:event.classNames[0],
          start:resetEventStart,
          end:resetEventEnd,
          resourceId:event.getResources()[0].id
      };

      specialPresent.remove();
      event.remove();
      calendar.addEvent(resetEvent);
      calendar.addEvent(eSplit);
      resetEvent = calendar.getEvents()[calendar.getEvents().length-2];
      resetEvent.setExtendedProp('ID',_ID);
      eSplit = calendar.getEvents()[calendar.getEvents().length-1];
      eSplit.setExtendedProp('ID',_ID);
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- ajoute la class specialRight/Left et supprime le specialPresent --------- //
function setPropOfEvent_RemoveSp(classNames,event,specialPresent){
  event.setProp('classNames',classNames);
  specialPresent.remove();
}
////////////////////////////////////////////////////////////////////////////////////////


// --------- data pour créer eSplit et resetEvent --------- //
function setData(specialPresent,start,end,event){
  let ESplitStart,  ESplitEnd,  ESplitClassNames, resetEventStart, resetEventEnd;
  if(moment(specialPresent.start).isSame(start,'day')){
      ESplitStart = start;
      ESplitEnd = start;
      resetEventStart = moment(start).add(1,'days')._d;
      resetEventEnd = end;
      ESplitClassNames = [event.classNames[0],'specialLeft'];
  }
  else if(moment(specialPresent.start).isSame(end,'day')){
      ESplitStart = end;
      ESplitEnd = end;
      resetEventStart = start;
      resetEventEnd = moment(end).subtract(1,'days')._d;
      ESplitClassNames = [event.classNames[0],'specialRight'];
  }

  return[ESplitStart,  ESplitEnd,  ESplitClassNames, resetEventStart, resetEventEnd];
}
////////////////////////////////////////////////////////////////


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
//////////////////////////////////////////////////////////////////////////////////////


// --------- Gère tout ce qu'il faut lors de la création d'un nouvel évènement  --------- //
function EventsManagment(eventsToRemove,startHour,endHour,start,end,event,modal){

  if(eventsToRemove.length>0 && eventsToRemove[eventsToRemove.length-1] != true && eventsToRemove.find(e => e == 'thisDateIsEmpty')!="thisDateIsEmpty"){
    event.setExtendedProp('ID',create_unique_ID());
    setHoursOfEvent(startHour,endHour,start,end,event);
    eventsToRemove.forEach(eventToRemove => eventToRemove.remove());
    if(moment(start).isSame(moment(end),'day')){
      if(!(startHour=='Matin' && endHour=='Soir')){
        addEventPresentIfMidDay(start,end,event,startHour,endHour);
      }
    }
    else{
      if(startHour == 'Après-midi' && endHour == 'Après-midi'){
        addSpecialEventPresentIfMidDay(start,end,event);
      }
      else if(startHour == 'Après-midi'){
        addEventPresentIfMidDay(start,start,event,startHour,endHour);
      }
      else if(endHour == 'Après-midi')
        addEventPresentIfMidDay(end,end,event,startHour,endHour);      
    }
    
    if(calendar.getEvents().filter(e => 
      (moment(e.start).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id 
      || moment(e.start).isSame(event.end,'day') && e.getResources()[0].id == event.getResources()[0].id
      || moment(e.end).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id)
      && e.classNames[0] != 'present'
      && e.classNames[0] != 'specialPresent'
    ).length == 2){
      setWidthEvent(start,end,event);
    };
       
    updateTotalPresenceAtDate(event);
    event.setProp('title','');
    setHeightOfRow();
    $(modal).modal('hide');    
  }
  else if(eventsToRemove.find(e => e == 'thisDateIsEmpty')){
    event.setExtendedProp('ID',create_unique_ID());
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

    if(calendar.getEvents().filter(e => 
      (moment(e.start).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id 
      || moment(e.start).isSame(event.end,'day') && e.getResources()[0].id == event.getResources()[0].id
      || moment(e.end).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id)
      && e.classNames[0] != 'present'
      && e.classNames[0] != 'specialPresent'
    ).length == 2){
      setWidthEvent(start,end,event);
    };

    event.setProp('title','');
    $(modal).modal('hide');    
    setHeightOfRow();
  }
  else{
    setHeightOfRow();
    $(modal).modal('hide');  
    displayError();
  }
  $('.spinner-border').hide();
  $('.btn-primary').show();
  $('#valid-modif-event-btn').hide();
}

// --------- Supprimer un évènement (sauf évenement present) --------- //
function deleteEvent(eventRightClicked, isAmodif = false){
  let _ID = eventRightClicked.extendedProps.ID; 
  let eventsToRemove = calendar.getEvents().filter(e => e.extendedProps.ID == _ID);
  let dates = deleteManagment(eventsToRemove);
  let hasSpecialRight = [];
  let hasSpecialLeft = [];

  if( (eventRightClicked.classNames[0] == 'conge' || eventRightClicked.classNames[0] == 'demandeCongeValid') && moment(eventRightClicked.start).isAfter(moment()) && !isAmodif){
    restoreSoldeConge(eventRightClicked.getResources()[0].id,eventRightClicked.start,eventRightClicked.end,calendar.getEvents().filter(e=>e.extendedProps.ID = _ID && e.classNames[0] == 'specialPresent').length)
  }

  eventsToRemove.forEach(e => {
    if(e.classNames[1] == 'specialRight'){
      hasSpecialRight[0] = true;
      hasSpecialRight[1] = e.start;
      hasSpecialRight[2] = calendar.getEvents().filter(ev=>(moment(ev.start).isSame(e.start,'day') || moment(ev.start).isSame(e.end,'day')) && ev.getResources()[0].id == e.getResources()[0].id && ev != e)[0].extendedProps.ID;
    }
    if(e.classNames[1] == 'specialLeft'){
      hasSpecialLeft[0] = true;
      hasSpecialLeft[1] = e.start;
      hasSpecialLeft[2] = calendar.getEvents().filter(ev=>(moment(ev.start).isSame(e.start,'day') || moment(ev.start).isSame(e.end,'day')) && ev.getResources()[0].id == e.getResources()[0].id && ev != e)[0].extendedProps.ID;
    }
    e.remove();
    resetTotalPresence(e);
  })
  
  let checkIfSpecial = calendar.getEvents().filter(e=>(moment(e.start).isSame(eventRightClicked.start,'day') || moment(e.start).isSame(eventRightClicked.end,'day')) && (e.classNames[1] == 'specialRight' || e.classNames[1] == 'specialLeft' ));
  if(checkIfSpecial.length > 0){
    updateTotalPresenceAtDate(checkIfSpecial[0]);
    if(checkIfSpecial[0].classNames[1] == 'specialRight'){
      let e = checkIfSpecial[0];
      hasSpecialLeft[0] = true;
      hasSpecialLeft[1] = e.start;
      hasSpecialLeft[2] = calendar.getEvents().filter(ev=>(moment(ev.start).isSame(e.start,'day') || moment(ev.start).isSame(e.end,'day')) && ev.getResources()[0].id == e.getResources()[0].id && ev != e)[0].extendedProps.ID;
    }
    if(checkIfSpecial[0].classNames[1] == 'specialLeft'){
      let e = checkIfSpecial[0];
      hasSpecialRight[0] = true;
      hasSpecialRight[1] = e.start;
      hasSpecialRight[2] = calendar.getEvents().filter(ev=>(moment(ev.start).isSame(e.start,'day') || moment(ev.start).isSame(e.end,'day')) && ev.getResources()[0].id == e.getResources()[0].id && ev != e)[0].extendedProps.ID;
    }
  }

  removeInfo(eventRightClicked.classNames[0],eventRightClicked.start,eventRightClicked.getResources()[0].id);

  let events = [];
  dates.forEach(d => {
    if(![0,6].includes(d.getDay())){
      if(hasSpecialRight[0] == true && moment(d).isSame(hasSpecialRight[1],'day') && eventsToRemove.length != 3){
        event = {
          classNames: ['specialPresent','split-right'],
          start: hasSpecialRight[1],
          end: hasSpecialRight[1],
          resourceId:eventRightClicked.getResources()[0].id,
        }
      }
      else if(hasSpecialLeft[0] == true && moment(d).isSame(hasSpecialLeft[1],'day') && eventsToRemove.length != 3){
        event = {
          classNames: ['specialPresent','split-left'],
          start: hasSpecialLeft[1],
          end: hasSpecialLeft[1],
          resourceId:eventRightClicked.getResources()[0].id,
        }
      }
      else{
        event = {
          classNames: 'present',
          start: d,
          allDay: true,
          resourceId: eventRightClicked.getResources()[0].id,
        };
      }
      events.push(event);
    }
    else{
      event = {
        classNames: 'ferie_WE',
        start: d,
        allDay: true,
        resourceId: eventRightClicked.getResources()[0].id,
        rendering:'background',
      };
      events.push(event);
    } 
  }) 
  calendar.addEventSource(events);
  if(hasSpecialLeft[0] == true){
    let eventToSetEprop = calendar.getEvents().filter(e=>moment(e.start).isSame(hasSpecialLeft[1]) && e.classNames[1] == 'split-left' && e.getResources()[0].id == eventRightClicked.getResources()[0].id);
    if(eventToSetEprop.length != 0)
      eventToSetEprop[0].setExtendedProp('ID',hasSpecialLeft[2]);
  }
  if(hasSpecialRight[0] == true){
    let eventToSetEprop = calendar.getEvents().filter(e=>moment(e.start).isSame(hasSpecialRight[1]) && e.classNames[1] == 'split-right' && e.getResources()[0].id == eventRightClicked.getResources()[0].id);
    if(eventToSetEprop.length != 0)
      eventToSetEprop[0].setExtendedProp('ID',hasSpecialRight[2]);
  }
  $('#modalDelete').modal('hide');
  setHeightOfRow();
}
//////////////////////////////////////////////////////////////////////////////


// --------- Permet d'obtenir la longueur des evenements --------- //
function getWidthOfEvent(){
  return width_event = $('.present').width();
}

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
      || (moment(e.start).isSame(start,'day') && e.getResources()[0].id == event.getResources()[0].id && (e.classNames[1] == 'specialRight' || e.classNames[1] == 'specialLeft'))
      || (moment(e.start).isSame(end,'day') && e.getResources()[0].id == event.getResources()[0].id && (e.classNames[1] == 'specialRight' || e.classNames[1] == 'specialLeft'))
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
    else if(event.classNames[1] == 'specialLeft' || event.classNames[1] == 'specialRight'){
      compteurPresence = eventTotPresence[0].extendedProps.totPres + 0.5;
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
  if( eventsToRemove.length == 2 && eventsToRemove[0].classNames[0] != 'specialPresent' && eventsToRemove[1].classNames[1] != 'specialLeft' && eventsToRemove[1].classNames[1] != 'specialRight'){
    if(eventsToRemove[0].end == null)
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].start);
    else
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
  }

  else if(eventsToRemove.length == 2 && eventsToRemove[1].classNames[0] != 'specialPresent' && eventsToRemove[1].classNames[1] != 'specialLeft' && eventsToRemove[1].classNames[1] != 'specialRight'){
    if(eventsToRemove[1].end == null)
      _dates = createDateArray(eventsToRemove[1].start,eventsToRemove[1].start);
    else
      _dates = createDateArray(eventsToRemove[1].start,eventsToRemove[1].end);
  }

  else if(eventsToRemove.length == 2 && (eventsToRemove[1].classNames[1] == 'specialLeft' || eventsToRemove[1].classNames[1] == 'specialRight')){
    if(moment(eventsToRemove[1].start).isBefore(eventsToRemove[0].start,'days'))
      _dates = createDateArray(eventsToRemove[1].start,eventsToRemove[0].end)
    else
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[1].start)
  }    
  
  else if (eventsToRemove.length == 1 && !moment(eventsToRemove[0].start).isSame(moment(eventsToRemove[0].end),'day')){
    if(eventsToRemove[0].end == null)
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].start);
    else
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[0].end);
  }

  else if(eventsToRemove.length == 3 && (eventsToRemove[1].classNames[0] != 'specialPresent' && eventsToRemove[2].classNames[0] != 'specialPresent')){
    if(moment(eventsToRemove[1].start).isBefore(eventsToRemove[0].start,'days'))
      _dates = createDateArray(eventsToRemove[1].start,eventsToRemove[0].end)
    else
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[1].start)
  }

  else{
    if(eventsToRemove[0].classNames[0] != 'specialPresent')
      _dates = createDateArray(eventsToRemove[0].start,eventsToRemove[eventsToRemove.length -1].start);
    else if(eventsToRemove[eventsToRemove.length -1].classNames[0] == 'conge' || eventsToRemove[eventsToRemove.length -1].classNames[0] == 'congeDeny')
      _dates = createDateArray(eventsToRemove[eventsToRemove.length -1].start,eventsToRemove[eventsToRemove.length -2].start);
  }

  return _dates;
}

// --------- Permet de conserver la hauteur  des fc-widget-content --------- //
function setHeightOfRow(){
  let fc_widgets_content_div = $('.fc-widget-content:nth-child(1)')
  for(i=1;i<fc_widgets_content_div.length-1;i++){
    $(fc_widgets_content_div[i].firstElementChild).css('height','38px');
  }
}

// --------- creer les evenement present | ferie | recap --------- //
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

// --------- creer les evenement present | ferie --------- //
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

// --------- creer les evenement recap --------- //
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

// --------- Gestion des informations des events --------- //
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
  modal.modal('show');
}

function pushInfos(classNames,info,form,emp_id,formIsinfo = false){
  if(classNames == 'demandeConge'){
    form.each(function(){
      let info_id = $(this)[0].id.slice(4);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = emp_id;
    demandeCongesInfos.push(info);
  }
  else if(classNames == 'demandeCongeValid'){
    form.each(function(){
      let info_id = $(this)[0].id;
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = emp_id;
    demandeCongeValidInfos.push(info);
  }    
  else{
    form.each(function(){
      let info_id;
      if(formIsinfo)
        info_id = $(this)[0].id.slice(1);
      else  
        info_id = $(this)[0].id.slice(4);
      let val = $(this).val() ;
      info[info_id] = val;
    })
    info['emp_id'] = emp_id;
    if(classNames == "conge")
      congeInfos.push(info);
    else if(classNames == "absence")
      absenceInfos.push(info);
    else if(classNames == "arret")
      arretInfos.push(info);
    else if(classNames == "teletravail")
      teletravailInfos.push(info);
    else if(classNames == "formation")
      formationInfos.push(info);
    else if(classNames == "rdv_pro")
      rdv_proInfos.push(info);
    else if(classNames == "recup")
      recupInfos.push(info);
  }
}

function removeInfo(classNames,start,emp_id){
  let infoIndex; 
  switch(classNames){
    case "demandeConge": 
      infoIndex = demandeCongesInfos.findIndex(info=> {return moment(info.VdateDebut).isSame(start,'day') && info.emp_id == emp_id});
      demandeCongesInfos.splice(infoIndex,1);
      break;
    case "conge": 
      infoIndex = congeInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      congeInfos.splice(infoIndex,1);
      break;
    case "absence": 
      infoIndex = absenceInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      absenceInfos.splice(infoIndex,1);
      break;
    case "arret": 
      infoIndex = arretInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      arretInfos.splice(infoIndex,1);
      break;
    case "teletravail": 
      infoIndex = teletravailInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      teletravailInfos.splice(infoIndex,1);
      break;
    case "formation": 
      infoIndex = formationInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      formationInfos.splice(infoIndex,1);
      break;
    case 'rdv_pro': 
      infoIndex = rdv_proInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      rdv_proInfos.splice(infoIndex,1);
      break;
    case 'recup': 
      infoIndex = recupInfos.findIndex(info=> {return moment(info.dateDebut).isSame(start,'day') && info.emp_id == emp_id});
      recupInfos.splice(infoIndex,1);
      break;
    case 'demandeCongeValid': 
      infoIndex = demandeCongeValidInfos.findIndex(info=> {return moment(info.VdateDebut).isSame(start,'day') && info.emp_id == emp_id});
      demandeCongeValidInfos.splice(infoIndex,1);
      break;
  }
}
// --------- --------------------------- --------- //


// --------- Initialise solde de congé --------- //
function initSoldeConge(){
  calendar.getResources().forEach(r=>{
    if(r.id != "recap-present")
      soldeConge[r.id] = 5;
  });
}

// --------- rend le nombre de congés à l'employé correspondant l'event supprimé si celui-ci est avant now() --------- //
function restoreSoldeConge(emp_id,start,end,nbrOfSpecialPresent){
  let nbrOfDays;
  if(end == null)
    nbrOfDays = 1;
  else
    nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1;
  nbrOfDays = nbrOfDays - nbrOfSpecialPresent * 0.5;
  soldeConge[emp_id] = soldeConge[emp_id] + nbrOfDays;
}
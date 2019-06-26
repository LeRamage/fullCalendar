////////////////////////////////////////////////
// Modules de creation d'un nouvel événement //
///////////////////////////////////////////////

// Variables Globales // 
var specialPresentToReplace = [];

/* --------- selectionne les évènements à retirer
              Si un évènement autre que présent se trouve sur la plage de date, impossible de créer l'évènement --------- */
function pushEventsToRemove(allEventsFilter,resourceId,startHour,endHour,start,end){
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
              _hasNext = hasMidDayAvailable(e,start,end,endHour,startHour);
          }
      })
  }
  return [_eventsToRemove,_hasNext];
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- check si e à une demi journée de dispo qui match avec new event --------- //
function hasMidDayAvailable(e,start,end,endHour,startHour){
  let _available = false;
  if(moment(start).isSame(moment(end),'day')){
    if( (moment(e.start).hour() == 13 && endHour == 'Après-midi') )
      _available = true;
    if( (moment(e.end).hour() == 12 && startHour == 'Après-midi') )
      _available = true;
  }
  else{
    if( (moment(e.start).hour() == 13 && endHour == 'Après-midi' && moment(e.start).isSame(end,'day')) )
      _available = true;
    if( (moment(e.end).hour() == 12 && startHour == 'Après-midi' && moment(e.end).isSame(start,'day')) )
      _available = true;
  }
  return !_available;
}
////////////////////////////////////////////////////////////////////////////////////////


// --------- Ajout d' évenements specialPresent d'une demi journée --------- //
function addEventPresentIfMidDay(start,end,event,startHour,endHour){  
  let _ID = event.extendedProps.ID;
  let eventPresent1, eventPresent2;
  let events = [];
  let startPresent = start;
  let endPresent = end;
  
  if(startHour == 'Après-midi'){         
    eventPresent1 = createEventWithExtProp(['specialPresent','split-right'],startPresent,startPresent,event.getResources()[0].id,_ID); 
    events.push(eventPresent1);
  }
  if(endHour == 'Après-midi'){
    eventPresent2 = createEventWithExtProp(['specialPresent','split-left'],endPresent,endPresent,event.getResources()[0].id,_ID); 
    events.push(eventPresent2);
  }
  calendar.addEventSource(events);
}
////////////////////////////////////////////////////////////////////////////////
  
  
// --------- modifie l'aparence d'un évènement qui commence ou fini sur un specialPresent --------- //
function setWidthEvent(start,end,event){
  let e = calendar.getEvents().filter(e=> (moment(e.start).isSame(start,'day') || moment(e.start).isSame(end,'day')) && e.classNames[0] == 'specialPresent' && e.getResources()[0].id == event.getResources()[0].id);
  let specialPresent = getSpecialPresent(e);
  let _ID = event.extendedProps.ID;

  if(moment(start).isSame(end,'day')){
    if(specialPresent[0].classNames[1] == 'split-left'){
      setPropOfEvent_RemoveSp([event.classNames[0],'specialRight'],event,specialPresent[0]);
    }
    else if(specialPresent[0].classNames[1] == 'split-right'){
      setPropOfEvent_RemoveSp([event.classNames[0],'specialLeft'],event,specialPresent[0]);
    }
  } 
    
  else{
    specialPresent.forEach(sP=>{
      let data =  setData(sP,start,end,event);
      let ESplitStart = data[0],  ESplitEnd = data[1],  ESplitClassNames = data[2], resetEventStart = data[3], resetEventEnd = data[4];
      let eSplit = createEvent(ESplitClassNames,ESplitStart,ESplitEnd,event.getResources()[0].id);
      let resetEvent = createEvent([event.classNames[0],'zIndex'],resetEventStart,resetEventEnd,event.getResources()[0].id);
      traitement_ES_RE(sP, resetEvent, eSplit, _ID);
    })
    event.remove();
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
  

// --------- Get specialPresent(s) à remplacer --------- //
function getSpecialPresent(e){
  let _specialPresent = [];
  if(e.length > 1){
    if(specialPresentToReplace.length == 1)
      _specialPresent.push(e[specialPresentToReplace[0]]);
    else{
      _specialPresent.push(e[0]);
      _specialPresent.push(e[1]); 
    }
  }
  else
    _specialPresent.push(e[0]);
  return _specialPresent;
}
//////////////////////////////////////////////////////////


// --------- traitement pour eSplit et resetEvent --------- //
function traitement_ES_RE(specialPresent, resetEvent, eSplit, _ID){
  specialPresent.remove();
  calendar.addEvent(resetEvent);
  calendar.addEvent(eSplit);
  resetEvent = calendar.getEvents()[calendar.getEvents().length-2];
  resetEvent.setExtendedProp('ID',_ID);
  eSplit = calendar.getEvents()[calendar.getEvents().length-1];
  eSplit.setExtendedProp('ID',_ID);
  if(resetEvent.end == null)
    resetEvent.remove();
}
/////////////////////////////////////////////////////////////
  
  
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


// --------- traitement à faire si l'évenement comporte une/deux demi journée --------- //
function addMidDay(start,end,event,startHour,endHour){
  if(moment(start).isSame(moment(end),'day')){
    if(!(startHour=='Matin' && endHour=='Soir')){
      addEventPresentIfMidDay(start,end,event,startHour,endHour);
    }
  }
  else{
    if(startHour == 'Après-midi' && endHour == 'Après-midi'){
      addEventPresentIfMidDay(start,end,event,startHour,endHour);
    }
    else if(startHour == 'Après-midi'){
      addEventPresentIfMidDay(start,start,event,startHour,endHour);
    }
    else if(endHour == 'Après-midi')
      addEventPresentIfMidDay(end,end,event,startHour,endHour);      
  }
}
/////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- check si le nouvel événement ajouté est placé sur une demi journée de présence --------- //
function checkDropOnSpecialPresent(event){
  try{
    specialPresentToReplace = [];
    let bool = false;
    let events = calendar.getEvents().filter(e => 
      (moment(e.start).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id 
      || moment(e.start).isSame(event.end,'day') && e.getResources()[0].id == event.getResources()[0].id
      || moment(e.end).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id)
      && e.classNames[0] != 'present'
      && e.classNames[0] != 'specialPresent'
    );
    if(events.length >= 2)
      bool = true;
    if(events.length == 2){
      if(moment(event.start).isBefore(events[0].start,'day'))
        specialPresentToReplace.push(1);
      else
        specialPresentToReplace.push(0);
    }
    return bool;
  }
  catch{
    return false;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- traitement à faire si le nouvel événement n'est pas placé sur un événement déjà existant --------- //
function traitementEventManagment(event,startHour,endHour,start,end,event,eventsToRemove){
  event.setExtendedProp('ID',create_unique_ID());
  setHoursOfEvent(startHour,endHour,start,end,event);
  eventsToRemove.forEach(eventToRemove => eventToRemove.remove());
  addMidDay(start,end,event,startHour,endHour);
  
  let placeOnExistingMidDay = checkDropOnSpecialPresent(event);
  if(placeOnExistingMidDay){
    setWidthEvent(start,end,event);
  }; 
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- cache le titre de l'événement créer, reset la taille de ligne à l'initial, cache la modal --------- //
function postTraitement_EM(event,modal){
  event.setProp('title','');
  setHeightOfRow();
  $(modal).modal('hide');   
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
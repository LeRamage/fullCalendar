/////////////////////////////////////////////////
// Modules pour la suppression d'un événement //
////////////////////////////////////////////////


// --------- créer les variables pour deleteEvent --------- //
function dataDeleteEvent(eventRightClicked){
  let _ID = eventRightClicked.extendedProps.ID; 
  let eventsToRemove = calendar.getEvents().filter(e => e.extendedProps.ID == _ID);
  let dates = deleteManagment(eventsToRemove);

  return [_ID,eventsToRemove,dates];
}
/////////////////////////////////////////////////////////////
  
  
// --------- remove les events supprimés et check si specialRight/left existe parmis ceux-ci --------- //
function removeEventstoDelete(eventsToRemove, hasSpecialRight, hasSpecialLeft){
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
  });

  return [hasSpecialRight,hasSpecialLeft];
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- update les totaux de présences et check s'il y a un specialRight/Left sur l'événement suivant/précédent l'événement supprimé--------- //
function updateTotPres_checkIfSpecial(checkIfSpecial,hasSpecialLeft,hasSpecialRight){
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
  return [hasSpecialLeft,hasSpecialRight];
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- remplace les événements supprimés par des événements présent et les événements specialRigth/Left par des événement specialPrésent --------- //
function replaceDeletedByDefault(dates,events,hasSpecialRight,hasSpecialLeft,eventsToRemove,eventRightClicked){
  dates.forEach(d => {
    if(![0,6].includes(d.getDay())){
      data = dataDefaultEvent(d,hasSpecialRight,hasSpecialLeft,eventsToRemove,eventRightClicked);
      let classNames = data[0],start = data[1],end = data[2],resourceId = data[3];           
      let event = createEvent(classNames,start,end,resourceId);
      events.push(event);
    }
    else{
      let event = createEventFerie(d,eventRightClicked.getResources()[0].id);
      events.push(event);
    } 
  })
  return events; 
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- créer les datas pour les défaults events --------- //
function dataDefaultEvent(d,hasSpecialRight,hasSpecialLeft,eventsToRemove,eventRightClicked){
  let classNames,start,end,resourceId
  if(hasSpecialRight[0] == true && moment(d).isSame(hasSpecialRight[1],'day') && eventsToRemove.length != 3){
    classNames = ['specialPresent','split-right'];
    start = hasSpecialRight[1];
    end = hasSpecialRight[1];
    resourceId = eventRightClicked.getResources()[0].id;
  }
  else if(hasSpecialLeft[0] == true && moment(d).isSame(hasSpecialLeft[1],'day') && eventsToRemove.length != 3){
      classNames = ['specialPresent','split-left'];
      start = hasSpecialLeft[1];
      end = hasSpecialLeft[1];
      resourceId = eventRightClicked.getResources()[0].id;
  }
  else{
      classNames = 'present';
      start = d;
      end = d;
      resourceId = eventRightClicked.getResources()[0].id;
  }

  return [classNames,start,end,resourceId];
}
/////////////////////////////////////////////////////////////////
  
  
// --------- rattache le specialEvent créer à l'événement suivant/précédent l'événement supprimé --------- //
function fusion(hasSpecialLeft,hasSpecialRight,eventRightClicked){
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
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- retourne la plage de date où supprimer --------- //
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
///////////////////////////////////////////////////////////////
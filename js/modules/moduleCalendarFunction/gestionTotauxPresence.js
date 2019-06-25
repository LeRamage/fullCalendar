//////////////////////////////////////////
// Modules pour les totaux de Présence //
/////////////////////////////////////////


// --------- ajoute/enlève la durée de l'événement aux totaux de présence --------- //
function update(compteurPresence,eventTotPresence, duration){
  compteurPresence = eventTotPresence[0].extendedProps.totPres - duration;
  eventTotPresence[0].setProp('title',compteurPresence);
  eventTotPresence[0].setExtendedProp('totPres',compteurPresence);
}
/////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- obtient les événements recap qui doivent être update --------- //
function getEventTotPrence(ETPstart){
  let _eventTotPresence = calendar.getEvents().filter(e=> e.classNames[0] == 'recap' && moment(e.start).isSame(ETPstart,'day'));
  return _eventTotPresence;
}
/////////////////////////////////////////////////////////////////////////////
  
  
// --------- obtient le / les événements  --------- //
function getEventAtDate(event){
  let _eventsAtDate;
  _eventsAtDate = calendar.getEvents().filter(e=>e.extendedProps.ID == event.extendedProps.ID);  
  _eventsAtDate.splice(0,1);
  return _eventsAtDate;
}
/////////////////////////////////////////////////////
  
  
// --------- Update les totaux de présence après la suppression d'un évènement --------- //
function resetTotalPresence(event){
  let start = moment(event.start), end = event.end, eventTotPresence, compteurPresence;

  if(start.isSame(end,'day') || end == null){
    eventTotPresence = getEventTotPrence(start);
    let duration = getDuration(event.classNames);
    update(compteurPresence,eventTotPresence,duration);
  }
  
  else{
    if(event.classNames[0] != 'specialPresent'){
      let dates = createDateArray(start,end);
      dates.forEach(d=>{
        if(!calendar.getEvents().find(e => moment(e.start).isSame(d,'day') && e.classNames[0] == 'ferie_WE')){
          eventTotPresence = getEventTotPrence(d);
          update(compteurPresence,eventTotPresence, -1);
        }
      })
    }
    else{
      eventTotPresence = getEventTotPrence(start);
      update(compteurPresence,eventTotPresence,0.5);
    }
  }
}
//////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- obtient la durée de l'événement : 1 jour ou un demi jour --------- //
function getDuration(classNames){
  let _duration;
  if(classNames[0] == 'specialPresent')
    _duration = 0.5;
  else if(classNames[1] == 'specialLeft' || classNames[1] == 'specialRight')
    _duration = - 0.5;
  else
    _duration = -1;

  return _duration;
}
/////////////////////////////////////////////////////////////////////////////////
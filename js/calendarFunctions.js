////////////////////////////////////
// Fonctionnalités du calendrier //
///////////////////////////////////


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
      let ETR = pushEventsToRemove(allEventsFilter,resourceId,startHour,endHour,start,end);
      eventsToRemove = ETR[0];
      hasNext = ETR[1];
  }

  if(hasNext)
      eventsToRemove.push(hasNext);

  return eventsToRemove;
}
////////////////////////////////////////////////////////////////////////////////////////////////////


// --------- Gère tout ce qu'il faut lors de la création d'un nouvel évènement  --------- //
function EventsManagment(eventsToRemove,startHour,endHour,start,end,event,modal){
  if(eventsToRemove.length>0 && eventsToRemove[eventsToRemove.length-1] != true && eventsToRemove.find(e => e == 'thisDateIsEmpty')!="thisDateIsEmpty"){
    traitementEventManagment(event,startHour,endHour,start,end,event,eventsToRemove,modal);
    updateTotalPresenceAtDate(event);
    postTraitement_EM(event,modal);
  }
  else if(eventsToRemove.find(e => e == 'thisDateIsEmpty')){
    traitementEventManagment(event,startHour,endHour,start,end,event,eventsToRemove,modal);
    postTraitement_EM(event,modal);
  }
  else{
    $(modal).modal('hide');
    displayError();
  }
  toggle_spinner(false);
}
///////////////////////////////////////////////////////////////////////////////////////////


// --------- Supprimer un évènement (sauf évenement present) --------- //
function deleteEvent(eventRightClicked, isAmodif = false){
  // Variables
  let data = dataDeleteEvent(eventRightClicked);
  let _ID = data[0],eventsToRemove = data[1],dates = data[2],hasSpecialRight = [],hasSpecialLeft = [], events = [];
  let hasSpecial = removeEventstoDelete(eventsToRemove, hasSpecialRight, hasSpecialLeft);
  hasSpecialRight = hasSpecial[0],hasSpecialLeft = hasSpecial[1];
  let checkIfSpecial = calendar.getEvents().filter(e=>(moment(e.start).isSame(eventRightClicked.start,'day') || moment(e.start).isSame(eventRightClicked.end,'day')) && (e.classNames[1] == 'specialRight' || e.classNames[1] == 'specialLeft' ));
  if(hasSpecial[0].length == 0 && hasSpecial[1].length == 0){
    hasSpecial = updateTotPres_checkIfSpecial(checkIfSpecial,hasSpecialLeft,hasSpecialRight);
    hasSpecialLeft = hasSpecial[0],hasSpecialRight = hasSpecial[1];
  }

  // traitement
  if( (eventRightClicked.classNames[0] == 'conge' || eventRightClicked.classNames[0] == 'demandeCongeValid') && moment(eventRightClicked.start).isAfter(moment()) && !isAmodif){
    restoreSoldeConge(eventRightClicked.getResources()[0].id,eventRightClicked.start,eventRightClicked.end,calendar.getEvents().filter(e=>e.extendedProps.ID = _ID && e.classNames[0] == 'specialPresent').length);
  }
  removeInfo(eventRightClicked.classNames[0],eventRightClicked.start,eventRightClicked.getResources()[0].id);
  events = replaceDeletedByDefault(dates,events,hasSpecialRight,hasSpecialLeft,eventsToRemove,eventRightClicked);
  calendar.addEventSource(events);
  fusion(hasSpecialLeft,hasSpecialRight,eventRightClicked);

  // post traitement
  $('#modalDelete').modal('hide');
  setHeightOfRow();
}
/////////////////////////////////////////////////////////////////////////


// --------- Update les totaux de présence après l'ajout d'un événement --------- //
function updateTotalPresenceAtDate(event){
  let start = moment(event.start), end = event.end, eventTotPresence, compteurPresence;
  let eventsAtDate =  getEventAtDate(event);

  if(start.isSame(end,'day') || end == null){
    eventTotPresence = getEventTotPrence(start);
    if(eventsAtDate.length >= 1){
      update(compteurPresence,eventTotPresence, 0.5);
    }
    else{
      update(compteurPresence,eventTotPresence, 1);
    }
  }
  else{
    let dates = createDateArray(start,end);
    dates.forEach(d=>{
      if(!calendar.getEvents().find(e => moment(e.start).isSame(d,'day') && e.classNames[0] == 'ferie_WE')){
        eventTotPresence = getEventTotPrence(d);
        if(eventTotPresence.length > 0){
          update(compteurPresence,eventTotPresence, 1);
        }
      }
    })
    eventsAtDate.forEach(ev=>{
      eventTotPresence = getEventTotPrence(ev.start);
      update(compteurPresence,eventTotPresence, -0.5);
    })
  }
}
///////////////////////////////////////////////////////////////////////////////////


// --------- Creer ID unique --------- //
function create_unique_ID(){
  return '_' + Math.random().toString(36).substr(2, 9);
}
////////////////////////////////////////


// --------- Tableau contenant toutes les dates entre une start date et une end date  --------- //
function createDateArray(start,end){
  let dateArray = [], dt = new Date(start);

  while (moment(dt).isSameOrBefore(end) || moment(dt).isSame(end,'day')) {
    dateArray.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return dateArray;
}
////////////////////////////////////////////////////////////////////////////////////////////////


// --------- display Erreur--------- //
function displayError(){
  $('#alertD').show();
  $('#modalDemandeConge').modal('hide');
  displayAlert($('#alertD'));

  setTimeout(function(){
    $('#eventReceive').val().remove();
    setHeightOfRow();
  },10);
}
///////////////////////////////////////


// --------- Permet d'obtenir la longueur des evenements --------- //
function getWidthOfEvent(){
  return width_event = $('.present').width();
}
////////////////////////////////////////////////////////////////////


// --------- Permet de conserver la hauteur des fc-widget-content --------- //
function setHeightOfRow(){
  let fc_widgets_content_div = $('.fc-widget-content:nth-child(1)')
  for(i=1;i<fc_widgets_content_div.length-1;i++){
    $(fc_widgets_content_div[i].firstElementChild).css('height','38px');
  }
}
/////////////////////////////////////////////////////////////////////////////


// --------- Initialise solde de congé --------- //
function initSoldeConge(){
  calendar.getResources().forEach(r=>{
    if(r.id != "recap-present")
      soldeConge[r.id] = 5;
  });
}
//////////////////////////////////////////////////


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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
        traitement_ES_RE(specialPresent, event, resetEvent, eSplit, _ID);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- traitement pour eSplit et resetEvent --------- //
function traitement_ES_RE(specialPresent, event, resetEvent, eSplit, _ID){
    specialPresent.remove();
    event.remove();
    calendar.addEvent(resetEvent);
    calendar.addEvent(eSplit);
    resetEvent = calendar.getEvents()[calendar.getEvents().length-2];
    resetEvent.setExtendedProp('ID',_ID);
    eSplit = calendar.getEvents()[calendar.getEvents().length-1];
    eSplit.setExtendedProp('ID',_ID);
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
        addSpecialEventPresentIfMidDay(start,end,event);
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
    let bool = calendar.getEvents().filter(e => 
      (moment(e.start).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id 
      || moment(e.start).isSame(event.end,'day') && e.getResources()[0].id == event.getResources()[0].id
      || moment(e.end).isSame(event.start,'day') && e.getResources()[0].id == event.getResources()[0].id)
      && e.classNames[0] != 'present'
      && e.classNames[0] != 'specialPresent'
    ).length == 2;
    return bool;
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
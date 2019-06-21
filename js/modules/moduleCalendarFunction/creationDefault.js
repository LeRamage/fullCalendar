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


// --------- creer les evenement present | ferie | recap aux dates définies --------- //
function createDefaultFromDates(events,dates,employes){
    dates.forEach(function(date){ 
      employes.forEach(emp => {
        if(![0,6].includes(date.getDay())){       
          event = createEventPresent(date,emp.id);
          events.push(event);
        }
        else{
          event = createEventFerie(date,emp.id);       
          events.push(event)
        }
      })
      if(![0,6].includes(date.getDay())){
        event = createEventRecap(date,employes.length);
        events.push(event);
      }
    })
    calendar.addEventSource(events);
  }
  ///////////////////////////////////////////////////////////////////////////////////////
  
  
  // --------- creation d'un événement Présent --------- //
  function createEventPresent(start,empID){
    event = {
      classNames: ['present','pres'],
      start: start,
      allDay: true,
      resourceId: empID,          
    };
    return event;
  }
  ////////////////////////////////////////////////////////
  
  
  // --------- création d'un évenement ferié --------- //
  function createEventFerie(start,empID){
    event = {
      classNames: 'ferie_WE',
      start: start,
      allDay: true,
      resourceId:empID,
      rendering:'background'
    };   
    return event;
  }
  //////////////////////////////////////////////////////
  
  
  // --------- création d'un évenement Recap --------- //
  function createEventRecap(start,n){
    event = {
      title: n,
      classNames:'recap',
      start: start,
      resourceId: 'recap-present',
      extendedProps:{'totPres':n}
    }; 
    return event; 
  }
  //////////////////////////////////////////////////////
  
  // --------- creer les evenement present | ferie --------- //
  function createDefaultFromDatesWithoutRecap(events,dates,employes){
    dates.forEach(function(date){ 
      employes.forEach(emp => {
        if(![0,6].includes(date.getDay())){
          event = createEventPresent(date,emp.id);        
          events.push(event)
        }
        else{
          event = createEventFerie(date,emp.id);
          events.push(event)
        }
      })
    })
    calendar.addEventSource(events);
  }
  ////////////////////////////////////////////////////////////
  
  
  // --------- creer les evenement recap --------- //
  function createDefaultRecap(dates){
    let events = []
    dates.forEach(date=>{
      nbrOfPresentAtThisDay = calendar.getEvents().filter(e=>moment(e.start).isSame(date,'day') && e.classNames[0] == 'present')
      if(![0,6].includes(date.getDay())){
        event = createEventRecap(start,nbrOfPresentAtThisDay.length);
        events.push(event)
      }
    })
    calendar.addEventSource(events);
  }
  //////////////////////////////////////////////////
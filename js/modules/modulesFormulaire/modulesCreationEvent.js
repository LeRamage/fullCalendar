//////////////////////////////////////
// Modules de creation d'événement //
/////////////////////////////////////


// --------- Créer les booleans pour la création d'un évènement // 
function createBooleans(modal){
    let _isTypeAddE = false, _isTypeC = false, _isConge = false;
    if(modal[0].id == 'modalAddEvent'){
      _isTypeAddE = true;
    }   
    if(modal[0].id == 'modalConge' || modal[0].id == 'modalDemandeConge' || modal[0].id == 'modalValidationConge' || (modal[0].id == 'modalAddEvent' && ($('#typeEvent option:selected').val() == 'demandeConge' || $('#typeEvent option:selected').val() == 'conge')))
        _isTypeC = true;
    if(modal[0].id == 'modalConge' || modal[0].id == 'modalValidationConge' || (modal[0].id == 'modalAddEvent' && $('#typeEvent option:selected').val() == 'conge'))
        _isConge = true;
    return [_isTypeAddE, _isTypeC, _isConge];
}
/////////////////////////////////////////////////////////////////

  
// --------- Pré-traitement de la création d'évènements : créer les variables pour le traitement //
function pre_traitement(form,modal,isTypeAddE,isTypeC){
    // Variables //
    let _variables = create_variables(form, isTypeC, isTypeAddE);
    let event;
    let resourceId;
    if(modal[0].id == 'modalValidationConge'){
        event = $('#eventClicked').val();
        resourceId = $('#eventClicked').val().getResources()[0].id;
        event = resetEvent(event,['demandeCongeValid','zIndex'],_variables,resourceId);
    }
    else if(isTypeAddE){
        resourceId = $("#eventDblClicked").val().getResources()[0].id;
        event = createEvent(_variables[0].className,_variables[0].start,_variables[0].end,resourceId); 
        calendar.addEvent(event);
        event = calendar.getEvents()[calendar.getEvents().length - 1]; 
    }
    else{
        event = _variables[0].event;
        resourceId = $('#dropLocation').val(); 
    }        
    _variables[0].event = event;
    _variables[0].resourceId = resourceId;
  
    return _variables;
}
////////////////////////////////////////////////////////////////////////////////////////////////////

  
// --------- Permet de récupérer l'objet qui stocke les infos du type d'évènement créé (pour modalAddEvent) // 
function setIdInfo(idInfo){
    switch(idInfo){
        case 'demandeConge':
            idInfo = demandeCongesInfos;
            break;
        case "conge":
            idInfo = congeInfos;
            break;
        case "absence":
            idInfo = absenceInfos;
            break;
        case "arret":
            idInfo = arretInfos;
            break;
        case "teletravail":
            idInfo = teletravailInfos;
            break;
        case "formation":
            idInfo = formationInfos;
            break;
        case "rdv_pro":
            idInfo = rdv_proInfos;
            break;
        case "recup":
            idInfo = recupInfos;
            break;
    }
    return idInfo;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

  
// --------- Modifie le solde de conge de l'employé si l'évènement créé est de type Congé --------- //
function modifSolde(isTypeC,isTypeAddE,nbrOfDays,resourceId){
    if(isTypeC){
        if(isTypeAddE){
            soldeConge[resourceId] = soldeConge[resourceId] - nbrOfDays;
        }
        else{
            soldeConge[resourceId] = soldeConge[resourceId] - nbrOfDays;
        }
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////

  
// --------- Push les infos de l'évènement dans l'objet qui stocke les infos du type d'évènement créé --------- //
function infoManagment(isTypeAddE,variables,form,idInfo,nbrOfSlice,event,resourceId,modal){
    if(isTypeAddE){
        pushInfos(variables[0].className, variables[0].info, form, resourceId);
    }
    else if(modal[0].id == 'modalValidationConge'){
        pushInfos(event.classNames[0], variables[0].info, form, resourceId);
    }
    else{
        let info = variables[0].info
        form.each(function(){
            let info_id = $(this)[0].id.slice(nbrOfSlice);
            let val = $(this).val() ;
            info[info_id] = val;
        })
        info['emp_id'] = resourceId;
        idInfo.push(info);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  
// --------- Vérifie que les inputs des modals sont valides --------- //
function checkIfInputValid(form, start, end, startHour, endHour, isTypeC, isTypeAddE, event){
    try{
        let startIndex = 1;
        if(isTypeC)
            startIndex = 2;
        if(isTypeAddE){
            startIndex = 3;
        }
             
        if(!(start <= end)){
            $('.invalid').show()
            var element = document.getElementById(form[startIndex].id);
            element.classList.add('not-valid');
            event.remove();
            toggle_spinner(false);
            return false;
        }
        else if(
            (moment(start).isSame(moment(end),'day')) 
            && (startHour =='Après-midi' && endHour == 'Après-midi')
        ){
            $('.isTheSame').show();
            var element = document.getElementById(form[startIndex+1].id);
            element.classList.add('not-valid');
            element = document.getElementById(form[startIndex+2].id);
            element.classList.add('not-valid');
            event.remove();
            toggle_spinner(false);
            return false;
        }
        else  
            return true;
    }
    catch{
        return false;
    }
}
/////////////////////////////////////////////////////////////////////

  
// --------- Vérifier si l'employé à suffisament de solde de congé disponible --------- //
function checkSolde(form,event,nbrOfDays,modal,isTypeC,isTypeAddE){
    try{
        if( soldeConge[event.getResources()[0].id] - nbrOfDays < 0 ){
            cancelModal(form,modal,isTypeC,isTypeAddE,event);
            $('#soldeRestant').html();
            $('#soldeRestant').html(soldeConge[event.getResources()[0].id].toString()); // est faux si modal = modalAddEvent
            displayAlert($('#alertSoldeInsuffisant'));
            toggle_spinner(false);
            return false;
        }
        else
            return true;
    }
    catch{
        return false;
    }
}
//////////////////////////////////////////////////////////////////////////////////////////

  
// --------- active/desactive le spinner lors de création/modification d'évènement --------- //
function toggle_spinner(bool){
    if(bool){
        $('.btn-primary').hide();
        $('.spinner-border').show();
    }
    else if(!bool){
        $('.spinner-border').hide();
        $('.btn-primary').show();
        $('#valid-modif-event-btn').hide();
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////

  
// --------- créer les variables pour le traitement de la création d'évènement --------- //
function create_variables(form,isTypeC,isTypeAddE){
    let variables = [];
    let startIndex = 0;
    let nbrOfDays = 0;
    let className = '';
    if(isTypeC)
        startIndex = 1;
    if(isTypeAddE){
        startIndex = 2;
        className = $('#typeEvent option:selected').val();
    } 
    let start = new Date(form[startIndex].value);
    let end = new Date(form[startIndex+1].value);
    let startHour = form[startIndex+2].value;
    let endHour = form[startIndex+3].value;
    let event = calendar.getEvents()[calendar.getEvents().length - 1];
    let info = [];
  
    if(isTypeC){
        nbrOfDays = moment(end).dayOfYear() - moment(start).dayOfYear() + 1;
        if(startHour == 'Après-midi')
            nbrOfDays = nbrOfDays - 0.5
        if(endHour == 'Après-midi')
            nbrOfDays = nbrOfDays - 0.5
    }
  
    variables.push({'start':start,'end':end,'startHour':startHour,'endHour':endHour,'event':event,'className':className,'info':info,'nbrOfDays':nbrOfDays})
    return variables;
}
///////////////////////////////////////////////////////////////////////////////////////////

  
// --------- reset le formulaire s'il comportait des erreurs --------- //
function toggle_invalid_isSame(form,isTypeC,isTypeAddE){
    startIndex = 1;
    if(isTypeC)
        startIndex = 2;
    if(isTypeAddE)
        startIndex = 3;
  
    $('.invalid').hide();
    $('#'+form[startIndex].id).removeClass('not-valid');
    $('.isTheSame').hide();
    $('#'+form[startIndex+1].id).removeClass('not-valid');
    $('#'+form[startIndex+2].id).removeClass('not-valid');
}
/////////////////////////////////////////////////////////////////////////

  
// --------- ferme la modal ouvert --------- // 
function cancelModal(form,modal,isTypeC,isTypeAddE,event){
    if(!isTypeAddE)
        event.remove();
    toggle_invalid_isSame(form,isTypeC,isTypeAddE);
    modal.modal('hide');
    setHeightOfRow();
}
//////////////////////////////////////////////

  
// --------- remove event et recrée un event avec les nouvelles propriété --------- //
function resetEvent(event,classNames,variables,resourceId){
    resourceId = event.getResources()[0].id;    
    let resetEvent = createEvent(classNames,variables[0].start,variables[0].end,resourceId);
    let _extendedProps = event.extendedProps.ID;
    deleteEvent(event,true);
    calendar.addEvent(resetEvent);    
    resetEvent = calendar.getEvents()[calendar.getEvents().length-1]
    resetEvent.setExtendedProp('_ID',_extendedProps);
    event = resetEvent;
    return event;
}
////////////////////////////////////////////////////////////////////////////////////
  
 
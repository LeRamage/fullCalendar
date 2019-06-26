/////////////////////////////////////////////////////////////////
// Modules pour la création du calendrier et ces interactions //
////////////////////////////////////////////////////////////////


// --------- Modifie l'apparence du formulaire addEvent en fonction de typeEvent --------- //
$(document).ready(function(){
  try{
    $('#typeEvent').change(function(){
      switch($('#typeEvent option:selected').val()){
        case 'demandeConge':
          toggleElementFormAddEvent(true,true,true);
          break;
        case 'conge' :
          toggleElementFormAddEvent(true,true,true);
          break;
        case 'absence' :
          toggleElementFormAddEvent(false,true,false);
          break;
        case 'arret' :
          toggleElementFormAddEvent(false,true,false);
          break;
        case 'teletravail' :
          toggleElementFormAddEvent(false,false,true);
          break;
        case 'formation' :
          toggleElementFormAddEvent(false,false,true);
          break;
        case 'rdv_pro' :
          toggleElementFormAddEvent(false,false,true);
          break;
        case 'recup' :
          toggleElementFormAddEvent(false,false,true);
          break;
      }
    })
  }
  catch{
    unknownErrorManagment($('#modalAddEvent'));
  }
})
////////////////////////////////////////////////////////////////////////////////////////////


// --------- show modal et la remplis avec les infos de l'événement cliqué --------- //
function showFormInfo(modal,typeInfo,event){
  $('#info-type-conge').hide();
  let isTypeC = false;
  if(modal[0].id == 'modalConge')
      isTypeC = true;
  remplirModalInfoEvent(typeInfo,event,modal,'I',0,isTypeC);
}
//////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- Montre le formulaire pour la création d'événement et set les dates début et fin --------- //
function showFormOther(modal,arg,prefix){
  modal.modal({backdrop: 'static'});
  modal.modal('show');
  $('#'+prefix+'dateDebut').val(arg["dateStr"].slice(0,10));
  $('#'+prefix+'dateFin').val(arg["dateStr"].slice(0,10));
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- autorise le drop sur les événements present et specialPresent + check si le solde de congé de l'employé n'est pas épuisé --------- //
function allowDrop(draggedEvent,dropLocation){
  try{
    if(draggedEvent.classNames[0] == 'demandeConge' || draggedEvent.classNames[0] == 'conge'){
      if(soldeConge[draggedEvent.getResources()[0].id] > 0){
        $('#dropLocation').val(dropLocation.resource.id);
        setHeightOfRow();
        $('#draggedEventIdEmp').val(draggedEvent.getResources()[0].id);
        return true;
      }
      else{
        setHeightOfRow();
        displayAlert($('#alertSoldeEmpty'));
        return false;
      }
    }
    else{
      $('#dropLocation').val(dropLocation.resource.id);
      setHeightOfRow();
      return true;
    }
  }
  catch{
    displayAlert($('#alertErreurUnknown'));
    return false;
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
// --------- show/hide inputs de modalAddEvent en fonction de typeEvent --------- //
function toggleElementFormAddEvent(tcc,js,atga){
  if(tcc)
      $('#type-conge-content').show();
  else
      $('#type-conge-content').hide();
  if(js)
      $('#justification-content').show();
  else
      $('#justification-content').hide();
  if(atga)
      $('#addToGoogleAgenda').show();
  else
      $('#addToGoogleAgenda').show();
}
//////////////////////////////////////////////////////////////////

function setWidthViewChanges(){
  $('.specialPresent').css('width',width_event / 2)
}
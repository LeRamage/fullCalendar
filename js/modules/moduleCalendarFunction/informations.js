///////////////////////////////////////////////////
// Modules pour les informations des événements //
//////////////////////////////////////////////////


// --------- Gestion des informations des events --------- //
function remplirModalInfoEvent(typeEvent,event,modal,c,nbrOfSlice,showITC){
  modal.modal({backdrop: 'static'});
  if(showITC)
      $('#info-type-conge').show();    
  typeEvent.forEach(function(info){
    let V = '';
    if(typeEvent == demandeCongeValidInfos)
      V = 'V';
    date = new Date(info[V+"dateDebut"]);
    if(moment(date).isSame(moment(event.start),'day') && info['emp_id'] == event.getResources()[0].id){
      Object.keys(info).forEach(function(element){
        $('#'+c+element.slice(nbrOfSlice)).val(info[element]);
      })
      return; // ?
    }
  }) 
  modal.modal('show');
}
////////////////////////////////////////////////////////////
  
  
// --------- Sauvegardes les informations de l'événement est modifié --------- //
function pushInfos(classNames,info,form,emp_id,formIsinfo = false){
  if(classNames == 'demandeConge'){
    info = getInfoOfForm(form,4,info);
    info['emp_id'] = emp_id;
    getTypeInfoAndPushIt(classNames,info);
  }
  else if(classNames == 'demandeCongeValid'){
    info = getInfoOfForm(form,0,info);
    info['emp_id'] = emp_id;
    getTypeInfoAndPushIt(classNames,info);
  }    
  else{
    if(formIsinfo)
      info = getInfoOfForm(form,1,info);
    else 
      info = getInfoOfForm(form,4,info); 
    info['emp_id'] = emp_id;
    getTypeInfoAndPushIt(classNames,info);
  }
}
///////////////////////////////////////////////////////////////////////////////////
  
  
// --------- Récupère les infos saisis dans le formulaire --------- //
function getInfoOfForm(form,nbrOfSlice,info){
  form.each(function(){
    let info_id = $(this)[0].id.slice(nbrOfSlice);
    let val = $(this).val() ;
    info[info_id] = val;
  })
  return info;
}
/////////////////////////////////////////////////////////////////////
  
  
// --------- Récupère l'objet dans lequel push les infos + push --------- //
function getTypeInfoAndPushIt(className,info){
  if(className == "conge")
    congeInfos.push(info);
  else if(className == "absence")
    absenceInfos.push(info);
  else if(className == "arret")
    arretInfos.push(info);
  else if(className == "teletravail")
    teletravailInfos.push(info);
  else if(className == "formation")
    formationInfos.push(info);
  else if(className == "rdv_pro")
    rdv_proInfos.push(info);
  else if(className == "recup")
    recupInfos.push(info);
  else if(className == "demandeConge")
    demandeCongesInfos.push(info);
  else if(className == 'demandeCongeValid')
    demandeCongeValidInfos.push(info);
}
///////////////////////////////////////////////////////////////////////////
  

// --------- supprime les infos avant changement --------- //
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
////////////////////////////////////////////////////////////
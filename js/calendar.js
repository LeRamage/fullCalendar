/////////////////
// Calendrier //
////////////////


// --------- Variables Globales --------- //
let calendar;
let demandeCongesInfos = [], demandeCongeValidInfos = [], congeInfos = [], absenceInfos = [], arretInfos = [],
    teletravailInfos = [], formationInfos = [], rdv_proInfos = [], recupInfos = [];
let width_event;
let soldeConge = [];
///////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
    const Calendar = FullCalendar.Calendar;
    const Draggable = FullCalendarInteraction.Draggable;

    /* initialize the external events
    -----------------------------------------------------------------*/
    //// the individual way to do it
    const containerEl = document.getElementById('external-events-list');
    const eventEls = Array.prototype.slice.call(
        containerEl.querySelectorAll('.fc-event')
    );
    let eventEl;
    let _id;

    for (let i = 1; i < eventEls.length - 1; i++) {
        eventEl = eventEls[i];
        _id = eventEl.id;
        new Draggable(eventEl, {
            eventData: {
                title: eventEl.innerText.trim(),
                classNames: _id,
                id: _id,
            }
        });
    }

    /* initialize the calendar
    -----------------------------------------------------------------*/

    const calendarEl = document.getElementById('calendar');

    calendar = new Calendar(calendarEl, {
        // --------- Plugins --------- //
        plugins: ['resourceTimeline', 'interaction'],
        ///////////////////////////////

        // --------- Display --------- //
        defaultView: 'custom3Month',
        timezone: 'local',
        locale: 'fr',
        droppable: true,
        editable: false,
        displayEventTime: false,
        displayEventEnd: false,
        contentHeight: 'auto',
        resourceAreaWidth: '10%',
        firstDay: 1,
        ///////////////////////////////////

        // --------- Custom Buttons --------- //
        customButtons: {
            myCustomButton: {
                text: 'Aller à la date',
                click: function () {
                    $('#goToDate').modal('show');
                }
            }
        },
        ///////////////////////////////////////

        // --------- Custom Views --------- //
        views: {
            custom3Month: {
                type: 'resourceTimeline',
                duration: {months: 3},
                slotDuration: {days: 1},
                buttonText: '3 mois',
            },
            customWeek: {
                type: 'resourceTimeline',
                duration: {weeks: 1},
                slotDuration: {days: 1},
                buttonText: '1 semaine',
            },
            customDay: {
                type: 'resourceTimeline',
                duration: {days: 1},
                slotDuration: {days: 1},
                buttonText: '1 jour',
            }
        },
        /////////////////////////////////////

        // --------- Header --------- //
        header: {
            left: 'prev,next today, myCustomButton',
            center: 'title',
            right: 'customDay,customWeek,custom3Month'
        },
        ///////////////////////////////

        // ---------  Ressources --------- //
        resourceLabelText: 'Date',
        resourceGroupField: 'type',
        resources: [
            {id: 'emp1', type: 'Employés', title: 'Jean Bombeur'},
            {id: 'emp2', type: 'Employés', title: 'Jean Talu'},
            {id: 'emp3', type: 'Employés', title: 'Bowie Ken'},
            {id: 'emp4', type: 'Employés', title: 'Alain Dii'},
            {id: 'recap-present', type: 'Récapitulatif', title: 'Total Présences'},
        ],

        events: [
            {
                start: new Date('2019-06-03').setHours(9, 0, 0, 0),
                end: new Date('2019-06-05').setHours(18, 0, 0, 0),
                classNames: 'demandeConge',
                extendedProps: '_abcd',
                resourceId: 'emp1',
            },
            {
                start: new Date('2019-06-03'),
                classNames: ['specialPresent', 'split-right'],
                extendedProps: '_abcd',
                resourceId: 'emp1',
            },
        ],

        ///////////////////////////////////

        // --------- Fonction clique simple sur un événement (autre que présent / special Présent / recap) --------- //
        eventClick: function (e) {
            const eventClassNames = e.event.classNames[0];
            const arrayEvent = [
                ['conge', congeInfos],
                ['absence', absenceInfos],
                ['arret', arretInfos],
                ['teletravail', teletravailInfos],
                ['formation', formationInfos],
                ['rdv_pro', rdv_proInfos],
                ['recup', recupInfos]
            ];
            $('#eventClicked').val(e.event);


            if (eventClassNames === 'demandeConge')
                return remplirModalInfoEvent(demandeCongesInfos, e.event, $('#modalValidationConge'), 'V', 0, false);
            for (let i = 0; i !== arrayEvent.length; i++) {
                if (eventClassNames === arrayEvent[0])
                    return showFormInfo($('#modalInfoEvent'), arrayEvent[1], e.event);
            }
            if (eventClassNames === 'demandeCongeValid')
                remplirModalInfoEvent(demandeCongeValidInfos, e.event, $('#modalInfoEvent'), 'I', 1, true);
        },
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // --------- Fonction quand un external event est reçu par le calendrier --------- //
        eventReceive: function (e) {
            $('#eventReceive').val(e.event);
        },
        ////////////////////////////////////////////////////////////////////////////////////

        // --------- Fonction quand un événement à l'intérieur du calendrier est dropé ailleurs --------- //
        eventDrop: function (e) {
            setHeightOfRow();
        },
        ///////////////////////////////////////////////////////////////////////////////////////////////////

        // --------- Fonction quand un external event est dropé sur le calendrier --------- //


        drop: function (arg) {
            let Cid = arg.draggedEl.id;


            setHeightOfRow();

            if (!checkModal(Cid)) {
                if (Cid === 'ferie_WE') {
                    setTimeout(function () {
                        $('#eventReceive').val().remove();
                    }, 10)
                } else {
                    let start = arg.date;
                    let eventAtDropPlace = calendar.getEvents().filter(e => moment(e.start).isSame(moment(start), 'day'));
                    eventAtDropPlace = eventAtDropPlace.filter(e => e.getResources()[0].id === $('#dropLocation').val());
                    eventAtDropPlace[0].remove();
                    setTimeout(function () {
                        updateTotalPresenceAtDate($('#eventReceive').val())
                    }, 10)
                }
            }
            setTimeout(function () {
                setHeightOfRow();
            }, 100);
        },
        /////////////////////////////////////////////////////////////////////////////////////

        // --------- Fonction de rendu des events présent sur le calendrier --------- //
        eventRender: function (event) {
            let element = $(event.el);
            element.css('border', 'none');
            element.css('height', '20px');
            setHeightOfRow();
            // ajoute un listener pour le click droit sur certains évenements
            if (event.event.classNames[0] !== 'present' && event.event.classNames[0] !== 'ferie_WE' && event.event.classNames[0] !== 'specialPresent') {
                element[0].addEventListener('contextmenu', function (ev) {
                    ev.preventDefault();
                    $('#eventRightClicked').val(event.event)
                    $('#modalDelete').modal('show');
                    return false;
                }, false);
            }

            if (event.event.classNames[0] === 'specialPresent') {
                element.css('width', width_event / 2)
            }
            // ajoute un listener pour le doubleclick sur l'évenements présent
            if (event.event.classNames[0] === 'present') {
                element[0].addEventListener('dblclick', function () {
                    $('#modalAddEvent').modal({backdrop: 'static'});
                    $('#modalAddEvent').modal('show');
                    $('#addEdateDebut').val(moment(event.event.start).add(1, 'days').toISOString().slice(0, 10));
                    $('#addEdateFin').val(moment(event.event.start).add(1, 'days').toISOString().slice(0, 10));
                    $("#eventDblClicked").val(event.event);
                });
            }
        }
        ,
        ///////////////////////////////////////////////////////////////////////////////

        // --------- Fonction de gestion des autorisations pour le drop d'external Event --------- //
        eventAllow: function (dropLocation, draggedEvent) {
            setHeightOfRow();
            events = calendar.getEvents().filter(e => moment(e.start).isSame(moment(dropLocation.start), 'day'));
            events = events.filter(e => e.getResources()[0].id === dropLocation.resource.id);
            if (events.find(e => e.classNames[0] === 'present')) {
                return allowDrop(draggedEvent, dropLocation);
            } else if (events.find(e => e.classNames[0] === 'specialPresent')) {
                return allowDrop(draggedEvent, dropLocation);
            } else {
                //setHeightOfRow();
                return false;
            }
        }
        ,
        ////////////////////////////////////////////////////////////////////////////////////////////
    });

    function checkModal(Cid) {
        const arrayModals = [
            ['demandeConge', $('#modalDemandeConge'), ''],
            ['conge', $('#modalConge'), 'C'],
            ['absence', $('#modalAbsence'), 'A'],
            ['arret', $('#modalArret'), 'Ar'],
            ['teletravail', $('#modalTeletravail'), 'T'],
            ['formation', $('#modalFormation'), 'F'],
            ['rdv_pro', $('#modalRdvPro'), 'RDV'],
            ['recup', $('#modalRecup'), 'R']
        ];


        for (let i = 0; i !== arrayModals.length; i++) {
            if (Cid === arrayModals[0]) {
                showFormOther(arrayModals[1], arg, arrayModals[2]);
                return true;
            }
        }
        return false;
    };
    // --------- Rendu du calendrier --------- //
    calendar.render();
    createDefault();
    setHeightOfRow();
    width_event = getWidthOfEvent();
    setWidthViewChanges();
    initSoldeConge();
    $('.fc-next-button').click(function () {
        createDefault();
        setWidthViewChanges();
        setHeightOfRow();
    });
    $('.fc-prev-button').click(function () {
        setWidthViewChanges();
        setHeightOfRow();
    });
    $('.fc-customDay-button').click(() => {
        updateCustom();
    });
    $('.fc-customWeek-button').click(() => {
        updateCustom();
    });
    $('.fc-custom3Month-button').click(() => {
        updateCustom();
    });

    function updateCustom() {
        getWidthOfEvent();
        setWidthViewChanges();
        setHeightOfRow();
    }

    ////////////////////////////////////////////
}); 

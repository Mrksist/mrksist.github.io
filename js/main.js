const organizations = [
    {
        name: "МБОУ Лицей №3",
        logo: "l3.jpg",
        coordinates: [43.345155, 54.920030],
        label_id: "lyceum3"
    },
    {
        name: "МБОУ Гимназия №2",
        logo: "g2.png",
        coordinates: [43.352058, 54.925033],
        label_id: "gymnasium2"
    },
    {
        name: "Детский сад №6",
        coordinates: [43.344887, 54.919234],
        label_id: "detsad6"
    },
]

let routes = [];
let map = null;

function newMarker(organization) {
    const markerElement = document.createElement('div')
    let innerHTML = ``;

    innerHTML += `<div class="school-marker">
                        <img src="img/${organization.logo ?? 'default.png'}" class="school-marker-img"></img>
                    </div>`
    innerHTML += `<h3 class="school-marker-label">${organization.name}</h3>`

    markerElement.innerHTML = innerHTML
    markerElement.className = "school-marker-wrapper"
    markerElement.onclick = function () {
        document.getElementById(organization.label_id).style.display = 'flex';
    }

    return new ymaps3.YMapMarker(
        {
            coordinates: organization.coordinates,
            id: organization.label_id
        },
        markerElement
    );
}

function hide_routes() {
    for(let i of routes){
        map.removeChild(i);
    }
}

function hide_modals() {
    for(let i of document.getElementsByClassName('modal')){
        i.style.display = 'none';
    }
}

function sch3ds6_show(){
    hide_modals();

    const lineStringFeature = new ymaps3.YMapFeature({
        id: 'line',
        geometry: {
            type: 'LineString',
            coordinates: [
                [43.345285, 54.919847],
                [43.345001, 54.919371]
            ]
        },
        style: {
            stroke: [{ width: 12, color: 'rgb(246, 52, 52)' }]
        }
    });

    const markerElement = document.createElement('div');
    markerElement.style.width = "40px";
    markerElement.style.fontSize = "30px";
    markerElement.innerText = "60м";

    const marker = new ymaps3.YMapMarker(
        {
            coordinates: [43.345173, 54.919637]
        },
        markerElement
    );

    routes.push(lineStringFeature);
    routes.push(marker);
    map.addChild(marker);
    map.addChild(lineStringFeature);
}

function initMaps() {
    map = new ymaps3.YMap(
        document.getElementById('map'),
        {
            location: {
                center: [43.345219, 54.919842],
                zoom: 18
            }
        }
    );

    map.addChild(new ymaps3.YMapDefaultSchemeLayer({ 
        customization: [{
                tags: ['poi'],
                stylers: {
                    visibility: "off"
                }
            },
            {
                tags: ['business'],
                stylers: {
                    visibility: "off"
                }
            }]
        }));

    map.addChild(new ymaps3.YMapDefaultFeaturesLayer());

    for (let i of organizations) {
        map.addChild(newMarker(i));
    }

    
}

document.addEventListener("DOMContentLoaded", function () {
    if (window.ymaps3) {
        document.getElementById("map").innerHTML = "";
        ymaps3.ready.then(initMaps);
    }
    else {
        document.getElementById("map").innerHTML = "Ошибка загрузки карты по API";
    }
})
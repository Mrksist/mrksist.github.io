const organizations = [
    {
        name: "МБОУ Лицей №3",
        logo: "l3.jpg",
        coordinates: [43.345155, 54.920030],
        label_id: "lyceum3",
        description: "Физико-математический лицей",
        info: [
            "Количество учащихся: 2026 человек",
            "Количество мест: НЕмало",
            "Количество классов: -22",
            `Ближайший детский сад: <a class="a-near" onclick="showPath('sch3ds6')">Сад №6</a>`
        ]
    },
    {
        name: "МБОУ Гимназия №2",
        logo: "g2.png",
        coordinates: [43.352058, 54.925033],
        label_id: "gymnasium2",
        description: "Гимназия с языковым уклоном",
        info: [
            "Количество учащихся: 2025 человек",
            "Количество мест: НЕмало",
            "Количество классов: гойда",
            `Ближайший детский сад: <a class="a-near" onclick="showPath('sch2ds36')">Сад №36</a>`
        ]
    },
    {
        name: "Детский сад №6",
        coordinates: [43.344887, 54.919234],
        label_id: "detsad6",
        description: "Сад с дошкольным образованием",
        info: [
            "Количество мест: НЕмало",
            "Количество групп: ещё больше",
            `Ближайшая школа: <a class="a-near" onclick="showPath('sch3ds6')">МБОУ Лицей №3</a>`
        ]
    },
    {
        name: "Детский сад №9",
        coordinates: [43.348281, 54.920800],
        description: "",
        label_id: "detsad9",
        info: [
            "Количество мест: скажем",
            "Количество групп: скажем",
            `Ближайшая школа: <a class="a-near" onclick="showPath('sch3ds9')">МБОУ Лицей №3</a>`
        ]
    }
]

const paths = {
    sch3ds6: {
        coords: [
            [43.345285, 54.919847],
            [43.345001, 54.919371]  
        ],
        centercoords: [43.345173, 54.919637],
        dist: "60м"
    },
    sch3ds9: {
        coords: [
            [43.345246, 54.919800],
            [43.348087, 54.919242],
            [43.348985, 54.920705],
            [43.348628, 54.920774]
        ],
        centercoords: [43.348712, 54.920270],
        dist: "400м"
    }
}

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

function newModal(organization){
    let body = document.getElementById("main");
    let innerHTML = ``

    innerHTML += `
         <div class="modal" id="${organization.label_id}" onclick="if(event.target == this) this.style.display = 'none'">
            <div class="modal-content">
              <h2>${organization.name}</h2>
              <h4 style="text-align: center;">${organization.description}</h4>`;
    for(let i of organization.info){
        innerHTML += `<p style="text-align: left">• ${i}</p>`;
    }
    innerHTML += `</div></div>`
    
    body.innerHTML += innerHTML;
}

function hidePaths() {
    document.getElementById('hide-paths').style.display = 'none';
    for(let i of routes){
        map.removeChild(i);
    }
    routes = [];
}

function hideModals() {
    for(let i of document.getElementsByClassName('modal')){
        i.style.display = 'none';
    }
}

function showPath(path){
    hideModals();
    hidePaths();
    
    document.getElementById('hide-paths').style.display = 'flex';

    const pathObject = paths[path]

    const lineStringFeature = new ymaps3.YMapFeature({
        id: 'line',
        geometry: {
            type: 'LineString',
            coordinates: pathObject.coords
        },
        style: {
            stroke: [{ width: 12, color: 'rgb(246, 52, 52)' }]
        }
    });

    const markerElement = document.createElement('div');
    markerElement.style.width = "40px";
    markerElement.style.fontSize = "30px";
    markerElement.innerText = pathObject.dist;

    const marker = new ymaps3.YMapMarker(
        {
            coordinates: pathObject.centercoords
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
                tags: 'poi',
                stylers: {
                    visibility: "off"
                }
            }]
        }));

    map.addChild(new ymaps3.YMapDefaultFeaturesLayer());
    for (let i of organizations) {
        map.addChild(newMarker(i));
        newModal(i);
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

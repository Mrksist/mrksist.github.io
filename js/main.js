let paths = [];
let map = null;

function newMarker(feature) {
    const organization = organizations.find(i => i.id == feature.id)

    let markerElement;

    markerElement = document.createElement('div')
    let innerHTML = ``;

    innerHTML += `<div class="school-marker">
                        <img src="img/${organization.logo}" class="school-marker-img"></img>
                    </div>`
    innerHTML += `<h3 class="school-marker-label">${organization.name}</h3>`

    markerElement.innerHTML = innerHTML
    markerElement.className = "school-marker-wrapper"
    markerElement.onclick = function () {
        document.getElementById(organization.id).style.display = 'flex';
    }

    return new ymaps3.YMapMarker(
        {
            coordinates: organization.coordinates,
            id: organization.id
        },
        markerElement
    );
}

function newModal(organization) {
    let root = document.getElementById("main");
    let innerHTML = ``
    innerHTML += `
             <div class="modal" id="${organization.id}" onclick="if(event.target == this) this.style.display = 'none'">
                <div class="modal-content">
                    <img src="img/${organization.logo}" class="modal-img"></img>
                  <h2>${organization.name}</h2>
                  <h4 style="text-align: center;">${organization.description}</h4>`;

    for (let i of organization.info) {
        innerHTML += `<p style="text-align: left">• ${i}</p>`;
    }
    if (organization.nearby.length) {
        innerHTML += `<p style="text-align: left">• ОО рядом: `
    }

    for (let i of organization.nearby) {
        const nearOrg = organizations.find(a => a.id == i + 'z1')
        innerHTML += `<a class="a-near" onclick="showPath('${nearOrg.id}-${organization.id}')">${nearOrg.name}</a>, `
    }

    innerHTML = innerHTML.substring(0, innerHTML.length - 2);
    innerHTML += `</div></div>`
    root.innerHTML += innerHTML;
}


function calculateDistance(lon1, lat1, lon2, lat2) {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaphi = (lat2 - lat1) * Math.PI / 180;
    const deltalambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaphi / 2) * Math.sin(deltaphi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltalambda / 2) * Math.sin(deltalambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

async function showPath(path) {
    hideModals();
    hidePaths();

    document.getElementById('hide-paths').style.display = 'flex';

    const dos = path.split('-');

    const firstDO = organizations.find(a => a.id === dos[0]);
    const secondDO = organizations.find(a => a.id === dos[1]);

    const lineStringFeature = new ymaps3.YMapFeature({
        id: 'line',
        geometry: {
            type: 'LineString',
            coordinates: [
                firstDO.coordinates,
                secondDO.coordinates
            ]
        },
        style: {
            stroke: [{ width: 12, color: 'rgb(242, 167, 46)' }]
        }
    });

    const centercoords = [(firstDO.coordinates[0] + secondDO.coordinates[0]) / 2, (firstDO.coordinates[1] + secondDO.coordinates[1]) / 2];

    const markerElement = document.createElement('div');
    markerElement.style.width = "70px";
    markerElement.style.fontSize = "30px";

    const len = calculateDistance(firstDO.coordinates[0], firstDO.coordinates[1], secondDO.coordinates[0], secondDO.coordinates[1])
    markerElement.innerText = Math.round(len) + 'м';

    const marker = new ymaps3.YMapMarker(
        {
            coordinates: centercoords
        },
        markerElement
    );

    paths.push(marker);
    paths.push(lineStringFeature);
    map.addChild(marker);
    map.addChild(lineStringFeature);
}

function hidePaths() {
    document.getElementById('hide-paths').style.display = 'none';
    for (let i of paths) {
        map.removeChild(i);
    }
    paths = [];
}

function hideModals() {
    for (let i of document.getElementsByClassName('modal')) {
        i.style.display = 'none';
    }
}

async function initMaps() {
    const { YMapClusterer, clusterByGrid } = await ymaps3.import('@yandex/ymaps3-clusterer');

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
    map.addChild(new ymaps3.YMapFeatureDataSource({ id: 'oo' }))
    map.addChild(new ymaps3.YMapLayer({ source: 'oo', type: 'markers', zIndex: 1800 }))

    const contentPin = document.createElement('div');
    contentPin.innerHTML = '<img src="img/default.png" />';

    const marker = (feature) => newMarker(feature);

    const cluster = (coordinates, features) =>
        new ymaps3.YMapMarker(
            {
                coordinates,
                source: 'oo'
            },
            circle(features.length).cloneNode(true)
        );

    function circle(count) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.innerHTML = `
            <div class="cluster">
                <p class="cluster-text">${count}</p>
            </div>
        `;
        return circle;
    }

    const points = organizations.map((org, i) => ({
        type: 'Feature',
        id: org.id,
        geometry: { coordinates: org.coordinates },
        properties: { name: 'Point of issue of orders' }
    }));

    for (let i of organizations) {
        newModal(i);
    }

    const clusterer = new YMapClusterer({
        method: clusterByGrid({ gridSize: 170 }),
        features: points,
        marker,
        cluster
    });

    map.addChild(clusterer);
}

document.addEventListener("DOMContentLoaded", function () {
    if (window.ymaps3) {
        document.getElementById("map").innerHTML = "";
        ymaps3.ready.then(() => {
            ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', [
                '@yandex/ymaps3-clusterer@latest'
            ]);
        }).then(initMaps);
    }
    else {
        document.getElementById("map").innerHTML = "Ошибка загрузки карты по API";
    }
})

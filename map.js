var map, popup, element, features; 
var myIp = '';
var temperaturaSensor = 0;
var humedadSensor = 0;
var limiteHumedad = 35;
var longs = [-5.851482, -5.852301, -5.854350, -5.854200];
var lats = [43.354857, 43.356941, 43.355794, 43.357307];
var closer = document.getElementById('popup-closer');

function initMap(){
    var myView = new ol.View({
        center: ol.proj.fromLonLat([-5.852196,43.356011]),
        zoom: 17
    });

    map = new ol.Map({
        target: document.getElementById('map'),
        layers: [
            new ol.layer.Tile({
            source: new ol.source.OSM()
            })
        ],
        view: myView
    }) 

    var names = ["Escuela de Ingeniería Informática", "Bar Juan", "Escuela de idiomas", "Tienda de chuches"];
    
    features = [];

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon( ({
            anchor: [0.3, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'myIcon.png'
        }))
    });

    for(var i = 0; i < longs.length; i++){
         var marker = new ol.Feature({
            geometry: new ol.geom.Point(
                ol.proj.fromLonLat([longs[i], lats[i]])),
            name: names[i],
        });
        marker.setStyle(iconStyle);
        features.push(marker);
    }

    var vectorSource = new ol.source.Vector({
        features: features
    });

    var markerVectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });

    map.addLayer(markerVectorLayer);

    element = document.getElementById('popup');

    popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    
    map.addOverlay(popup);

    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
}

initMap();

function obtainDataFromArduino(latitud, longitud){
    $.ajax({
     url: 'http://' + myIp + '/index?',
     type: 'post',
     dataType: 'json',
     success: function(data){
      console.log(data);
      temperaturaSensor = data.temperatura;
      humedadSensor = data.humedad;
        if(humedadSensor >= limiteHumedad){
            $('#notification').html('El sensor de humedad de la Escuela de Ingeniería ' + 
            'Informática en latitud ' + lats[0] + ' longitud ' + longs[0] + 
            ' ha sobrepasado el nivel limite');
            $('#notification').css('background', 'orangered');
        } else {
                $('#notification').html('Todos los sensores son correctos');
                $('#notification').css('background', 'greenyellow');
            }
        },
      error: function(){
        console.log("ERROR conectando con arduino");
      }
    });
    
}
   
$(document).ready(function(){
    setInterval(obtainDataFromArduino(),1000);
});


map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        return feature;
      });
    if (feature) {
        var coordinates = feature.getGeometry().getCoordinates();

        var lugar = feature.get('name');
        var latitud = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326')[1];
        var longitud = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326')[0];
        var temperatura = Math.floor(Math.random() * (25 - 12) + 12);
        var humedad = Math.floor(Math.random() * (30 - 20) + 20);
    
        var apagar = "";
        var encender = "";
    
        console.log(lugar);
    
        if(lugar == "Escuela de Ingeniería Informática"){
            console.log("Obteniendo los datos reales");
            apagar = "onclick='apagarLed()'";
            encender = "onclick='encenderLed()'";
            temperatura = temperaturaSensor;
            humedad = humedadSensor;
        }
    
        var info = "<div>"
        + "<div>Lugar: " + lugar + "</div>"
        + "<div>Latitud: " + latitud + " </div>"
        + "<div>Longitud: " + longitud + " </div>"
        + "<div>Temperatura: " + temperatura + "ºC </div>"
        + "<div>Humedad: " + humedad + "%</div>"
        + "<div id='btn-group'><input type='button' value='Apagar' " + apagar + "/>"
        + "<input type='button' value='Encender' " + encender + "/></div>"
        + "</div>";
        
        $(element).popover('destroy');
        popup.setPosition(coordinates);
        $(element).popover({
          placement: 'top',
          animation: false,
          html: true,
          content: info
        });
        $(element).popover('show');

        var closer = document.getElementById('popup-closer');

        closer.onclick = function() {
            closer.blur();
            return false;
          };
    } 
});



function apagarLed(){
   /* var myRequest = new XMLHttpRequest();
    var url = 'http://' + myIp + '/index?apagar';
    myRequest.open("GET", url);
    myRequest.send();*/
    console.log("apagar");
}

function encenderLed(){
    /*var myRequest = new XMLHttpRequest();
    var url = 'http://' + myIp + '/index?encender';
    myRequest.open("GET", url);
    myRequest.send();*/
    console.log("encender");
}

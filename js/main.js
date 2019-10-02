$(window).ready(function() {
  $('.loader').fadeOut("slow");

  $("#nextTimeSwitcher input").on("click", function() {
    if ($("#nextTimeSwitcher input:checked").val() === "on") {
      localStorage.setItem('popState', 'shown');
    } else {

      localStorage.setItem('popState', 'notShown');
    }
  })

  if (localStorage.getItem('popState') != 'shown') {
    console.log("show disclaimer");
    $('#disclaimer').modal('show');

  } else {
    console.log("hide disclaimer");
    $('#disclaimer').modal('hide');
  }
  $('#disclaimer-close').click(function(e) // You are clicking the close button
    {
      $('#disclaimer').fadeOut(); // Now the pop up is hiden.
      $('#disclaimer').modal('hide');
    });
});

$(".showFrontPage").on("click", function() {
  $('#disclaimer').modal('show');
  localStorage.setItem('popState', 'notShown');
})

// 1. Create a map object.
var mymap = L.map('map', {
    center: [44, -121.5],
    zoom: 7,
    maxZoom: 12,
    minZoom: 3,
    zoomcontrol: false,
    detectRetina: true });

$(".leaflet-control-zoom").hide();

L.control.scale({
  position: 'topright'
}).addTo(mymap);

// 2. Add a base map.
// L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png').addTo(mymap);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mymap);
// 6. Set function for color ramp
colors = chroma.scale('RdYlBu').colors(7); //colors = chroma.scale('OrRd').colors(5);

function setColor(density) {
    var id = 0;
    if (density > 3.51) { id = 6; }
    else if (density > 2.51 && density <= 3.51) { id = 5; }
    else if (density > 1.51 &&  density <= 2.51) { id = 4; }
    else if (density > 0.51 && density <= 1.51) { id = 3; }
    else if (density > -0.5 && density <= 0.51) { id = 2; }
    else if (density > -1.5 &&  density <= -.5) { id = 1; }
    else  { id = 0; }
    return colors[id];
}

// 7. Set style function that sets fill color.md property equal to cell tower density
function style(feature) {
    return {
        fillColor: setColor(feature.properties.Food_Vulne),
        fillOpacity: 0.4,
        weight: 1,
        opacity: 1,
        color: '#b4b4b4',
        dashArray: '4'
    };
}

// 3.1 declare an empty/null geojson object
var county = null;

// 3.2 interactive features.
// 3.2.1 highlight a feature when the mouse hovers on it.

function highlightFeature(e) {
    // e indicates the current event
    var layer = e.target; //the target capture the object which the event associates with
    layer.setStyle({
        weight: 8,
        opacity: 0.8,
        color: '#e3e3e3',
        fillColor: '#e3e00f',
        fillOpacity: 0.5
    });
    // bring the layer to the front.
    layer.bringToFront();
    // select the update class, and update the contet with the input value.
    $(".update").html(
      '<b>' + layer.feature.properties.Geography +'</b><br>'
            + layer.feature.properties.County + ' County'+'<br>'
            + 'FVI Value: ' + layer.feature.properties.Food_Vulne.toFixed(5) + '<br>');
}


// 3.2.3 reset the hightlighted feature when the mouse is out of its region.
function resetHighlight(e) {
    county.resetStyle(e.target);
    $(".update").html("Hover over a Census Tract");
}

// 3.3 add these event the layer obejct.
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

// 3.4 assign the geojson data path, style option and onEachFeature option. And then Add the geojson layer to the map.
county = L.geoJson.ajax("assets/FVI.geojson", {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);

L.geoJson.ajax("assets/OR.geojson", {
    style: {
    fillColor: 'black',
    fillOpacity:'0',
    weight: '1.2',
  }
}).addTo(mymap);


// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Food Vulnerability Index</b><br />';
    div.innerHTML += '<i style="background: ' + colors[6] + '; opacity: 0.5"></i><p>>3.5</p>';
    div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>2.51-3.5</p>';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>1.51-2.5</p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>0.51-1.5</p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>-0.5-0.5</p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p>-1.5--0.51</p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p><-1.5</p>';
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

//attribution
$(".leaflet-control-attribution")
  .css("background-color", "transparent")
  .html("Supported by <a href='https://oregonexplorer.info/topics/rural-communities?ptopic=140' target='_blank'>The RCE @ Oregon State University </a> | Web Map by: <a href='#' target='_blank'>Benji Antolin");

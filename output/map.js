var plyConfig = {
    responsive: true,
    showLink: false,
    locale: "es",
    displaylogo: false
  };

function showMap() {
  Plotly.d3.csv("mop-region.csv", function (err, rows) {
    if (err) {
      console.log("Error en CSV", err);
      return;
    }

    function unpack(rows, key) {
      return rows.map(function (row) {
        return row[key];
      });
    }

    var countryName = unpack(rows, "COMUNA"),
      countryPop = unpack(rows, "PRESUPUESTO DECRETADO(M$)"),
      cityLat = unpack(rows, "GEO_LAT"),
      cityLon = unpack(rows, "GEO_LON"),
      citySize = [],
      hoverText = [],
      scale = 10;
    for (var i = 0; i < countryPop.length; i++) {
      var currentSize = countryPop[i] / scale;
      var currentText = countryName[i] + " - Presupuesto: " + (countryPop[i]) + " (miles)";
      citySize.push(currentSize);
      hoverText.push(currentText);
    }

    var data = [
      {
        type: "scattergeo",
        locationmode: "country names",
        mode: "markers",
        lat: cityLat,
        lon: cityLon,
        hoverinfo: "text",
        text: hoverText,
        marker: {
          size: citySize,
          colorscale: 'Greens',
          line: {
            color: "black",
            width: 1
          }
        }
      }
    ];

    var layout = {
      title: "Presupuesto 2021",
      height: 600,
      showlegend: false,
      geo: {
        scope: "south america",
        showland: true,
        landcolor: "#5eb3b3",
        countrycolor: "#fff",
        countrywidth: 1
      }
    };

    Plotly.newPlot("my-map", data, layout, plyConfig);
  });
}

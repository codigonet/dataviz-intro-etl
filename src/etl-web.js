// Cargar las librerías
const axios = require("axios").default;
const cheerio = require("cheerio");

// Definir la página de origen
const url = "https://www.meganoticias.cl/temas/coronavirus-en-chile/";

// Pedir los datos al origen
axios
  .get(url)
  .then(function (response) {
    // Obtener los datos
    //console.log("Datos del origen",response.data)

    // Analizar los datos
    const $ = cheerio.load(response.data);
    var noticias = $(".box-articulos article");
    //console.log("Bloque de noticias", noticias)
    var noticia3 = cheerio.load(noticias[2]);
    var titulo_noticia_3 = noticia3(".bottom figcaption a h2").text();
    console.log("Noticia 3", titulo_noticia_3);
  })
  .catch(function (error) {
    console.log(error);
  });

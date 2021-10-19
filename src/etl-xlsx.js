// Cargar las librerías
const { log } = require("console"); // Para mensajes por consola (terminal)
const fs = require("fs"); // Para lecturas/escrituras de archivos
const path = require("path"); // Para acceso a directorios
const XLSX = require("xlsx"); // Para manejo de archivos Excel (XLS, XLSX)
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // Para generar archivo CSV

// Definir archivo de origen
const xlsx = path.resolve("src/mop.xls"); // Obtiene la ruta absoluta al archivo

// Definir filtros
const REGION = "Valparaíso";
const COMMUNES = ["VALPARAISO", "PETORCA", "LA LIGUA"];

// Leer los datos del archivo origen
var buf = fs.readFileSync(xlsx); // Leer archivo
var wb = XLSX.read(buf, { type: 'buffer' }); // Interpreta el formato Excel desde la lectura
var hoja = wb.Sheets["Hoja1"]; // Accede a una hoja por su nombre, "Hoja1" por defecto al existir solo una
var hoja_json = XLSX.utils.sheet_to_json(hoja); // Convierte la hoja a formato JSON

// Muestra por consola el contenido de la primera fila
log("Encabezados en Hoja", hoja_json[0]);

// Preparar variable donde se mantendrá la transformación, en formato JSON
var output_data = {} // Objeto JSON "vacío", es decir sin datos

// Ciclo para recorrer todas las filas de la hoja
for (let idx = 0; idx < hoja_json.length; idx++) {
  /*
  obs: al recorrer cada fila, está se referencia por la variable "idx"

  Extraer datos de acuerdo a filtros:
    - REGION
    - COMUNAS
  */
  let region_hoja = hoja_json[idx].REGION; // Obtiene el valor de la columna REGION
  let comuna_hoja = hoja_json[idx].COMUNA; // Obtiene el valor de la columna COMUNA

  // Validar condición que la fila leida coincida con los filtros requeridos.
  // Ya que la variable COMMUNES es un arreglo, se una un método para validar.
  if (region_hoja == REGION && COMMUNES.indexOf(comuna_hoja) > -1) {

    // log("Datos en Hoja para [" + REGION + " - " + COMMUNES + "]", hoja_json[idx]);

    // Obtener el registro desde la variable donde se mantendrá la transformación
    let data_comuna = output_data[comuna_hoja];

    if (data_comuna) {
      // Si existe el registro, se aumentan los contadores
      data_comuna['PRESUPUESTO DECRETADO(M$)'] += hoja_json[idx]['PRESUPUESTO DECRETADO(M$)'];
      data_comuna['GASTO (M$)'] += hoja_json[idx]['GASTO (M$)'];
      data_comuna['SALDO (M$)'] += hoja_json[idx]['SALDO (M$)'];
    } else {
      // Al no existir registro, se establece los contadores
      data_comuna = {};
      data_comuna['PRESUPUESTO DECRETADO(M$)'] = hoja_json[idx]['PRESUPUESTO DECRETADO(M$)'];
      data_comuna['GASTO (M$)'] = hoja_json[idx]['GASTO (M$)'];
      data_comuna['SALDO (M$)'] = hoja_json[idx]['SALDO (M$)'];
    }

    // Se almacena en la variable la información procesada
    output_data[comuna_hoja] = data_comuna;
  }
}

// Muestra por consola el contenido de información procesada
log("Data de Salida", output_data);

// Definir archivo de salida (JSON)
const json_file = path.resolve("src/mop.json");

// Guardar en JSON los datos transformados 
fs.writeFileSync(json_file, JSON.stringify(output_data));

/*
Generar archivo CSV
*/
var output_csv = [] // Objeto Array vacío

// Ciclo para obtener los datos procesados de cada comuna
for (let n = 0; n < COMMUNES.length; n++) {
  let nombre_comuna = COMMUNES[n];
  datos_comuna = output_data[nombre_comuna];
  output_csv.push({
    'COMUNA': nombre_comuna,
    'PRESUPUESTO DECRETADO(M$)': datos_comuna['PRESUPUESTO DECRETADO(M$)'],
    'GASTO (M$)': datos_comuna['GASTO (M$)'],
    'SALDO (M$)': datos_comuna['SALDO (M$)'],
  })
}

log("Salida para CSV", output_csv);

// Definir archivo de salida (CSV)
const csv_file = path.resolve("src/mop.csv");

// Configurar objeto de escritura CSV, indicando los nombres de columnas como encabezados
const csvWriter = createCsvWriter({
  path: csv_file,
  header: [
    { id: 'COMUNA', title: 'COMUNA' },
    { id: 'PRESUPUESTO DECRETADO(M$)', title: 'PRESUPUESTO DECRETADO(M$)' },
    { id: 'GASTO (M$)', title: 'GASTO (M$)' },
    { id: 'SALDO (M$)', title: 'SALDO (M$)' },
  ]
});

// Escribir el archivo de salida CSV
csvWriter.writeRecords(output_csv).then(() => {
  log("Archivo CSV escrito!!!");
}).catch((error) => {
  log("Error al escribir el archivo CSV", error);
})

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
const COMMUNES = ["VALPARAISO", "PETORCA", "LA LIGUA", "QUILLOTA", "LOS ANDES", "MARGA MARGA"];

// Definir la GEO-Posición por comuna
const GEO = {
    "VALPARAISO": [-33.0438639, -71.6023175],
    "PETORCA": [-32.25123, -70.9408742],
    "LA LIGUA": [-32.4501874, -71.2418708],
    "QUILLOTA": [-33.0156341, -71.5468906],
    "LOS ANDES": [-32.83204, -70.6145295],
    "MARGA MARGA": [-33.0816332, -71.3825493],
};

// Leer los datos del archivo origen
var buf = fs.readFileSync(xlsx); // Leer archivo
var wb = XLSX.read(buf, { type: 'buffer' }); // Interpreta el formato Excel desde la lectura
var hoja = wb.Sheets["Hoja1"]; // Accede a una hoja por su nombre, "Hoja1" por defecto al existir solo una
var hoja_json = XLSX.utils.sheet_to_json(hoja); // Convierte la hoja a formato JSON

// Muestra por consola el contenido de la primera fila
log("Encabezados en Hoja", hoja_json[0]);

// Preparar variable donde se mantendrá la transformación, en formato JSON
var output_data = {} // Objeto Arreglo "vacío", es decir sin datos

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
            data_comuna['DATA']['PRESUPUESTO DECRETADO(M$)'] += hoja_json[idx]['PRESUPUESTO DECRETADO(M$)'];
            data_comuna['DATA']['GASTO (M$)'] += hoja_json[idx]['GASTO (M$)'];
            data_comuna['DATA']['SALDO (M$)'] += hoja_json[idx]['SALDO (M$)'];
        } else {
            // Al no existir registro, se establece los contadores
            data_comuna = {};
            data_comuna['COMUNA'] = hoja_json[idx]['COMUNA'];
            data_comuna['DATA'] = {};
            data_comuna['DATA']['COMUNA'] = hoja_json[idx]['COMUNA'];
            data_comuna['DATA']['PRESUPUESTO DECRETADO(M$)'] = hoja_json[idx]['PRESUPUESTO DECRETADO(M$)'];
            data_comuna['DATA']['GASTO (M$)'] = hoja_json[idx]['GASTO (M$)'];
            data_comuna['DATA']['SALDO (M$)'] = hoja_json[idx]['SALDO (M$)'];
            data_comuna['DATA']['GEO'] = GEO[comuna_hoja];
        }

        // Se almacena en la variable la información procesada
        output_data[comuna_hoja] = data_comuna;
    }
}

// Muestra por consola el contenido de información procesada
log("Data de Salida", output_data);

/*
Generar archivo CSV
*/
// Definir archivo de salida (CSV)
const csv_file = path.resolve("output/mop-region.csv");

// Configurar objeto de escritura CSV, indicando los nombres de columnas como encabezados
const csvWriter = createCsvWriter({
    path: csv_file,
    header: [
        //{ id: 'ID', title: 'ID' },
        { id: 'COMUNA', title: 'COMUNA' },
        { id: 'PRESUPUESTO DECRETADO(M$)', title: 'PRESUPUESTO DECRETADO(M$)' },
        { id: 'GASTO (M$)', title: 'GASTO (M$)' },
        { id: 'SALDO (M$)', title: 'SALDO (M$)' },
        { id: 'GEO', title: 'GEO' },
    ]
});

// Escribir el archivo de salida CSV
var data_de_csv = []
for (n = 0; n < COMMUNES.length; n++) {
    let comuna = COMMUNES[n];

    if (output_data[comuna]) {
        let data_de_comuna = output_data[comuna]["DATA"];

        log("Data comuna", data_de_comuna);
        
        data_de_csv.push(data_de_comuna);
    }    
}

csvWriter.writeRecords(data_de_csv).then(() => {
    log("Archivo CSV escrito!!!");
}).catch((error) => {
    log("Error al escribir el archivo CSV", error);
})

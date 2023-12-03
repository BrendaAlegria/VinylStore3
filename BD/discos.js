var conexionDis = require("./conexion").conexionDis;
var Disco = require("../modelos/Discos");

async function mostrarDiscos() {
  var disc = [];
  try {
    var discos = await conexionDis.get();
    discos.forEach((dis) => {
      var disco = new Disco(dis.id, dis.data());
      if (disco.bandera == 0) {
        disc.push(disco.obtenerDatos);
      }
    });
  } catch (err) {
    console.log("Error al recuperar discos de la base de datos: " + err);
  }
  return disc;
}

async function buscarDiscoPorID(id) {
  var disco = null;  // Inicializa disco como null
  try {
    var discoSnap = await conexionDis.doc(id).get();
    var discoDat = new Disco(discoSnap.id, discoSnap.data());
    if (discoDat.bandera == 0) {
      disco = discoDat;  // Almacena la instancia de Disco, no el resultado de obtenerDatos
    }
  } catch (err) {
    console.log("Error al recuperar el disco: " + err);
  }
  return disco;
}

async function nuevoDisco(datos) {
  //console.log("Paso 1: Datos recibidos", datos);
  var discoDat = new Disco(null, datos);
  //console.log("Paso 2: Disco creado", discoDat);
  var error = 1;
  if (discoDat.bandera == 0) {
    //console.log("Entra al if");
    try {
      await conexionDis.doc(discoDat.nombre).set(discoDat.obtenerDatos);
      console.log("Disco insertado en la base de datos");
      error = 0;
    } catch (err) {
      console.log("Error al insertar el disco: " + err);
    }
  }
  return error;
}

  async function modificarDisco(datos) {
    var error = 1;
    var respuestaBuscar = await buscarDiscoPorID(datos.id);
    
    if (respuestaBuscar !== "") {
      var discoActual = await conexionDis.doc(datos.id).get();
      var datosDisco = discoActual.data();
  
      // Verificar si se proporcionan nuevos valores en el formulario
      const nuevosDatos = {
        nombre: datos.nombre !== undefined ? datos.nombre : datosDisco.nombre,
        artista: datos.artista !== undefined ? datos.artista : datosDisco.artista,
        duracion: datos.duracion !== undefined ? datos.duracion : datosDisco.duracion,
        precio: datos.precio !== undefined ? datos.precio : datosDisco.precio,
        foto: datos.foto !== undefined ? datos.foto : datosDisco.foto,
        /*audio: datos.audio !== undefined ? datos.audio : datosDisco.audio,*/
      };
      var  disco = new Disco(datos.id, nuevosDatos);
  
      if (disco.bandera === 0) {
        try {
          await conexionDis.doc(disco.id).set(disco.obtenerDatos);
          console.log("Disco modificado");
          error = 0;
        } catch (err) {
          console.log("Error al modificar el disco: " + err);
        }
      }
    }
    
    return error;
  }

  async function borrarDisco(id) {
    var error = 1;
    var disco = await buscarDiscoPorID(id);
    if (disco != "") {
      try {
        await conexionDis.doc(id).delete();
        console.log("Disco eliminado de la base de datos");
        error = 0;
      } catch (err) {
        console.log("Error al eliminar el disco de la base de datos: " + err);
      }
    }
    return error;
  }
  
module.exports = {
  mostrarDiscos,
  buscarDiscoPorID,
  modificarDisco,
  borrarDisco,
  nuevoDisco
};

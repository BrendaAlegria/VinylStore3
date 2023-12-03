var conexion = require("./conexion").conexion;
var Usuario = require("../modelos/Usuario");
var crypto = require("crypto")
var {encriptarPassword}=require("../middlewares/funcionesPassword")

async function mostrarUsuarios() {
  var users = [];
  try {
    var usuarios = await conexion.get();
    usuarios.forEach((usuario) => {
      var user = new Usuario(usuario.id, usuario.data());
      if (user.bandera == 0) {
        users.push(user.obtenerDatos);
      }
    });
  } catch (err) {
    console.log("Error al recuperar usuarios de la base de datos: ") + err;
  }
  return users;
}

async function buscarPorID(id) {
  var user="";
  try {
    var usuario = await conexion.doc(id).get();
    var usuarioObjeto = new Usuario(usuario.id, usuario.data());
    if (usuarioObjeto.bandera == 0) {
      user = usuarioObjeto.obtenerDatos;
    }
  } catch (err) {
    console.log("Error al recuperar el usuario: " + err);
  }
  return user;
}

async function nuevoUsuario(datos) {
  var {hash, salt}=encriptarPassword(datos.password);
  datos.password=hash;
  datos.salt=salt;
  datos.admin=false;
  var user = new Usuario(null, datos);
  var error = 1;
  if (user.bandera == 0) {
    try {
      await conexion.doc(user.nombre).set(user.obtenerDatos);
      console.log("Usuario insertado a la base de datos");
      error = 0;
    } catch (err) {
      console.log("Error al capturar el nuevo usuario: " + err);
    }
  }
  return error;
}
async function modificarUsuario(datos) {
  var error = 1;
  var respuestaBuscar = await buscarPorID(datos.id);
  
  if (respuestaBuscar !== "") {
    var usuarioActual = await conexion.doc(datos.id).get();
    var datosUsuario = usuarioActual.data();

    if (datos.password === "") {
      datos.password = datosUsuario.password;
      datos.salt = datosUsuario.salt;
    } else {
      var { salt, hash } = encriptarPassword(datos.password);
      datos.password = hash;
      datos.salt = salt;
    }
    var datosActualizados = { 
      nombre: datos.nombre !== undefined ? datos.nombre : datosUsuario.nombre,
      usuario: datos.usuario !== undefined ? datos.usuario : datosUsuario.usuario,
      password: datos.password,
      salt: datos.salt,
      foto: datos.foto !== undefined ? datos.foto : datosUsuario.foto,
      admin: datos.admin !== undefined ? datos.admin : datosUsuario.admin 
    };

    var user = new Usuario(datos.id, datosActualizados);

    if (user.bandera === 0) {
      try {
        await conexion.doc(user.id).set(user.obtenerDatos);
        console.log("Modificado");
        error = 0;
      } catch (err) {
        console.log("Error al modificar usuario: " + err);
      }
    }
  }
  
  return error;
}

async function borrarUsuario(id) {
  var error = 1;
  var user = await buscarPorID(id);
  if (user != "") {
    try {
      await conexion.doc(id).delete();
      console.log("Usuario eliminado de la base de datos");
      error = 0;
    } catch (err) {
      console.log("Error al eliminar el usuario: " + err);
    }
  }
  return error;
}

async function buscarPorUsuario(usuario) {
  var user="";
  try {
    var usuarios = await conexion.where("usuario", "==", usuario).get();
    usuarios.forEach((usuario) => {
      // console.log(usuario.data());
      var usuarioObjeto = new Usuario(usuario.id, usuario.data());
      if (usuarioObjeto.bandera == 0) {
        user = usuarioObjeto.obtenerDatos;
      }
    });
  } catch (err) {
    console.log("Error al recuperar el usuario: " + err);
  }
  return user;
}

async function verificarPassword(password, hash, salt) {
  var hashEvaluar = crypto.scryptSync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hashEvaluar === hash;
}




module.exports = {
  mostrarUsuarios,
  buscarPorID,
  modificarUsuario,
  borrarUsuario,
  nuevoUsuario,
  buscarPorUsuario,
  verificarPassword,
};
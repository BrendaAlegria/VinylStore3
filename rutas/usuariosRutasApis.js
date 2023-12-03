//var ruta = require("express").Router();
var express = require('express');
var ruta = express.Router();
var fs=require("fs");
var {  mostrarUsuarios, nuevoUsuario,buscarPorID, modificarUsuario,  borrarUsuario,buscarPorUsuario,verificarPassword} = require("../BD/usuarios");
var { mostrarDiscos} = require("../BD/discos");
var { subirArchivo, subirAudio } = require("../middlewares/subirArchivo");
var {autorizado, admin}=require("../middlewares/funcionesPassword");
const { log } = require('console');

//PAGINA DE CARGA
ruta.get('/', (req, res) => {
  res.render("Usuarios/pagInicio");
}); 

//MOSTRA USUARIOS
ruta.get('/mosUsu',async  (req, res) => {
  var usuarios = await mostrarUsuarios();
  const tipo = req.session.usuario || undefined;
  res.render("usuarios/mostrar", { usuarios, tipo });
});

//GALERIA DE VINILOS 
ruta.get('/galeria',async  (req, res) => {
  try {
    // Obtener datos de discos
    const discos = await mostrarDiscos(); // Asegúrate de tener esta función definida
    const tipo = req.session.usuario || undefined;
    res.render("usuarios/galeria", { tipo, discos });
  } catch (error) {
    console.error('Error al cargar la galería:', error);
  }
});


//MENU VERIFICAR SI ES ADMIN O USUARIO
ruta.get("/usuarios", autorizado, async (req, res) => {
  var tipo;
  var usuarios = await mostrarUsuarios();
  
  if (req.session.usuario) {
    tipo = req.session.usuario; 
    
    if (tipo === "admin") {
      res.render("Usuarios/mostrarAdmin", { usuarios, tipo });
    } else {
      res.render("Usuarios/mostrarUsuarios", { usuarios, tipo });
    }
  } else {
    tipo = undefined;
    res.render("Usuarios/mostrarUsuarios", { usuarios, tipo });
  }
});

//ACERCA DE
ruta.get("/about", (req, res) => {
  const tipo = req.session.usuario || undefined;
  res.render("Usuarios/about",{ tipo});
});
//ELIMINAR CADA QUIEN SU CUENTA 
ruta.get("/elimiCuen", async (req, res) => {
  const usuarioId = req.session.usuarioId;
  if (usuarioId) {
    const tipo = req.session.usuario || undefined;
    res.render("Paginas/borarCuenta", { tipo: req.session.usuario, usuarioId });
    // No es necesario borrar el usuario aquí
  } else {
    res.redirect("/login"); 
  }
});

ruta.get("/elimiCuen/:id", async (req, res) => {
  const usuarioId = req.params.id; // Cambiado de req.params.usuarioId a req.params.id
  try {
    var usuario = await buscarPorID(usuarioId);
    if (usuario) {
      const foto = usuario.foto;
      if (foto) {
        fs.unlinkSync('./web/images/' + usuario.foto);
        console.log('Imagen Borrada');
      }
      await borrarUsuario(usuarioId);
      res.redirect("/login");
    } else {
    }
  } catch (error) {
    console.error("Error al intentar borrar la cuenta:", error);
  }
});



//AGREGAR NUEVO USUARIO

ruta.get("/nuevousu", (req, res) => {
  res.render("Usuarios/nuevo");
});

ruta.post("/nuevousu",subirArchivo(), async (req, res) => {
  req.body.foto=req.file.originalname;
  var error = await nuevoUsuario(req.body);
  res.redirect("/login");
  console.log("Usuario Ingresado correctamente");
});

//RUTA LOGIN
ruta.get("/login", async (req, res) =>{
res.render ("Usuarios/login");
});

ruta.post("/login", async (req, res) => {
  var { usuario, password } = req.body;
  var usuarioEnt = await buscarPorUsuario(usuario);
  if (usuarioEnt) {
    var passwordCorrect = await verificarPassword(password, usuarioEnt.password, usuarioEnt.salt);
    if (passwordCorrect) {
      req.session.usuarioId = usuarioEnt.id;
      if (usuarioEnt.admin) {
        req.session.admin = usuarioEnt.admin;
        req.session.usuario = usuarioEnt.usuario; 
        res.redirect("/mosUsu");
        console.log("Iniciaste sesion como Admin");
      } else {
        req.session.usuario = usuarioEnt.usuario;
        res.redirect("/galeria"); 
        console.log("Iniciaste sesion como Usuario");
      }
    } else {
      console.log("Usuario o contraseña incorrectos");
      res.render("usuarios/login");
    }
  } else {
    console.log("Usuario o contraseña incorrectos");
    res.render("usuarios/login");
  }
});


//RUTA EDITAR O MODIFICAR
ruta.get("/editar/:id", async (req, res) => {
  var user = await buscarPorID(req.params.id);
  console.log(user);
  res.render("usuarios/modificar", { user });
});

ruta.post("/editar", subirArchivo(), async (req, res) => {
   //req.body.foto=req.file.originalname;
  if(req.file != undefined){
    req.body.foto=req.file.originalname;
  }
  else{
    req.body.foto=req.body.fotoVieja;
  }
  /*console.log(req.body);
  res.end();*/ 
  var error = await modificarUsuario(req.body);
  res.redirect("/mosUsu");
 
  
});

//BORRAR UN USUARIO 
ruta.get("/borrar/:id", async (req, res) => {
  try {
    var usuario=await buscarPorID(req.params.id);
    await borrarUsuario(req.params.id);
    fs.unlinkSync('./web/images/'+usuario.foto);
    console.log('Imagen Borrada');
    res.redirect("/mosUsu");

  } catch (error) {
    console.error('No se puede borrar el usuario', error);
  
  }
});
//MODIFICAR MI CUENTA
ruta.get("/modiCuenta", async (req, res) => {
  const usuarioId = req.session.usuarioId;
  if (usuarioId) {
    try {
      const tipo = req.session.usuario || undefined; 
      const usuario = await buscarPorID(usuarioId);
      if (!usuario) {
        console.error("Usuario no encontrado");
        res.status(404).send("Usuario no encontrado");
        return;
      }
      res.render("Paginas/modCuenta", { usuarioId, tipo, user: usuario });
    } catch (error) {
      console.error("Error al cargar la página de modificación:", error);
     
    }
  } else {
    res.redirect("/login"); 
  }
});
 
ruta.post("/modiCuenta/:id", subirArchivo(), async (req, res) => {
  try {
    const usuarioAct = await buscarPorID(req.body.id);
    if (!usuarioAct) {
      console.error("Usuario no encontrado");
      res.status(404).send("Usuario no encontrado");
      return;
    }
    if (req.file) {
      req.body.foto = req.file.originalname;

      if (usuarioAct.foto) {
        const rutaFotoAnterior=('./web/images/'+usuarioAct.foto);
        fs.unlinkSync(rutaFotoAnterior);
      } else {
        req.body.foto = req.body.fotoViejo;
      }
    }
    usuarioAct.nombre = req.body.nombre;
    usuarioAct.usuario = req.body.usuario;
    usuarioAct.password = req.body.password || usuarioAct.password; 

    // Actualiza la foto si se sube una nueva
    if (req.file) {
      usuarioAct.foto = req.file.originalname;
    }
    await modificarUsuario(usuarioAct); 
    res.redirect("/login");
  } catch (error) {
    console.error("Error al modificar la cuenta:", error);
   
  }
});

//CERRAR SESION

ruta.get("/logout", (req,res)=>{
req.session=null;
res.redirect("/login");
console.log("Saliste de Tu cuenta");
});


module.exports = ruta;






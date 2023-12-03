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
// GALERIA DE VINILOS
ruta.get('/discos', async (req, res) => {
  try {
    const discos = await mostrarDiscos();
    const tipo = req.session.usuario || undefined;
    res.json({ tipo, discos });
  } catch (error) {
    console.error('Error al cargar la galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// MENU VERIFICAR SI ES ADMIN O USUARIO
ruta.get('/usuarios/menu', autorizado, async (req, res) => {
  const tipo = req.session.usuario || undefined;
  const usuarios = await mostrarUsuarios();

  if (tipo === 'admin') {
    res.json({ usuarios, tipo });
  } else {
    res.json({ usuarios, tipo });
  }
});

// ACERCA DE
ruta.get('/about', (req, res) => {
  const tipo = req.session.usuario || undefined;
  res.json({ tipo });
});

// ELIMINAR CADA QUIEN SU CUENTA
ruta.get('/usuarios/delete', async (req, res) => {
  const usuarioId = req.session.usuarioId;
  if (usuarioId) {
    const tipo = req.session.usuario || undefined;
    res.json({ tipo, usuarioId });
  } else {
    res.status(401).json({ error: 'No autorizado' });
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
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al intentar borrar la cuenta:", error);
    res.status(500).send("Error al intentar borrar la cuenta");
  }
});



//AGREGAR NUEVO USUARIO

ruta.get("/nuevousu", (req, res) => {
  res.render("Usuarios/nuevo");
});

// AGREGAR NUEVO USUARIO
ruta.post('/usuarios', subirArchivo(), async (req, res) => {
  req.body.foto = req.file.originalname;
  const error = await nuevoUsuario(req.body);
  res.json({ message: 'Usuario ingresado correctamente' });
});

//RUTA LOGIN
ruta.get("/login", async (req, res) =>{
res.render ("Usuarios/login");
});

// RUTA LOGIN
ruta.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  const usuarioEnt = await buscarPorUsuario(usuario);
  if (usuarioEnt) {
    const passwordCorrect = await verificarPassword(
      password,
      usuarioEnt.password,
      usuarioEnt.salt
    );
    if (passwordCorrect) {
      req.session.usuarioId = usuarioEnt.id;
      if (usuarioEnt.admin) {
        req.session.admin = usuarioEnt.admin;
        req.session.usuario = usuarioEnt.usuario;
        res.json({ message: 'Iniciaste sesión como Admin' });
      } else {
        req.session.usuario = usuarioEnt.usuario;
        res.json({ message: 'Iniciaste sesión como Usuario' });
      }
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  } else {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
});


//RUTA EDITAR O MODIFICAR
ruta.get("/editar/:id", async (req, res) => {
  var user = await buscarPorID(req.params.id);
  console.log(user);
  res.render("usuarios/modificar", { user });
});
// MODIFICAR USUARIO - ACTUALIZAR DATOS
ruta.put("/usuarios/edit", subirArchivo(), async (req, res) => {
  try {
    if (req.file) {
      req.body.foto = req.file.originalname;
    } else {
      req.body.foto = req.body.fotoVieja;
    }
    const error = await modificarUsuario(req.body);
    res.json({ message: 'Usuario modificado correctamente' });
  } catch (error) {
    console.error('Error al modificar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// BORRAR UN USUARIO
ruta.delete("/usuarios/delete/:id", async (req, res) => {
  try {
    const usuario = await buscarPorID(req.params.id);
    await borrarUsuario(req.params.id);
    if (usuario.foto) {
      fs.unlinkSync('./web/images/' + usuario.foto);
      console.log('Imagen Borrada');
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('No se puede borrar el usuario', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
      res.status(500).send("Error interno del servidor al intentar cargar la página de modificación");
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
    res.status(500).send("Error interno del servidor");
  }
});

//CERRAR SESION

ruta.get("/logout", (req,res)=>{
req.session=null;
res.redirect("/login");
console.log("Saliste de Tu cuenta");
});


module.exports = ruta;






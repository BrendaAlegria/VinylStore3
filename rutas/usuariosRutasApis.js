//var ruta = require("express").Router();
var express = require('express');
var ruta = express.Router();
var fs=require("fs");
var {  mostrarUsuarios, nuevoUsuario,buscarPorID, modificarUsuario,  borrarUsuario,buscarPorUsuario,verificarPassword} = require("../BD/usuarios");
var { mostrarDiscos} = require("../BD/discos");
var { subirArchivo, subirAudio } = require("../middlewares/subirArchivo");
var {autorizado, admin}=require("../middlewares/funcionesPassword");
const { log } = require('console');


//MOSTRA USUARIOS
ruta.get('/mosUsu', async (req, res) => {
  try {
    const usuarios = await mostrarUsuarios();
    const tipo = req.session.usuario || undefined;

    if (usuarios.length > 0)
      res.status(200).json({ usuarios, tipo });
    else
      res.status(400).json({ mensaje: "No hay usuarios" });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});



//AGREGAR NUEVO USUARIO

ruta.post("/nuevousu", subirArchivo(), async (req, res) => {
  try {
    req.body.foto = req.file.originalname;
    const error = await nuevoUsuario(req.body);

    if (error === 0) {
      res.status(200).json("Usuario registrado");
    } else {
      res.status(400).json("Datos incorrectos");
    }

    console.log("Usuario Ingresado correctamente");
  } catch (error) {
    console.error("Error al crear un nuevo usuario:", error);
    res.status(500).json("Error interno del servidor");
  }
});

//RUTA EDITAR O MODIFICAR

ruta.post("/editar", subirArchivo(), async (req, res) => {
  try {
    let fotoNueva = req.file ? req.file.originalname : req.body.fotoVieja;
    const error = await modificarUsuario({ ...req.body, foto: fotoNueva });

    if (error === 0) {
      res.status(200).json("Usuario actualizado");
    } else {
      res.status(400).json("Error al actualizar el usuario");
    }

    console.log("Usuario actualizado correctamente");
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json("Error interno del servidor");
  }
});


//BORRAR UN USUARIO 
ruta.get("/borrar/:id", async (req, res) => {
  try {
    const usuario = await buscarPorID(req.params.id);
    const error = await borrarUsuario(req.params.id);

    if (error === 0) {
      // Borra la imagen solo si el usuario se borra exitosamente
      fs.unlinkSync('./web/images/' + usuario.foto);
      console.log('Imagen Borrada');
      res.status(200).json("Usuario borrado");
    } else {
      res.status(400).json("Error al eliminar usuario");
    }
  } catch (error) {
    console.error('No se puede borrar el usuario', error);
    res.status(500).json("Error interno del servidor");
  }
});



module.exports = ruta;






var express = require('express');
var rutasDis = express.Router();
var { mostrarDiscos,buscarDiscoPorID,modificarDisco,borrarDisco,nuevoDisco,llamarDatosDisco} = require("../BD/discos");
var { subirArchivo, subirAudio } = require("../middlewares/subirArchivo");
var fs=require("fs");
const { autorizado } = require('../middlewares/funcionesPassword');
var { obtenerMeGustaUsuario,agregarMeGusta } = require('../BD/megusta');
const { log } = require('console');



rutasDis.get("/dis/mostrarDis", async (req, res) => {
  try {
    const discos = await mostrarDiscos();
    const tipo = req.session.usuario || undefined;

    res.status(200).json({ discos, tipo });
  } catch (error) {
    console.error("Error al obtener los discos:", error);
    res.status(500).json("Error interno del servidor");
  }
});


//CREAR UN NUEVO DISCO
rutasDis.post("/dis/newDis", subirArchivo(), async (req, res) => {
  try {
    req.body.foto = req.file.originalname;
    const error = await nuevoDisco(req.body);

    if (error === 0) {
      res.status(200).json("Disco registrado");
    } else {
      res.status(400).json("Error al registrar el disco");
    }
  } catch (error) {
    console.error("Error al crear un nuevo disco:", error);
    res.status(500).json("Error interno del servidor");
  }
});
//RUTAS EDITAR O modificar un vinilo
rutasDis.post("/dis/editarDis", subirArchivo()/*,subirAudio()*/, async (req, res) => {
  try {
    if (req.file !== undefined) {
      req.body.foto = req.file.originalname;
    } else {
      req.body.foto = req.body.fotoVieja;
    }

    const error = await modificarDisco(req.body);

    if (error === 0) {
      res.status(200).json("Disco actualizado");
    } else {
      res.status(400).json("Error al actualizar el disco");
    }
  } catch (error) {
    console.error("Error al editar disco:", error);
    res.status(500).json("Error interno del servidor");
  }
});
//BORRAR UN DISCO
rutasDis.get("/dis/borrarDis/:id", async (req, res) => {
  try {
    const disco = await buscarPorID(req.params.id);
    if (disco) {
      const foto = disco.foto;
      fs.unlinkSync(`./web/images/${foto}`);
      await borrarDisco(req.params.id);
      console.log('Imagen Borrada Del Vinilo');
      res.status(200).json("Disco eliminado");
    } else {
      res.status(404).json("Vinilo no encontrado");
    }
  } catch (error) {
    console.error('No se puede borrar el vinilo', error);
    res.status(500).json('Error interno del servidor');
  }
});



module.exports = rutasDis;

var express = require('express');
var rutasDis = express.Router();
var { mostrarDiscos,buscarDiscoPorID,modificarDisco,borrarDisco,nuevoDisco,llamarDatosDisco} = require("../BD/discos");
var { subirArchivo, subirAudio } = require("../middlewares/subirArchivo");
var fs=require("fs");
const { autorizado } = require('../middlewares/funcionesPassword');
var { obtenerMeGustaUsuario,agregarMeGusta } = require('../BD/megusta');
const { log } = require('console');

//ENTRAR A MOSTRAR DISCOS QUE LE GUSTAN AL USUARIO
rutasDis.get("/dis/likes", async (req, res) => {
  try {
      const idUsuario = req.session.usuario.id;
      const idsMeGusta = await obtenerMeGustaUsuario(idUsuario);
      const discosMeGusta = await Promise.all(idsMeGusta.map(buscarDiscoPorID));

      const tipo = req.session.usuario || undefined;
      res.render("Paginas/misLike", { discosMeGusta, tipo });
  } catch (error) {
      console.error("Error al obtener los 'Me Gusta' del usuario:", error);
      res.status(500).send("Error interno del servidor");
  }
});

rutasDis.post("/dis/agreLike/:idDisco", async (req, res) => {
  try {
      const idUsuario = req.session.usuario.id;
      const idDisco = req.params.idDisco;
      console.log(idDisco);
      const yaLeGusta = await obtenerMeGustaUsuario(idUsuario);
      if (yaLeGusta.includes(idDisco)) {
          console.log('El usuario ya le dio "Me Gusta" a este disco');
          res.redirect('/dis/likes');
          return;
      }
      console.log(idUsuario);
      await agregarMeGusta(idUsuario, idDisco);
      
      res.redirect('/dis/likes');
  } catch (error) {
      console.error("Error al dar 'Me Gusta' al vinilo:", error);
      res.status(500).send("Error interno del servidor");
  }
});

//MOSTRAR LOS ME GUSTA DE LOS USUARIOS AL ADMIN
rutasDis.get("/dis/meGustaUsuarios", async (req, res) => {
  try {
      // Obtén la información de los usuarios y los vinilos a los cuales les dieron "Me Gusta"
      const meGustaUsuarios = await obtenerMeGustaUsuarios();
      // Para cada usuario, busca los detalles de los vinilos que le gustan
      const usuariosConMeGusta = await Promise.all(meGustaUsuarios.map(async (usuario) => {
          const vinilosMeGusta = await Promise.all(usuario.vinilos.map(buscarDiscoPorID));
          return {
              usuario,
              vinilosMeGusta
          };
      }));
      // Renderiza la página con la información
      const tipo = req.session.usuario || undefined;
      res.render("Paginas/meGustaUsuarios", { usuariosConMeGusta, tipo });
  } catch (error) {
      console.error("Error al obtener la información de 'Me Gusta' de los usuarios:", error);
      res.status(500).send("Error interno del servidor");
  }
});








rutasDis.get("/dis/mostrarDis", async (req, res) => {
  try {
    var discos = await mostrarDiscos();
    const tipo = req.session.usuario || undefined; 
    res.render("Discos/mostrarDis", { discos, tipo });
    } catch (error) {
    console.error("Error al obtener las obras:", error);
    res.status(500).send("Error interno del servidor");
    }
});

//GALERIA DE VINILOS Pero de Consumo REGISTRO DE VINILOS 
rutasDis.get('/dis/galeriaD',async (req, res) => {
  const tipo = req.session.usuario || undefined;
  res.render("Discos/galeriaD", {tipo });
}); 

//CREAR UN NUEVO DISCO
rutasDis.get("/dis/newDis", (req, res) => {
  const tipo = req.session.usuario || undefined;
  res.render("Discos/nuevoDis", { tipo: tipo });
});

rutasDis.post("/dis/newDis", subirArchivo() ,/*subirAudio(),*/ async (req, res) => {
  req.body.foto = req.file.originalname;
  /*req.body.audio = req.file.originalname;*/
  var error = await nuevoDisco(req.body);
  const tipo = req.session.usuario || undefined;
  res.redirect("/dis/dis/mostrarDis");
});
//RUTAS EDITAR O modificar un vinilo

rutasDis.get("/dis/editarDis/:id", async (req, res) => {
  try {
    var disc = await buscarDiscoPorID(req.params.id);
    const tipo = req.session.usuario || undefined;
    res.render("Discos/modificarDis", { disc, tipo });
  } catch (error) {
    console.error("Error al mostrar el formulario de edición:", error);
    res.status(500).send("Error interno del servidor");
  }
});

rutasDis.post("/dis/editarDis", subirArchivo()/*,subirAudio()*/, async (req, res) => {
  //req.body.foto=req.file.originalname;
if(req.file != undefined){
  req.body.foto=req.file.originalname;
}
else{
  req.body.foto=req.body.fotoVieja;
}
// Verifica si se subió un nuevo archivo de audio
/*if (req.fileAudio !== undefined) {
  req.body.audio = req.fileAudio.originalname;
} else {
  req.body.audio = req.body.audioViejo;
}*/
var error = await modificarDisco(req.body);
res.redirect("/dis/dis/mostrarDis");

});
//BORRAR UN DISCO
rutasDis.get("/dis/borrarDis/:id", async (req, res) => {
  try {
    var disco=await buscarPorID(req.params.id);
    await borrarDisco(req.params.id);
    fs.unlinkSync('./web/images/'+disco.foto);
    console.log('Imagen Borrada Del Vinilo');
    
    // Verificar si hay un archivo de audio y eliminarlo
    /*if (disco.audio) {
      fs.unlinkSync('./web/audio/' + disco.audio);
      console.log('Audio Borrado Del Vinilo');
    }*/
    res.redirect("/dis/dis/mostrarDis");

  } catch (error) {
    console.error('No se puede borrar el vinilo', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = rutasDis;

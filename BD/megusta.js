var conexionLi = require("./conexion").conexionLi;
var Gusta = require("../modelos/Megusta");

async function agregarMeGusta(idUsuario, idDisco) {
    var meGusta = new Gusta(idUsuario, idDisco);
    try {
        console.log(meGusta.obtenerDatos);
        var resultado = await conexionLi.collection('megusta').add(meGusta.obtenerDatos);
        console.log('Me Gusta agregado correctamente');
        console.log('ID del documento agregado:', resultado.id);
        return resultado.id;  // Retorna el ID del documento agregado
    } catch (error) {
        console.error('Error al agregar Me Gusta:', error);
        throw error;
    }
}
async function obtenerMeGustaUsuario(idUsuario) {
    try {
        var meGustaConsulta = await conexionLi.collection('megusta').where('idUsuario', '==', idUsuario).get();
        var meGusta = meGustaConsulta.docs.map((doc) => {
            var datosMeGusta = doc.data();
            return new Gusta(datosMeGusta.idUsuario, datosMeGusta.idDisco);
        });

        console.log('Me Gusta obtenidos correctamente');
        console.log('Instancias de MeGusta:', meGusta);
        return meGusta;
    } catch (error) {
        console.error('Error al obtener Me Gusta del usuario:', error);
        throw error;
    }
}
module.exports = {
    obtenerMeGustaUsuario,
    agregarMeGusta

};
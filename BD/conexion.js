var admin=require("firebase-admin");
var keys=require("../keys.json");
admin.initializeApp({
    credential:admin.credential.cert(keys)
});
var micuenta=admin.firestore();
var conexion=micuenta.collection("usuarios");
var conexionDis=micuenta.collection("discos");
var conexionLi=micuenta.collection("megusta");

module.exports={
    conexion,
    conexionDis,
    conexionLi
};
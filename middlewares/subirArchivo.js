var multer=require("multer");
//Funcion para subir un Archivo o img 
function subirArchivo() {
    var storage = multer.diskStorage({
        destination: './web/images',
        filename: function (req, file, cb) {
            var archivo = file.originalname;
            cb(null, archivo);
        }
    });
    var upload = multer({ storage }).single('foto');
    return upload;
}

// Funcion para subir un audio
    function subirAudio() {
        var storage = multer.diskStorage({
            destination: './web/audio',
            filename: function (req, file, cb) {
                var audio = file.originalname;
                cb(null, audio);
            }
        });
        
        var upload = multer({ storage }).single('audio');
        return upload;
    }


module.exports =  { 
    subirArchivo, 
    subirAudio 
};
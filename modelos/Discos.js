class Disco{
    constructor(id,data){
        this.bandera=0; 
        this.id=id; 
        this.nombre=data.nombre;
        this.artista=data.artista;
        this.duracion=data.duracion;
        this.precio=data.precio;
        this.foto=data.foto;
        /*this.audio=data.audio;*/
    }
    set id(id){
        if (id!=null) {
            if (id != null) id.length > 0 ? (this._id = id) : (this.bandera = 1);  
        }
    }
    set nombre(nombre){
        nombre.length>0?this._nombre=nombre:this.bandera=1;
    }
    set artista(artista){
        artista.length>0?this._artista=artista:this.bandera=1;

    }
    set duracion(duracion) {
        if (typeof duracion === 'string' && duracion.length > 0) {
            this._duracion = duracion;
        } else {
            this.bandera = 1;
        }
    }
    set precio(precio){
        precio.length>0?this._precio=precio:this.bandera=1;
    }
    set foto(foto){
        foto.length>0?this._foto=foto:this.bandera=1;
    }
    /*set audio(audio){
        audio.length>0?this._audio=audio:this.bandera=1;
    }*/
    get id(){
        return this._id;
    }
    get nombre(){
        return this._nombre;
    }
    get artista(){
        return this._artista;
    }
    get duracion(){
        return this._duracion;
    }
    get precio(){
        return this._precio;
    }
    get foto(){
        return this._foto;
    }
    /*get audio(){
        return this._audio;
    }*/
    get obtenerDatos(){
        if(this._id != null)
            return{
                id:this.id,
                nombre:this.nombre,
                artista:this.artista,
                duracion:this.duracion,
                precio:this.precio,
                foto:this.foto
                /*audio:this.audio*/

        }
        else{
            return {
                nombre:this.nombre,
                artista:this.artista,
                duracion:this.duracion,
                precio:this.precio,
                foto:this.foto
                /*audio:this.audio*/

            }
        }
    }
}
module.exports= Disco ;
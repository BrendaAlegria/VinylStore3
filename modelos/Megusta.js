class MeGustas {
    constructor(idUsuario, idDisco) {
        this.idUsuario = idUsuario;
        this.idDisco = idDisco;
    }

    get obtenerDatos() {
        return {
            idUsuario: this.idUsuario,
            idDisco: this.idDisco
        };
    }
}

module.exports = MeGustas;
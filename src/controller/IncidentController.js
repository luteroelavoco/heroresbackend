const connection = require("../database/connection");

module.exports = {
 
    async index(request, response){
        const {page = 1 , limit = 5} = request.query;

        const [count] = await connection('incidents')
            .count()

        const total = count['count(*)'];
            
        const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', '=' , 'incidents.ong_id')
        .limit(limit)
        .offset((page - 1) * limit)
        .select([
            'incidents.*',
            'ongs.name',
            'ongs.email',
            'ongs.whatsapp',
            'ongs.city',
            'ongs.uf'
        ]);

        response.header('X-TOTAL-Count' ,total )
        response.header('X-TOTAL-Pages' , Math.ceil(total/limit));

        return response.json(incidents);
    },

    async store(request, response) {
        const { title, value, description } = request.body;
        const  ong_id  = request.headers.authorization;

        const [id] = await connection('incidents').insert({ 
            title, 
            value, 
            description ,
            ong_id
        })

        return response.json({id})

    },

    async destroy(request, response){
        const { id } = request.params;
        const  ong_id  = request.headers.authorization;
        
        const incident = await connection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if(!incident){
            return response.status(404).json({erro : 'wrong incidents id'})
        }
        if(incident.ong_id !== ong_id){
            return response.status(401).json({error : 'operation not permited'})
        }
        await connection('incidents').where('id', id).delete();
        
        return response.status(204).send();
    }
}
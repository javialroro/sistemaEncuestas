class AppService {
    constructor(database,database2, redisClient) {
        this.database = database;
        this.database2 = database2;
        this.redisClient = redisClient;
    }
// Autenticacion y Autorizacion
    async getUserByUsername(username) {
        // Implementa la lógica para consultar la base de datos y obtener el usuario por su nombre de usuario
        // Por ejemplo, utilizando un método de consulta SQL
        try {
            return await this.database.getUserByUsername(username); // Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }

    async createUser(user, email, password, rol){
        try {
            return await this.database.createUser(user, email, password, rol);// Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }

// Usuarios
    // async getUsers() {
    //     try{
    //         return await this.database.getUsers();
    //     }
    //     catch(e){
    //         console.error(`Failed to get users ${e}`);
    //     }
    // }

    async getUsers() {
        try {
            // Intenta obtener los datos de Redis
            const usersData = await this.getUsersFromCache();
            if (usersData) {
                console.log('Users data found in Redis');
                return usersData;
            }

            // Si los datos no están en Redis, obténlos de la base de datos
            console.log('Users data not found in Redis. Retrieving from database...');
            const dbUsersData = await this.database.getUsers();

            // Guarda los datos en Redis para futuras solicitudes
            await this.saveUsersToCache(dbUsersData);
            return dbUsersData;
        } catch (error) {
            console.error(`Failed to get users: ${error}`);
            throw error; // Propaga el error para que lo maneje el llamador
        }
    }

    async getUsersFromCache() {
        return new Promise((resolve, reject) => {
            this.redisClient.get('users', (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data ? JSON.parse(data) : null);
                }
            });
        });
    }

    async saveUsersToCache(usersData) {
        return new Promise((resolve, reject) => {
            this.redisClient.set('users', JSON.stringify(usersData), 'EX', 3600, (error, reply) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(reply);
                }
            });
        });
    }

    async getUserById(id) {
        try{
            return await this.database.getUserById(id);
        }
        catch(e){
            console.error(`Failed to get user by id ${e}`);
        }
    }


    async updateUser(request_json, id) {
        try{
            return await this.database.updateUser(request_json, id);
        }
        catch(e){
            console.error(`Failed to update user ${e}`);
        }
    }

    async deleteUser(id) {
        try{
            return await this.database.deleteUser(id);
        }
        catch(e){
            console.error(`Failed to delete user ${e}`);
        }
    }

// Encuestas

    async createSurvey(request_json) {
        try{
            return await this.database2.insertSurvey(request_json);
        }
        catch(e){
            console.error(`Failed to create survey ${e}`);
        }
    }

    

    async getSurveys(collectionName) {
        try{
            return await this.database2.findAllSurveys(collectionName);
        }
        catch(e){
            console.error(`Failed to get surveys ${e}`);
        }
    }

    async getSurveyById(id) {
        try{
            return await this.database2.findSurveyById(id);
        }
        catch(e){
            console.error(`Failed to get survey by id ${e}`);
        }
    }

    async updateSurvey(id, request_json) {
        try{
            return await this.database2.updateSurveyById(id, request_json);
        }
        catch(e){
            console.error(`Failed to update survey ${e}`);
        }
    }

    async deleteSurvey(id) {
        try{
            return await this.database2.deleteSurveyById(id);
        }
        catch(e){
            console.error(`Failed to delete survey ${e}`);
        }
    }

    async publishSurvey(surveyId) {
        try {
            const updatedDocument = { 'estado': 'public' };
            const result = await this.database2.updateSurveyById(surveyId, updatedDocument);
            return result > 0; // Devuelve true si se actualizó al menos un documento
        } catch (error) {
            console.error(`Failed to publish survey: ${error}`);
            return false;
        }
    }


// Preguntas de encuestas

    async addQuestionToSurvey(surveyId, newQuestion) {
        try {
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return false; 
            }  
            existingSurvey.questions.push(newQuestion);
            const result = await this.database2.updateSurveyById(surveyId, existingSurvey);

            return result > 0; 
        } catch (error) {
            console.error(`Failed to add question to survey: ${error}`);
            return false;
        }
    }


    async getSurveyQuestions(surveyId) {
        try {
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return null; 
            }
            return existingSurvey.questions;
        } catch (error) {
            console.error(`Failed to get survey questions: ${error}`);
            return null;
        }
    }
    
    async updateSurveyQuestion(surveyId, questionId, updatedQuestion) {
        try {
            // Obtener la encuesta por su ID
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return false; // Encuesta no encontrada
            }
            
            // Buscar la pregunta por su ID dentro de la encuesta
            const questionIndex = existingSurvey.questions.findIndex(q => q.idPregunta === parseInt(questionId));
            if (questionIndex === -1) {
                return false; // Pregunta no encontrada en la encuesta
            }
            
            // Actualizar la pregunta con la nueva información
            existingSurvey.questions[questionIndex] = updatedQuestion;
            
            // Actualizar la encuesta en la base de datos
            const result = await this.database2.updateSurveyById(surveyId, existingSurvey);
            
            return result > 0; // Devolver true si la encuesta se actualizó correctamente
        } catch (error) {
            console.error(`Error al actualizar la pregunta de la encuesta: ${error}`);
            throw error;
        }
    }
    
    async deleteSurveyQuestion(surveyId, questionId) {
        try {
            // Obtener la encuesta por su ID
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return false; // Encuesta no encontrada
            }
            
            // Filtrar la lista de preguntas para eliminar la pregunta específica por su ID
            existingSurvey.questions = existingSurvey.questions.filter(q => q.idPregunta !== parseInt(questionId));
            
            // Actualizar la encuesta en la base de datos para reflejar los cambios
            const result = await this.database2.updateSurveyById(surveyId, existingSurvey);
            
            return result > 0; // Devolver true si la encuesta se actualizó correctamente
        } catch (error) {
            console.error(`Error al eliminar la pregunta de la encuesta: ${error}`);
            throw error;
        }
    }
    

// Respuestas de encuestas

    async insertResponse(request_json, survey_id) {
        try{
            return await this.database2.insertResponse(request_json, survey_id);
        }
        catch(e){
            console.error(`Failed to create response ${e}`);
        }
    }

    async getResponses(survey_id) {
        try{
            return await this.database2.getResponses(survey_id);
        }
        catch(e){
            console.error(`Failed to get response ${e}`);
        }
    }

// Encuestados

    async createRespondent(request_json) {
        try{
            return await this.database.createRespondent(request_json);
        }
        catch(e){
            console.error(`Failed to create respondent ${e}`);
        }
    }

    async getRespondents() {
        try{
            return await this.database.getRespondents();
        }
        catch(e){
            console.error(`Failed to get respondents ${e}`);
        }
    }

    async getRespondentById(id) {
        try{
            return await this.database.getRespondentById(id);
        }
        catch(e){
            console.error(`Failed to get respondent by id ${e}`);
        }
    }

    async updateRespondent(request_json, id) {
        try{
            return await this.database.updateRespondent(request_json, id);
        }
        catch(e){
            console.error(`Failed to update respondent ${e}`);
        }
    }

    async deleteRespondent(id) {
        try{
            return await this.database.deleteRespondent(id);
        }
        catch(e){
            console.error(`Failed to delete respondent ${e}`);
        }
    }

// Reportes y analisis

    async getAnalysis(survey_id) {
        try{
            return await this.database2.getAnalysis(survey_id);
        }
        catch(e){
            console.error(`Failed to get analysis ${e}`);
        }
    }

}

module.exports.AppService = AppService;
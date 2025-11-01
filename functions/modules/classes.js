//functions/modules/classes.js
//Importar express, cors, y el pasamano classService.
//Crear la app de Express: const app = express();.
//Endpoint POST /: (Para ClassFormModal.tsx) Llama a classService.createClass(req.body).
//Endpoint PUT /:classId: (Para ClassFormModal.tsx) Llama a classService.updateClass(req.params.classId, req.body).
//Endpoint DELETE /:classId: (Para gestion-clases.tsx) Llama a classService.deleteClass(req.params.classId).
//Endpoint GET /gym/:gymId: (Para clases.tsx) Llama a classService.getClassesByGym(req.params.gymId).
//Endpoint GET /user/:userId: (Para MisClases.tsx) Llama a classService.getUserClasses(req.params.userId).
//Endpoint POST /enroll: (Para GrupoDetalle.tsx) Llama a classService.enrollUser(req.body).
//Endpoint POST /unenroll: (Para GrupoDetalle.tsx) Llama a classService.unenrollUser(req.body).
//Exportar app.
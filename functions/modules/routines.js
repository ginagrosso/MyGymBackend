//functions/modules/routines.js
//Importar express, cors, y el pasamano routineService.
//Crear la app de Express: const app = express();.
//Endpoint POST /: (Para crear rutinas) Llama a routineService.createRoutine(req.body).
//Endpoint PUT /:routineId: (Para editar rutinas) Llama a routineService.updateRoutine(req.params.routineId, req.body).
//Endpoint POST /assign: (Para entrenamiento.tsx) Llama a routineService.assignRoutine(req.body).
//Endpoint GET /user/:userId: (Para rutina.tsx) Llama a routineService.getUserRoutine(req.params.userId).
//Exportar app.
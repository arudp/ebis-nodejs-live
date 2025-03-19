# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar
* `dev`  
  Inicia el servidor de desarrollo. Se puede acceder a él en `http://localhost:3000`.

> **Nota:**  
> Fijaos especialmente en el `GET /tasks` para ver la paginación que no nos ha dado tiempo a ver en clase.  
> Para usarla se utilizan **query params** de la forma `localhost:3000/tasks?from=2023-03-17&sort=due_date,DESC&sort=name,ASC`. Éste, por ejemplo, devolvería las tareas a partir del 17 de marzo de 2023, ordenadas por fecha de vencimiento descendente y nombre ascendente.

### Ejercicios
Tenéis los ejercicios propuestos habituales de validación. Sería interesante implementarlos con `sequelize` para ver cómo se pueden hacer.

Además, hay unas cuantas propuestas en el archivo `reset-tables.sql`, tanto de SQL como de endpoints.

# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar
* `dev`  
  Inicia el servidor de desarrollo. Se puede acceder a él en `http://localhost:3000`.
* `test`  
  Ejecuta los tests.
* `test-[get/post/delete/update]-tasks`  
  Ejecuta todos los tests para el método indicado.

De nuevo hay muchas formas de completar cualquiera de los tests, sin embargo estaría mejor enfatizar el control de errores y validación de datos en los middleware.  
Los tests sólo verifican que el código crea la respuesta y las entradas de base de datos correctas, pero no dónde se hace.  

Como siempre, es mejor primero experimentar y ver cómo conseguimos que los tests pasen. Una vez pasen, podemos probar formas distintas de hacerlo.

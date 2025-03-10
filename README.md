# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar
* `dev`  
  Inicia el servidor de desarrollo. Se puede acceder a él en `http://localhost:3000`.
* `test`  
  Ejecuta los tests.
* `test-all-[get/post/delete/update]`  
  Ejecuta todos los tests para el método indicado.

En esta ocasión hay muchas formas de completar cualquiera de los tests. Podemos optar por utilizar más o menos funcionalides de Mongoose o implementar nosotros mismos las validaciones en TypeScript.  
Lo importante por ahora es experimentar y ver cómo conseguimos que los tests pasen. Una vez pasen, podemos probar formas distintas de hacerlo.

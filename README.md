# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar
* `dev`  
  Inicia el servidor de desarrollo. Se puede acceder a él en `http://localhost:3000`.
* `test`  
  Ejecuta los tests.
* `test-all-[get/post/delete/update]`  
  Ejecuta todos los tests para el método indicado.

Los tests harán de formularios, por lo que si los formularios implementados funcionan correctamente, los tests también deberían pasar correctamente.  
Los tests nos pueden servir para indicar si ha faltado algo por implementar o si algo no funciona correctamente.

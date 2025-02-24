# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar:
* cli  
  Ejecuta el comando no interactivo. Sólo tiene `create` y `read`.  
  Puede ser útil para probar a trabajar con el fichero sin tener que lidiar con la entrada de usuario.
* cli-loop  
  Ejecuta el comando interactivo. Hay varios `// TODO` a completar.

Además, hay varios **scripts de test**. Están ideados para que funcionen una vez se le den las implementaciones a las funciones que tienen `// TODO`.  
Cada uno se puede ejecutar por sí solo con `npm run test-<nombre>`, o se pueden ejecutar todos con `npm test`.  
Debido a la naturaleza asíncrona de Node.js, los tests que fallan tardan en mostrar el mensaje de error, ya que están esperando a que se lancen unos eventos que, simplemente, no están en el código.

**Importante:** Es aconsejable **probar las cosas** de forma manual. Los tests están pensados de una forma, pero es posible que se puedan resolver los ejercicios de una forma que no se haya contemplado en los tests. Dicho de otra forma, si los tests passan, es muy probable que el código esté bien. Si no pasan, sin embargo, no quiere decir automáticamente que el código esté mal, pero puede ser un indicio.

* test  
  Ejecuta todos los tests.
* test-show-all  
  Ejecuta el test que muestra todas las tareas.
* test-show-by-name  
  Ejecuta el test que muestra filtra tareas por su nombre.
* test-delete  
  Ejecuta el test que elimina una tarea por índice.

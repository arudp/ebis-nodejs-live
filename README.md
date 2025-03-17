# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar
* `dev`  
  Inicia el servidor de desarrollo. Se puede acceder a él en `http://localhost:3000`.

## Propuestas de ejercicios
### Añadir roles a los usuarios
Los roles pueden ser `admin` o `writer`.
* Los `admin` pueden
  * Asignar roles a otros usuarios.
  * Actualizar la lista de `participats` de una tarea (ver ejercicios temas anteriores)
  * Ver y editar usuarios
* Los `writer` pueden
  * Crear tareas
  * Actualizar tareas en las que participan
  * Ver tareas en las que participan
  * Ver su propio usuario

Es mejor hacer las partes que se puedan aunque dejemos alguna sin hacer, ¡no es todo o nada!  
Aquí tenemos **dos ejemplos** de estrategias de autorización:
* RBAC (Role Based Access Control) para los roles `admin` y `writer`
* ReBAC (Relationship Based Access Control) para las tareas (solo los `participats` pueden ver y editar la tarea)

### Log out con JWT
Una cosa importante **que no mencioné en clase** es que los tokens JWT **no se pueden invalidar**.

¿Qué hacemos para que un usuario no pueda seguir accediendo a la aplicación una vez ha cerrado sesión?  
Una opción habitual es tener una lista de tokens revocados.
* En `POST /logout`, añade el token a la lista de tokens revocados.
* En la estrategia de autenticación de JWT, comprueba si el token está en la lista de tokens revocados, en cuyo caso **no** se autoriza la petición.

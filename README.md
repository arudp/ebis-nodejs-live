# ebis-nodejs

Para empezar a trabajar con el proyecto, es necesario instalar las dependencias (`npm install`).

En el archivo `package.json` se encuentran los scripts que se pueden ejecutar
* `dev`  
  Inicia el servidor de desarrollo. Se puede acceder a él en `http://localhost:3000`.
* `test-connection`  
  Realiza una conexión a la base de datos para comprobar que todo está correcto.

He actualizado un poco el index con ejercicios propuestos bajo `TODOs` como siempre, pero esta vez al estar la clase incompleta no tenemos tests.  
Os aconsejaría utilizar [Postman](https://www.postman.com) porque es muy intuitivo para probar las rutas, pero cualquier herramienta que permita hacer peticiones HTTP está bien.

Además, he añadido un archivo `.env.example` para que podáis configurar la conexión a la base de datos (copiadlo a `.env` y añadid lo que necesitáis).

También he añadido [`prettier`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) como formatter. Se puede ejecutar desde línea de comandos con `npm run format` o instalar en el editor para que se ejecute automáticamente al guardar.  
Para que lo haga automáticamente es necesario añadir la configuración
```json
"[typescript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
},
```


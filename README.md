# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Caché, persistencia y modo sin conexión (TanStack Query)

### Claves (`src/config/queryKeys.ts`)

- `catalogoPublico`: `todas` → `lista()` → `detalle(id)` (PokeAPI, solo lectura).
- `notasUsuario`: `todas` → `lista()` → `detalle(id)` → `porElemento(idElemento)` (MockAPI).
- `clavesMutacion`: `crearNota` y `editarNota`, necesarias para que `setMutationDefaults` encuentre la función de cada mutación.

### Qué se invalida tras cada mutación

| Mutación | Claves invalidadas | Por qué |
|---|---|---|
| Crear nota | `notasUsuario.lista()`, `notasUsuario.porElemento(itemId)` | Aparece una nota nueva en la lista general y en las notas del elemento al que pertenece. |
| Editar nota | `notasUsuario.detalle(id)`, `notasUsuario.lista()`, `notasUsuario.porElemento(itemId)` | La nota cambia en su detalle, en la lista y en las notas de su elemento. |
| Eliminar nota | `notasUsuario.lista()`, `notasUsuario.porElemento(itemId)`, `notasUsuario.detalle(id)` | La nota desaparece de la lista y de las notas de su elemento; el detalle deja de existir en el servidor y debe dejar de considerarse válido. |

`catalogoPublico` nunca se invalida: las mutaciones solo afectan a MockAPI y la API pública es de solo lectura.

### staleTime y gcTime

| Fuente | staleTime | Justificación |
|---|---|---|
| API pública (`catalogoPublico`) | 1 hora | Los datos casi no cambian; evita peticiones repetidas (20 Pokémon + 20 detalles). |
| MockAPI (`notasUsuario`) | 30 segundos | Datos editables por el usuario; deben refrescarse pronto. |

`gcTime` = `MAX_AGE` = 24 horas, igual al `maxAge` del persister (`MAX_AGE` en `src/config/queryClient.ts`).
Si `gcTime` fuera menor que `maxAge`, una consulta sin observadores se eliminaría de la memoria antes de que expire la caché persistida:
la caché guardada en disco se restauraría, pero esas consultas se descartarían enseguida y la app perdería los datos offline tras reabrirla.

### Persistencia

`PersistQueryClientProvider` (en `src/app/_layout.tsx`) guarda la caché en AsyncStorage mediante `@tanstack/query-async-storage-persister`.
Al abrir la app, la caché se restaura y `useQuery` entrega los datos guardados mientras el GET se actualiza en segundo plano.

### Flujo sin conexión

1. `onlineManager` usa NetInfo; sin red, las mutaciones pasan a estado `paused` en lugar de fallar.
2. `setMutationDefaults` registra `mutationFn`, la actualización optimista (`isPending: true`) y el rollback para cada `mutationKey`.
   Así las mutaciones pausadas, que se persisten sin funciones, pueden reanudarse tras reiniciar la app.
3. Al terminar de restaurar la caché, `onSuccess` del provider llama a `resumePausedMutations()` y después invalida `notasUsuario`.
4. `useCambiosPendientes()` expone las mutaciones pausadas o en curso para mostrarlas en la UI (una mutación pausada tiene `status: 'pending'` e `isPaused: true`).

### Hooks de lectura de notas

- `useNotas()`: lista completa (`notasUsuario.lista()`).
- `useNota(id)`: detalle por id (`notasUsuario.detalle(id)`), solo se ejecuta si `id` no está vacío.
- `useNotasPorElemento(itemId)`: notas de un elemento del catálogo (`notasUsuario.porElemento(itemId)`, `GET datosUsuario?itemId=…`).

Las tres heredan el `staleTime` de 30 s definido sobre `notasUsuario.todas`.

### Ids temporales y limitaciones offline

- Una nota creada sin conexión se muestra con `id` `temp-…` e `isPending: true` en `lista` y `porElemento`.
- Si se edita o elimina una nota con id temporal antes de sincronizarse, no se llama a MockAPI: la mutación falla sin reintentos y se revierte el cambio optimista. Hay que esperar a que se sincronice la creación.
- Solo se persisten las mutaciones pausadas (comportamiento por defecto de `dehydrate`). Al reiniciar, se reanudan gracias a `setMutationDefaults`; no se vuelve a ejecutar `onMutate`, pero la caché optimista ya está persistida.
- `useMutationState` con `status: 'pending'` incluye las pausadas.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


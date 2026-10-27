import Reactotron from 'reactotron-react-native';

// Forzamos la ejecución independientemente de si es producción o desarrollo
Reactotron.configure({
  name: 'ConsumoAPI APK',
  host: '192.168.100.47',
  port: 9090,
})
  .useReactNative({
    asyncStorage: false,
    networking: {
      ignoreUrls: /symbolicate/,
    },
  })
  .connect();

Reactotron.clear?.();
console.tron = Reactotron;
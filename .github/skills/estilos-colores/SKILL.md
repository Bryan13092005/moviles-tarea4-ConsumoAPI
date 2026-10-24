---
name: estilos-colores
description: Paleta de colores y estilos visuales con temática Pokémon para interfaces de usuario.
---

# Skill: estilo-colores-pokemon

Documento de especificación de interfaz de usuario con temática Pokémon. Define la paleta cromática suavizada para reducir la fatiga visual, tipografía, componentes interactivos y componentes de React Native/Web.

---

## 1. Filosofía UX/UI Visual (Sin Fatiga Visual)

* **Balance Suave:** Se sustituyen los fondos de blanco puro resplandeciente por tonos pastel eufónicos (`#F4F7FB` y `#EEF2F6`) que absorben el brillo excesivo.
* **Uso de Colores de Acento:** Los colores saturados de la franquicia (Amarillo Pikachu `#FFCB05` y Rojo Pokéball `#E3350D`) se reservan exclusivamente para acciones principales (CTAs), badges e insignias clave.

---

## 2. Paleta de Colores

### Colores de Identidad (Acentos)

* **Azul Pokémon (Primary Brand):** `#2A75BB`  
  *Uso:* Encabezados principales, estados activos y botones primarios.
* **Amarillo Pikachu (Secondary / Accent):** `#FFCB05`  
  *Uso:* Badges de nivel/tipo, destacados e iconos de notificación.
* **Rojo Pokéball (Alert / CTA):** `#E3350D`  
  *Uso:* Botones de captura/acción crítica y badges de alerta.

### Fondos y Superficies No Invasivas

* **Background General:** `#F4F7FB` (Gris azulado pastel hiper-suave)
* **Surface Card:** `#FFFFFF` (Superficie limpia para tarjetas)
* **Card Surface Tinted:** `#F8FAFC` (Para contenedores secundarios o listas)
* **Borde / Separador:** `#E2E8F0`

### Tipografía y Jerarquía

* **Texto Principal (Titles / Headings):** `#1E293B` (Azul-gris oscuro muy alto en contraste pero sin la agresividad del negro puro)
* **Texto Secundario (Subtitle / Description):** `#64748B` (Gris frío balanceado)
* **Texto Muted / Caption:** `#94A3B8`

---

## 3. Tipografía

* **Font Family:** `Flexo`, `Inter`, `Rubik` o System Sans-Serif.

### Jerarquía de Texto

```typescript
const typography = {
  pokemonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2A75BB',
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
};
```

---

## 4. Botones (Estilo Pokéball / Capsule)

Los botones implementan bordes totalmente redondeados (`borderRadius: 9999`) y sombras suaves.

```javascript
import { StyleSheet } from 'react-native';

export const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#2A75BB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2A75BB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  accentButton: {
    backgroundColor: '#FFCB05',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
  },
  accentButtonText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
  },
});
```

---

## 5. Tarjetas para FlatList (Pokémon Cards)

Las tarjetas evocan a la Pokédex y las cartas TCG Pocket, combinando esquinas redondeadas pronunciadas (`16px`) con un fondo suave y sombras atenuadas.

### Código de Componente React Native

```jsx
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from 'react-native';

const PokemonCard = ({ pokemon, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
    <View style={styles.imageBackground}>
      <Image source={{ uri: pokemon.imageUrl }} style={styles.pokemonImage} />
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>#{pokemon.id}</Text>
      </View>
    </View>

    <View style={styles.content}>
      <View style={styles.typeContainer}>
        <Text style={styles.typeBadge}>{pokemon.type}</Text>
      </View>
      <Text style={styles.pokemonName}>{pokemon.name}</Text>
      <Text style={styles.pokemonStats}>{pokemon.description}</Text>
    </View>
  </TouchableOpacity>
);

export const PokemonList = ({ data, onItemPress }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => <PokemonCard pokemon={item} onPress={() => onItemPress(item)} />}
    contentContainerStyle={styles.listContainer}
    showsVerticalScrollIndicator={false}
  />
);

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: '#F4F7FB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBackground: {
    backgroundColor: '#EEF2F6',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pokemonImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  numberBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  content: {
    padding: 16,
  },
  typeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2A75BB',
    textTransform: 'uppercase',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  pokemonStats: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
```
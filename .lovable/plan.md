
# Plan: Ver Tapas Votadas y Ranking dentro de la Ruta

## Resumen

Añadir navegación con tabs dentro de la página de detalle de una ruta (`/ruta/:slug`) para que el usuario pueda ver:
1. **Locales** - Vista actual de los establecimientos participantes
2. **Mi Pasaporte** - Tapas que ha votado el usuario (solo de esta ruta)
3. **Ranking** - Las mejores tapas de la ruta

---

## Cambios a Realizar

### 1. Modificar `useRanking.ts` - Añadir filtro por evento

Actualmente el hook obtiene el ranking de **todas** las tapas. Modificaremos para aceptar un `eventId` opcional y filtrar los votos solo de tapas pertenecientes a locales de ese evento.

**Cambio clave:**
- Añadir parámetro `eventId?: string`
- Filtrar venues por `event_id` y luego tapas de esos venues
- Calcular ranking solo con esos datos

---

### 2. Modificar `useUserVotedTapas.ts` - Añadir filtro por evento

Similar al ranking, añadir soporte para filtrar las tapas votadas del usuario por evento.

**Cambio clave:**
- Añadir parámetro `eventId?: string`
- Filtrar venues por `event_id` antes de hacer el join

---

### 3. Refactorizar `RutaDetailPage.tsx` - Añadir sistema de tabs

Transformar la página para usar el componente `Tabs` de Radix UI con tres secciones:

```text
+--------------------------------------------------+
|  [<] Logo    Nombre Ruta                          |
|              X locales participantes              |
|  [Buscar local o tapa...]                         |
+--------------------------------------------------+
|  [ Locales ]  [ Mi Pasaporte ]  [ Ranking ]       |
+--------------------------------------------------+
|                                                   |
|   (Contenido según tab activo)                    |
|                                                   |
+--------------------------------------------------+
```

**Tabs disponibles:**
- **Locales** (`MapPin`) - Grid actual de VenueCards
- **Mi Pasaporte** (`Stamp`) - Lista de tapas votadas del usuario en esta ruta
- **Ranking** (`Trophy`) - Top 5 tapas de esta ruta

---

### 4. Crear componentes internos para las tabs

Para mantener el código limpio, extraer el contenido de cada tab en componentes:

- `RutaVenuesTab` - Vista actual de locales
- `RutaPassportTab` - Versión simplificada del pasaporte filtrada por evento
- `RutaRankingTab` - Versión simplificada del ranking filtrada por evento

---

## Flujo de Usuario

1. Usuario entra a `/ruta/rutaza`
2. Ve la **tab Locales** por defecto (comportamiento actual)
3. Puede pulsar en **"Mi Pasaporte"** para ver sus votos en esta ruta
4. Puede pulsar en **"Ranking"** para ver las mejores tapas de esta ruta
5. La barra de búsqueda solo aplica a la tab de Locales

---

## Detalles Técnicos

### Hooks modificados

```typescript
// useRanking.ts
export const useRanking = (limit: number = 5, eventId?: string) => {
  // Si eventId existe, filtrar venues por event_id
  // Luego filtrar tapas por venue_ids
  // Calcular ranking solo con esas tapas
}

// useUserVotedTapas.ts  
export const useUserVotedTapas = (eventId?: string) => {
  // Si eventId existe, filtrar por venues del evento
}
```

### Estructura de tabs en RutaDetailPage

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="locales">
  <TabsList className="w-full">
    <TabsTrigger value="locales">
      <MapPin /> Locales
    </TabsTrigger>
    <TabsTrigger value="pasaporte">
      <Stamp /> Mi Pasaporte
    </TabsTrigger>
    <TabsTrigger value="ranking">
      <Trophy /> Ranking
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="locales">
    {/* Grid de VenueCards actual */}
  </TabsContent>
  
  <TabsContent value="pasaporte">
    {/* Lista de tapas votadas del usuario */}
  </TabsContent>
  
  <TabsContent value="ranking">
    {/* Top 5 tapas de la ruta */}
  </TabsContent>
</Tabs>
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useRanking.ts` | Añadir parámetro `eventId` para filtrar por ruta |
| `src/hooks/useUserVotedTapas.ts` | Añadir parámetro `eventId` para filtrar por ruta |
| `src/pages/RutaDetailPage.tsx` | Implementar sistema de tabs con las 3 vistas |

---

## Resultado Esperado

- El usuario puede navegar entre las 3 tabs sin salir de la página de la ruta
- Los datos mostrados están siempre filtrados por el evento actual
- La experiencia es fluida y coherente con el diseño existente
- El progreso del pasaporte (3 votos para sorteo) se muestra específico para la ruta

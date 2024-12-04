"use client"
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// El tipo genérico recibe el tipo de la entidad y el nombre de su campo 'id'
interface EntityContextType<T, ID extends keyof T> {
  entities: T[];
  saveEntity: (entity: T) => Promise<void>;
  updateEntity: (id: ID, entity: T) => Promise<void>;
  deleteEntity: (id: ID) => Promise<void>;
  refreshEntities: () => Promise<void>;
  getEntityById: (id: ID) => T | undefined;
}

// Contexto genérico de entidades
const EntityContext = createContext<EntityContextType<any, any> | undefined>(undefined);

interface EntityProviderProps<T, ID extends keyof T> {
  children: ReactNode;
  fetchEntities: () => Promise<T[]>;
  saveEntity: (entity: T) => Promise<void>;
  updateEntity: (id: ID, entity: T) => Promise<void>;
  deleteEntity: (id: ID) => Promise<void>;
}

export const EntityProvider = <T extends { [key: string]: any }, ID extends keyof T>({
  children,
  fetchEntities,
  saveEntity,
  updateEntity,
  deleteEntity,
}: EntityProviderProps<T, ID>) => {
  const [entities, setEntities] = useState<T[]>([]);

  // Función para refrescar las entidades
  const refreshEntities = async () => {
    try {
      const data = await fetchEntities();
      setEntities(data);
    } catch (error) {
      console.error('Error al obtener las entidades:', error);
    }
  };

  // Función para guardar una entidad
  const handleSave = async (entity: T) => {
    try {
      await saveEntity(entity);
      await refreshEntities(); // Refrescar las entidades después de guardar
    } catch (error) {
      console.error('Error al guardar la entidad:', error);
    }
  };

  // Función para actualizar una entidad
  const handleUpdate = async (id: ID, entity: T) => {
    try {
      await updateEntity(id, entity);
      await refreshEntities(); // Refrescar las entidades después de actualizar
    } catch (error) {
      console.error('Error al actualizar la entidad:', error);
    }
  };

  // Función para eliminar una entidad
  const handleDelete = async (id: ID) => {
    try {
      await deleteEntity(id);
      await refreshEntities(); // Refrescar las entidades después de eliminar
    } catch (error) {
      console.error('Error al eliminar la entidad:', error);
    }
  };

  // Función para obtener una entidad por su id
  const getEntityById = (id: ID) => {
    return entities.find((entity) => entity[id] === id);
  };

  return (
    <EntityContext.Provider value={{
      entities,
      saveEntity: handleSave,
      updateEntity: handleUpdate,
      deleteEntity: handleDelete,
      refreshEntities,
      getEntityById
    }}>
      {children}
    </EntityContext.Provider>
  );
};

// Hook para consumir el contexto de las entidades
export const useEntity = <T extends { [key: string]: any }, ID extends keyof T>() => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error('useEntity debe ser usado dentro de un EntityProvider');
  }
  return context;
};

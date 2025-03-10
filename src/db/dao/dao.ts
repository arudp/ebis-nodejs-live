export interface DAO<T> {
  /**
   * Get all entities from the database.
   *
   * @returns All entities
   */
  getAll(): Promise<T[]>;

  /**
   * Get a specific entity from the database.
   *
   * @param id Entity id
   *
   * @returns Entity
   *
   * @throws {NotFoundError} When entity is not found
   */
  get(id: string): Promise<T>;

  /**
   * Add an entity to the database.
   * The entity id is set on the entity object.
   *
   * @param entity Entity to add to the database
   *
   * @throws {DuplicateEntityError} When entity with same unique fields already exists
   */
  create(entity: T): Promise<void>;

  /**
   * Update an entity in the database.
   *
   * @param entity Entity to update in the database
   *
   * @returns Updated entity
   *
   * @throws {NotFoundError} When entity is not found
   */
  update(entity: T): Promise<T>;

  /**
   * Delete an entity from the database.
   *
   * @param id Entity id
   *
   * @throws {NotFoundError} When entity is not found
   */
  delete(id: string): Promise<void>;
}

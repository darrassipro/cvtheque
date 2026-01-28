import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add source field to CVs table for tracking upload origin
 * - Adds CVSource enum (USER_UPLOAD, SUPERADMIN_BULK)
 * - Makes userId nullable for superadmin bulk uploads
 * - Sets default source to USER_UPLOAD for existing records
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add source column
  await queryInterface.addColumn('cvs', 'source', {
    type: DataTypes.ENUM('USER_UPLOAD', 'SUPERADMIN_BULK'),
    allowNull: false,
    defaultValue: 'USER_UPLOAD',
  });

  // Make userId nullable (modify column)
  await queryInterface.changeColumn('cvs', 'user_id', {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove source column
  await queryInterface.removeColumn('cvs', 'source');

  // Make userId non-nullable again
  await queryInterface.changeColumn('cvs', 'user_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });
}

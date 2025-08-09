import { Sequelize, DataTypes, Model } from 'sequelize';

export function makeInMemorySequelize() {
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });

  class User extends Model {}
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, modelName: 'User', tableName: 'users', timestamps: false }
  );

  return { sequelize, User };
}
import { DataTypes, Model } from "sequelize";
import { sequelize } from "src/db/mysql/sequelize";

export class Task extends Model {}
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      // Can't be null by definition in it being the PK
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    due_date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    timestamps: false,
  }
);

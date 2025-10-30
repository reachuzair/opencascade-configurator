import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Configuration Model
 * Stores user configurations for parametric models
 */

interface ConfigurationAttributes {
  id: number;
  name: string;
  modelType: string;
  parameters: object;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConfigurationCreationAttributes
  extends Optional<
    ConfigurationAttributes,
    "id" | "userId" | "createdAt" | "updatedAt"
  > {}

class Configuration
  extends Model<ConfigurationAttributes, ConfigurationCreationAttributes>
  implements ConfigurationAttributes
{
  public id!: number;
  public name!: string;
  public modelType!: string;
  public parameters!: object;
  public userId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Configuration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    modelType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "box",
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "configurations",
    timestamps: true,
  }
);

export default Configuration;

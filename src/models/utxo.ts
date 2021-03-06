import * as Sequelize from "sequelize";
import { AssetSchemeAttribute } from "./assetscheme";

export interface UTXOAttribute {
    id?: string;
    address: string;
    assetType: string;
    shardId: number;
    lockScriptHash: string;
    parameters: string[];
    quantity: string;
    transactionHash: string;
    transactionOutputIndex: number;
    usedTransactionHash?: string | null;
    usedBlockNumber?: number | null;
    assetScheme: AssetSchemeAttribute;
    blockNumber: number;
}

export interface UTXOInstance extends Sequelize.Instance<UTXOAttribute> {}

export default (
    sequelize: Sequelize.Sequelize,
    DataTypes: Sequelize.DataTypes
) => {
    const UTXO = sequelize.define(
        "UTXO",
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.BIGINT
            },
            address: {
                allowNull: false,
                type: DataTypes.STRING
            },
            assetType: {
                allowNull: false,
                type: DataTypes.STRING
            },
            shardId: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            lockScriptHash: {
                allowNull: false,
                type: DataTypes.STRING
            },
            parameters: {
                allowNull: false,
                type: DataTypes.JSONB
            },
            quantity: {
                allowNull: false,
                type: DataTypes.NUMERIC({ precision: 20, scale: 0 })
            },
            transactionHash: {
                allowNull: false,
                type: DataTypes.STRING,
                onDelete: "CASCADE",
                references: {
                    model: "Transactions",
                    key: "hash"
                }
            },
            transactionOutputIndex: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            assetScheme: {
                allowNull: false,
                type: DataTypes.JSONB
            },
            usedTransactionHash: {
                type: DataTypes.STRING,
                onDelete: "SET NULL",
                references: {
                    model: "Transactions",
                    key: "hash"
                }
            },
            blockNumber: {
                allowNull: false,
                type: DataTypes.INTEGER
            },
            usedBlockNumber: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        },
        {}
    );
    UTXO.associate = models => {
        UTXO.belongsTo(models.Transaction, {
            foreignKey: "usedTransactionHash",
            as: "usedTransaction",
            onDelete: "SET NULL"
        });
    };
    return UTXO;
};

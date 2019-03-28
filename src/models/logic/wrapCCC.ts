import { H160, SignedTransaction, U64 } from "codechain-sdk/lib/core/classes";
import { WrapCCCActionJSON } from "codechain-sdk/lib/core/transaction/WrapCCC";
import models from "../index";
import { WrapCCCInstance } from "../wrapCCC";
import { createAddressLog } from "./addressLog";
import { createAssetSchemeOfWCCC } from "./assetscheme";
import { createAssetTypeLog } from "./assetTypeLog";
import { getOwner } from "./utils/address";
import { strip0xPrefix } from "./utils/format";

export async function createWrapCCC(
    transaction: SignedTransaction
): Promise<WrapCCCInstance> {
    const transactionHash = transaction.hash().value;
    const {
        shardId,
        lockScriptHash,
        parameters,
        quantity,
        payer
    } = transaction.toJSON().action as WrapCCCActionJSON;
    const networkId = transaction.unsigned.networkId();

    const recipient = getOwner(new H160(lockScriptHash), parameters, networkId);

    const result = await models.WrapCCC.create({
        transactionHash: strip0xPrefix(transactionHash),
        shardId,
        lockScriptHash: strip0xPrefix(lockScriptHash),
        parameters: parameters.map(p => strip0xPrefix(p)),
        quantity: new U64(quantity).toString(),
        recipient
    });
    const existing = await models.AssetScheme.findByPk(H160.zero().toString());
    if (existing == null) {
        await createAssetSchemeOfWCCC(transactionHash, networkId, shardId);
    }
    await createAddressLog(transaction, payer, "AssetOwner");
    if (recipient) {
        await createAddressLog(transaction, recipient, "AssetOwner");
    }
    await createAssetTypeLog(
        transaction,
        "0000000000000000000000000000000000000000"
    );
    return result;
}

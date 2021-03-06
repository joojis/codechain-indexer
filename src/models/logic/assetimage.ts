import { H160 } from "codechain-sdk/lib/core/classes";
import * as request from "request";
import * as sharp from "sharp";
import models from "..";
import * as Exception from "../../exception";

export async function createAssetImage(
    transactionHash: string,
    assetType: string,
    assetURL: string
): Promise<void> {
    let imageDataBuffer;
    try {
        const imageBuffer = await getImageBuffer(assetURL);
        if (imageBuffer) {
            imageDataBuffer = await sharp(imageBuffer)
                .resize(100, 100)
                .png()
                .toBuffer();
        }
    } catch (e) {
        console.log(e);
    }
    if (imageDataBuffer) {
        try {
            await models.AssetImage.upsert({
                transactionHash,
                assetType,
                image: imageDataBuffer.toString("base64")
            });
        } catch (err) {
            console.error(err);
            throw Exception.DBError;
        }
    }
}

export async function getByAssetType(assetType: H160) {
    try {
        return await models.AssetImage.findOne({
            where: {
                assetType: assetType.value
            }
        });
    } catch (err) {
        console.error(err);
        throw Exception.DBError;
    }
}

function getImageBuffer(url: string) {
    return new Promise((resolve, reject) => {
        request({ url, encoding: null }, (err, _R, buffer) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(buffer);
        });
    });
}

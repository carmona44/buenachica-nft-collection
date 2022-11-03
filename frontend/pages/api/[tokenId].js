export default function handler(req, res) {
    const tokenId = req.query.tokenId;
    const image_url = "https://github.com/carmona44/buenachica-nft-collection/tree/main/frontend/public/buenaschicas/";

    res.status(200).json({
        name: "BuenaChica #" + tokenId,
        description: "BuenaChica 🐶 es una colección de NFTs para un grupo de amigos",
        image: image_url + tokenId + ".png",
    });
}
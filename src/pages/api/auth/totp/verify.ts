import { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";
import Totp from "../../../../models/Totp";
import connectDb from "../../../../lib/mongodb";

const verifyTOTP = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDb();

  const { email, token } = req.body;

  const user = await Totp.findOne({ email });

  if (!user || !user.secret) {
    res.status(400).json({ error: "TOTP not setup for this user" });
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: "base32",
    token,
  });

  if (verified) {
    await Totp.updateOne({ email }, { totpEnabled: true });
  }

  res.status(200).json({ verified });
};

export default verifyTOTP;

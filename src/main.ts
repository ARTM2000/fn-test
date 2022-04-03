import express from "express";
import { AxiosError } from "axios";
import { OakService, TokenService } from "./finnotech";
import { SCOPES } from "finnotech-easy";

const app = express();

app.use(express.json());

app.get("/cc-token", async (req, res) => {
	await TokenService.getClientCredentialToken([
		SCOPES.ibanInquiry.name,
		SCOPES.groupIbanInquiryPost.name,
		SCOPES.cifInquiry.name,
	]);
	return res.send("done");
});

app.get("/iban", async (req, res) => {
	const { iban } = req.query;
	const finalIban = iban as string;

	try {
		const result = await OakService.ibanInquiry({ iban: finalIban });
		return res.json(result);
	} catch (err) {
		const error = err as AxiosError;
		// console.log('main.ts => ', err);
		console.log(error.response?.data);
		
		return res.send(error || {});
	}
});

app.get("/gIban", async (req, res) => {
	const fileBase64: string = req.query.bfile as string;

	try {
		const result = await OakService.submitGroupIbanInquiry({
			file: fileBase64.split('base64,')[1],
		});
		return res.json(result);
	} catch (err) {
		const error = err as AxiosError;
		console.log(err);
		return res.send(error || {});
	}
});

app.get("/cifInq", async (req, res) => {
	try {
		const result = await OakService.cifInquiry({
			nid: req.query.nid as string
		});
		return res.json(result);
	} catch (err) {
		const error = err as AxiosError;
		console.log(error.response?.data);
		return res.send(error || {});
	}
})

app.use("/", (req, res, next) => {
	return res.send("Hi, I'm fine, how are you? :)");
});

app.listen(3000, () => {
	console.log("\n server is running...\n");
});

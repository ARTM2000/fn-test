import Finnotech, { SCOPES, GRANT_TYPE, Utils } from "finnotech-easy";
import RedisClient from "./redis";

interface IStoreToken {
	accessToken: string;
	refreshToken: string;
	scopes: string[];
}

let step = 0;

const myFinnotechServices = new Finnotech({
	clientId: "myappname",
	clientSecret: "mysecret",
	nid: "mynid",
	getAccessToken: async (fullScopeName) => {
		console.log("get token ==> ", fullScopeName);
		const grantType = Utils.getGrantTypeFromScopeName(fullScopeName);
		const storeKey = grantType + ":tokens";
		const tokenInfoString = await RedisClient.get(storeKey);
		if (!tokenInfoString) {
			return "";
		}
		const tokenInfo: IStoreToken = JSON.parse(tokenInfoString);
		step++;
		console.log(step);
		if (step % 2 === 0) {
			return tokenInfo.accessToken;
		}
		return "";
	},
	getRefreshToken: async (fullScopeName) => {
		console.log("get refresh token ==> ", fullScopeName);
		const grantType = Utils.getGrantTypeFromScopeName(fullScopeName);
		const storeKey = grantType + ":tokens";
		const tokenInfoString = await RedisClient.get(storeKey);
		if (!tokenInfoString) {
			return "";
		}
		const tokenInfo: IStoreToken = JSON.parse(tokenInfoString);
		return tokenInfo.refreshToken;
	},
	setTokens: async (tokenData) => {
		console.log("TokenData: ", tokenData);
		const { accessToken, refreshToken, scopes, lifeTime, tokenType } =
			tokenData;
		let storeKey: string;
		switch (tokenType) {
			case GRANT_TYPE.CLIENT_CREDENTIALS:
				storeKey = GRANT_TYPE.CLIENT_CREDENTIALS;
				break;
			case GRANT_TYPE.AUTHORIZATION_CODE:
				storeKey = GRANT_TYPE.AUTHORIZATION_CODE;
				break;
			case GRANT_TYPE.SMS:
				storeKey = GRANT_TYPE.SMS;
				break;
			default:
				throw new Error('"tokenType" is not defined"');
		}
		storeKey += ":tokens";

		const storedTokens = await RedisClient.get(storeKey);

		if (storedTokens) {
			const tokenInfoObject: IStoreToken = JSON.parse(storedTokens);
			tokenInfoObject.accessToken = accessToken;
			tokenInfoObject.refreshToken = refreshToken;
			tokenInfoObject.scopes = [
				...new Set(tokenInfoObject.scopes.concat(scopes)),
			];
			await RedisClient.setEx(
				storeKey,
				lifeTime,
				JSON.stringify(tokenInfoObject)
			);
			return;
		}

		const newTokenInfoObject: IStoreToken = {
			accessToken,
			refreshToken,
			scopes,
		};
		await RedisClient.setEx(
			storeKey,
			lifeTime,
			JSON.stringify(newTokenInfoObject)
		);
		return;
	},
});

export const TokenService = myFinnotechServices.TokenService;
export const OakService = myFinnotechServices.OakService;
export const CreditService = myFinnotechServices.CreditService;

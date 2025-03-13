"use server";

import client from "@/lib/mongodb";
import { getCurrentSession, invalidateSession, UsersCollection } from "../sessions";
import { deleteSessionTokenCookie } from "../cookies";
import { toBoolean } from "@/lib/utils";

export async function getUser() {
	"use server"
	const { user } = await getCurrentSession();

	return user;
}

export async function updateUser(formData: FormData) {
	"use server";
	const { user } = await getCurrentSession();

	if (!user) {
		return {
			error: true,
			message: "Unauthorized"
		}
	}

	let changes = {};

	if (formData.has("username")) {
		changes = {
			...changes,
			username: formData.get("username")
		}
	}

	if (formData.has("name")) {
		changes = {
			...changes,
			name: formData.get("name")
		}
	}

	if (formData.has("visibility")) {
		changes = {
			...changes,
			visibility: formData.get("visibility")
		}
	}

	if (formData.has("oauth_auto_link")) {
		changes = {
			...changes,
			oauth_auto_link: toBoolean(formData.get("oauth_auto_link"))
		}
	}

	if (Object.keys(changes).length === 0) {
		return {
			error: false,
			message: "Please make some changes before saving."
		}
	}

	for (const [key, value] of formData.entries()) {
		switch (key) {
			case "username": {
				const val = value.toString();
				if (val.length < 3 || val.length > 32) {
					return {
						error: true,
						message: "Your username must be between 3 and 32 characters"
					}
				}

				if (val === user.username) {
					return {
						error: true,
						message: "Please make some changes before saving"
					}
				}
				break;
			}

			case "name": {
				const val = value.toString();

				if (val === user.name) {
					return {
						error: true,
						message: "Please make some changes before saving"
					}
				}
				break;
			}

			case "visibility": {
				const val = value.toString();

				if (!["public", "unlisted", "private"].includes(val)) {
					return {
						error: true,
						message: "Invalid value"
					}
				}

				if (val === user.visibility) {
					return {
						error: true,
						message: "Please make some changes before saving"
					}
				}
				break;
			}

			case "oauth_auto_link": {
				const val = toBoolean(value);

				if (val === user.oauth_auto_link) {
					return {
						error: true,
						message: "Please make some changes before saving"
					}
				}
				break;
			}
		}
	}

	await client.connect();

	await client.db().collection<UsersCollection>("users").updateOne({ _id: user.id }, {
		$set: changes
	});

	return {
		error: false,
		message: "Your changes have been saved"
	}
}

export async function deleteUser() {
	"use server";

	const { user } = await getCurrentSession();

	if (!user) {
		return {
			error: true,
			message: "Unauthorized"
		}
	}

	await client.connect();

	if (process.env.USE_S3 === "false") {
		await client.db().collection<{ _id: string }>("avatars").deleteOne({ _id: user.id });
		await client.db().collection<{ _id: string }>("banners").deleteOne({ _id: user.id });
	}

	await client.db().collection<UsersCollection>("users").deleteOne({ _id: user.id });
	await invalidateSession(user.id);
	deleteSessionTokenCookie();

	return {
		error: false,
		message: "Your account has been deleted"
	}
}
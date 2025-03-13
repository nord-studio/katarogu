import minio from "@/lib/minio";
import client from "@/lib/mongodb";

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	if (process.env.USE_S3 === "true") {
		// S3
		const res = await minio.getObject("public", `avatars/${params.id}`).then(async (res) => {
			let buffer = Buffer.from("");

			for await (const chunk of res) {
				buffer = Buffer.concat([buffer, chunk]);
			}

			return new Response(buffer, {
				headers: {
					"Content-Type": "image/png",
					"Cache-Control": "public, max-age=300",
				}
			});
		}).catch(async (err) => {
			console.error(err);
			return new Response("Failed to find avatar", {
				status: 404
			});
		});

		return res;
	} else {
		// MongoDB
		await client.connect();

		const avatar = await client.db().collection<{ _id: string, type: string, data: { buffer: string } }>("avatars").findOne({
			_id: params.id
		});

		if (avatar === null) {
			return new Response("Failed to find avatar", {
				status: 404
			});
		}

		return new Response(avatar.data.buffer, {
			headers: {
				"Content-Type": avatar.type,
				"Cache-Control": "public, max-age=300"
			}
		});
	}
}
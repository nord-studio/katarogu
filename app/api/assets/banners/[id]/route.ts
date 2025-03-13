import minio from "@/lib/minio";
import client from "@/lib/mongodb";
import { readFileSync } from "fs";

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	if (process.env.USE_S3 === "true") {
		const res = await minio.getObject("public", `banners/${params.id}`).then(async (res) => {
			let buffer = Buffer.from("");

			for await (const chunk of res) {
				buffer = Buffer.concat([buffer, chunk]);
			}

			return new Response(buffer, {
				headers: {
					"Content-Type": "image/jpeg",
					"Cache-Control": "stale-while-revalidate"
				}
			});
		}).catch(() => {
			const banner = readFileSync("public/assets/default-banner.jpg");

			return new Response(Buffer.from(banner), {
				headers: {
					"Content-Type": "image/jpeg",
					"Cache-Control": "stale-while-revalidate"
				}
			});
		});

		return res;
	} else {
		await client.connect();

		const banner = await client.db().collection<{ _id: string, data: Buffer }>("banners").findOne({
			_id: params.id
		});

		if (!banner) {
			const banner = readFileSync("public/assets/default-banner.jpg");

			return new Response(Buffer.from(banner.buffer), {
				headers: {
					"Content-Type": "image/jpeg",
					"Cache-Control": "stale-while-revalidate"
				}
			});
		}

		return new Response(Buffer.from(banner.data.buffer), {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "stale-while-revalidate"
			}
		});
	}
}
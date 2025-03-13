import { getCurrentSession, UsersCollection } from "@/auth/sessions";
import minio, { publicBucketExists } from "@/lib/minio";
import client from "@/lib/mongodb";
import { MAX_FILE_SIZE } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const { user } = await getCurrentSession();

	if (!user) {
		return NextResponse.json({
			error: true,
			message: "Unauthorized"
		}, {
			status: 401
		});
	}

	const form = await request.formData();
	const file = form.get("file") as File;

	if (!file) {
		return NextResponse.json({
			error: true,
			message: "No file was selected"
		}, {
			status: 400
		})
	}

	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({
			error: true,
			message: "Please upload a file smaller than 12MB"
		}, {
			status: 400
		})
	}

	if (process.env.USE_S3 === "true") {
		await publicBucketExists();

		await minio.putObject("public", `banners/${user.id}`, Buffer.from(await file.arrayBuffer()), file.size, {
			"Content-Type": file.type
		});
	} else {
		await client.connect();

		client.db().collection<{ _id: string, type: string, size: number, data: Buffer }>("banners").replaceOne({
			_id: user.id,
		}, {
			type: file.type,
			size: file.size,
			data: Buffer.from(await file.arrayBuffer())
		}, {
			upsert: true
		});
	}

	await client.db().collection<UsersCollection>("users").updateOne({ _id: user.id }, {
		$set: {
			banner: `/api/assets/banners/${user.id}`
		}
	});

	return NextResponse.json({
		error: false,
		message: "Banner uploaded successfully"
	}, {
		status: 200
	});
}
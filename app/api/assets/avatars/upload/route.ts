import { getCurrentSession, UsersCollection } from "@/auth/sessions";
import minio, { publicBucketExists } from "@/lib/minio";
import client from "@/lib/mongodb";
import { MAX_FILE_SIZE } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
		});
	}

	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({
			error: true,
			message: "Please upload a file smaller than 12MB"
		}, {
			status: 400
		});
	}

	if (process.env.USE_S3 === "true") {
		await publicBucketExists();

		await minio.putObject("public", `avatars/${user.id}`, Buffer.from(await file.arrayBuffer()), file.size, {
			"Content-Type": file.type
		});
	} else {
		await client.connect();

		client.db().collection<{ _id: string, type: string, size: number, data: Buffer<ArrayBuffer> }>("avatars").insertOne({
			_id: user.id,
			type: file.type,
			size: file.size,
			data: Buffer.from(await file.arrayBuffer())
		});
	}

	await client.db().collection<UsersCollection>("users").updateOne({ _id: user.id }, {
		$set: {
			avatar: `/api/assets/avatars/${user.id}`
		}
	});

	return NextResponse.json({
		error: false,
		message: "Avatar uploaded successfully"
	}, {
		status: 200
	});
}
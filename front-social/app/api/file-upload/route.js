import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file"); 

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files provided" }),
        { status: 400 }
      );
    }

    const uploadingFiles = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExtension = file.name.split('.').pop();
      const fileName = `uploads/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);

      return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;
    });

    const fileUrls = await Promise.all(uploadingFiles);

    return new Response(
      JSON.stringify({ urls: fileUrls }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload files", details: error.message }),
      { status: 500 }
    );
  }
}

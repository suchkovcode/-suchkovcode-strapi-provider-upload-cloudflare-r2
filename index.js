const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

module.exports = {
  init({ accountId, accessKeyId, secretAccessKey, bucket, publicUrl }) {
    const s3Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: "auto",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const uploadHandler = async (file) => {
      const params = {
        Bucket: bucket,
        Body: file.stream || file.buffer,
        Key: `${file.hash}${file.ext}`,
        ContentType: file.mime,
      };

      try {
        await s3Client.send(new PutObjectCommand(params));
        file.url = `https://${publicUrl}/${params.Key}`;
      } catch (error) {
        throw error;
      }
    };

    return {
      async upload(file) {
        await uploadHandler(file);
      },

      uploadStream(file) {
        return uploadHandler(file);
      },

      async delete(file) {
        const params = {
          Bucket: bucket,
          Key: `${file.hash}${file.ext}`,
        };

        return s3Client.send(new DeleteObjectCommand(params));
      },
    };
  },
};

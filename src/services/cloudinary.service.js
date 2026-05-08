const { v2: cloudinary } = require("cloudinary");
const axios = require("axios");
const { appConfig } = require("../config/config-manager");
const Logger = require("../lib/logger");

// Initialize Cloudinary
// The library will automatically pick up CLOUDINARY_URL from process.env
// if we don't call config() with conflicting parameters.
cloudinary.config({
  secure: true
});

Logger.info("Cloudinary Service Initialized (using Env URL)");

class CloudinaryService {
  /**
   * Uploads a file buffer directly to Cloudinary using Axios for better stability.
   * @param {Buffer} buffer The file buffer
   * @param {string} folder Optional folder name
   * @returns {Promise<any>}
   */
  async uploadBuffer(buffer, folder = "user_photos") {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const api_secret = appConfig.string("CLOUDINARY_API_SECRET");
      const api_key = appConfig.string("CLOUDINARY_API_KEY");
      const cloud_name = appConfig.string("CLOUDINARY_CLOUD_NAME");

      // Generate signature
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        api_secret
      );

      const formData = new URLSearchParams();
      formData.append("file", `data:image/jpeg;base64,${buffer.toString("base64")}`);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 60000,
        }
      );

      Logger.info("Cloudinary upload success via Axios");
      return response.data;
    } catch (error) {
      Logger.error("Cloudinary upload error via Axios:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Uploads a Base64 string directly to Cloudinary using Axios.
   * @param {string} base64String The Base64 string
   * @param {string} folder Optional folder name
   * @returns {Promise<any>}
   */
  async uploadBase64(base64String, folder = "user_photos") {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const api_secret = appConfig.string("CLOUDINARY_API_SECRET");
      const api_key = appConfig.string("CLOUDINARY_API_KEY");
      const cloud_name = appConfig.string("CLOUDINARY_CLOUD_NAME");

      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        api_secret
      );

      const formData = new URLSearchParams();
      formData.append("file", base64String);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 60000,
        }
      );

      return response.data;
    } catch (error) {
      Logger.error("Cloudinary Base64 upload error via Axios:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generates a signed upload signature so front-end clients can upload directly
   * @param {string} folder The target folder
   * @returns {object} Signature, timestamp, cloud name, and api key
   */
  generateUploadSignature(folder = "uploads") {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const api_secret = appConfig.string("CLOUDINARY_API_SECRET");
    const api_key = appConfig.string("CLOUDINARY_API_KEY");
    const cloud_name = appConfig.string("CLOUDINARY_CLOUD_NAME");

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      api_secret
    );

    return { timestamp, signature, cloud_name, api_key, folder };
  }

  /**
   * Deletes a file from Cloudinary by its public ID.
   * @param {string} publicId The public ID of the resource
   */
  async deleteFile(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          Logger.error("Cloudinary delete error:", error);
          return reject(error);
        }
        resolve(result);
      });
    });
  }
}

const cloudinaryService = new CloudinaryService();
module.exports = { CloudinaryService, cloudinaryService };

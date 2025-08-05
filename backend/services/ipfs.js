const { create } = require('ipfs-http-client');
const axios = require('axios');

class IPFSService {
  constructor() {
    // Using Pinata as IPFS provider
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.pinataBaseUrl = 'https://api.pinata.cloud';
  }

  async uploadJSON(data, name) {
    try {
      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata: {
            name: name || 'carbon-credit-metadata'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType
      });
      
      formData.append('pinataMetadata', JSON.stringify({
        name: fileName
      }));

      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  async getContent(ipfsHash) {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting IPFS content:', error);
      throw error;
    }
  }

  async createCarbonCreditMetadata(creditData) {
    const metadata = {
      name: creditData.name,
      description: creditData.description,
      image: creditData.imageUrl,
      external_url: `https://ecosync.app/credits/${creditData.tokenId}`,
      attributes: [
        {
          trait_type: "Project ID",
          value: creditData.projectId
        },
        {
          trait_type: "Vintage",
          value: creditData.vintage
        },
        {
          trait_type: "Registry",
          value: creditData.registry
        },
        {
          trait_type: "Serial Number",
          value: creditData.serialNumber
        },
        {
          trait_type: "Quantity",
          value: creditData.quantity,
          display_type: "number"
        },
        {
          trait_type: "Location",
          value: creditData.location
        },
        {
          trait_type: "Methodology",
          value: creditData.methodology
        },
        {
          trait_type: "Verifier",
          value: creditData.verifier
        }
      ],
      properties: {
        sdgs: creditData.sdgs || [],
        issuanceDate: creditData.issuanceDate,
        issuer: creditData.issuer
      }
    };

    return await this.uploadJSON(metadata, `carbon-credit-${creditData.tokenId}`);
  }
}

module.exports = new IPFSService();
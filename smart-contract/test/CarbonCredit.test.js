const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCredit", function () {
  let carbonCredit;
  let owner, issuer, verifier, user1, user2;

  beforeEach(async function () {
    [owner, issuer, verifier, user1, user2] = await ethers.getSigners();

    const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
    carbonCredit = await CarbonCredit.deploy("https://api.ecosync.app/metadata/");
    await carbonCredit.waitForDeployment();

    // Grant roles
    await carbonCredit.grantRole(await carbonCredit.ISSUER_ROLE(), issuer.address);
    await carbonCredit.grantRole(await carbonCredit.VERIFIER_ROLE(), verifier.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCredit.hasRole(await carbonCredit.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should grant issuer role", async function () {
      expect(await carbonCredit.hasRole(await carbonCredit.ISSUER_ROLE(), issuer.address)).to.be.true;
    });
  });

  describe("Carbon Credit Issuance", function () {
    it("Should issue carbon credits", async function () {
      const quantity = 100;
      const projectId = "VCS-123-456";
      const vintage = "2023";
      const serialNumber = "123-456-789-001";
      const registry = "Verra";
      const metadataURI = "QmTest123";

      await expect(
        carbonCredit.connect(issuer).issueCarbonCredit(
          user1.address,
          quantity,
          projectId,
          vintage,
          serialNumber,
          registry,
          metadataURI
        )
      ).to.emit(carbonCredit, "CreditIssued");

      expect(await carbonCredit.balanceOf(user1.address, 0)).to.equal(quantity);
    });

    it("Should not allow non-issuer to issue credits", async function () {
      await expect(
        carbonCredit.connect(user1).issueCarbonCredit(
          user2.address,
          100,
          "VCS-123",
          "2023",
          "123-456",
          "Verra",
          "QmTest"
        )
      ).to.be.reverted;
    });
  });

  describe("Carbon Credit Transfer", function () {
    beforeEach(async function () {
      await carbonCredit.connect(issuer).issueCarbonCredit(
        user1.address,
        100,
        "VCS-123-456",
        "2023",
        "123-456-789-001",
        "Verra",
        "QmTest123"
      );
    });

    it("Should transfer carbon credits", async function () {
      await carbonCredit.connect(user1).safeTransferFrom(
        user1.address,
        user2.address,
        0,
        50,
        "0x"
      );

      expect(await carbonCredit.balanceOf(user1.address, 0)).to.equal(50);
      expect(await carbonCredit.balanceOf(user2.address, 0)).to.equal(50);
    });
  });

  describe("Carbon Credit Retirement", function () {
    beforeEach(async function () {
      await carbonCredit.connect(issuer).issueCarbonCredit(
        user1.address,
        100,
        "VCS-123-456",
        "2023",
        "123-456-789-001",
        "Verra",
        "QmTest123"
      );
    });

    it("Should retire carbon credits", async function () {
      const reason = "Personal carbon offset";
      
      await expect(
        carbonCredit.connect(user1).retireCarbonCredit(0, 50, reason)
      ).to.emit(carbonCredit, "CreditRetired");

      expect(await carbonCredit.balanceOf(user1.address, 0)).to.equal(50);
      expect(await carbonCredit.totalSupply(0)).to.equal(50);
    });

    it("Should not retire more than balance", async function () {
      await expect(
        carbonCredit.connect(user1).retireCarbonCredit(0, 150, "Test")
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Metadata Management", function () {
    beforeEach(async function () {
      await carbonCredit.connect(issuer).issueCarbonCredit(
        user1.address,
        100,
        "VCS-123-456",
        "2023",
        "123-456-789-001",
        "Verra",
        "QmTest123"
      );
    });

    it("Should update metadata by verifier", async function () {
      const newMetadataURI = "QmNewTest456";
      
      await expect(
        carbonCredit.connect(verifier).updateMetadata(0, newMetadataURI)
      ).to.emit(carbonCredit, "MetadataUpdated");

      const metadata = await carbonCredit.getCreditMetadata(0);
      expect(metadata.metadataURI).to.equal(newMetadataURI);
    });

    it("Should not allow non-verifier to update metadata", async function () {
      await expect(
        carbonCredit.connect(user1).updateMetadata(0, "QmTest")
      ).to.be.reverted;
    });
  });
});
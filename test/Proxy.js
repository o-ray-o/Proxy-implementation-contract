const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { assert } = require("chai");

describe("Proxy", function () {
  async function deployFixture() {
    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy();
    const Logic1 = await ethers.getContractFactory("Logic1");
    const logic1 = await Logic1.deploy();
    const Logic2 = await ethers.getContractFactory("Logic2");
    const logic2 = await Logic2.deploy();

    const proxyAsLogic1 = await ethers.getContractAt("Logic1", proxy.target);
    const proxyAsLogic2 = await ethers.getContractAt("Logic2", proxy.target);

    return { proxy, proxyAsLogic1, proxyAsLogic2, logic1, logic2 };
  }
  // eth_getStorageAt
  async function lookupUint(contractAddr, slot) {
    return parseInt(await ethers.provider.getStorage(contractAddr, slot));
  }

  it("should work with logic1", async function () {
    const { proxy, proxyAsLogic1, logic1 } = await loadFixture(deployFixture);

    await proxy.changeImplementation(logic1.target);

    assert.equal(await lookupUint(proxy.target, "0x0"), 0);

    await proxyAsLogic1.changeX(52);

    assert.equal(await lookupUint(proxy.target, "0x0"), 52);
  });

  it("should work with upgrades", async function () {
    const { proxy, proxyAsLogic1, proxyAsLogic2, logic1, logic2 } =
      await loadFixture(deployFixture);

    await proxy.changeImplementation(logic1.target);

    assert.equal(await lookupUint(proxy.target, "0x0"), 0);

    await proxyAsLogic1.changeX(45);

    assert.equal(await lookupUint(proxy.target, "0x0"), 45);

    await proxy.changeImplementation(logic2.target);

    assert.equal(await lookupUint(proxy.target, "0x0"), 45);

    await proxyAsLogic2.changeX(25);
    await proxyAsLogic2.tripleX();

    assert.equal(await lookupUint(proxy.target, "0x0"), 75);
  });
});

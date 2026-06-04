const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { canUserModifyPostTags } = require("../src/mcp/posts-tool-auth");

describe("canUserModifyPostTags", () => {
  it("rechaza sin userId", () => {
    const result = canUserModifyPostTags({ id: 1, authorId: 1, deletedAt: null }, {});
    assert.equal(result.allowed, false);
    assert.equal(result.statusCode, 401);
  });

  it("permite admin", () => {
    const result = canUserModifyPostTags(
      { id: 1, authorId: 99, deletedAt: null },
      { userId: 1, role: "admin" }
    );
    assert.equal(result.allowed, true);
  });
});

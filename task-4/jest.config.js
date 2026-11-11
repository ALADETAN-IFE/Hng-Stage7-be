// ============================================================
// REPOGUARD — MANUAL REVIEW REQUIRED: task-4/jest.config.js
// Scanned: 2026-11-11T15:00:52.064Z
// The following findings could NOT be automatically patched:
//   [CRITICAL] js-obfuscated-hex: JavaScript hex/unicode escape obfuscation sequence
//   [MEDIUM] high-entropy-secret: High-entropy string detected — possible hardcoded credential or API key
// ============================================================

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@openrouter)"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
};
// REMOVED BY REPOGUARD: obfuscated malware payload

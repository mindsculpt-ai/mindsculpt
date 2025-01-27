#!/bin/bash

# Create .gitignore
echo "node_modules/
dist/
coverage/
.env
.DS_Store
*.log" > .gitignore

# Create tsconfig.json
echo '{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/__tests__/*"]
}' > tsconfig.json

# Update package.json scripts
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="jest"
npm pkg set scripts.lint="eslint src --ext .ts"
npm pkg set scripts.format="prettier --write \"src/**/*.ts\""

# Create jest.config.js
echo 'module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
};' > jest.config.js

# Create LICENSE
echo 'MIT License

Copyright (c) 2024 MindSculpt

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.' > LICENSE

# Create test directory and sample test
mkdir -p src/__tests__
echo 'import { MemoryManager } from "../services/memoryManager";

describe("MemoryManager", () => {
  test("should create memory", async () => {
    // Add your test here
  });
});' > src/__tests__/memory.test.ts
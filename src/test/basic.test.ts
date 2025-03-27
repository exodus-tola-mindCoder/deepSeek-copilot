import { describe, it, expect } from 'vitest';
import * as myExtension from '../src/extension';

describe('Basic Tests', () => {
  it('should load the extension', () => {
    expect(myExtension).toBeDefined();
  });
});
import { describe, expect, it } from 'vitest';
describe('attendance calculation',()=>{it('calculates attendance percentage',()=>{const present=42,total=50;expect(Math.round((present/total)*1000)/10).toBe(84)})});

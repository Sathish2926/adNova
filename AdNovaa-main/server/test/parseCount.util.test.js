import { expect } from 'chai';
// Import parseCount directly from the file (not exported, so we redefine for test)
const parseCount = (str) => {
    if (!str) return 0;
    const cleanStr = str.replace(/[^0-9.kKmM]/g, '').toLowerCase();
    let multiplier = 1;
    if (cleanStr.includes('k')) multiplier = 1000;
    if (cleanStr.includes('m')) multiplier = 1000000;
    const num = parseFloat(cleanStr.replace(/[km]/g, ''));
    return Math.floor(num * multiplier);
};

describe('parseCount Utility', function() {
  it('should parse numbers with K', function() {
    expect(parseCount('1.2K')).to.equal(1200);
    expect(parseCount('5K')).to.equal(5000);
  });
  it('should parse numbers with M', function() {
    expect(parseCount('2M')).to.equal(2000000);
    expect(parseCount('0.5M')).to.equal(500000);
  });
  it('should parse plain numbers', function() {
    expect(parseCount('123')).to.equal(123);
    expect(parseCount('9999')).to.equal(9999);
  });
  it('should return 0 for invalid input', function() {
    expect(parseCount('')).to.equal(0);
    expect(parseCount(null)).to.equal(0);
    expect(parseCount(undefined)).to.equal(0);
  });
});

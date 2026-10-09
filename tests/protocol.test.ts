import { describe, it, expect } from 'vitest';
import { generateProtocol } from '../src/lib/protocol';

describe('Geração de Protocolos Imprevisíveis', () => {
  it('deve gerar protocolos no formato esperado sem expor IDs sequenciais', () => {
    const proto1 = generateProtocol('PRT');
    const proto2 = generateProtocol('PRT');

    const year = new Date().getFullYear();
    expect(proto1).toMatch(new RegExp(`^PRT-${year}-[2-9A-HJ-NP-Z]{6}$`));
    expect(proto2).toMatch(new RegExp(`^PRT-${year}-[2-9A-HJ-NP-Z]{6}$`));
    expect(proto1).not.toBe(proto2);
  });
});
